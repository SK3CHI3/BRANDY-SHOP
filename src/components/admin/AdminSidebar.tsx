import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  Bell,
  FileText,
  UserCheck,
  CreditCard,
  Palette,
  Upload
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin-panel',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'Print Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Manage printing orders'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and artists'
  },
  {
    name: 'Design Catalog',
    href: '/admin/products',
    icon: Package,
    description: 'Manage design submissions'
  },
  {
    name: 'Design Licensing',
    href: '/admin/design-licensing',
    icon: Palette,
    description: 'License transactions'
  },
  {
    name: 'Design Submissions',
    href: '/admin/design-submissions',
    icon: Upload,
    description: 'Review submissions'
  },
  {
    name: 'Print Revenue',
    href: '/admin/financials',
    icon: DollarSign,
    description: 'Printing profits & costs'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics'
  },
  {
    name: 'Messages & Support',
    href: '/admin/messages',
    icon: MessageSquare,
    description: 'Customer support'
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'System notifications'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate reports'
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform configuration'
  }
]

const AdminSidebar: React.FC = () => {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive ? 'text-red-600' : 'text-gray-400'
              )} />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default AdminSidebar
