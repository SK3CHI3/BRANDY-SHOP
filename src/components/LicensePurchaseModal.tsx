import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { licensingService } from '@/services/licensing'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CreditCard,
  Smartphone,
  Crown,
  Download,
  CheckCircle,
  X,
  Loader2,
  Shield,
  Star,
  User
} from 'lucide-react'

interface Product {
  id: string
  title: string
  description?: string
  image_url?: string
  license_price?: number
  license_type?: string
  usage_rights?: string
  artist?: {
    id: string
    full_name: string
    avatar_url?: string
    rating?: number
    total_sales?: number
  }
}

interface LicensePurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

const LicensePurchaseModal: React.FC<LicensePurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')
  const [licenseType, setLicenseType] = useState<'standard' | 'exclusive' | 'commercial'>('standard')

  const licensePrice = product.license_price || 0
  const platformFee = Math.round(licensePrice * 0.05) // 5% platform fee
  const totalAmount = licensePrice + platformFee

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase licenses',
        variant: 'destructive',
      })
      return
    }

    // Validate payment details
    if (paymentMethod === 'mpesa' && !mpesaPhone.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your M-Pesa phone number',
        variant: 'destructive',
      })
      return
    }

    if (paymentMethod === 'card' && (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim())) {
      toast({
        title: 'Card details required',
        description: 'Please fill in all card details',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)

      const result = await licensingService.purchaseLicense({
        design_id: product.id,
        customer_id: user.id,
        license_type: licenseType,
        payment_method: paymentMethod as 'mpesa' | 'card',
        mpesa_phone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
        card_details: paymentMethod === 'card' ? {
          number: cardNumber,
          expiry: expiryDate,
          cvv: cvv
        } : undefined
      })

      if (result.error) {
        toast({
          title: 'Purchase failed',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      setStep('success')

      toast({
        title: 'License purchased successfully!',
        description: 'You will receive the high-resolution files shortly.',
      })

    } catch (error) {
      toast({
        title: 'Payment failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as Kenyan phone number
    if (digits.startsWith('254')) {
      return digits.slice(0, 12)
    } else if (digits.startsWith('0')) {
      return '254' + digits.slice(1, 10)
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return '254' + digits.slice(0, 9)
    }
    
    return digits.slice(0, 12)
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4)
    }
    return digits
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Please sign in to purchase design licenses
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              License Purchased!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
            <p className="text-gray-600 mb-4">
              Your license for "{product.title}" has been purchased successfully.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• High-resolution files will be sent to your email</li>
                <li>• License agreement will be provided</li>
                <li>• Artist will be notified of your purchase</li>
              </ul>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Purchase Design License
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Details */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.title}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {product.license_type?.charAt(0).toUpperCase() + product.license_type?.slice(1)} License
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{product.artist?.rating || 4.5}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Info */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={product.artist?.avatar_url || '/placeholder.svg'} />
              <AvatarFallback>
                {product.artist?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{product.artist?.full_name}</p>
              <p className="text-sm text-gray-600">{product.artist?.total_sales || 0} sales</p>
            </div>
          </div>

          {/* License Details */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              License Agreement
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {product.usage_rights || 'Standard license for personal and commercial use'}
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• High-resolution files included</p>
              <p>• Commercial usage permitted</p>
              <p>• Attribution required</p>
              <p>• No resale of original files</p>
            </div>
          </div>

          {step === 'details' && (
            <>
              {/* Pricing Breakdown */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Pricing Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>License Fee</span>
                    <span>KSh {licensePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee (5%)</span>
                    <span>KSh {platformFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>KSh {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStep('payment')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Select Payment Method</h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      M-Pesa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Details */}
              {paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                    <Input
                      id="mpesa-phone"
                      placeholder="254712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(formatPhoneNumber(e.target.value))}
                    />
                  </div>
                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                    <p>You will receive an M-Pesa prompt on your phone to complete the payment.</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Payment</span>
                  <span className="text-xl font-bold text-purple-600">
                    KSh {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePurchase}
                  disabled={processing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay KSh {totalAmount.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LicensePurchaseModal
