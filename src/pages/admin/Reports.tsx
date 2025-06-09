import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  FileSpreadsheet,
  FileText as FilePdf,
  Mail,
  Clock,
  Edit
} from 'lucide-react'

interface ReportData {
  name: string
  description: string
  icon: React.ComponentType<any>
  data: any[]
  lastGenerated?: string
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0] // today
  })
  const [reportType, setReportType] = useState('sales')

  const reportTypes = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Comprehensive sales data including orders, revenue, and trends',
      icon: DollarSign,
      fields: ['Order ID', 'Customer', 'Amount', 'Date', 'Status', 'Payment Method']
    },
    {
      id: 'users',
      name: 'User Report',
      description: 'User registration, activity, and demographics data',
      icon: Users,
      fields: ['User ID', 'Name', 'Email', 'Role', 'Registration Date', 'Last Active']
    },
    {
      id: 'products',
      name: 'Product Report',
      description: 'Product performance, inventory, and artist data',
      icon: Package,
      fields: ['Product ID', 'Title', 'Artist', 'Price', 'Stock', 'Sales Count']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Revenue, commissions, withdrawals, and financial analytics',
      icon: BarChart3,
      fields: ['Date', 'Revenue', 'Platform Fee', 'Artist Earnings', 'Withdrawals']
    },
    {
      id: 'orders',
      name: 'Orders Report',
      description: 'Order status, fulfillment, and customer data',
      icon: ShoppingCart,
      fields: ['Order Number', 'Customer', 'Items', 'Total', 'Status', 'Date']
    },
    {
      id: 'analytics',
      name: 'Analytics Report',
      description: 'Platform usage, performance metrics, and growth data',
      icon: TrendingUp,
      fields: ['Metric', 'Current Period', 'Previous Period', 'Change %', 'Trend']
    }
  ]

  const generateReport = async (type: string, format: 'csv' | 'pdf' | 'excel') => {
    setLoading(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would call an API to generate the actual report
      const reportData = await fetchReportData(type)
      
      // Simulate file download
      const filename = `${type}_report_${dateRange.from}_to_${dateRange.to}.${format}`
      
      toast({
        title: 'Report Generated',
        description: `${filename} has been generated and downloaded successfully`,
      })
      
      // In a real app, you would trigger the actual file download here
      console.log(`Generated ${format.toUpperCase()} report:`, filename, reportData)
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async (type: string) => {
    // Mock data generation based on report type
    switch (type) {
      case 'sales':
        return generateSalesData()
      case 'users':
        return generateUsersData()
      case 'products':
        return generateProductsData()
      case 'financial':
        return generateFinancialData()
      case 'orders':
        return generateOrdersData()
      case 'analytics':
        return generateAnalyticsData()
      default:
        return []
    }
  }

  const generateSalesData = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return [
      { orderId: 'ORD-001', customer: 'John Doe', amount: 2500, date: today.toISOString().split('T')[0], status: 'Completed', paymentMethod: 'M-Pesa' },
      { orderId: 'ORD-002', customer: 'Jane Smith', amount: 1800, date: yesterday.toISOString().split('T')[0], status: 'Completed', paymentMethod: 'Card' },
      // ... more mock data
    ]
  }

  const generateUsersData = () => {
    const today = new Date()
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return [
      { userId: 'USR-001', name: 'John Doe', email: 'john@example.com', role: 'Customer', registrationDate: lastMonth.toISOString().split('T')[0], lastActive: today.toISOString().split('T')[0] },
      { userId: 'USR-002', name: 'Jane Smith', email: 'jane@example.com', role: 'Artist', registrationDate: lastMonth.toISOString().split('T')[0], lastActive: today.toISOString().split('T')[0] },
      // ... more mock data
    ]
  }

  const generateProductsData = () => {
    return [
      { productId: 'PRD-001', title: 'Custom T-Shirt', artist: 'Artist One', price: 1500, stock: 25, salesCount: 12 },
      { productId: 'PRD-002', title: 'Art Print', artist: 'Artist Two', price: 800, stock: 50, salesCount: 8 },
      // ... more mock data
    ]
  }

  const generateFinancialData = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return [
      { date: today.toISOString().split('T')[0], revenue: 4300, platformFee: 645, artistEarnings: 3655, withdrawals: 2000 },
      { date: yesterday.toISOString().split('T')[0], revenue: 3200, platformFee: 480, artistEarnings: 2720, withdrawals: 1500 },
      // ... more mock data
    ]
  }

  const generateOrdersData = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return [
      { orderNumber: 'ORD-001', customer: 'John Doe', items: 2, total: 2500, status: 'Delivered', date: today.toISOString().split('T')[0] },
      { orderNumber: 'ORD-002', customer: 'Jane Smith', items: 1, total: 1800, status: 'Shipped', date: yesterday.toISOString().split('T')[0] },
      // ... more mock data
    ]
  }

  const generateAnalyticsData = () => {
    return [
      { metric: 'Total Users', currentPeriod: 52, previousPeriod: 45, changePercent: 15.6, trend: 'up' },
      { metric: 'Total Orders', currentPeriod: 78, previousPeriod: 65, changePercent: 20.0, trend: 'up' },
      { metric: 'Revenue', currentPeriod: 150000, previousPeriod: 125000, changePercent: 20.0, trend: 'up' },
      // ... more mock data
    ]
  }

  const scheduleReport = async (type: string, frequency: string, email: string) => {
    try {
      // In a real app, this would set up a scheduled report
      toast({
        title: 'Report Scheduled',
        description: `${type} report will be sent ${frequency} to ${email}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule report',
        variant: 'destructive',
      })
    }
  }

  const selectedReportType = reportTypes.find(r => r.id === reportType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Reports
          </h1>
          <p className="text-gray-600">Generate and download comprehensive platform reports</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Reports</p>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-gray-500">Active schedules</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-2xl font-bold">1.2K</p>
                <p className="text-xs text-gray-500">Available for export</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Generated</p>
                <p className="text-2xl font-bold">2h</p>
                <p className="text-xs text-gray-500">ago</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReportType && (
                <p className="text-sm text-gray-600 mt-1">{selectedReportType.description}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
            </div>

            {/* Report Fields Preview */}
            {selectedReportType && (
              <div>
                <label className="text-sm font-medium mb-2 block">Report Fields</label>
                <div className="flex flex-wrap gap-2">
                  {selectedReportType.fields.map((field) => (
                    <span key={field} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => generateReport(reportType, 'csv')}
                disabled={loading}
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Export CSV'}
              </Button>
              <Button
                onClick={() => generateReport(reportType, 'excel')}
                disabled={loading}
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Export Excel'}
              </Button>
              <Button
                onClick={() => generateReport(reportType, 'pdf')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <FilePdf className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <Card key={report.id} className="border-2 hover:border-red-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <report.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReportType(report.id)
                            generateReport(report.id, 'csv')
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Quick Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Email address" type="email" />
              <Button className="bg-red-600 hover:bg-red-700">
                <Mail className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>

            {/* Existing Scheduled Reports */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Sales Report - Weekly</div>
                  <div className="text-sm text-gray-500">Sent to admin@brandyshop.com every Monday</div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Financial Report - Monthly</div>
                  <div className="text-sm text-gray-500">Sent to finance@brandyshop.com on 1st of each month</div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
