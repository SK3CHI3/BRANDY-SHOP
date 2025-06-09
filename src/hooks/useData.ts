import { useState, useEffect } from 'react'
import { supabase, Product, Category, Profile, ArtistProfile, Order, Review, Favorite, CartItem } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useData as useGlobalData } from '@/contexts/DataContext'

// Optimized Products hooks using global data
export const useProducts = (filters?: { category?: string; artist?: string; featured?: boolean }) => {
  const globalData = useGlobalData()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If specific filters are provided, fetch fresh data
    if (filters && (filters.category || filters.artist)) {
      console.log('🛍️ Fetching products with specific filters:', filters)
      globalData.refreshProducts(filters)
    } else if (filters?.featured) {
      // For featured products, use the global featured products
      setFilteredProducts(globalData.featuredProducts)
    } else {
      // For general products, use global products
      setFilteredProducts(globalData.products)
    }
  }, [filters?.category, filters?.artist, filters?.featured, globalData.products, globalData.featuredProducts])

  return {
    products: filteredProducts,
    loading: globalData.productsLoading,
    error
  }
}

// Mock data for when database is not set up
const getMockProducts = (filters?: { category?: string; artist?: string; featured?: boolean }): Product[] => {
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Kenyan Wildlife Safari Design',
      description: 'Beautiful wildlife design featuring Kenyan animals - Available for free use',
      price: 0,
      image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&h=500&fit=crop&crop=center',
      watermarked_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&h=500&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
      high_res_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=1200&fit=crop&crop=center',
      images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&h=500&fit=crop&crop=center'],
      category_id: '1',
      artist_id: 'mock-artist-1',
      is_active: true,
      is_featured: true,
      is_free: true,
      license_type: 'free',
      usage_rights: 'Free for personal and commercial use with attribution',
      stock_quantity: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-1',
        full_name: 'Sarah Wanjiku',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        total_sales: 45
      },
      category: {
        id: '1',
        name: 'Wildlife'
      }
    },
    {
      id: '2',
      title: 'Traditional Maasai Patterns',
      description: 'Authentic Maasai patterns - Premium licensed design',
      price: 1200,
      license_price: 800,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&crop=center',
      watermarked_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
      high_res_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1200&fit=crop&crop=center',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&crop=center'],
      category_id: '2',
      artist_id: 'mock-artist-2',
      is_active: true,
      is_featured: true,
      is_free: false,
      license_type: 'standard',
      usage_rights: 'Standard license for personal and commercial use',
      stock_quantity: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-2',
        full_name: 'John Mwangi',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 4.6,
        total_sales: 32
      },
      category: {
        id: '2',
        name: 'Traditional'
      }
    },
    {
      id: '3',
      title: 'Nairobi Skyline Silhouette',
      description: 'Beautiful Nairobi skyline design - Exclusive license available',
      price: 2500,
      license_price: 1500,
      image_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=500&h=500&fit=crop&crop=center',
      watermarked_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=500&h=500&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
      high_res_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1200&h=1200&fit=crop&crop=center',
      images: ['https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=500&h=500&fit=crop&crop=center'],
      category_id: '3',
      artist_id: 'mock-artist-1',
      is_active: true,
      is_featured: false,
      is_free: false,
      license_type: 'exclusive',
      usage_rights: 'Exclusive license - you get sole usage rights',
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-1',
        full_name: 'Sarah Wanjiku',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        total_sales: 45
      },
      category: {
        id: '3',
        name: 'Modern'
      }
    },
    {
      id: '4',
      title: 'Kikuyu Proverbs Typography',
      description: 'Traditional Kikuyu wisdom in beautiful typography - Commercial license',
      price: 1800,
      license_price: 1200,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop&crop=center',
      watermarked_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
      high_res_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1200&fit=crop&crop=center',
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop&crop=center'],
      category_id: '4',
      artist_id: 'mock-artist-3',
      is_active: true,
      is_featured: false,
      is_free: false,
      license_type: 'commercial',
      usage_rights: 'Commercial license with full usage rights for business',
      stock_quantity: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-3',
        full_name: 'Grace Njeri',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 4.7,
        total_sales: 39
      },
      category: {
        id: '4',
        name: 'Typography'
      }
    },
    {
      id: '5',
      title: 'Swahili Wisdom Quotes',
      description: 'Beautiful Swahili quotes and sayings - Free for community use',
      price: 0,
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&crop=center',
      watermarked_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
      high_res_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=1200&fit=crop&crop=center',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&crop=center'],
      category_id: '5',
      artist_id: 'mock-artist-4',
      is_active: true,
      is_featured: true,
      is_free: true,
      license_type: 'free',
      usage_rights: 'Free for personal and commercial use with attribution',
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-4',
        full_name: 'Amina Hassan',
        avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        total_sales: 67
      },
      category: {
        id: '5',
        name: 'Typography'
      }
    }
  ]

  // Apply filters
  let filteredProducts = mockProducts

  if (filters?.featured) {
    filteredProducts = filteredProducts.filter(p => p.is_featured)
  }

  if (filters?.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category_id === filters.category)
  }

  if (filters?.artist) {
    filteredProducts = filteredProducts.filter(p => p.artist_id === filters.artist)
  }

  return filteredProducts
}

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            artist:profiles!artist_id(id, full_name, avatar_url, bio),
            category:categories(id, name)
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Product not found')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  return { product, loading, error }
}

// Categories hook
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) {
          console.error('Categories fetch error:', error)
          // If table doesn't exist, provide mock data
          if (error.code === '42P01') {
            setCategories(getMockCategories())
            setError('Database tables not set up. Using mock data.')
          } else {
            throw error
          }
        } else {
          setCategories(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Categories fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        // Provide mock data as fallback
        setCategories(getMockCategories())
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Mock categories data
const getMockCategories = (): Category[] => {
  return [
    {
      id: '1',
      name: 'T-Shirts',
      description: 'Custom printed t-shirts',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Hoodies',
      description: 'Comfortable hoodies with custom designs',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Mugs',
      description: 'Custom printed mugs',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Bags',
      description: 'Custom bags and totes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

// Artists hooks
export const useArtists = () => {
  const [artists, setArtists] = useState<(Profile & { artist_profile?: ArtistProfile })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          artist_profile:artist_profiles(*)
        `)
        .eq('role', 'artist')
        .order('created_at', { ascending: false })

      setArtists(data || [])
      setLoading(false)
    }

    fetchArtists()
  }, [])

  return { artists, loading }
}

// Note: useOrders is now in src/hooks/useOrders.ts to avoid conflicts

// Reviews hooks
export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!customer_id(id, full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      setReviews(data || [])
      setLoading(false)
    }

    if (productId) fetchReviews()
  }, [productId])

  return { reviews, loading }
}

// Note: useFavorites is now in src/hooks/useFavorites.ts to avoid conflicts

// Cart hooks
export const useCart = () => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)

        if (error) {
          console.error('Cart fetch error:', error)
          setCartItems([])
        } else {
          setCartItems(data || [])
        }
      } catch (err) {
        console.error('Cart fetch error:', err)
        setCartItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const addToCart = async (productId: string, quantity: number = 1, customization?: any) => {
    if (!user) return

    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity,
        customization_data: customization,
        updated_at: new Date().toISOString()
      })
      .select()

    if (!error && data) {
      // Refresh cart
      const { data: updatedCart } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            artist:profiles!artist_id(id, full_name)
          )
        `)
        .eq('user_id', user.id)

      setCartItems(updatedCart || [])
    }

    return { error }
  }

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    }

    return { error }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId)

    if (!error) {
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ))
    }

    return { error }
  }

  const clearCart = async () => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (!error) {
      setCartItems([])
    }

    return { error }
  }

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    cartTotal,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0)
  }
}

// Optimized Stats hook using global data
export const useStats = () => {
  const { stats, statsLoading } = useGlobalData()
  return { stats, loading: statsLoading }
}

// Optimized Featured Products hook using global data
export const useFeaturedProducts = () => {
  const { featuredProducts, featuredLoading } = useGlobalData()
  return { featuredProducts, loading: featuredLoading }
}
