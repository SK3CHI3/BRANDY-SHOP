import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { withdrawalService, WithdrawalRequest } from '@/services/withdrawals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

export default function WithdrawalHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWithdrawals()
    }
  }, [user])

  const fetchWithdrawals = async (isRefresh = false) => {
    if (!user) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const { withdrawals: withdrawalData, error } = await withdrawalService.getWithdrawalHistory(user.id, 50)
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive'
        })
      } else {
        setWithdrawals(withdrawalData || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal history',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review'
      case 'approved':
        return 'Approved'
      case 'completed':
        return 'Completed'
      case 'rejected':
        return 'Rejected'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Withdrawal History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchWithdrawals(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">No withdrawal requests yet</div>
            <div className="text-sm text-gray-400 mt-1">
              Your withdrawal history will appear here
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <div className="font-semibold text-lg">
                        KSh {withdrawal.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested {format(new Date(withdrawal.requested_at!), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(withdrawal.status)}
                  >
                    {getStatusText(withdrawal.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">M-Pesa:</span>
                    <span className="font-medium">{formatPhoneNumber(withdrawal.mpesa_phone)}</span>
                  </div>

                  {withdrawal.transaction_id && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{withdrawal.transaction_id}</span>
                    </div>
                  )}

                  {withdrawal.reviewed_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Reviewed:</span>
                      <span>{format(new Date(withdrawal.reviewed_at), 'MMM dd, yyyy')}</span>
                    </div>
                  )}

                  {withdrawal.completed_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Completed:</span>
                      <span>{format(new Date(withdrawal.completed_at), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                {withdrawal.request_notes && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Your Notes:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {withdrawal.request_notes}
                      </div>
                    </div>
                  </>
                )}

                {withdrawal.admin_notes && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</div>
                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        {withdrawal.admin_notes}
                      </div>
                    </div>
                  </>
                )}

                {withdrawal.failure_reason && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="text-sm font-medium text-red-700 mb-1">Failure Reason:</div>
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {withdrawal.failure_reason}
                      </div>
                    </div>
                  </>
                )}

                {withdrawal.status === 'pending' && (
                  <>
                    <Separator className="my-3" />
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <div className="font-medium">Under Review</div>
                          <div className="mt-1">
                            Your withdrawal request is being reviewed by our team.
                            You will receive the payment within 3 business days once approved.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
