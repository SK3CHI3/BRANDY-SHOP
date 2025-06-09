import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { licensingService, type DesignLicense } from '@/services/licensing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
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
  Palette,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileImage
} from 'lucide-react'



const DesignLicensing: React.FC = () => {
  const [licenses, setLicenses] = useState<DesignLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLicense, setSelectedLicense] = useState<DesignLicense | null>(null)

  useEffect(() => {
    fetchDesignLicenses()
  }, [])

  const fetchDesignLicenses = async () => {
    try {
      setLoading(true)
      
      // Mock design license data (in real app, this would come from design_licenses table)
      const mockLicenses: DesignLicense[] = [
        {
          id: '1',
          design_id: 'design1',
          customer_id: 'cust1',
          artist_id: 'artist1',
          license_type: 'standard',
          license_price: 500,
          status: 'paid',
          payment_method: 'M-Pesa',
          transaction_id: 'TXN123456',
          license_terms: 'Non-exclusive usage rights for personal/commercial use',
          created_at: new Date().toISOString(),
          design: {
            title: 'Maasai Geometric Pattern',
            image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
            watermarked_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
            file_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=1200&fit=crop&crop=center'
          },
          customer: { full_name: 'John Doe', email: 'john@example.com' },
          artist: { full_name: 'Artist One', email: 'artist1@example.com' }
        },
        {
          id: '2',
          design_id: 'design2',
          customer_id: 'cust2',
          artist_id: 'artist2',
          license_type: 'exclusive',
          license_price: 2000,
          status: 'pending',
          payment_method: 'Card',
          license_terms: 'Exclusive usage rights for 12 months',
          expires_at: '2025-06-08T10:00:00Z',
          created_at: '2024-06-07T14:00:00Z',
          design: {
            title: 'Kenyan Wildlife Illustration',
            image_url: '/designs/wildlife.jpg',
            watermarked_url: '/designs/wildlife-watermarked.jpg',
            file_url: '/designs/wildlife-hires.png'
          },
          customer: { full_name: 'Jane Smith', email: 'jane@example.com' },
          artist: { full_name: 'Artist Two', email: 'artist2@example.com' }
        },
        {
          id: '3',
          design_id: 'design3',
          customer_id: 'cust3',
          artist_id: 'artist1',
          license_type: 'commercial',
          license_price: 1500,
          status: 'delivered',
          payment_method: 'M-Pesa',
          transaction_id: 'TXN789012',
          license_terms: 'Commercial usage rights with attribution',
          created_at: '2024-06-06T16:00:00Z',
          design: {
            title: 'Swahili Typography Design',
            image_url: '/designs/swahili-typo.jpg',
            watermarked_url: '/designs/swahili-typo-watermarked.jpg',
            file_url: '/designs/swahili-typo-hires.png'
          },
          customer: { full_name: 'Mike Johnson', email: 'mike@example.com' },
          artist: { full_name: 'Artist One', email: 'artist1@example.com' }
        }
      ]

      const result = await licensingService.getAllLicenses()

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      setLicenses(result.licenses || [])
    } catch (error) {
      console.error('Error fetching design licenses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load design licenses',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLicenseStatus = async (licenseId: string, status: string) => {
    try {
      const result = await licensingService.updateLicenseStatus(licenseId, status as any)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      // Update local state
      setLicenses(licenses.map(license =>
        license.id === licenseId
          ? { ...license, status: status as any }
          : license
      ))

      toast({
        title: 'Success',
        description: `License status updated to ${status}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update license status',
        variant: 'destructive',
      })
    }
  }

  const deliverDesignFile = async (licenseId: string) => {
    try {
      // In real app, this would trigger file delivery to customer
      await updateLicenseStatus(licenseId, 'delivered')
      
      toast({
        title: 'Success',
        description: 'Design file delivered to customer',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deliver design file',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      paid: { variant: 'default' as const, icon: CheckCircle },
      delivered: { variant: 'default' as const, icon: CheckCircle },
      expired: { variant: 'destructive' as const, icon: XCircle },
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

  const getLicenseTypeBadge = (type: string) => {
    const typeConfig = {
      standard: { variant: 'secondary' as const, color: 'text-blue-600' },
      exclusive: { variant: 'destructive' as const, color: 'text-purple-600' },
      commercial: { variant: 'default' as const, color: 'text-green-600' },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.standard

    return (
      <Badge variant={config.variant} className={config.color}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.design?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: licenses.length,
    pending: licenses.filter(l => l.status === 'pending').length,
    paid: licenses.filter(l => l.status === 'paid').length,
    delivered: licenses.filter(l => l.status === 'delivered').length,
    totalRevenue: licenses.filter(l => l.status === 'paid' || l.status === 'delivered').reduce((sum, l) => sum + l.license_price, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design licenses...</p>
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
            <Palette className="h-6 w-6" />
            Design Licensing
          </h1>
          <p className="text-gray-600">Manage design licenses and file delivery</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Licenses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileImage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">License Revenue</p>
                <p className="text-2xl font-bold text-purple-600">KSh {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by design title, customer, or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Design Licenses ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Design</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={license.design?.watermarked_url || '/placeholder.svg'} 
                        alt={license.design?.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{license.design?.title}</div>
                        <div className="text-sm text-gray-500">Design ID: {license.design_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{license.customer?.full_name}</div>
                      <div className="text-sm text-gray-500">{license.customer?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{license.artist?.full_name}</div>
                      <div className="text-sm text-gray-500">{license.artist?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getLicenseTypeBadge(license.license_type)}</TableCell>
                  <TableCell className="font-medium">KSh {license.license_price.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(license.status)}</TableCell>
                  <TableCell>{new Date(license.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLicense(license)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>License Details</DialogTitle>
                          </DialogHeader>
                          {selectedLicense && (
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <img 
                                  src={selectedLicense.design?.image_url || '/placeholder.svg'} 
                                  alt={selectedLicense.design?.title}
                                  className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium">{selectedLicense.design?.title}</h3>
                                  <p className="text-gray-600">License Type: {getLicenseTypeBadge(selectedLicense.license_type)}</p>
                                  <p className="text-gray-600">Price: KSh {selectedLicense.license_price.toLocaleString()}</p>
                                  <p className="text-gray-600">Status: {getStatusBadge(selectedLicense.status)}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Customer</h4>
                                  <p>{selectedLicense.customer?.full_name}</p>
                                  <p className="text-sm text-gray-500">{selectedLicense.customer?.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Artist</h4>
                                  <p>{selectedLicense.artist?.full_name}</p>
                                  <p className="text-sm text-gray-500">{selectedLicense.artist?.email}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">License Terms</h4>
                                <p className="text-sm text-gray-600">{selectedLicense.license_terms}</p>
                              </div>

                              {selectedLicense.expires_at && (
                                <div>
                                  <h4 className="font-medium mb-2">Expires</h4>
                                  <p className="text-sm text-gray-600">{new Date(selectedLicense.expires_at).toLocaleDateString()}</p>
                                </div>
                              )}

                              {selectedLicense.status === 'paid' && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => deliverDesignFile(selectedLicense.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Deliver Design File
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {license.status === 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deliverDesignFile(license.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
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

export default DesignLicensing
