import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { withdrawalService, WithdrawalRequest } from '@/services/withdrawals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Calendar,
  DollarSign,
  User,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminWithdrawals() {
  const { user } = useAuth()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    fetchPendingWithdrawals()
  }, [])

  const fetchPendingWithdrawals = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const { withdrawals: withdrawalData, error } = await withdrawalService.getPendingWithdrawals()
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
        description: 'Failed to load pending withdrawals',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal || !user) return

    setActionLoading(true)
    try {
      const { success, error } = await withdrawalService.approveWithdrawal(
        selectedWithdrawal.id!,
        user.id,
        adminNotes.trim() || undefined
      )

      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Withdrawal Approved',
          description: 'The withdrawal has been approved and will be processed automatically.',
        })
        setSelectedWithdrawal(null)
        setAdminNotes('')
        setActionType(null)
        fetchPendingWithdrawals()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve withdrawal',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal || !user || !adminNotes.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this withdrawal.',
        variant: 'destructive'
      })
      return
    }

    setActionLoading(true)
    try {
      const { success, error } = await withdrawalService.rejectWithdrawal(
        selectedWithdrawal.id!,
        user.id,
        adminNotes.trim()
      )

      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Withdrawal Rejected',
          description: 'The withdrawal has been rejected and the artist has been notified.',
        })
        setSelectedWithdrawal(null)
        setAdminNotes('')
        setActionType(null)
        fetchPendingWithdrawals()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject withdrawal',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
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
      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Withdrawals ({withdrawals.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPendingWithdrawals(true)}
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
            <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <div className="text-gray-500">No pending withdrawals</div>
            <div className="text-sm text-gray-400 mt-1">
              All withdrawal requests have been processed
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {(withdrawal as any).artist?.full_name || 'Unknown Artist'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(withdrawal as any).artist?.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      KSh {withdrawal.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested {format(new Date(withdrawal.requested_at!), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">M-Pesa:</span>
                    <span className="font-medium">{formatPhoneNumber(withdrawal.mpesa_phone)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Total Earnings:</span>
                    <span className="font-medium">
                      KSh {((withdrawal as any).artist_profile?.total_earnings || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Days Pending:</span>
                    <span className="font-medium">
                      {Math.floor((Date.now() - new Date(withdrawal.requested_at!).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Completed Orders:</span>
                    <span className="font-medium">
                      {(withdrawal as any).artist_profile?.completed_orders || 0}
                    </span>
                  </div>
                </div>

                {withdrawal.request_notes && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Artist Notes:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {withdrawal.request_notes}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setActionType('approve')
                          setAdminNotes('')
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Withdrawal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Approve KSh {withdrawal.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-green-700">
                            This withdrawal will be processed automatically via M-Pesa to {formatPhoneNumber(withdrawal.mpesa_phone)}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
                          <Textarea
                            id="approve-notes"
                            placeholder="Add any notes for this approval..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedWithdrawal(null)
                              setAdminNotes('')
                              setActionType(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleApproveWithdrawal}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              'Approve Withdrawal'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setActionType('reject')
                          setAdminNotes('')
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Withdrawal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-medium">Reject KSh {withdrawal.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-red-700">
                            The artist will be notified of the rejection and the reason provided.
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reject-notes">Rejection Reason (Required)</Label>
                          <Textarea
                            id="reject-notes"
                            placeholder="Please provide a clear reason for rejecting this withdrawal..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedWithdrawal(null)
                              setAdminNotes('')
                              setActionType(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleRejectWithdrawal}
                            disabled={actionLoading || !adminNotes.trim()}
                            variant="destructive"
                            className="flex-1"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              'Reject Withdrawal'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
