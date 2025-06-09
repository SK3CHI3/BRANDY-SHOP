import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/hooks/use-toast'
import { featuredListingsService, FeaturedListingPricing } from '@/services/featuredListings'
import { useAuth } from '@/contexts/AuthContext'
import {
  Star,
  Clock,
  CreditCard,
  Smartphone,
  TrendingUp,
  Eye,
  Zap,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PromoteProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    title: string
    image_url: string
    price: number
  }
}

const PromoteProductModal: React.FC<PromoteProductModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { user } = useAuth()
  const [selectedDuration, setSelectedDuration] = useState<number>(7)
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const pricingTiers = featuredListingsService.getPricingTiers()
  const selectedTier = pricingTiers.find(tier => tier.duration === selectedDuration)
  const price = selectedTier?.price || featuredListingsService.calculatePrice(selectedDuration)

  const handlePromote = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to promote your product',
        variant: 'destructive'
      })
      return
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your M-Pesa phone number',
        variant: 'destructive'
      })
      return
    }

    if (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv)) {
      toast({
        title: 'Card details required',
        description: 'Please fill in all card details',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)

    try {
      const result = await featuredListingsService.createFeaturedListing({
        productId: product.id,
        artistId: user.id,
        duration: selectedDuration,
        paymentMethod,
        phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
        cardDetails: paymentMethod === 'card' ? cardDetails : undefined
      })

      if (result.success) {
        toast({
          title: 'Promotion initiated!',
          description: paymentMethod === 'mpesa' 
            ? 'Please check your phone for M-Pesa payment prompt'
            : 'Payment processed successfully. Your product will be featured shortly.',
        })
        onClose()
      } else {
        toast({
          title: 'Promotion failed',
          description: result.error || 'Failed to initiate promotion',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Promote Your Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-600">KSh {product.price.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Featured Product Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Displayed prominently on homepage</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Increased visibility and sales potential</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Featured badge on your product</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Higher search ranking in marketplace</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Choose Duration</Label>
            <RadioGroup
              value={selectedDuration.toString()}
              onValueChange={(value) => setSelectedDuration(parseInt(value))}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {pricingTiers.map((tier) => (
                <div key={tier.duration} className="relative">
                  <RadioGroupItem
                    value={tier.duration.toString()}
                    id={`duration-${tier.duration}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`duration-${tier.duration}`}
                    className="flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {tier.duration === 7 ? '1 Week' : 
                         tier.duration === 14 ? '2 Weeks' :
                         tier.duration === 30 ? '1 Month' : 
                         tier.duration === 90 ? '3 Months' : `${tier.duration} Days`}
                      </span>
                      {tier.discount && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {tier.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      KSh {tier.price.toLocaleString()}
                    </div>
                    {tier.discount && (
                      <div className="text-sm text-gray-500 line-through">
                        KSh {Math.round(tier.price / (1 - tier.discount / 100)).toLocaleString()}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      ~KSh {Math.round(tier.price / tier.duration)} per day
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: 'mpesa' | 'card') => setPaymentMethod(value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="relative">
                <RadioGroupItem
                  value="mpesa"
                  id="payment-mpesa"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="payment-mpesa"
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300"
                >
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold">M-Pesa</div>
                    <div className="text-sm text-gray-600">Pay with mobile money</div>
                  </div>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="card"
                  id="payment-card"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="payment-card"
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300"
                >
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Pay with card</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'mpesa' && (
            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Input
                  id="expiryMonth"
                  type="text"
                  placeholder="MM"
                  value={cardDetails.expiryMonth}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Input
                  id="expiryYear"
                  type="text"
                  placeholder="YY"
                  value={cardDetails.expiryYear}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Total Amount</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Featured for {selectedDuration} days
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  KSh {price.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Promote Product
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromoteProductModal
