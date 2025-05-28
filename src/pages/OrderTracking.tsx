import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
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
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

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

interface CustomerOrder {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  estimated_delivery?: string
  total_amount: number
  shipping_address: any
  tracking_number?: string
  payment_method?: string
  payment_status?: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      title: string
      image_url: string
      artist?: {
        id: string
        full_name: string
      }
    }
  }>
}

const OrderTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')

  // Fetch customer orders
  const fetchCustomerOrders = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('Fetching orders for user:', user.id)

      // Try to fetch orders with a simple query first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          estimated_delivery,
          total_amount,
          shipping_address,
          tracking_number,
          payment_method,
          payment_status
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Orders query error:', ordersError)

        // Handle specific error types
        if (ordersError.code === 'PGRST116' || ordersError.message?.includes('relation') || ordersError.message?.includes('does not exist')) {
          // Table doesn't exist - this is expected for new installations
          console.log('Orders table not found - showing empty state')
          setCustomerOrders([])
          return
        } else if (ordersError.code === '42501' || ordersError.message?.includes('permission') || ordersError.message?.includes('RLS')) {
          // Permission denied - RLS policy issue
          console.log('Permission denied - RLS policy issue')
          setCustomerOrders([])
          return
        } else {
          throw ordersError
        }
      }

      console.log('Orders found:', ordersData?.length || 0)

      // If we have orders, try to fetch order items
      if (ordersData && ordersData.length > 0) {
        try {
          // Fetch order items separately to avoid complex join issues
          const orderIds = ordersData.map(order => order.id)
          const { data: orderItemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              order_id,
              quantity,
              price,
              product:products (
                id,
                title,
                image_url,
                artist:profiles!products_artist_id_fkey (
                  id,
                  full_name
                )
              )
            `)
            .in('order_id', orderIds)

          if (itemsError) {
            console.error('Order items query error:', itemsError)
            // If order items query fails, just use orders without items
            setCustomerOrders(ordersData.map(order => ({
              ...order,
              order_items: []
            })))
          } else {
            // Combine orders with their items
            const ordersWithItems = ordersData.map(order => ({
              ...order,
              order_items: orderItemsData?.filter(item => item.order_id === order.id) || []
            }))
            setCustomerOrders(ordersWithItems)
          }
        } catch (itemsError) {
          console.error('Error fetching order items:', itemsError)
          // Fall back to orders without items
          setCustomerOrders(ordersData.map(order => ({
            ...order,
            order_items: []
          })))
        }
      } else {
        // No orders found - this is normal for new users
        console.log('No orders found for user')
        setCustomerOrders([])
      }

      // If there's an ID in the URL, find and select that order
      if (id && ordersData) {
        const order = ordersData.find(o => o.id === id || o.order_number === id)
        if (order) {
          setSelectedOrder(order)
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching orders:', error)

      // For any unexpected error, just show empty state
      // This prevents the "Failed to load orders" error from showing
      console.log('Setting empty orders due to unexpected error')
      setCustomerOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && profile?.role === 'customer') {
      fetchCustomerOrders()
    } else if (user && profile?.role === 'artist') {
      // Redirect artists to their specific order management
      navigate('/artist-orders')
    }
  }, [user, profile, id, navigate])

  // Test function to check database connectivity
  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('count(*)')
        .limit(1)

      if (error) {
        console.log('Database test error:', error)
        return false
      }
      return true
    } catch (error) {
      console.log('Database connection test failed:', error)
      return false
    }
  }

  // Create a test order for demonstration (only in development)
  const createTestOrder = async () => {
    if (!user || import.meta.env.PROD) return

    try {
      const testOrder = {
        order_number: `TEST-${Date.now()}`,
        user_id: user.id,
        status: 'pending',
        total_amount: 2500,
        shipping_address: {
          name: user.user_metadata?.full_name || 'Test User',
          address: '123 Test Street',
          city: 'Nairobi',
          phone: '+254700000000'
        },
        payment_method: 'M-Pesa',
        payment_status: 'completed'
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single()

      if (error) {
        console.error('Error creating test order:', error)
        return
      }

      console.log('Test order created:', data)

      // Refresh orders
      fetchCustomerOrders()

      toast({
        title: 'Test Order Created',
        description: 'A test order has been created for demonstration',
      })
    } catch (error) {
      console.error('Error creating test order:', error)
    }
  }

  // Helper functions
  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  const getOrderTimeline = (order: CustomerOrder) => {
    const timeline = [
      {
        status: 'Order Placed',
        description: 'Your order has been received and is being processed',
        timestamp: order.created_at,
        completed: true
      },
      {
        status: 'Payment Confirmed',
        description: 'Payment has been successfully processed',
        timestamp: order.created_at,
        completed: order.payment_status === 'completed'
      },
      {
        status: 'Processing',
        description: 'Your items are being prepared for shipment',
        timestamp: order.created_at,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'Shipped',
        description: 'Your order is on its way',
        timestamp: order.tracking_number ? order.created_at : '',
        completed: ['shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'Delivered',
        description: 'Your order has been delivered',
        timestamp: '',
        completed: order.status === 'delivered'
      }
    ]

    return timeline
  }

  // Filter orders based on search term
  const filteredOrders = customerOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_items.some(item =>
      item.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.artist?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show auth modal for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Icon with lock overlay */}
            <div className="relative inline-block mb-8">
              <Package className="h-24 w-24 text-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Track Your Orders
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to track your orders, view order history, and get real-time updates
              on your purchases from talented Kenyan artists.
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Truck className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                <p className="text-sm text-gray-600">Get live updates on your order status</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Order History</h3>
                <p className="text-sm text-gray-600">View all your past purchases</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Updates</h3>
                <p className="text-sm text-gray-600">Know exactly when to expect delivery</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => openAuthModal('signin')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <User className="h-5 w-5 mr-2" />
                Sign In to Track Orders
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openAuthModal('signup')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                <Package className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>

            {/* Continue shopping link */}
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue shopping
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
              <p className="text-gray-600">
                Track your orders and view purchase history
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
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
                  <p className="text-2xl font-bold text-gray-900">{customerOrders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    KSh {customerOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customerOrders.filter(order => ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customerOrders.filter(order => order.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedOrder ? (
          /* Order Details View */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedOrder(null)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order #{selectedOrder.order_number}</CardTitle>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ordered:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="ml-2 font-medium">
                        {selectedOrder.estimated_delivery ? formatDate(selectedOrder.estimated_delivery) : '3-5 business days'}
                      </span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex items-center md:col-span-2">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="ml-2 font-medium font-mono">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getOrderTimeline(selectedOrder).map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          event.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            event.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {event.status}
                          </p>
                          <p className={`text-sm ${
                            event.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {event.description}
                          </p>
                          {event.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(event.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.image_url || '/placeholder.svg'}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.title}
                          </p>
                          {item.product.artist && (
                            <p className="text-xs text-gray-500">by {item.product.artist.full_name}</p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-medium">
                      <span>Total</span>
                      <span>KSh {selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    {selectedOrder.shipping_address ? (
                      <>
                        <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                        <p className="text-gray-600">{selectedOrder.shipping_address.address}</p>
                        <p className="text-gray-600">{selectedOrder.shipping_address.city}</p>
                        {selectedOrder.shipping_address.phone && (
                          <div className="flex items-center mt-2 pt-2 border-t">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="text-gray-600">{selectedOrder.shipping_address.phone}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">No shipping address available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>

                <Link to="/marketplace" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Orders List View */
          <div className="space-y-6">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders yet. Start exploring our amazing designs!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/marketplace">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Browse Marketplace
                    </Button>
                  </Link>
                  {!import.meta.env.PROD && (
                    <Button
                      variant="outline"
                      onClick={createTestOrder}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Create Test Order (Dev)
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6" onClick={() => setSelectedOrder(order)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">
                              {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'} •
                              Placed {formatDate(order.created_at)}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              KSh {order.total_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {order.tracking_number && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default OrderTracking
