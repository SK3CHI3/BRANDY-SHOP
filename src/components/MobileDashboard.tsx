import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Palette, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Bell, 
  Settings,
  TrendingUp,
  Package,
  Star,
  Upload,
  BarChart3,
  DollarSign,
  Eye
} from 'lucide-react'

interface MobileDashboardProps {
  userRole: 'artist' | 'customer' | 'admin'
  stats?: {
    designs?: number
    orders?: number
    earnings?: number
    followers?: number
    favorites?: number
    messages?: number
  }
  recentActivity?: Array<{
    id: string
    type: string
    title: string
    time: string
    status?: string
  }>
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  userRole, 
  stats = {}, 
  recentActivity = [] 
}) => {
  const getQuickActions = () => {
    switch (userRole) {
      case 'artist':
        return [
          { icon: Upload, label: 'Upload Design', href: '/upload-design', color: 'bg-purple-500' },
          { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'bg-blue-500' },
          { icon: MessageCircle, label: 'Messages', href: '/messages', color: 'bg-green-500' },
          { icon: DollarSign, label: 'Earnings', href: '/artist-studio', color: 'bg-yellow-500' },
        ]
      case 'customer':
        return [
          { icon: ShoppingCart, label: 'Browse', href: '/marketplace', color: 'bg-orange-500' },
          { icon: Heart, label: 'Favorites', href: '/favorites', color: 'bg-red-500' },
          { icon: Package, label: 'Orders', href: '/order-tracking', color: 'bg-blue-500' },
          { icon: MessageCircle, label: 'Messages', href: '/messages', color: 'bg-green-500' },
        ]
      case 'admin':
        return [
          { icon: Settings, label: 'Admin Panel', href: '/admin-panel', color: 'bg-gray-700' },
          { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'bg-blue-500' },
          { icon: User, label: 'Users', href: '/admin-panel', color: 'bg-purple-500' },
          { icon: Package, label: 'Orders', href: '/admin-panel', color: 'bg-green-500' },
        ]
      default:
        return []
    }
  }

  const getStatsCards = () => {
    switch (userRole) {
      case 'artist':
        return [
          { label: 'Designs', value: stats.designs || 0, icon: Palette, color: 'text-purple-600' },
          { label: 'Orders', value: stats.orders || 0, icon: Package, color: 'text-blue-600' },
          { label: 'Earnings', value: `KSh ${(stats.earnings || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
          { label: 'Followers', value: stats.followers || 0, icon: Heart, color: 'text-red-600' },
        ]
      case 'customer':
        return [
          { label: 'Orders', value: stats.orders || 0, icon: Package, color: 'text-blue-600' },
          { label: 'Favorites', value: stats.favorites || 0, icon: Heart, color: 'text-red-600' },
          { label: 'Messages', value: stats.messages || 0, icon: MessageCircle, color: 'text-green-600' },
          { label: 'Reviews', value: stats.designs || 0, icon: Star, color: 'text-yellow-600' },
        ]
      case 'admin':
        return [
          { label: 'Users', value: stats.designs || 0, icon: User, color: 'text-purple-600' },
          { label: 'Orders', value: stats.orders || 0, icon: Package, color: 'text-blue-600' },
          { label: 'Revenue', value: `KSh ${(stats.earnings || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
          { label: 'Products', value: stats.favorites || 0, icon: Palette, color: 'text-orange-600' },
        ]
      default:
        return []
    }
  }

  const quickActions = getQuickActions()
  const statsCards = getStatsCards()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-2">
          Welcome back!
        </h2>
        <p className="text-purple-100 text-sm sm:text-base">
          {userRole === 'artist' && "Ready to create something amazing?"}
          {userRole === 'customer' && "Discover unique designs today!"}
          {userRole === 'admin' && "Manage your platform efficiently."}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                    <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.status && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button className="flex-1 min-h-[48px]" asChild>
          <Link to="/profile">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 min-h-[48px]" asChild>
          <Link to="/notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default MobileDashboard
