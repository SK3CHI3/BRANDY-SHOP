-- Design Studio Database Setup
-- Run this SQL in your Supabase SQL Editor to create tables for the design studio features

-- Create design_projects table for storing user design projects
CREATE TABLE IF NOT EXISTS design_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('tshirt', 'hoodie', 'cap', 'mug', 'bag', 'phone-case', 'notebook', 'sticker')),
  design_data JSONB NOT NULL DEFAULT '{}', -- Stores canvas data, elements, etc.
  preview_image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_downloads table for tracking paid downloads
CREATE TABLE IF NOT EXISTS design_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  design_project_id UUID REFERENCES design_projects(id) ON DELETE CASCADE,
  download_type VARCHAR(50) NOT NULL CHECK (download_type IN ('png', 'svg', 'pdf', 'bundle')),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference VARCHAR(255),
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_requests table for design printing quotes
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  design_project_id UUID REFERENCES design_projects(id) ON DELETE CASCADE,
  product_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  additional_requirements TEXT,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed')),
  quoted_price DECIMAL(10,2),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_templates table for reusable design templates
CREATE TABLE IF NOT EXISTS design_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  product_type VARCHAR(50) NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  category VARCHAR(100),
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_collaborations table for shared design projects
CREATE TABLE IF NOT EXISTS design_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_project_id UUID REFERENCES design_projects(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(design_project_id, collaborator_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_design_projects_user_id ON design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_status ON design_projects(status);
CREATE INDEX IF NOT EXISTS idx_design_projects_product_type ON design_projects(product_type);
CREATE INDEX IF NOT EXISTS idx_design_downloads_user_id ON design_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_design_downloads_payment_status ON design_downloads(payment_status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_design_templates_product_type ON design_templates(product_type);
CREATE INDEX IF NOT EXISTS idx_design_templates_category ON design_templates(category);

-- Add RLS (Row Level Security) policies
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_collaborations ENABLE ROW LEVEL SECURITY;

-- Policies for design_projects
CREATE POLICY "Users can view own design projects" ON design_projects
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own design projects" ON design_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own design projects" ON design_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own design projects" ON design_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for design_downloads
CREATE POLICY "Users can view own downloads" ON design_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads" ON design_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for quote_requests
CREATE POLICY "Users can view own quote requests" ON quote_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quote requests" ON quote_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quote requests" ON quote_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for design_templates (public read, authenticated insert)
CREATE POLICY "Anyone can view active templates" ON design_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can insert templates" ON design_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON design_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies for design_collaborations
CREATE POLICY "Users can view collaborations they're part of" ON design_collaborations
  FOR SELECT USING (
    auth.uid() = collaborator_id OR 
    auth.uid() = invited_by OR
    auth.uid() IN (
      SELECT user_id FROM design_projects WHERE id = design_project_id
    )
  );

CREATE POLICY "Users can insert collaborations for own projects" ON design_collaborations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM design_projects WHERE id = design_project_id
    )
  );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_design_projects_updated_at BEFORE UPDATE ON design_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_templates_updated_at BEFORE UPDATE ON design_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_collaborations_updated_at BEFORE UPDATE ON design_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE design_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample design templates
INSERT INTO design_templates (template_name, description, product_type, template_data, category, tags, is_active) VALUES
('Simple Text Design', 'Basic text overlay template', 'tshirt', '{"elements": [{"type": "text", "content": "Your Text Here", "style": {"fontSize": 24, "color": "#000000"}}]}', 'Basic', ARRAY['text', 'simple'], true),
('Logo Placement', 'Template for logo placement', 'hoodie', '{"elements": [{"type": "placeholder", "content": "Logo Here", "style": {"width": 100, "height": 100}}]}', 'Business', ARRAY['logo', 'business'], true),
('Vintage Badge', 'Retro style badge design', 'cap', '{"elements": [{"type": "shape", "shape": "circle", "style": {"border": "2px solid #8B4513"}}]}', 'Vintage', ARRAY['vintage', 'badge'], true),
('Coffee Quote', 'Inspirational coffee mug design', 'mug', '{"elements": [{"type": "text", "content": "But First, Coffee", "style": {"fontSize": 18, "color": "#8B4513"}}]}', 'Lifestyle', ARRAY['coffee', 'quote'], true),
('Eco Message', 'Environmental awareness bag design', 'bag', '{"elements": [{"type": "text", "content": "Save Our Planet", "style": {"fontSize": 20, "color": "#228B22"}}]}', 'Environmental', ARRAY['eco', 'message'], true),
('Phone Protection', 'Minimalist phone case design', 'phone-case', '{"elements": [{"type": "shape", "shape": "rectangle", "style": {"border": "1px solid #000000"}}]}', 'Minimalist', ARRAY['minimal', 'protection'], true),
('Journal Cover', 'Personal notebook design', 'notebook', '{"elements": [{"type": "text", "content": "My Journal", "style": {"fontSize": 16, "color": "#4B0082"}}]}', 'Personal', ARRAY['journal', 'personal'], true),
('Fun Sticker', 'Colorful sticker design', 'sticker', '{"elements": [{"type": "shape", "shape": "star", "style": {"fill": "#FFD700"}}]}', 'Fun', ARRAY['colorful', 'fun'], true)
ON CONFLICT DO NOTHING;
