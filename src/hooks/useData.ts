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
      title: 'Kenyan Wildlife Safari T-Shirt',
      description: 'Beautiful wildlife design featuring Kenyan animals',
      price: 1500,
      image_url: '/placeholder.svg',
      images: ['/placeholder.svg'],
      category_id: '1',
      artist_id: 'mock-artist-1',
      is_active: true,
      is_featured: true,
      stock_quantity: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-1',
        full_name: 'Sarah Wanjiku',
        avatar_url: '/placeholder.svg'
      },
      category: {
        id: '1',
        name: 'T-Shirts'
      }
    },
    {
      id: '2',
      title: 'Traditional Maasai Patterns Hoodie',
      description: 'Authentic Maasai patterns on comfortable hoodie',
      price: 2500,
      image_url: '/placeholder.svg',
      images: ['/placeholder.svg'],
      category_id: '2',
      artist_id: 'mock-artist-2',
      is_active: true,
      is_featured: true,
      stock_quantity: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-2',
        full_name: 'John Mwangi',
        avatar_url: '/placeholder.svg'
      },
      category: {
        id: '2',
        name: 'Hoodies'
      }
    },
    {
      id: '3',
      title: 'Nairobi Skyline Coffee Mug',
      description: 'Beautiful Nairobi skyline design',
      price: 800,
      image_url: '/placeholder.svg',
      images: ['/placeholder.svg'],
      category_id: '3',
      artist_id: 'mock-artist-1',
      is_active: true,
      is_featured: false,
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-1',
        full_name: 'Sarah Wanjiku',
        avatar_url: '/placeholder.svg'
      },
      category: {
        id: '3',
        name: 'Mugs'
      }
    },
    {
      id: '4',
      title: 'Kikuyu Proverbs Canvas Tote',
      description: 'Traditional Kikuyu wisdom on a stylish tote bag',
      price: 1200,
      image_url: '/placeholder.svg',
      images: ['/placeholder.svg'],
      category_id: '4',
      artist_id: 'mock-artist-3',
      is_active: true,
      is_featured: false,
      stock_quantity: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artist: {
        id: 'mock-artist-3',
        full_name: 'Grace Njeri',
        avatar_url: '/placeholder.svg'
      },
      category: {
        id: '4',
        name: 'Bags'
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
