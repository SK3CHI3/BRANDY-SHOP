import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  Eye,
  TrendingUp,
  Star,
  ShoppingBag,
  Palette,
  BarChart3,
  AlertCircle
} from 'lucide-react'

// Artist-specific interfaces
interface ArtistOrder {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  customerName: string
  customerEmail: string
  designTitle: string
  designImage: string
  quantity: number
  unitPrice: number
  totalAmount: number
  commission: number
  commissionRate: number
  shippingAddress: string
  trackingNumber?: string
  estimatedDelivery: string
}

interface DesignPerformance {
  id: string
  title: string
  image: string
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  averageRating: number
  totalViews: number
  conversionRate: number
  lastOrderDate: string
}

const ArtistOrders = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [artistOrders, setArtistOrders] = useState<ArtistOrder[]>([])
  const [designPerformance, setDesignPerformance] = useState<DesignPerformance[]>([])

  // Check if user is artist
  useEffect(() => {
    if (user && user.role !== 'artist') {
      navigate('/artist-studio')
    }
  }, [user, navigate])

  // Mock artist orders data
  const mockArtistOrders: ArtistOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'shipped',
      createdAt: '2024-01-15T10:30:00Z',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      designTitle: 'Kenyan Wildlife T-Shirt',
      designImage: '/placeholder.svg',
      quantity: 2,
      unitPrice: 1500,
      totalAmount: 3000,
      commission: 450,
      commissionRate: 15,
      shippingAddress: '123 Kenyatta Avenue, Nairobi',
      trackingNumber: 'TRK-KE-789456123',
      estimatedDelivery: '2024-01-20T18:00:00Z'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'processing',
      createdAt: '2024-01-16T14:20:00Z',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      designTitle: 'Traditional Patterns Hoodie',
      designImage: '/placeholder.svg',
      quantity: 1,
      unitPrice: 2500,
      totalAmount: 2500,
      commission: 375,
      commissionRate: 15,
      shippingAddress: '456 Uhuru Highway, Mombasa',
      estimatedDelivery: '2024-01-22T18:00:00Z'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'delivered',
      createdAt: '2024-01-10T09:15:00Z',
      customerName: 'Peter Kamau',
      customerEmail: 'peter@example.com',
      designTitle: 'Maasai Culture Design',
      designImage: '/placeholder.svg',
      quantity: 3,
      unitPrice: 1800,
      totalAmount: 5400,
      commission: 810,
      commissionRate: 15,
      shippingAddress: '789 Kimathi Street, Kisumu',
      trackingNumber: 'TRK-KE-123789456',
      estimatedDelivery: '2024-01-15T18:00:00Z'
    }
  ]

  // Mock design performance data
  const mockDesignPerformance: DesignPerformance[] = [
    {
      id: '1',
      title: 'Kenyan Wildlife T-Shirt',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=300&h=300&fit=crop&crop=center',
      totalOrders: 25,
      totalRevenue: 37500,
      totalCommission: 5625,
      averageRating: 4.8,
      totalViews: 1250,
      conversionRate: 2.0,
      lastOrderDate: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Traditional Patterns Hoodie',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
      totalOrders: 18,
      totalRevenue: 45000,
      totalCommission: 6750,
      averageRating: 4.6,
      totalViews: 980,
      conversionRate: 1.8,
      lastOrderDate: '2024-01-16T14:20:00Z'
    },
    {
      id: '3',
      title: 'Maasai Culture Design',
      image: '/placeholder.svg',
      totalOrders: 32,
      totalRevenue: 57600,
      totalCommission: 8640,
      averageRating: 4.9,
      totalViews: 1680,
      conversionRate: 1.9,
      lastOrderDate: '2024-01-10T09:15:00Z'
    }
  ]

  useEffect(() => {
    if (user?.role === 'artist') {
      setArtistOrders(mockArtistOrders)
      setDesignPerformance(mockDesignPerformance)
    }
  }, [user])

  // Filter orders based on search term
  const filteredOrders = artistOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.designTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter designs based on search term
  const filteredDesigns = designPerformance.filter(design =>
    design.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading or redirect message for non-artists
  if (user && user.role !== 'artist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">
              This page is for artists only. Redirecting you back...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/artist-studio')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studio
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">
                Track orders for your designs and monitor performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders or designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{artistOrders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KSh {artistOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KSh {artistOrders.reduce((sum, order) => sum + order.commission, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Designs</p>
                  <p className="text-2xl font-bold text-gray-900">{designPerformance.length}</p>
                </div>
                <Palette className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white shadow-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger
              value="orders"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Customer Orders
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Design Performance
            </TabsTrigger>
          </TabsList>

          {/* Customer Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Orders for your designs will appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={order.designImage}
                            alt={order.designTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{order.designTitle}</h3>
                            <p className="text-gray-600">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium">{order.quantity} items</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Your Commission</p>
                            <p className="font-medium text-green-600">
                              KSh {order.commission.toLocaleString()} ({order.commissionRate}%)
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{order.shippingAddress}</span>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              <span>Tracking: {order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Order Value</p>
                          <p className="font-bold text-lg">KSh {order.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Design Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {filteredDesigns.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Design Data Found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Design performance data will appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDesigns.map((design) => (
                  <Card key={design.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={design.image}
                          alt={design.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{design.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{design.averageRating.toFixed(1)}</span>
                            <span className="text-gray-500">•</span>
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{design.totalViews.toLocaleString()} views</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Last order: {formatDate(design.lastOrderDate)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                          <p className="text-xl font-bold text-blue-700">{design.totalOrders}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Revenue</p>
                          <p className="text-xl font-bold text-green-700">
                            KSh {design.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Commission</p>
                          <p className="text-xl font-bold text-purple-700">
                            KSh {design.totalCommission.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-600 font-medium">Conversion</p>
                          <p className="text-xl font-bold text-orange-700">{design.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Design
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

export default ArtistOrders
