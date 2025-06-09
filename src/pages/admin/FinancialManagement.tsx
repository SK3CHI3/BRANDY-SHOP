import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { featuredListingsService } from '@/services/featuredListings'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface PrintOrder {
  id: string
  customer_id: string
  design_license_id: string
  product_type: string
  quantity: number
  printing_cost: number
  markup_amount: number
  total_amount: number
  status: 'pending' | 'printing' | 'shipped' | 'delivered'
  created_at: string
  customer?: {
    full_name: string
    email: string
  }
  design?: {
    title: string
    artist_name: string
  }
}

interface FinancialStats {
  totalPrintRevenue: number
  printingCosts: number
  platformProfit: number
  monthlyPrintOrders: number
  averageOrderValue: number
  monthlyGrowth: number
  featuredListingRevenue: number
}

const FinancialManagement: React.FC = () => {
  const [printOrders, setPrintOrders] = useState<PrintOrder[]>([])
  const [stats, setStats] = useState<FinancialStats>({
    totalPrintRevenue: 0,
    printingCosts: 0,
    platformProfit: 0,
    monthlyPrintOrders: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0,
    featuredListingRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)

      // Mock print orders data (in real app, this would come from print_orders table)
      const mockPrintOrders: PrintOrder[] = [
        {
          id: '1',
          customer_id: 'cust1',
          design_license_id: 'lic1',
          product_type: 'T-Shirt',
          quantity: 2,
          printing_cost: 1200,
          markup_amount: 300,
          total_amount: 1500,
          status: 'delivered',
          created_at: '2024-06-08T10:00:00Z',
          customer: { full_name: 'John Doe', email: 'john@example.com' },
          design: { title: 'Maasai Pattern', artist_name: 'Artist One' }
        },
        {
          id: '2',
          customer_id: 'cust2',
          design_license_id: 'lic2',
          product_type: 'Mug',
          quantity: 1,
          printing_cost: 800,
          markup_amount: 200,
          total_amount: 1000,
          status: 'printing',
          created_at: '2024-06-07T14:00:00Z',
          customer: { full_name: 'Jane Smith', email: 'jane@example.com' },
          design: { title: 'Kenyan Wildlife', artist_name: 'Artist Two' }
        }
      ]

      setPrintOrders(mockPrintOrders)

      // Calculate financial statistics
      await calculateStats(mockPrintOrders)

    } catch (error) {
      console.error('Error fetching financial data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = async (orders: PrintOrder[]) => {
    try {
      // Calculate printing revenue statistics
      const totalPrintRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const printingCosts = orders.reduce((sum, order) => sum + order.printing_cost, 0)
      const platformProfit = orders.reduce((sum, order) => sum + order.markup_amount, 0)

      // Calculate monthly stats
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })

      const monthlyPrintOrders = monthlyOrders.length
      const averageOrderValue = orders.length > 0 ? totalPrintRevenue / orders.length : 0

      // Get real featured listing revenue
      const featuredRevenueData = await featuredListingsService.getFeaturedListingsRevenue()
      const featuredListingRevenue = featuredRevenueData.monthlyRevenue || 0

      setStats({
        totalPrintRevenue,
        printingCosts,
        platformProfit,
        monthlyPrintOrders,
        averageOrderValue,
        monthlyGrowth: 15.2, // Mock growth percentage
        featuredListingRevenue
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const updatePrintOrderStatus = async (orderId: string, status: string) => {
    try {
      // In real app, this would update the database
      // For now, update local state
      setPrintOrders(printOrders.map(order =>
        order.id === orderId
          ? { ...order, status: status as any }
          : order
      ))

      toast({
        title: 'Success',
        description: `Print order status updated to ${status}`,
      })

      // Recalculate stats
      await calculateStats(printOrders)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update print order status',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      approved: { variant: 'default' as const, icon: CheckCircle },
      processing: { variant: 'default' as const, icon: CreditCard },
      completed: { variant: 'default' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredOrders = printOrders.filter(order => {
    return statusFilter === 'all' || order.status === statusFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Financial Management
          </h1>
          <p className="text-gray-600">Manage printing revenue, costs, and platform profits</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Financial Report
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Print Revenue</p>
                <p className="text-2xl font-bold text-green-600">KSh {stats.totalPrintRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Printing Costs</p>
                <p className="text-2xl font-bold text-red-600">KSh {stats.printingCosts.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Profit</p>
                <p className="text-2xl font-bold text-purple-600">KSh {stats.platformProfit.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">KSh {stats.averageOrderValue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.monthlyGrowth}% growth
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Print Orders</p>
                <p className="text-2xl font-bold text-orange-600">{printOrders.filter(o => o.status === 'pending').length}</p>
                <p className="text-xs text-gray-500">Awaiting printing</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Print Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.monthlyPrintOrders}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured Listings Revenue</p>
                <p className="text-2xl font-bold text-blue-600">KSh {stats.featuredListingRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Artist promotions</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Print Orders</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Design</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer?.full_name || 'Unknown Customer'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.design?.title}</div>
                      <div className="text-sm text-gray-500">by {order.design?.artist_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.product_type}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">KSh {order.total_amount.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-green-600">KSh {order.markup_amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Print Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Customer</label>
                                  <p className="text-sm">{selectedOrder.customer?.full_name}</p>
                                  <p className="text-xs text-gray-500">{selectedOrder.customer?.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Design</label>
                                  <p className="text-sm font-bold">{selectedOrder.design?.title}</p>
                                  <p className="text-xs text-gray-500">by {selectedOrder.design?.artist_name}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Product Type</label>
                                  <p className="text-sm">{selectedOrder.product_type}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Quantity</label>
                                  <p className="text-sm">{selectedOrder.quantity}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Printing Cost</label>
                                  <p className="text-sm">KSh {selectedOrder.printing_cost.toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Markup</label>
                                  <p className="text-sm text-green-600">KSh {selectedOrder.markup_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Total</label>
                                  <p className="text-sm font-bold">KSh {selectedOrder.total_amount.toLocaleString()}</p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Current Status</label>
                                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                              </div>

                              <div className="flex gap-2 pt-4">
                                {selectedOrder.status === 'pending' && (
                                  <Button
                                    onClick={() => updatePrintOrderStatus(selectedOrder.id, 'printing')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Start Printing
                                  </Button>
                                )}
                                {selectedOrder.status === 'printing' && (
                                  <Button
                                    onClick={() => updatePrintOrderStatus(selectedOrder.id, 'shipped')}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Mark as Shipped
                                  </Button>
                                )}
                                {selectedOrder.status === 'shipped' && (
                                  <Button
                                    onClick={() => updatePrintOrderStatus(selectedOrder.id, 'delivered')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Mark as Delivered
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const nextStatus =
                            order.status === 'pending' ? 'printing' :
                            order.status === 'printing' ? 'shipped' :
                            order.status === 'shipped' ? 'delivered' : order.status
                          if (nextStatus !== order.status) {
                            updatePrintOrderStatus(order.id, nextStatus)
                          }
                        }}
                        disabled={order.status === 'delivered'}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {order.status === 'pending' ? 'Start Printing' :
                         order.status === 'printing' ? 'Ship Order' :
                         order.status === 'shipped' ? 'Mark Delivered' : 'Completed'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialManagement
