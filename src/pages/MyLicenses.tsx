import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { licensingService, type DesignLicense, type LicenseFile } from '@/services/licensing'
import { toast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Download,
  Eye,
  FileImage,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Palette,
} from 'lucide-react'

const MyLicenses: React.FC = () => {
  const { user } = useAuth()
  const [licenses, setLicenses] = useState<DesignLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLicense, setSelectedLicense] = useState<DesignLicense | null>(null)
  const [licenseFiles, setLicenseFiles] = useState<LicenseFile[]>([])

  useEffect(() => {
    if (user) {
      fetchMyLicenses()
    }
  }, [user])

  const fetchMyLicenses = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const result = await licensingService.getCustomerLicenses(user.id)
      
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
      console.error('Error fetching licenses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your licenses',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLicenseFiles = async (licenseId: string) => {
    try {
      const result = await licensingService.getLicenseFiles(licenseId)
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      setLicenseFiles(result.files || [])
    } catch (error) {
      console.error('Error fetching license files:', error)
      toast({
        title: 'Error',
        description: 'Failed to load license files',
        variant: 'destructive',
      })
    }
  }

  const downloadFile = async (file: LicenseFile) => {
    try {
      // In a real app, this would handle secure file downloads
      // For now, we'll simulate the download
      const link = document.createElement('a')
      link.href = file.file_url
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Download started',
        description: `Downloading ${file.file_name}`,
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
      paid: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
      delivered: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      expired: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-gray-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
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
      license.design?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.design?.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: licenses.length,
    delivered: licenses.filter(l => l.status === 'delivered').length,
    pending: licenses.filter(l => l.status === 'pending').length,
    totalSpent: licenses.filter(l => l.status === 'paid' || l.status === 'delivered').reduce((sum, l) => sum + l.license_price, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your licenses...</p>
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
            My Design Licenses
          </h1>
          <p className="text-gray-600">View and download your purchased design licenses</p>
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
                <p className="text-sm text-gray-600">Available Downloads</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
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
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">KSh {stats.totalSpent.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search by design title or artist..."
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
          <CardTitle>Your Licenses ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLicenses.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No licenses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No licenses match your current filters.' 
                  : 'You haven\'t purchased any design licenses yet.'}
              </p>
              <Button onClick={() => window.location.href = '/marketplace'}>
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Design</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={license.design?.image_url || '/placeholder.svg'} 
                          alt={license.design?.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{license.design?.title}</div>
                          <div className="text-sm text-gray-500">ID: {license.design_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{license.design?.artist?.full_name}</div>
                        <div className="text-sm text-gray-500">{license.design?.artist?.email}</div>
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
                              onClick={() => {
                                setSelectedLicense(license)
                                if (license.status === 'delivered') {
                                  fetchLicenseFiles(license.id)
                                }
                              }}
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
                                    <p className="text-gray-600">Artist: {selectedLicense.design?.artist?.full_name}</p>
                                    <p className="text-gray-600">License: {getLicenseTypeBadge(selectedLicense.license_type)}</p>
                                    <p className="text-gray-600">Price: KSh {selectedLicense.license_price.toLocaleString()}</p>
                                    <p className="text-gray-600">Status: {getStatusBadge(selectedLicense.status)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Usage Rights</h4>
                                  <p className="text-sm text-gray-600">{selectedLicense.usage_rights}</p>
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

                                {selectedLicense.status === 'delivered' && licenseFiles.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Available Downloads</h4>
                                    <div className="space-y-2">
                                      {licenseFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                                          <div>
                                            <p className="font-medium">{file.file_name}</p>
                                            <p className="text-sm text-gray-500">
                                              {file.file_type.toUpperCase()} • {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                                            </p>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => downloadFile(file)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedLicense.status === 'pending' && (
                                  <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-orange-800">
                                      Your payment is being processed. You'll receive download links once payment is confirmed.
                                    </p>
                                  </div>
                                )}

                                {selectedLicense.status === 'paid' && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-800">
                                      Payment confirmed! The artist will deliver your files shortly.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {license.status === 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchLicenseFiles(license.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MyLicenses
