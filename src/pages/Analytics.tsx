import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Eye,
  Heart,
  Star,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalEarnings: number
    totalSales: number
    totalViews: number
    totalLikes: number
    earningsChange: number
    salesChange: number
    viewsChange: number
    likesChange: number
  }
  topProducts: Array<{
    id: string
    title: string
    image: string
    sales: number
    revenue: number
    views: number
  }>
  recentOrders: Array<{
    id: string
    product: string
    customer: string
    amount: number
    date: string
    status: string
  }>
  monthlyData: Array<{
    month: string
    earnings: number
    sales: number
    views: number
  }>
}

const Analytics = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  // Mock analytics data
  const mockData: AnalyticsData = {
    overview: {
      totalEarnings: 45750,
      totalSales: 127,
      totalViews: 8420,
      totalLikes: 1250,
      earningsChange: 12.5,
      salesChange: 8.3,
      viewsChange: -2.1,
      likesChange: 15.7
    },
    topProducts: [
      {
        id: '1',
        title: 'Kenyan Wildlife Safari T-Shirt',
        image: '/placeholder.svg',
        sales: 45,
        revenue: 67500,
        views: 1250
      },
      {
        id: '2',
        title: 'Traditional Maasai Patterns Hoodie',
        image: '/placeholder.svg',
        sales: 32,
        revenue: 80000,
        views: 980
      },
      {
        id: '3',
        title: 'Nairobi Skyline Coffee Mug',
        image: '/placeholder.svg',
        sales: 28,
        revenue: 22400,
        views: 750
      },
      {
        id: '4',
        title: 'Kikuyu Proverbs Canvas Tote',
        image: '/placeholder.svg',
        sales: 22,
        revenue: 26400,
        views: 650
      }
    ],
    recentOrders: [
      {
        id: 'ORD-001',
        product: 'Wildlife T-Shirt',
        customer: 'John Doe',
        amount: 1500,
        date: '2024-01-15',
        status: 'completed'
      },
      {
        id: 'ORD-002',
        product: 'Maasai Hoodie',
        customer: 'Jane Smith',
        amount: 2500,
        date: '2024-01-14',
        status: 'processing'
      },
      {
        id: 'ORD-003',
        product: 'Coffee Mug',
        customer: 'Mike Johnson',
        amount: 800,
        date: '2024-01-13',
        status: 'shipped'
      }
    ],
    monthlyData: [
      { month: 'Jan', earnings: 45750, sales: 127, views: 8420 },
      { month: 'Dec', earnings: 38200, sales: 98, views: 7200 },
      { month: 'Nov', earnings: 42100, sales: 115, views: 7800 },
      { month: 'Oct', earnings: 35600, sales: 89, views: 6900 },
      { month: 'Sep', earnings: 39800, sales: 102, views: 7400 },
      { month: 'Aug', earnings: 41200, sales: 108, views: 7600 }
    ]
  }

  useEffect(() => {
    // Check if user is an artist
    if (profile && profile.role !== 'artist') {
      navigate('/dashboard')
      return
    }

    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1500)
  }, [profile, navigate])

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-500" />
    )
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || (profile && profile.role !== 'artist')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Access Required</h1>
            <p className="text-gray-600 mb-4">This page is only available for artists</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Track your performance and earnings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(analyticsData.overview.totalEarnings)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getChangeIcon(analyticsData.overview.earningsChange)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(analyticsData.overview.earningsChange)}`}>
                      {Math.abs(analyticsData.overview.earningsChange)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.totalSales}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getChangeIcon(analyticsData.overview.salesChange)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(analyticsData.overview.salesChange)}`}>
                      {Math.abs(analyticsData.overview.salesChange)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getChangeIcon(analyticsData.overview.viewsChange)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(analyticsData.overview.viewsChange)}`}>
                      {Math.abs(analyticsData.overview.viewsChange)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Likes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.totalLikes.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getChangeIcon(analyticsData.overview.likesChange)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(analyticsData.overview.likesChange)}`}>
                      {Math.abs(analyticsData.overview.likesChange)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Top Products</TabsTrigger>
                <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Monthly Performance Chart Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Monthly Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Chart visualization would go here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Sales by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Pie chart would go here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                          </div>
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{product.sales} sales</span>
                              <span>{product.views} views</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-sm text-gray-500">Revenue</p>
                          </div>
                        </div>
                      ))}
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
                    <div className="space-y-4">
                      {analyticsData.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{order.product}</h4>
                            <p className="text-sm text-gray-500">by {order.customer}</p>
                            <p className="text-xs text-gray-400">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(order.amount)}
                            </p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Detailed trend analysis would go here</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Including conversion rates, customer acquisition, and seasonal patterns
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
      
      <Footer />
    </div>
  )
}

export default Analytics
