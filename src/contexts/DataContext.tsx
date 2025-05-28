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
  forceRefreshAll: () => Promise<void>
  invalidateProductCache: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Cache utilities for localStorage persistence
const CACHE_KEYS = {
  STATS: 'brandy_cache_stats',
  FEATURED_PRODUCTS: 'brandy_cache_featured',
  PRODUCTS: 'brandy_cache_products'
}

const CACHE_DURATION = 30000 // 30 seconds

// Persistent cache with localStorage backup
const getCache = (key: string, defaultValue: any) => {
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error)
  }
  return defaultValue
}

const setCache = (key: string, data: any, timestamp: number) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp }))
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}

const clearCache = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Cache clear error:', error)
  }
}

// Global cache with localStorage persistence
let globalCache = {
  stats: getCache(CACHE_KEYS.STATS, { data: null as Stats | null, timestamp: 0 }),
  featuredProducts: getCache(CACHE_KEYS.FEATURED_PRODUCTS, { data: [] as Product[], timestamp: 0 }),
  products: getCache(CACHE_KEYS.PRODUCTS, { data: [] as Product[], timestamp: 0, filters: null as any })
}

// Initialize state from cache
const initializeFromCache = () => {
  const statsCache = getCache(CACHE_KEYS.STATS, { data: null, timestamp: 0 })
  const featuredCache = getCache(CACHE_KEYS.FEATURED_PRODUCTS, { data: [], timestamp: 0 })
  const productsCache = getCache(CACHE_KEYS.PRODUCTS, { data: [], timestamp: 0, filters: null })

  return {
    stats: statsCache.data || { artistCount: 0, productCount: 0, orderCount: 0 },
    featuredProducts: featuredCache.data || [],
    products: productsCache.data || []
  }
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const cachedData = initializeFromCache()

  const [stats, setStats] = useState<Stats>(cachedData.stats)
  const [statsLoading, setStatsLoading] = useState(true)

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(cachedData.featuredProducts)
  const [featuredLoading, setFeaturedLoading] = useState(true)

  const [products, setProducts] = useState<Product[]>(cachedData.products)
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

      // Update cache with localStorage persistence
      globalCache.stats = { data: statsData, timestamp: now }
      setCache(CACHE_KEYS.STATS, statsData, now)
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

        // Update cache with localStorage persistence
        globalCache.featuredProducts = { data: productsWithBasicDetails, timestamp: now }
        setCache(CACHE_KEYS.FEATURED_PRODUCTS, productsWithBasicDetails, now)
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

        // Update cache with localStorage persistence
        globalCache.products = { data: productsWithBasicDetails, timestamp: now, filters }
        setCache(CACHE_KEYS.PRODUCTS, { data: productsWithBasicDetails, filters }, now)
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
        await refreshProducts() // Load all products, not just featured
      }, 200)
    }

    initializeData()

    // Set up real-time subscription for products
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('🔄 Product change detected:', payload.eventType)
          // Clear cache and refresh products when changes occur
          globalCache.products = { data: [], timestamp: 0, filters: {} }
          globalCache.featuredProducts = { data: [], timestamp: 0 }

          clearCache(CACHE_KEYS.PRODUCTS)
          clearCache(CACHE_KEYS.FEATURED_PRODUCTS)

          // Refresh data after a short delay to allow DB to settle
          setTimeout(() => {
            refreshProducts()
            refreshFeaturedProducts()
          }, 1000)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Force refresh all data (clear cache)
  const forceRefreshAll = async () => {
    console.log('🔄 Force refreshing all data...')

    // Clear all caches including localStorage
    globalCache.stats = { data: null, timestamp: 0 }
    globalCache.featuredProducts = { data: [], timestamp: 0 }
    globalCache.products = { data: [], timestamp: 0, filters: {} }

    clearCache(CACHE_KEYS.STATS)
    clearCache(CACHE_KEYS.FEATURED_PRODUCTS)
    clearCache(CACHE_KEYS.PRODUCTS)

    // Refresh all data
    await Promise.all([
      refreshStats(),
      refreshFeaturedProducts(),
      refreshProducts() // Get all products, not just featured
    ])

    console.log('✅ All data refreshed')
  }

  // Invalidate product cache (for use after uploads)
  const invalidateProductCache = () => {
    console.log('🗑️ Invalidating product cache...')
    globalCache.products = { data: [], timestamp: 0, filters: {} }
    globalCache.featuredProducts = { data: [], timestamp: 0 }

    clearCache(CACHE_KEYS.PRODUCTS)
    clearCache(CACHE_KEYS.FEATURED_PRODUCTS)

    // Trigger immediate refresh
    refreshProducts()
    refreshFeaturedProducts()
  }

  const value: DataContextType = {
    stats,
    statsLoading,
    featuredProducts,
    featuredLoading,
    products,
    productsLoading,
    refreshStats,
    refreshFeaturedProducts,
    refreshProducts,
    forceRefreshAll,
    invalidateProductCache
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
