import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

import CommissionDashboard from '@/components/CommissionDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Package,
  BarChart3,
  Palette,
  Upload,
  Settings,
  Filter,
  Search,
  MoreVertical,
  ArrowUpRight,
  Calendar,
  Users,
  Wallet,
  DollarSign
} from 'lucide-react'

const ArtistStudio = () => {
  const { user, profile } = useAuth()
  const { invalidateProductCache } = useData()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Enhanced dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
    averageRating: 0,
    recentOrders: [],
    recentReviews: [],
    monthlyEarnings: [],
    topProducts: []
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    tags: '',
    stock_quantity: '10'
  })

  // Fetch all data
  useEffect(() => {
    if (!user || profile?.role !== 'artist') return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            favorites(id)
          `)
          .eq('artist_id', user.id)
          .order('created_at', { ascending: false })

        if (productsError) throw productsError

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)

        // Fetch orders for earnings calculation
        const { data: ordersData } = await supabase
          .from('order_items')
          .select(`
            *,
            order:orders(status, created_at),
            product:products!inner(artist_id)
          `)
          .eq('product.artist_id', user.id)

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            *,
            customer:profiles!customer_id(full_name, avatar_url),
            product:products(title)
          `)
          .eq('artist_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const products = productsData || []
        const orders = ordersData || []
        const reviews = reviewsData || []

        // Calculate metrics
        const totalEarnings = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0)
        const totalFavorites = products.reduce((sum, product) => sum + (product.favorites?.length || 0), 0)
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0

        setProducts(products)
        setCategories(categoriesData || [])
        setDashboardData({
          totalEarnings,
          totalProducts: products.length,
          activeProducts: products.filter(p => p.is_active).length,
          totalViews: products.reduce((sum, product) => sum + (product.view_count || 0), 0),
          totalFavorites,
          averageRating,
          recentOrders: orders.slice(0, 5),
          recentReviews: reviews,
          monthlyEarnings: [], // TODO: Calculate monthly data
          topProducts: products.sort((a, b) => (b.favorites?.length || 0) - (a.favorites?.length || 0)).slice(0, 3)
        })

      } catch (error) {
        console.error('Error fetching studio data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load studio data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, profile])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUploading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          artist_id: user.id,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: '/placeholder.svg', // TODO: Implement image upload
          is_active: true
        })
        .select()

      if (error) throw error

      // Invalidate product cache to trigger immediate marketplace update
      invalidateProductCache()

      toast({
        title: 'Success',
        description: 'Product uploaded successfully!',
      })

      setShowUploadDialog(false)
      setFormData({
        title: '',
        description: '',
        category_id: '',
        price: '',
        original_price: '',
        tags: '',
        stock_quantity: '10'
      })

      // Refresh data instead of full page reload
      const { data: newProductsData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          favorites(id)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      if (newProductsData) {
        setProducts(newProductsData)
        setDashboardData(prev => ({
          ...prev,
          totalProducts: newProductsData.length,
          activeProducts: newProductsData.filter(p => p.is_active).length
        }))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload product',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Invalidate product cache to trigger immediate marketplace update
      invalidateProductCache()

      toast({
        title: 'Success',
        description: 'Product deleted successfully!',
      })

      // Refresh products list
      const { data: newProductsData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          favorites(id)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      if (newProductsData) {
        setProducts(newProductsData)
        setDashboardData(prev => ({
          ...prev,
          totalProducts: newProductsData.length,
          activeProducts: newProductsData.filter(p => p.is_active).length
        }))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  if (!user || !profile || profile.role !== 'artist') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to artists.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && product.is_active) ||
                         (filterStatus === 'inactive' && !product.is_active)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6 lg:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl w-fit">
                <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span>Artist Studio</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Manage your designs, track performance, and grow your business</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/artist-orders')}
              className="flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[48px] text-sm sm:text-base"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Order Management</span>
              <span className="sm:hidden">Orders</span>
            </Button>
            <Link to="/upload-design" className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Design</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KSh {loading ? '...' : dashboardData.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+12% this month</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white min-h-[48px]"
                onClick={() => window.open('https://wa.me/254714525667?text=Hello! I would like to discuss my earnings and payment options.', '_blank')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contact for Payment</span>
                <span className="sm:hidden">Payment</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Designs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : dashboardData.totalProducts}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{dashboardData.activeProducts} active</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : dashboardData.totalFavorites}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Across all designs</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : 'New'}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">{dashboardData.recentReviews.length} reviews</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 bg-white shadow-sm border border-gray-200 rounded-xl p-1 h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">🎨</span>
            </TabsTrigger>
            <TabsTrigger
              value="commissions"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Commissions</span>
              <span className="sm:hidden">💰</span>
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Earnings</span>
              <span className="sm:hidden">💳</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">📦</span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white min-h-[44px] text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Reviews</span>
              <span className="sm:hidden">⭐</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performing Designs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.topProducts.map((product: any, index: number) => (
                        <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="relative">
                            <img
                              src={product.image_url || '/placeholder.svg'}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>KSh {product.price?.toLocaleString()}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{product.favorites?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No performance data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recent Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.recentReviews.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentReviews.slice(0, 3).map((review: any) => (
                        <div key={review.id} className="border-l-4 border-yellow-400 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              by {review.customer?.full_name || 'Anonymous'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                          {review.product && (
                            <p className="text-xs text-gray-500 mt-1">
                              for "{review.product.title}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 sm:space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 min-h-[48px] text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 min-h-[48px] text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="min-h-[44px]">All Products</SelectItem>
                  <SelectItem value="active" className="min-h-[44px]">Active Only</SelectItem>
                  <SelectItem value="inactive" className="min-h-[44px]">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-gray-200 overflow-hidden relative">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-purple-600">KSh {product.price?.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Heart className="h-3 w-3" />
                          <span>{product.favorites?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 min-h-[44px]">
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No designs found' : 'No designs yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by uploading your first design to the marketplace'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link to="/upload-design">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Design
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <CommissionDashboard />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Payment System</h3>
                  <p className="text-gray-600 mb-4">
                    Artists receive payments directly from customers. No withdrawal system needed!
                  </p>
                  <Button
                    onClick={() => window.open('https://wa.me/254714525667?text=Hello! I would like to discuss my earnings and payment tracking.', '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Contact Support for Payment Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p>Orders for your designs will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentReviews.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardData.recentReviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.customer?.full_name || 'Anonymous'}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            {review.product && (
                              <p className="text-sm text-purple-600">
                                Review for "{review.product.title}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p>Customer reviews will appear here when you receive them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

export default ArtistStudio
