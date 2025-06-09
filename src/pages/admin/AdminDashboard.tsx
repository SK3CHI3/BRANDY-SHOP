import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalArtists: number
  totalDesigns: number
  totalPrintOrders: number
  printRevenue: number
  pendingPrintOrders: number
  completedPrintOrders: number
  activeDesigns: number
  featuredListings: number
  newUsersToday: number
  platformProfit: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'product' | 'withdrawal'
  description: string
  timestamp: string
  status?: string
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArtists: 0,
    totalDesigns: 0,
    totalPrintOrders: 0,
    printRevenue: 0,
    pendingPrintOrders: 0,
    completedPrintOrders: 0,
    activeDesigns: 0,
    featuredListings: 0,
    newUsersToday: 0,
    platformProfit: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch basic stats
      const [
        usersRes,
        artistsRes,
        productsRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'artist'),
        supabase.from('products').select('id', { count: 'exact' })
      ])

      // Mock print order data (in real app, this would come from print_orders table)
      const mockPrintOrders = [
        { total_amount: 1500, markup: 300, status: 'delivered' },
        { total_amount: 1000, markup: 200, status: 'pending' },
        { total_amount: 2000, markup: 500, status: 'delivered' }
      ]

      const totalPrintOrders = mockPrintOrders.length
      const printRevenue = mockPrintOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const platformProfit = mockPrintOrders.reduce((sum, order) => sum + order.markup, 0)
      const pendingPrintOrders = mockPrintOrders.filter(o => o.status === 'pending').length
      const completedPrintOrders = mockPrintOrders.filter(o => o.status === 'delivered').length

      // Get new users today
      const today = new Date().toISOString().split('T')[0]
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', today)

      setStats({
        totalUsers: usersRes.count || 0,
        totalArtists: artistsRes.count || 0,
        totalDesigns: productsRes.count || 0, // Products are now designs
        totalPrintOrders,
        printRevenue,
        pendingPrintOrders,
        completedPrintOrders,
        activeDesigns: productsRes.count || 0, // Active designs
        featuredListings: 5, // Mock featured listings count
        newUsersToday: newUsersToday || 0,
        platformProfit
      })

      // Fetch recent activity
      await fetchRecentActivity()

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          profiles!customer_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      const activity: RecentActivity[] = []

      // Add print order activities (mock data)
      const mockPrintOrders = [
        {
          id: '1',
          description: 'New print order: Maasai Pattern T-Shirt from John Doe',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          description: 'Print order completed: Kenyan Wildlife Mug for Jane Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'delivered'
        }
      ]

      mockPrintOrders.forEach(order => {
        activity.push({
          id: order.id,
          type: 'order',
          description: order.description,
          timestamp: order.timestamp,
          status: order.status
        })
      })

      // Add user activities
      recentUsers?.forEach(user => {
        activity.push({
          id: user.id,
          type: 'user',
          description: `New ${user.role} registered: ${user.full_name || user.email}`,
          timestamp: user.created_at
        })
      })

      // Sort by timestamp
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setRecentActivity(activity.slice(0, 8))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to BRANDY-SHOP - Design Licensing & Printing Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Print Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPrintOrders.toLocaleString()}</div>
            <p className="text-xs text-orange-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats.pendingPrintOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Print Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">KSh {stats.printRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              KSh {stats.platformProfit.toLocaleString()} profit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Designs</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeDesigns.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {stats.totalDesigns} total designs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalArtists}</div>
            <p className="text-sm text-gray-600">Active creators on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Featured Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.featuredListings}</div>
            <p className="text-sm text-gray-600">Artists paying for promotion</p>
            <p className="text-xs text-green-600 mt-1">KSh 2,500 monthly revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payments</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'product' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.status && (
                  <Badge variant={
                    activity.status === 'pending' ? 'secondary' :
                    activity.status === 'completed' || activity.status === 'delivered' ? 'default' :
                    'outline'
                  }>
                    {activity.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
