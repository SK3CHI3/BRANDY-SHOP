import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  User
} from 'lucide-react'

interface OrderStatus {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderNumber: string
  createdAt: string
  estimatedDelivery: string
  total: number
  items: Array<{
    id: string
    title: string
    artist: string
    price: number
    quantity: number
    image: string
  }>
  shippingAddress: {
    name: string
    address: string
    city: string
    phone: string
  }
  trackingNumber?: string
  timeline: Array<{
    status: string
    description: string
    timestamp: string
    completed: boolean
  }>
}

const OrderTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orderNumber, setOrderNumber] = useState(id || '')
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock order data - in real app, this would come from API
  const mockOrder: OrderStatus = {
    id: orderNumber || 'ORD-2024-001',
    status: 'shipped',
    orderNumber: orderNumber || 'ORD-2024-001',
    createdAt: '2024-01-15T10:30:00Z',
    estimatedDelivery: '2024-01-20T18:00:00Z',
    total: 4500,
    trackingNumber: 'TRK-KE-789456123',
    items: [
      {
        id: '1',
        title: 'Kenyan Wildlife T-Shirt',
        artist: 'Sarah Wanjiku',
        price: 1500,
        quantity: 2,
        image: '/placeholder.svg'
      },
      {
        id: '2',
        title: 'Traditional Patterns Hoodie',
        artist: 'John Mwangi',
        price: 2500,
        quantity: 1,
        image: '/placeholder.svg'
      }
    ],
    shippingAddress: {
      name: user?.full_name || 'Customer Name',
      address: '123 Kenyatta Avenue, Nairobi',
      city: 'Nairobi',
      phone: '+254 700 000 000'
    },
    timeline: [
      {
        status: 'Order Placed',
        description: 'Your order has been received and is being processed',
        timestamp: '2024-01-15T10:30:00Z',
        completed: true
      },
      {
        status: 'Payment Confirmed',
        description: 'Payment has been successfully processed',
        timestamp: '2024-01-15T10:35:00Z',
        completed: true
      },
      {
        status: 'In Production',
        description: 'Your custom items are being printed',
        timestamp: '2024-01-16T09:00:00Z',
        completed: true
      },
      {
        status: 'Quality Check',
        description: 'Items are being inspected for quality',
        timestamp: '2024-01-17T14:00:00Z',
        completed: true
      },
      {
        status: 'Shipped',
        description: 'Your order is on its way to you',
        timestamp: '2024-01-18T11:00:00Z',
        completed: true
      },
      {
        status: 'Out for Delivery',
        description: 'Your order is out for delivery',
        timestamp: '',
        completed: false
      },
      {
        status: 'Delivered',
        description: 'Order has been delivered successfully',
        timestamp: '',
        completed: false
      }
    ]
  }

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: 'Order Number Required',
        description: 'Please enter your order number to track your order',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrder)
      setLoading(false)
    }, 1500)
  }

  useEffect(() => {
    if (id) {
      handleTrackOrder()
    }
  }, [id])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number to track the status of your order
          </p>
        </div>

        {/* Order Number Input */}
        {!order && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Track Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your order number (e.g., ORD-2024-001)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackOrder}
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? 'Tracking...' : 'Track Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Ordered:</span>
                      <span className="ml-2 font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="ml-2 font-medium">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center md:col-span-2">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="ml-2 font-medium font-mono">{order.trackingNumber}</span>
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
                    {order.timeline.map((event, index) => (
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
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">by {item.artist}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">
                          KSh {item.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-medium">
                      <span>Total</span>
                      <span>KSh {order.total.toLocaleString()}</span>
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
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">{order.shippingAddress.city}</p>
                    <div className="flex items-center mt-2 pt-2 border-t">
                      <Phone className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-gray-600">{order.shippingAddress.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about your order? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}

export default OrderTracking
