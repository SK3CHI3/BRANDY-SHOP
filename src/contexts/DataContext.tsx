import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, Product } from '@/lib/supabase'

interface Stats {
  artistCount: number
  productCount: number
  orderCount: number
}

interface DataContextType {
  // Stats
  stats: Stats
  statsLoading: boolean
  
  // Featured Products
  featuredProducts: Product[]
  featuredLoading: boolean
  
  // Products
  products: Product[]
  productsLoading: boolean
  
  // Methods
  refreshStats: () => Promise<void>
  refreshFeaturedProducts: () => Promise<void>
  refreshProducts: (filters?: { category?: string; artist?: string; featured?: boolean }) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Global cache with timestamps
let globalCache = {
  stats: { data: null as Stats | null, timestamp: 0 },
  featuredProducts: { data: [] as Product[], timestamp: 0 },
  products: { data: [] as Product[], timestamp: 0, filters: null as any }
}

const CACHE_DURATION = 30000 // 30 seconds

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<Stats>({ artistCount: 0, productCount: 0, orderCount: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  // Optimized stats fetching
  const refreshStats = async () => {
    const now = Date.now()
    
    // Check cache first
    if (globalCache.stats.data && (now - globalCache.stats.timestamp) < CACHE_DURATION) {
      console.log('📊 Using cached stats')
      setStats(globalCache.stats.data)
      setStatsLoading(false)
      return
    }

    console.log('📊 Fetching fresh stats...')
    setStatsLoading(true)

    try {
      // Optimized parallel queries with only count
      const [artistResult, productResult, orderResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'artist'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('id', { count: 'exact', head: true })
      ])

      const statsData = {
        artistCount: artistResult.error ? 2 : (artistResult.count || 0),
        productCount: productResult.error ? 3 : (productResult.count || 0),
        orderCount: orderResult.error ? 0 : (orderResult.count || 0)
      }

      // Update cache
      globalCache.stats = { data: statsData, timestamp: now }
      setStats(statsData)
      console.log('📊 Stats updated:', statsData)
    } catch (error) {
      console.error('📊 Stats fetch error:', error)
      // Use fallback data
      const fallbackStats = { artistCount: 2, productCount: 3, orderCount: 0 }
      setStats(fallbackStats)
    } finally {
      setStatsLoading(false)
    }
  }

  // Optimized featured products fetching
  const refreshFeaturedProducts = async () => {
    const now = Date.now()
    
    // Check cache first
    if (globalCache.featuredProducts.data.length > 0 && (now - globalCache.featuredProducts.timestamp) < CACHE_DURATION) {
      console.log('⭐ Using cached featured products')
      setFeaturedProducts(globalCache.featuredProducts.data)
      setFeaturedLoading(false)
      return
    }

    console.log('⭐ Fetching fresh featured products...')
    setFeaturedLoading(true)

    try {
      // Optimized query - select only needed fields
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, price, image_url, artist_id, category_id, is_featured, created_at')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(2)

      if (error) {
        console.error('⭐ Featured products fetch error:', error)
        setFeaturedProducts([])
      } else {
        // Add basic artist/category info without additional queries
        const productsWithBasicDetails = (data || []).map(product => ({
          ...product,
          images: [product.image_url],
          stock_quantity: 50,
          updated_at: product.created_at,
          artist: product.artist_id ? {
            id: product.artist_id,
            full_name: 'Featured Artist',
            avatar_url: '/placeholder.svg'
          } : null,
          category: product.category_id ? {
            id: product.category_id,
            name: 'Category'
          } : null,
          favoriteCount: 0,
          averageRating: 0,
          reviewCount: 0
        })) as Product[]

        // Update cache
        globalCache.featuredProducts = { data: productsWithBasicDetails, timestamp: now }
        setFeaturedProducts(productsWithBasicDetails)
        console.log('⭐ Featured products updated:', productsWithBasicDetails.length)
      }
    } catch (error) {
      console.error('⭐ Featured products fetch error:', error)
      setFeaturedProducts([])
    } finally {
      setFeaturedLoading(false)
    }
  }

  // Optimized products fetching
  const refreshProducts = async (filters?: { category?: string; artist?: string; featured?: boolean }) => {
    const now = Date.now()
    
    // Check cache with filters
    const filtersKey = JSON.stringify(filters || {})
    if (globalCache.products.data.length > 0 && 
        (now - globalCache.products.timestamp) < CACHE_DURATION &&
        JSON.stringify(globalCache.products.filters) === filtersKey) {
      console.log('🛍️ Using cached products')
      setProducts(globalCache.products.data)
      setProductsLoading(false)
      return
    }

    console.log('🛍️ Fetching fresh products with filters:', filters)
    setProductsLoading(true)

    try {
      // Optimized query - select only needed fields
      let query = supabase
        .from('products')
        .select('id, title, description, price, image_url, artist_id, category_id, is_featured, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category)
      }
      if (filters?.artist) {
        query = query.eq('artist_id', filters.artist)
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('🛍️ Products fetch error:', error)
        setProducts([])
      } else {
        // Add basic details without additional queries
        const productsWithBasicDetails = (data || []).map(product => ({
          ...product,
          images: [product.image_url],
          stock_quantity: 50,
          updated_at: product.created_at,
          artist: product.artist_id ? {
            id: product.artist_id,
            full_name: 'Artist',
            avatar_url: '/placeholder.svg'
          } : null,
          category: product.category_id ? {
            id: product.category_id,
            name: 'Category'
          } : null
        })) as Product[]

        // Update cache
        globalCache.products = { data: productsWithBasicDetails, timestamp: now, filters }
        setProducts(productsWithBasicDetails)
        console.log('🛍️ Products updated:', productsWithBasicDetails.length)
      }
    } catch (error) {
      console.error('🛍️ Products fetch error:', error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    console.log('🚀 DataProvider initializing...')
    
    // Stagger the requests to avoid overwhelming the database
    const initializeData = async () => {
      await refreshStats()
      
      // Small delay between requests
      setTimeout(async () => {
        await refreshFeaturedProducts()
      }, 100)
      
      setTimeout(async () => {
        await refreshProducts({ featured: true })
      }, 200)
    }

    initializeData()
  }, [])

  const value: DataContextType = {
    stats,
    statsLoading,
    featuredProducts,
    featuredLoading,
    products,
    productsLoading,
    refreshStats,
    refreshFeaturedProducts,
    refreshProducts
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
