import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { instaPayService, PaymentRequest } from '@/services/instapay'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  CreditCard,
  Smartphone,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartTotal, cartCount, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'processing'>('details')
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleCardInputChange = (field: string, value: string) => {
    setCardInfo(prev => ({ ...prev, [field]: value }))
  }

  const validateShippingInfo = () => {
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return false
    }

    if (paymentMethod === 'mpesa' && !instaPayService.validatePhoneNumber(shippingInfo.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid Kenyan phone number for M-Pesa',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const proceedToPayment = () => {
    if (validateShippingInfo()) {
      setPaymentStep('payment')
    }
  }

  const processPayment = async () => {
    setProcessing(true)
    setPaymentStep('processing')

    try {
      const orderId = `ORD-${Date.now()}`
      const paymentData: PaymentRequest = {
        amount: cartTotal,
        currency: 'KES',
        phoneNumber: shippingInfo.phone,
        orderId: orderId,
        description: `Order ${orderId} - ${cartCount} items`,
        callbackUrl: `${window.location.origin}/payment-callback`,
        customerEmail: shippingInfo.email,
        customerName: shippingInfo.fullName
      }

      let paymentResult

      if (paymentMethod === 'mpesa') {
        paymentResult = await instaPayService.initiatePayment(paymentData)
      } else if (paymentMethod === 'card') {
        paymentResult = await instaPayService.processCardPayment({
          ...paymentData,
          cardNumber: cardInfo.cardNumber,
          expiryMonth: cardInfo.expiryMonth,
          expiryYear: cardInfo.expiryYear,
          cvv: cardInfo.cvv
        })
      } else {
        // Fallback to simulation for development
        paymentResult = await instaPayService.simulatePayment(paymentData)
      }

      if (paymentResult.success) {
        setTransactionId(paymentResult.transactionId || null)

        // Clear cart and navigate to confirmation
        await clearCart()

        toast({
          title: 'Payment Successful!',
          description: 'Your order has been placed successfully.',
        })

        navigate('/order-confirmation', {
          state: {
            orderId,
            transactionId: paymentResult.transactionId,
            amount: cartTotal
          }
        })
      } else {
        throw new Error(paymentResult.message)
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      setPaymentStep('payment')
    } finally {
      setProcessing(false)
    }
  }

  const paymentMethods = instaPayService.getSupportedPaymentMethods()

  if (!user) {
    navigate('/login')
    return null
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., +254 700 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-2 p-4 border rounded-lg ${
                        !method.supported ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        disabled={!method.supported}
                      />
                      <Label
                        htmlFor={method.id}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {method.name}
                            {!method.supported && (
                              <Badge variant="outline" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h4 className="font-medium text-gray-900">Card Details</h4>

                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        value={cardInfo.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                        placeholder="Name on card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={cardInfo.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiryMonth">Month *</Label>
                        <select
                          id="expiryMonth"
                          value={cardInfo.expiryMonth}
                          onChange={(e) => handleCardInputChange('expiryMonth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Year *</Label>
                        <select
                          id="expiryYear"
                          value={cardInfo.expiryYear}
                          onChange={(e) => handleCardInputChange('expiryYear', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i
                            return (
                              <option key={year} value={String(year).slice(-2)}>
                                {String(year).slice(-2)}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={cardInfo.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4" />
                      <span>Your card information is encrypted and secure</span>
                    </div>
                  </div>
                )}

                {/* M-Pesa Instructions */}
                {paymentMethod === 'mpesa' && (
                  <div className="mt-6 p-4 border rounded-lg bg-green-50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-900">M-Pesa Payment Instructions</h4>
                    </div>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Ensure your phone number is registered with M-Pesa</li>
                      <li>• You will receive an STK push notification</li>
                      <li>• Enter your M-Pesa PIN to complete payment</li>
                      <li>• Payment confirmation will be sent via SMS</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.product?.title}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium">
                        KSh {((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>KSh {cartTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>KSh 0</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>KSh {cartTotal.toLocaleString()}</span>
                </div>

                {paymentStep === 'details' ? (
                  <Button
                    onClick={proceedToPayment}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                ) : paymentStep === 'payment' ? (
                  <Button
                    onClick={processPayment}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay KSh {cartTotal.toLocaleString()}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </Button>
                )}

                {paymentStep === 'payment' && (
                  <Button
                    variant="outline"
                    onClick={() => setPaymentStep('details')}
                    className="w-full"
                  >
                    Back to Details
                  </Button>
                )}

                <div className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our Terms of Service and Privacy Policy
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

export default Checkout
