import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xrqfckeuzzgnwkutxqkx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWZja2V1enpnbndrdXR4cWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTQ5MDUsImV4cCI6MjA2Mzg3MDkwNX0.QGEZZ2lkSc7J6BEY_Vub1FxxmX8sSkqdG50aCJq0R6Q'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'brandy-shop-auth-token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  },
  db: {
    schema: 'public'
  }
})



// Types for our database
export type UserRole = 'customer' | 'artist' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  phone?: string
  location?: string
  bio?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface ArtistProfile {
  id: string
  specialty?: string
  portfolio_url?: string
  price_range?: string
  response_time: string
  languages: string[]
  skills: string[]
  total_earnings: number
  completed_orders: number
  rating: number
  total_reviews: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
}

export interface Product {
  id: string
  artist_id: string
  title: string
  description?: string
  category_id?: string
  price: number
  original_price?: number
  image_url?: string
  images: string[]
  tags: string[]
  is_featured: boolean
  is_active: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
  // Relations
  artist?: Profile
  category?: Category
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address?: any
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  customer?: Profile
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  customization_data?: any
  created_at: string
  // Relations
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  customer_id: string
  rating: number
  comment?: string
  created_at: string
  // Relations
  customer?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
  // Relations
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  customization_data?: any
  created_at: string
  updated_at: string
  // Relations
  product?: Product
}
