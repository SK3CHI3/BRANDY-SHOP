import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { withdrawalService, WithdrawalSummary } from '@/services/withdrawals'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import {
  Loader2,
  Wallet,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  Mail,
  CreditCard,
  Shield,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

interface WithdrawalModalProps {
  trigger?: React.ReactNode
}

export default function WithdrawalModal({ trigger }: WithdrawalModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null)
  const [artistProfile, setArtistProfile] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'summary' | 'form' | 'confirm' | 'processing' | 'success'>('summary')

  useEffect(() => {
    if (open && user) {
      fetchWithdrawalSummary()
    }
  }, [open, user])

  const fetchWithdrawalSummary = async () => {
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

      // Fetch artist profile for auto-population
      const { profile: profileData, error: profileError } = await withdrawalService.getArtistPaymentProfile(user.id)
      if (!profileError && profileData) {
        setArtistProfile(profileData)
        // Auto-populate phone number
        if (profileData.phone) {
          setMpesaPhone(profileData.phone)
        }
      }

    } catch (error) {
      setError('Failed to load withdrawal information')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!summary) return false

    const withdrawalAmount = parseFloat(amount)

    if (!withdrawalAmount || withdrawalAmount < summary.minimum_withdrawal) {
      setError(`Minimum withdrawal amount is KSh ${summary.minimum_withdrawal.toLocaleString()}`)
      return false
    }

    if (withdrawalAmount > summary.available_balance) {
      setError(`Insufficient balance. Available: KSh ${summary.available_balance.toLocaleString()}`)
      return false
    }

    if (!mpesaPhone.trim()) {
      setError('Please enter your M-Pesa phone number')
      return false
    }

    if (!agreedToTerms) {
      setError('Please agree to the withdrawal terms and conditions')
      return false
    }

    return true
  }

  const handleFormSubmit = () => {
    setError(null)
    if (validateForm()) {
      setStep('confirm')
    }
  }

  const handleConfirmWithdrawal = async () => {
    if (!user || !summary) return

    setStep('processing')
    setLoading(true)
    setError(null)

    try {
      const { withdrawal, error } = await withdrawalService.createWithdrawalRequest(
        user.id,
        parseFloat(amount),
        mpesaPhone.trim(),
        notes.trim() || undefined
      )

      if (error) {
        setError(error)
        setStep('form')
      } else {
        setStep('success')
        // Auto-close after 3 seconds
        setTimeout(() => {
          setOpen(false)
          resetForm()
        }, 3000)
      }
    } catch (error) {
      setError('Failed to submit withdrawal request')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setNotes('')
    setAgreedToTerms(false)
    setError(null)
    setStep('summary')
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Format as +254 XXX XXX XXX
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    } else if (cleaned.length === 9) {
      return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }

    return phone
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Request Withdrawal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            {step === 'summary' && 'Withdrawal Summary'}
            {step === 'form' && 'Request Withdrawal'}
            {step === 'confirm' && 'Confirm Withdrawal'}
            {step === 'processing' && 'Processing Request'}
            {step === 'success' && 'Request Submitted'}
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && step === 'summary' ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {step === 'summary' && summary && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      KSh {summary.available_balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Ready for withdrawal
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Pending</div>
                      <div className="font-semibold">
                        KSh {summary.pending_withdrawals.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Total Withdrawn</div>
                      <div className="font-semibold">
                        KSh {summary.total_withdrawn.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <div className="font-medium">Withdrawal Information</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Minimum withdrawal: KSh {summary.minimum_withdrawal.toLocaleString()}</li>
                        <li>• Processing time: 1-3 business days</li>
                        <li>• Payment via M-Pesa</li>
                        <li>• No withdrawal fees</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep('form')}
                    disabled={summary.available_balance < summary.minimum_withdrawal}
                    className="flex-1"
                  >
                    Request Withdrawal
                  </Button>
                </div>
              </>
            )}

            {step === 'form' && summary && (
              <>
                {/* Artist Information */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user?.full_name || 'Artist'}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                    {artistProfile?.artist_profiles && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Total Earnings:</span>
                          <div className="font-medium text-green-600">
                            KSh {artistProfile.artist_profiles.total_earnings?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Orders:</span>
                          <div className="font-medium">
                            {artistProfile.artist_profiles.completed_orders || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount (KSh) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder={`Minimum: KSh ${summary.minimum_withdrawal.toLocaleString()}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={summary.minimum_withdrawal}
                        max={summary.available_balance}
                        className="pl-10 text-lg font-medium"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Available: KSh {summary.available_balance.toLocaleString()}</span>
                      <span>Min: KSh {summary.minimum_withdrawal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">M-Pesa Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0700 000 000"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Enter the phone number registered with M-Pesa
                      {mpesaPhone && (
                        <div className="text-blue-600 font-medium mt-1">
                          Formatted: {formatPhoneNumber(mpesaPhone)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information for the admin..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <label htmlFor="terms" className="font-medium cursor-pointer">
                        I agree to the withdrawal terms and conditions
                      </label>
                      <ul className="text-gray-600 mt-1 space-y-1 text-xs">
                        <li>• Processing time: 1-3 business days</li>
                        <li>• Payment will be sent to the provided M-Pesa number</li>
                        <li>• Withdrawal requests cannot be cancelled once submitted</li>
                        <li>• Admin approval is required for all withdrawals</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('summary')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {step === 'confirm' && summary && (
              <>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div className="font-medium text-green-800">Confirm Withdrawal Details</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-green-700">KSh {parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">M-Pesa Number:</span>
                        <span className="font-medium">{formatPhoneNumber(mpesaPhone)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-medium">1-3 business days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fees:</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      {notes && (
                        <div>
                          <span className="text-gray-600">Notes:</span>
                          <div className="text-sm bg-white p-2 rounded mt-1">{notes}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Once submitted, this withdrawal request cannot be cancelled.
                    Please ensure all details are correct before proceeding.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('form')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button
                    onClick={handleConfirmWithdrawal}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                <div className="font-medium">Processing your withdrawal request...</div>
                <div className="text-sm text-gray-500 mt-1">
                  Please wait while we submit your request
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="font-bold text-lg text-green-800 mb-2">Request Submitted Successfully!</div>
                <div className="text-gray-600 mb-4">
                  Your withdrawal request has been submitted for admin review.
                  You will receive the payment within 3 business days once approved.
                </div>
                <div className="text-sm text-gray-500">
                  This dialog will close automatically in a few seconds...
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
