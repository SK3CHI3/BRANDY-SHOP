-- Missing Tables Setup for Brandy Shop
-- Run this SQL in your Supabase SQL Editor to create missing tables

-- Create custom_design_requests table
CREATE TABLE IF NOT EXISTS custom_design_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  budget TEXT,
  deadline DATE,
  contact_info TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  estimated_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_followers table
CREATE TABLE IF NOT EXISTS artist_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist_id, follower_id)
);

-- Create artist_earnings table
CREATE TABLE IF NOT EXISTS artist_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  earning_type VARCHAR(50) NOT NULL CHECK (earning_type IN ('sale', 'commission', 'bonus')),
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn')),
  available_for_withdrawal_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_withdrawals table
CREATE TABLE IF NOT EXISTS artist_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  mpesa_phone VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  transaction_id VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_orders table (for AI-generated designs)
CREATE TABLE IF NOT EXISTS custom_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_config JSONB NOT NULL,
  design_data JSONB,
  ai_prompt TEXT,
  ai_image_url TEXT,
  pricing_breakdown JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE custom_design_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_design_requests
CREATE POLICY "Users can view own custom requests" ON custom_design_requests 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom requests" ON custom_design_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all custom requests" ON custom_design_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for artist_followers
CREATE POLICY "Users can view artist followers" ON artist_followers 
  FOR SELECT USING (true);

CREATE POLICY "Users can follow/unfollow artists" ON artist_followers 
  FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for artist_earnings
CREATE POLICY "Artists can view own earnings" ON artist_earnings 
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Admins can view all earnings" ON artist_earnings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for artist_withdrawals
CREATE POLICY "Artists can view own withdrawals" ON artist_withdrawals 
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create withdrawal requests" ON artist_withdrawals 
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Admins can manage all withdrawals" ON artist_withdrawals 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for custom_orders
CREATE POLICY "Users can view own custom orders" ON custom_orders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create custom orders" ON custom_orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all custom orders" ON custom_orders 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add foreign key constraint for withdrawals
ALTER TABLE artist_earnings 
ADD CONSTRAINT fk_earnings_withdrawal 
FOREIGN KEY (withdrawal_id) REFERENCES artist_withdrawals(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_requests_user_id ON custom_design_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_design_requests(status);
CREATE INDEX IF NOT EXISTS idx_artist_followers_artist_id ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_follower_id ON artist_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_artist_earnings_artist_id ON artist_earnings(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_earnings_status ON artist_earnings(status);
CREATE INDEX IF NOT EXISTS idx_artist_withdrawals_artist_id ON artist_withdrawals(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_withdrawals_status ON artist_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);

-- Add updated_at triggers
CREATE TRIGGER custom_design_requests_updated_at 
  BEFORE UPDATE ON custom_design_requests 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER artist_earnings_updated_at 
  BEFORE UPDATE ON artist_earnings 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER artist_withdrawals_updated_at 
  BEFORE UPDATE ON artist_withdrawals 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER custom_orders_updated_at 
  BEFORE UPDATE ON custom_orders 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to automatically create earnings when order is completed
CREATE OR REPLACE FUNCTION create_artist_earnings()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  platform_fee_rate DECIMAL := 0.15; -- 15% platform fee
  gross_amount DECIMAL;
  platform_fee DECIMAL;
  net_amount DECIMAL;
BEGIN
  -- Only create earnings when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Loop through all order items
    FOR item IN 
      SELECT oi.*, p.artist_id, p.price 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = NEW.id AND p.artist_id IS NOT NULL
    LOOP
      -- Calculate earnings
      gross_amount := item.price * item.quantity;
      platform_fee := gross_amount * platform_fee_rate;
      net_amount := gross_amount - platform_fee;
      
      -- Insert earnings record
      INSERT INTO artist_earnings (
        artist_id,
        order_id,
        product_id,
        earning_type,
        gross_amount,
        platform_fee,
        net_amount,
        status
      ) VALUES (
        item.artist_id,
        NEW.id,
        item.product_id,
        'sale',
        gross_amount,
        platform_fee,
        net_amount,
        'pending'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic earnings creation
DROP TRIGGER IF EXISTS trigger_create_artist_earnings ON orders;
CREATE TRIGGER trigger_create_artist_earnings
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_artist_earnings();

-- Function to update earnings status to available after waiting period
CREATE OR REPLACE FUNCTION update_earnings_availability()
RETURNS void AS $$
BEGIN
  UPDATE artist_earnings 
  SET status = 'available'
  WHERE status = 'pending' 
    AND available_for_withdrawal_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'custom_design_requests',
    'artist_followers', 
    'artist_earnings',
    'artist_withdrawals',
    'custom_orders'
  )
ORDER BY table_name;
