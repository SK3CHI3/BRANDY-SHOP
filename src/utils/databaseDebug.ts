// Database Debug Utilities
// This file contains utilities to debug database connection and table issues

import { supabase } from '@/lib/supabase'

export interface DatabaseInfo {
  connected: boolean
  tables: string[]
  errors: string[]
  sampleData: Record<string, any[]>
}

// Check database connection and available tables
export const checkDatabaseConnection = async (): Promise<DatabaseInfo> => {
  const info: DatabaseInfo = {
    connected: false,
    tables: [],
    errors: [],
    sampleData: {}
  }

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (testError) {
      info.errors.push(`Connection test failed: ${testError.message}`)
    } else {
      info.connected = true
    }

    // Try to get table information
    const tablesToCheck = [
      'profiles',
      'products',
      'categories',
      'artist_profiles',
      'orders',
      'order_items',
      'reviews',
      'favorites',
      'cart_items'
    ]

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(3)

        if (error) {
          info.errors.push(`Table '${table}': ${error.message}`)
        } else {
          info.tables.push(table)
          info.sampleData[table] = data || []
        }
      } catch (err) {
        info.errors.push(`Table '${table}': ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

  } catch (error) {
    info.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return info
}

// Create sample data for testing
export const createSampleData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create categories first
    const categories = [
      { id: '1', name: 'T-Shirts', description: 'Custom printed t-shirts' },
      { id: '2', name: 'Hoodies', description: 'Comfortable hoodies with custom designs' },
      { id: '3', name: 'Mugs', description: 'Custom printed mugs' },
      { id: '4', name: 'Bags', description: 'Custom bags and totes' }
    ]

    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' })

    if (categoriesError) {
      return { success: false, message: `Failed to create categories: ${categoriesError.message}` }
    }

    // Create sample products
    const products = [
      {
        id: '1',
        title: 'Kenyan Wildlife Safari T-Shirt',
        description: 'Beautiful wildlife design featuring Kenyan animals',
        price: 1500,
        image_url: '/placeholder.svg',
        category_id: '1',
        artist_id: 'sample-artist-1',
        is_active: true,
        is_featured: true,
        stock_quantity: 50,
        images: ['/placeholder.svg'],
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Traditional Maasai Patterns Hoodie',
        description: 'Authentic Maasai patterns on comfortable hoodie',
        price: 2500,
        image_url: '/placeholder.svg',
        category_id: '2',
        artist_id: 'sample-artist-2',
        is_active: true,
        is_featured: true,
        stock_quantity: 30,
        images: ['/placeholder.svg'],
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Nairobi Skyline Coffee Mug',
        description: 'Beautiful Nairobi skyline design',
        price: 800,
        image_url: '/placeholder.svg',
        category_id: '3',
        artist_id: 'sample-artist-1',
        is_active: true,
        is_featured: false,
        stock_quantity: 100,
        images: ['/placeholder.svg'],
        created_at: new Date().toISOString()
      }
    ]

    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' })

    if (productsError) {
      return { success: false, message: `Failed to create products: ${productsError.message}` }
    }

    return { success: true, message: 'Sample data created successfully' }
  } catch (error) {
    return {
      success: false,
      message: `Error creating sample data: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Get the complete database setup SQL
export const getCompleteSetupSQL = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Return the complete setup SQL from our setup file
    const setupSQL = await fetch('/src/database/supabase-setup.sql').then(r => r.text()).catch(() => null)

    if (setupSQL) {
      return { success: true, message: setupSQL }
    }

    // Fallback to inline SQL if file not accessible
    return getInlineSetupSQL()
  } catch (error) {
    return getInlineSetupSQL()
  }
}

// Create database tables if they don't exist
export const createMissingTables = async (): Promise<{ success: boolean; message: string }> => {
  try {
    return await getCompleteSetupSQL()
  } catch (error) {
    return getInlineSetupSQL()
  }
}

// Inline SQL as fallback
const getInlineSetupSQL = (): { success: boolean; message: string } => {
  try {

    const sqlCommands = `
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  category_id UUID REFERENCES categories(id),
  artist_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  bio TEXT,
  portfolio_url TEXT,
  response_time VARCHAR(50) DEFAULT '24 hours',
  languages TEXT[] DEFAULT ARRAY['English'],
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_earnings DECIMAL(10,2) DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  tracking_number VARCHAR(255),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  customization JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  customization JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create order_tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to categories and products
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Artist profiles are viewable by everyone" ON artist_profiles FOR SELECT USING (true);

-- Create policies for user-specific data
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
`

    return {
      success: true,
      message: `Please run the following SQL in your Supabase SQL Editor:\n\n${sqlCommands}`
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Fix existing users with wrong roles
export const fixExistingUsers = async (): Promise<{ success: boolean; message: string; fixed: number }> => {
  try {
    // Get all auth users and their profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      return { success: false, message: `Failed to fetch profiles: ${profilesError.message}`, fixed: 0 }
    }

    let fixed = 0
    const errors: string[] = []

    // For each profile, check if they need an artist profile
    for (const profile of profiles || []) {
      if (profile.role === 'artist') {
        // Check if artist profile exists
        const { data: artistProfile, error: artistError } = await supabase
          .from('artist_profiles')
          .select('id')
          .eq('id', profile.id)
          .single()

        if (artistError && artistError.code === 'PGRST116') {
          // Artist profile doesn't exist, create it
          const { error: createError } = await supabase
            .from('artist_profiles')
            .insert({
              id: profile.id,
              bio: '',
              response_time: '24 hours',
              languages: ['English'],
              skills: [],
              total_earnings: 0,
              completed_orders: 0,
              rating: 0,
              total_reviews: 0
            })

          if (createError) {
            errors.push(`Failed to create artist profile for ${profile.email}: ${createError.message}`)
          } else {
            fixed++
          }
        }
      }
    }

    return {
      success: true,
      message: `Fixed ${fixed} users. ${errors.length} errors: ${errors.join(', ')}`,
      fixed
    }
  } catch (error) {
    return {
      success: false,
      message: `Error fixing users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fixed: 0
    }
  }
}

// Console helper functions
export const debugDatabase = async () => {
  const info = await checkDatabaseConnection()
  console.log('Database Debug Info:', info)
  return info
}

export const setupSampleData = async () => {
  const result = await createSampleData()
  console.log('Sample Data Setup:', result)
  return result
}

export const showTableCreationSQL = async () => {
  const result = await createMissingTables()
  console.log('Table Creation SQL:', result.message)
  return result
}

export const fixUsers = async () => {
  const result = await fixExistingUsers()
  console.log('Fix Users Result:', result)
  return result
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugDatabase = debugDatabase
  (window as any).setupSampleData = setupSampleData
  (window as any).showTableCreationSQL = showTableCreationSQL
  (window as any).checkDatabaseConnection = checkDatabaseConnection
  (window as any).fixExistingUsers = fixExistingUsers
  (window as any).fixUsers = fixUsers
}
