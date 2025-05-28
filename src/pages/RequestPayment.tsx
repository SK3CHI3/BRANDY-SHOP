import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { withdrawalService, WithdrawalSummary } from '@/services/withdrawals'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Wallet,
  Phone,
  User,
  Mail,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  DollarSign,
  Shield
} from 'lucide-react'

export default function RequestPayment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [amount, setAmount] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Auto-populated data
  const [artistProfile, setArtistProfile] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'artist') {
      navigate('/artist-studio')
      return
    }

    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      // Fetch withdrawal summary
      const { summary: summaryData, error: summaryError } = await withdrawalService.getWithdrawalSummary(user.id)
      if (summaryError) {
        setError(summaryError)
      } else {
        setSummary(summaryData)
      }

      // Fetch artist profile data using withdrawal service
      const { profile: profileData, error: profileError } = await withdrawalService.getArtistPaymentProfile(user.id)

      if (!profileError && profileData) {
        setArtistProfile(profileData)
        // Auto-populate phone number
        if (profileData.phone) {
          setMpesaPhone(profileData.phone)
        }
      }

    } catch (error) {
      setError('Failed to load payment request data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    if (!user || !summary) return

    const withdrawalAmount = parseFloat(amount)

    // Validation
    if (!withdrawalAmount || withdrawalAmount < summary.minimum_withdrawal) {
      setError(`Minimum withdrawal amount is KSh ${summary.minimum_withdrawal.toLocaleString()}`)
      return
    }

    if (withdrawalAmount > summary.available_balance) {
      setError(`Insufficient balance. Available: KSh ${summary.available_balance.toLocaleString()}`)
      return
    }

    if (!mpesaPhone.trim()) {
      setError('Please enter your M-Pesa phone number')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the withdrawal terms and conditions')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { withdrawal, error } = await withdrawalService.createWithdrawalRequest(
        user.id,
        withdrawalAmount,
        mpesaPhone.trim(),
        notes.trim() || undefined
      )

      if (error) {
        setError(error)
      } else {
        // Success - redirect to artist studio
        alert('Payment request submitted successfully! You will receive the payment within 3 business days.')
        navigate('/artist-studio?tab=earnings')
      }
    } catch (error) {
      setError('Failed to submit payment request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    } else if (cleaned.length === 9) {
      return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/artist-studio')}
            className="min-h-[44px] w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studio
          </Button>
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Request Payment</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Submit a withdrawal request for your earnings</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Artist Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Artist Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{user?.full_name || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {artistProfile?.artist_profiles && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Earnings</Label>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">
                          KSh {artistProfile.artist_profiles.total_earnings?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Completed Orders</Label>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-700">
                          {artistProfile.artist_profiles.completed_orders || 0} orders
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Payment Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount */}
                <div>
                  <Label htmlFor="amount" className="text-sm sm:text-base">Withdrawal Amount (KSh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Minimum: KSh ${summary?.minimum_withdrawal.toLocaleString()}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={summary?.minimum_withdrawal}
                    max={summary?.available_balance}
                    className="text-base sm:text-lg font-medium min-h-[48px]"
                    style={{ fontSize: '16px' }}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 mt-1 gap-1">
                    <span>Available: KSh {summary?.available_balance.toLocaleString()}</span>
                    <span>Min: KSh {summary?.minimum_withdrawal.toLocaleString()}</span>
                  </div>
                </div>

                {/* M-Pesa Phone Number */}
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">M-Pesa Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0700 000 000"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="pl-10 min-h-[48px] text-base"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    Enter the phone number registered with M-Pesa
                    {mpesaPhone && (
                      <div className="text-blue-600 font-medium mt-1 text-sm">
                        Formatted: {formatPhoneNumber(mpesaPhone)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm sm:text-base">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information for the admin..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="min-h-[120px] text-base resize-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 min-h-[20px] min-w-[20px]"
                  />
                  <div className="text-xs sm:text-sm">
                    <label htmlFor="terms" className="font-medium cursor-pointer">
                      I agree to the withdrawal terms and conditions
                    </label>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• Processing time: 1-3 business days</li>
                      <li>• Payment will be sent to the provided M-Pesa number</li>
                      <li>• Withdrawal requests cannot be cancelled once submitted</li>
                      <li>• Admin approval is required for all withdrawals</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitting || !summary || summary.available_balance < (summary.minimum_withdrawal || 1000)}
                  className="w-full min-h-[48px] sm:h-12 text-base sm:text-lg"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Submitting Request...</span>
                      <span className="sm:hidden">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="hidden sm:inline">Submit Payment Request</span>
                      <span className="sm:hidden">Submit Request</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Balance Summary */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Balance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      KSh {summary.available_balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Available for withdrawal</div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Withdrawals</span>
                      <span className="font-medium">KSh {summary.pending_withdrawals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Withdrawn</span>
                      <span className="font-medium">KSh {summary.total_withdrawn.toLocaleString()}</span>
                    </div>
                    {summary.next_available_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Available</span>
                        <span className="font-medium text-blue-600">
                          {new Date(summary.next_available_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Processing: 1-3 business days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span>Payment via M-Pesa</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <span>No withdrawal fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Admin approval required</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Contact support at{' '}
                <a href="mailto:support@brandyshop.co.ke" className="text-blue-600 hover:underline">
                  support@brandyshop.co.ke
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
