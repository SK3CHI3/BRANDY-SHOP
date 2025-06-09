import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Download
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number; artists: number }>
  revenueData: Array<{ month: string; revenue: number; orders: number }>
  productCategories: Array<{ name: string; value: number; color: string }>
  orderStatus: Array<{ status: string; count: number; color: string }>
  topArtists: Array<{ name: string; revenue: number; orders: number }>
  dailyStats: Array<{ date: string; orders: number; revenue: number }>
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    productCategories: [],
    orderStatus: [],
    topArtists: [],
    dailyStats: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch user growth data
      const userGrowthData = await fetchUserGrowthData()
      
      // Fetch revenue data
      const revenueData = await fetchRevenueData()
      
      // Fetch product categories
      const productCategories = await fetchProductCategories()
      
      // Fetch order status distribution
      const orderStatus = await fetchOrderStatusData()
      
      // Fetch top artists
      const topArtists = await fetchTopArtists()
      
      // Fetch daily stats
      const dailyStats = await fetchDailyStats()

      setAnalyticsData({
        userGrowth: userGrowthData,
        revenueData,
        productCategories,
        orderStatus,
        topArtists,
        dailyStats
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserGrowthData = async () => {
    // Mock data for user growth - in real app, this would aggregate by month
    return [
      { month: 'Jan', users: 12, artists: 3 },
      { month: 'Feb', users: 19, artists: 5 },
      { month: 'Mar', users: 25, artists: 7 },
      { month: 'Apr', users: 32, artists: 9 },
      { month: 'May', users: 45, artists: 12 },
      { month: 'Jun', users: 52, artists: 15 }
    ]
  }

  const fetchRevenueData = async () => {
    // Get actual revenue data from orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at, payment_status')
      .eq('payment_status', 'paid')

    // Mock monthly aggregation
    return [
      { month: 'Jan', revenue: 15000, orders: 8 },
      { month: 'Feb', revenue: 23000, orders: 12 },
      { month: 'Mar', revenue: 18000, orders: 10 },
      { month: 'Apr', revenue: 31000, orders: 16 },
      { month: 'May', revenue: 28000, orders: 14 },
      { month: 'Jun', revenue: 35000, orders: 18 }
    ]
  }

  const fetchProductCategories = async () => {
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        category:categories(name)
      `)

    // Count products by category
    const categoryCount: { [key: string]: number } = {}
    products?.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized'
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1
    })

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
    return Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
  }

  const fetchOrderStatusData = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('status')

    const statusCount: { [key: string]: number } = {}
    orders?.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1
    })

    const statusColors: { [key: string]: string } = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    }

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: statusColors[status] || '#6b7280'
    }))
  }

  const fetchTopArtists = async () => {
    // Mock data for top artists
    return [
      { name: 'Omollo artist1', revenue: 25000, orders: 12 },
      { name: 'Artist Two', revenue: 18000, orders: 8 },
      { name: 'Creative Artist', revenue: 15000, orders: 6 },
      { name: 'Design Master', revenue: 12000, orders: 5 },
      { name: 'Art Genius', revenue: 8000, orders: 4 }
    ]
  }

  const fetchDailyStats = async () => {
    // Mock daily stats for the last 7 days
    return [
      { date: '2024-06-03', orders: 3, revenue: 4500 },
      { date: '2024-06-04', orders: 5, revenue: 7200 },
      { date: '2024-06-05', orders: 2, revenue: 3100 },
      { date: '2024-06-06', orders: 7, revenue: 9800 },
      { date: '2024-06-07', orders: 4, revenue: 5600 },
      { date: '2024-06-08', orders: 6, revenue: 8400 },
      { date: '2024-06-09', orders: 8, revenue: 11200 }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Platform Analytics
          </h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">KSh 150,000</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">78</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% from last month
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">52</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.3% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products Listed</p>
                <p className="text-2xl font-bold text-orange-600">124</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.7% from last month
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Total Users" />
                <Bar dataKey="artists" fill="#8b5cf6" name="Artists" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.productCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.orderStatus} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `KSh ${Number(value).toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Artists */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Artists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topArtists.map((artist, index) => (
              <div key={artist.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{artist.name}</div>
                    <div className="text-sm text-gray-500">{artist.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">KSh {artist.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
