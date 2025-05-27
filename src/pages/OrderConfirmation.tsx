import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone,
  Download,
  ArrowLeft,
  Calendar,
  MapPin
} from 'lucide-react'

const OrderConfirmation = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orderNumber] = useState(() => `ORD-${Date.now().toString().slice(-8)}`)
  const [estimatedDelivery] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3) // 3 days from now
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  })

  // Mock order data - in real app, this would come from the order API
  const orderData = {
    id: orderNumber,
    status: 'confirmed',
    total: 4500,
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
      name: user?.full_name || 'Customer',
      address: '123 Kenyatta Avenue',
      city: 'Nairobi',
      phone: '+254 700 000 000'
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Confirmed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Order Number</div>
                    <div className="font-medium">{orderData.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Order Date</div>
                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payment Method</div>
                    <div className="font-medium">M-Pesa</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="font-medium">KSh {orderData.total.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600">by {item.artist}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                          <span className="font-medium">KSh {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{orderData.shippingAddress.name}</div>
                  <div className="text-gray-600">{orderData.shippingAddress.address}</div>
                  <div className="text-gray-600">{orderData.shippingAddress.city}</div>
                  <div className="text-gray-600">{orderData.shippingAddress.phone}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Email Confirmation</div>
                    <div className="text-xs text-gray-500">You'll receive an email confirmation shortly</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Order Processing</div>
                    <div className="text-xs text-gray-500">We'll prepare your items for shipping</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Delivery</div>
                    <div className="text-xs text-gray-500">Expected by {estimatedDelivery}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KSh {orderData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>KSh {orderData.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              
              <Link to="/marketplace" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Continue Shopping
                </Button>
              </Link>
              
              <Link to="/profile" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View Order History
                </Button>
              </Link>
            </div>

            {/* Support */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-medium mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our support team if you have any questions about your order.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default OrderConfirmation
