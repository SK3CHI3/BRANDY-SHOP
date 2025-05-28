
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { commissionService, type ArtistEarningsSummary, type ArtistCommission } from '@/services/commissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { DollarSign, TrendingUp, Clock, Settings, Save } from 'lucide-react'

const CommissionDashboard = () => {
  const { user, profile } = useAuth()
  const [earnings, setEarnings] = useState<ArtistEarningsSummary | null>(null)
  const [commissions, setCommissions] = useState<ArtistCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [newCommissionRate, setNewCommissionRate] = useState('')

  useEffect(() => {
    if (user && profile?.role === 'artist') {
      fetchData()
    }
  }, [user, profile])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const [earningsResult, commissionsResult] = await Promise.all([
        commissionService.getArtistEarnings(user.id),
        commissionService.getArtistCommissions(user.id)
      ])

      if (earningsResult.data) {
        setEarnings(earningsResult.data)
        setNewCommissionRate(earningsResult.data.commission_rate.toString())
      }

      if (commissionsResult.data) {
        setCommissions(commissionsResult.data)
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load commission data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCommissionRate = async () => {
    if (!user) return

    const rate = parseFloat(newCommissionRate)
    if (isNaN(rate) || rate < 7.7) {
      toast({
        title: 'Invalid Rate',
        description: 'Commission rate must be at least 7.7%',
        variant: 'destructive',
      })
      return
    }

    const { success, error } = await commissionService.updateCommissionRate(user.id, rate)
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Commission rate updated successfully',
      })
      fetchData()
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to update commission rate',
        variant: 'destructive',
      })
    }
  }

  if (!user || profile?.role !== 'artist') {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {earnings?.total_earnings?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  KSh {earnings?.pending_earnings?.toLocaleString() || '0'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {earnings?.commission_rate || 7.7}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Commission History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length > 0 ? (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{commission.order_id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {commission.commission_rate}% of KSh {commission.product_sale_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          KSh {commission.commission_amount.toLocaleString()}
                        </p>
                        <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No commissions yet</p>
                  <p className="text-sm">Start selling designs to earn commissions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Commission Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="commission-rate"
                    type="number"
                    min="7.7"
                    step="0.1"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(e.target.value)}
                    placeholder="7.7"
                  />
                  <Button onClick={handleUpdateCommissionRate}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Minimum rate is 7.7%. Higher rates mean more earnings per sale.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommissionDashboard
