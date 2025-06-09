-- Featured Listings Setup for Brandy Shop
-- Run this SQL in your Supabase SQL Editor to create the featured listings system

-- Create featured_listings table for paid promotions
CREATE TABLE IF NOT EXISTS featured_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  featured_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, featured_from, featured_until)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_featured_listings_product_id ON featured_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_listings_artist_id ON featured_listings(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_listings_active ON featured_listings(is_active, payment_status, featured_from, featured_until);
CREATE INDEX IF NOT EXISTS idx_featured_listings_payment_status ON featured_listings(payment_status);

-- Create function to automatically expire featured listings
CREATE OR REPLACE FUNCTION expire_featured_listings()
RETURNS void AS $$
BEGIN
  -- Deactivate expired featured listings
  UPDATE featured_listings 
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true 
    AND featured_until < NOW();
  
  -- Update products to remove featured status for expired listings
  UPDATE products 
  SET is_featured = false, updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT product_id 
    FROM featured_listings 
    WHERE is_active = false 
      AND featured_until < NOW()
      AND updated_at >= NOW() - INTERVAL '1 minute'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to activate featured listings when payment is completed
CREATE OR REPLACE FUNCTION activate_featured_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to completed, activate the listing and update product
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    -- Activate the featured listing
    NEW.is_active = true;
    NEW.updated_at = NOW();
    
    -- Update the product to be featured
    UPDATE products 
    SET is_featured = true, updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  
  -- If payment status changed from completed, deactivate the listing
  IF OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
    NEW.is_active = false;
    NEW.updated_at = NOW();
    
    -- Check if this product has any other active featured listings
    IF NOT EXISTS (
      SELECT 1 FROM featured_listings 
      WHERE product_id = NEW.product_id 
        AND id != NEW.id 
        AND is_active = true 
        AND payment_status = 'completed'
        AND featured_from <= NOW() 
        AND featured_until > NOW()
    ) THEN
      -- Remove featured status from product if no other active listings
      UPDATE products 
      SET is_featured = false, updated_at = NOW()
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for featured listing activation
DROP TRIGGER IF EXISTS trigger_activate_featured_listing ON featured_listings;
CREATE TRIGGER trigger_activate_featured_listing
  BEFORE UPDATE ON featured_listings
  FOR EACH ROW
  EXECUTE FUNCTION activate_featured_listing();

-- Create function to handle featured listing expiry (to be called by cron job)
CREATE OR REPLACE FUNCTION handle_featured_listing_expiry()
RETURNS void AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Get count of listings to expire
  SELECT COUNT(*) INTO expired_count
  FROM featured_listings
  WHERE is_active = true 
    AND payment_status = 'completed'
    AND featured_until < NOW();
  
  -- Deactivate expired listings
  UPDATE featured_listings 
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true 
    AND payment_status = 'completed'
    AND featured_until < NOW();
  
  -- Update products to remove featured status for expired listings
  UPDATE products 
  SET is_featured = false, updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT fl.product_id 
    FROM featured_listings fl
    WHERE fl.is_active = false 
      AND fl.featured_until < NOW()
      AND fl.updated_at >= NOW() - INTERVAL '5 minutes'
      -- Only remove featured status if no other active featured listings exist
      AND NOT EXISTS (
        SELECT 1 FROM featured_listings fl2
        WHERE fl2.product_id = fl.product_id
          AND fl2.id != fl.id
          AND fl2.is_active = true
          AND fl2.payment_status = 'completed'
          AND fl2.featured_from <= NOW()
          AND fl2.featured_until > NOW()
      )
  );
  
  -- Log the expiry action (optional)
  RAISE NOTICE 'Expired % featured listings', expired_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Artists can view their own featured listings
CREATE POLICY "Artists can view own featured listings" ON featured_listings
  FOR SELECT USING (artist_id = auth.uid());

-- Artists can create featured listings for their own products
CREATE POLICY "Artists can create featured listings" ON featured_listings
  FOR INSERT WITH CHECK (
    artist_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id AND artist_id = auth.uid()
    )
  );

-- Artists can update their own featured listings (for payment status updates)
CREATE POLICY "Artists can update own featured listings" ON featured_listings
  FOR UPDATE USING (artist_id = auth.uid());

-- Admins can view all featured listings
CREATE POLICY "Admins can view all featured listings" ON featured_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public can view active featured listings (for displaying featured products)
CREATE POLICY "Public can view active featured listings" ON featured_listings
  FOR SELECT USING (
    is_active = true AND 
    payment_status = 'completed' AND
    featured_from <= NOW() AND 
    featured_until > NOW()
  );

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add sample featured listings

/*
-- Sample featured listings (make sure to replace with actual product and artist IDs)
INSERT INTO featured_listings (
  product_id, 
  artist_id, 
  payment_amount, 
  payment_method, 
  payment_status, 
  transaction_id,
  featured_from,
  featured_until,
  is_active
) VALUES 
-- Replace these UUIDs with actual product and artist IDs from your database
-- ('product-uuid-1', 'artist-uuid-1', 500.00, 'mpesa', 'completed', 'TXN001', NOW(), NOW() + INTERVAL '7 days', true),
-- ('product-uuid-2', 'artist-uuid-2', 800.00, 'mpesa', 'completed', 'TXN002', NOW(), NOW() + INTERVAL '30 days', true),
-- ('product-uuid-3', 'artist-uuid-3', 300.00, 'card', 'completed', 'TXN003', NOW(), NOW() + INTERVAL '14 days', true);
*/

-- Create a view for easy querying of active featured products
CREATE OR REPLACE VIEW active_featured_products AS
SELECT 
  p.*,
  fl.payment_amount as featured_payment,
  fl.featured_from,
  fl.featured_until,
  fl.created_at as featured_since
FROM products p
INNER JOIN featured_listings fl ON p.id = fl.product_id
WHERE fl.is_active = true 
  AND fl.payment_status = 'completed'
  AND fl.featured_from <= NOW() 
  AND fl.featured_until > NOW()
ORDER BY fl.featured_from DESC;

-- Grant necessary permissions
GRANT SELECT ON active_featured_products TO anon, authenticated;
GRANT ALL ON featured_listings TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
