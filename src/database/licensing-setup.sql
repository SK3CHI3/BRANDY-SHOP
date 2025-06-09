-- Design Licensing System Setup for BRANDY-SHOP
-- This script adds licensing functionality to the existing products table
-- and creates the design_licenses table for tracking license purchases

-- First, add missing license fields to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS license_type VARCHAR(50) CHECK (license_type IN ('free', 'standard', 'exclusive', 'commercial')),
ADD COLUMN IF NOT EXISTS license_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS usage_rights TEXT,
ADD COLUMN IF NOT EXISTS watermarked_url TEXT,
ADD COLUMN IF NOT EXISTS high_res_url TEXT;

-- Create design_licenses table for tracking license purchases
CREATE TABLE IF NOT EXISTS design_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('standard', 'exclusive', 'commercial')),
  license_price DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  artist_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'expired', 'cancelled')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  license_terms TEXT,
  usage_rights TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create license_files table for tracking delivered files
CREATE TABLE IF NOT EXISTS license_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES design_licenses(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('png', 'jpg', 'svg', 'pdf', 'ai', 'psd')),
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_design_licenses_customer ON design_licenses(customer_id);
CREATE INDEX IF NOT EXISTS idx_design_licenses_artist ON design_licenses(artist_id);
CREATE INDEX IF NOT EXISTS idx_design_licenses_design ON design_licenses(design_id);
CREATE INDEX IF NOT EXISTS idx_design_licenses_status ON design_licenses(status);
CREATE INDEX IF NOT EXISTS idx_design_licenses_created ON design_licenses(created_at);
CREATE INDEX IF NOT EXISTS idx_license_files_license ON license_files(license_id);

-- Enable Row Level Security
ALTER TABLE design_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for design_licenses
-- Customers can view their own license purchases
CREATE POLICY "Customers can view own licenses" ON design_licenses
  FOR SELECT USING (auth.uid() = customer_id);

-- Artists can view licenses for their designs
CREATE POLICY "Artists can view own design licenses" ON design_licenses
  FOR SELECT USING (auth.uid() = artist_id);

-- Customers can create license purchases
CREATE POLICY "Customers can create licenses" ON design_licenses
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Artists can update license status (for delivery)
CREATE POLICY "Artists can update license status" ON design_licenses
  FOR UPDATE USING (auth.uid() = artist_id);

-- Admins can view and manage all licenses
CREATE POLICY "Admins can manage all licenses" ON design_licenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for license_files
-- License owners can view their files
CREATE POLICY "License owners can view files" ON license_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM design_licenses 
      WHERE id = license_id AND customer_id = auth.uid()
    )
  );

-- Artists can manage files for their licenses
CREATE POLICY "Artists can manage license files" ON license_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM design_licenses 
      WHERE id = license_id AND artist_id = auth.uid()
    )
  );

-- Admins can manage all license files
CREATE POLICY "Admins can manage all license files" ON license_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically calculate artist earnings and platform fee
CREATE OR REPLACE FUNCTION calculate_license_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate 5% platform fee and 95% artist earnings
  NEW.platform_fee := ROUND(NEW.license_price * 0.05, 2);
  NEW.artist_earnings := NEW.license_price - NEW.platform_fee;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate earnings on insert/update
CREATE TRIGGER calculate_license_earnings_trigger
  BEFORE INSERT OR UPDATE ON design_licenses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_license_earnings();

-- Function to update license status timestamps
CREATE OR REPLACE FUNCTION update_license_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set delivered_at when status changes to delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for license status timestamps
CREATE TRIGGER update_license_timestamps_trigger
  BEFORE UPDATE ON design_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_license_timestamps();

-- Insert some sample license data for testing
INSERT INTO design_licenses (
  design_id, customer_id, artist_id, license_type, license_price, 
  status, payment_method, transaction_id, license_terms, usage_rights
) VALUES 
-- Note: Replace these UUIDs with actual IDs from your products and profiles tables
-- This is just sample structure - you'll need to update with real data
(
  (SELECT id FROM products LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'artist' LIMIT 1),
  'standard',
  500.00,
  'paid',
  'M-Pesa',
  'TXN123456789',
  'Non-exclusive usage rights for personal and commercial use',
  'Can be used for digital and print media, no resale rights'
) ON CONFLICT DO NOTHING;

-- Create a view for license analytics
CREATE OR REPLACE VIEW license_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  license_type,
  COUNT(*) as total_licenses,
  SUM(license_price) as total_revenue,
  SUM(platform_fee) as platform_revenue,
  SUM(artist_earnings) as artist_revenue,
  AVG(license_price) as avg_license_price
FROM design_licenses 
WHERE status IN ('paid', 'delivered')
GROUP BY DATE_TRUNC('month', created_at), license_type
ORDER BY month DESC, license_type;

-- Grant necessary permissions
GRANT SELECT ON license_analytics TO authenticated;
