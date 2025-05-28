
-- Commission System and Custom Requests Setup
-- This extends the existing database to support the refined business model

-- Add commission configuration to artist profiles
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 7.70,
ADD COLUMN IF NOT EXISTS custom_design_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS allows_customization BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS response_time_custom VARCHAR(50) DEFAULT '24 hours';

-- Create commission tracking table
CREATE TABLE IF NOT EXISTS artist_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  product_sale_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create custom design requests table
CREATE TABLE IF NOT EXISTS custom_design_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
  artist_quote DECIMAL(10,2),
  artist_response TEXT,
  request_type VARCHAR(50) DEFAULT 'artist_direct' CHECK (request_type IN ('artist_direct', 'platform_managed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design customization permissions table
CREATE TABLE IF NOT EXISTS design_customization_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customization_details TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  artist_response TEXT,
  additional_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE artist_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_design_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_customization_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_commissions
CREATE POLICY "Artists can view own commissions" ON artist_commissions 
  FOR SELECT USING (artist_id = auth.uid());

CREATE POLICY "Admins can view all commissions" ON artist_commissions 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for custom_design_requests
CREATE POLICY "Users can view own requests" ON custom_design_requests 
  FOR SELECT USING (customer_id = auth.uid() OR artist_id = auth.uid());

CREATE POLICY "Users can create requests" ON custom_design_requests 
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Artists can update requests directed to them" ON custom_design_requests 
  FOR UPDATE USING (artist_id = auth.uid());

-- RLS Policies for design_customization_requests
CREATE POLICY "Users can view own customization requests" ON design_customization_requests 
  FOR SELECT USING (customer_id = auth.uid() OR artist_id = auth.uid());

CREATE POLICY "Customers can create customization requests" ON design_customization_requests 
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Artists can respond to customization requests" ON design_customization_requests 
  FOR UPDATE USING (artist_id = auth.uid());

-- Function to automatically create commission records when orders are paid
CREATE OR REPLACE FUNCTION create_artist_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create commissions for paid orders
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    INSERT INTO artist_commissions (
      artist_id,
      order_id,
      order_item_id,
      commission_rate,
      commission_amount,
      product_sale_amount,
      status
    )
    SELECT 
      p.artist_id,
      NEW.id,
      oi.id,
      COALESCE(ap.commission_rate, 7.70),
      (oi.price * oi.quantity * COALESCE(ap.commission_rate, 7.70) / 100),
      (oi.price * oi.quantity),
      'pending'
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN artist_profiles ap ON p.artist_id = ap.id
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic commission creation
DROP TRIGGER IF EXISTS create_commission_on_payment ON orders;
CREATE TRIGGER create_commission_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_artist_commission();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_commissions_artist_id ON artist_commissions(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_commissions_order_id ON artist_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_custom_design_requests_artist_id ON custom_design_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_custom_design_requests_customer_id ON custom_design_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_design_customization_requests_artist_id ON design_customization_requests(artist_id);

-- Update existing artist profiles with default commission rates
UPDATE artist_profiles 
SET commission_rate = 7.70 
WHERE commission_rate IS NULL;

-- Function to get artist earnings summary
CREATE OR REPLACE FUNCTION get_artist_earnings_summary(artist_uuid UUID)
RETURNS TABLE (
  total_earnings DECIMAL(10,2),
  pending_earnings DECIMAL(10,2),
  paid_earnings DECIMAL(10,2),
  total_orders INTEGER,
  commission_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(commission_amount), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_earnings,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid_earnings,
    COUNT(DISTINCT order_id)::INTEGER as total_orders,
    COALESCE(MAX(commission_rate), 7.70) as commission_rate
  FROM artist_commissions 
  WHERE artist_id = artist_uuid;
END;
$$ LANGUAGE plpgsql;
