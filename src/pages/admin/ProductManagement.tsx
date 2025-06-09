import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface Product {
  id: string
  title: string
  description?: string
  price: number
  image_url?: string
  is_active: boolean
  is_featured: boolean
  stock_quantity: number
  created_at: string
  artist?: {
    id: string
    full_name: string
    email: string
  }
  category?: {
    name: string
  }
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          artist:profiles!artist_id(id, full_name, email),
          category:categories(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)

      if (error) throw error

      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_active: isActive }
          : product
      ))

      toast({
        title: 'Success',
        description: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      })
    }
  }

  const toggleFeaturedStatus = async (productId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId)

      if (error) throw error

      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_featured: isFeatured }
          : product
      ))

      toast({
        title: 'Success',
        description: `Product ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive',
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      setProducts(products.filter(product => product.id !== productId))

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.artist?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active) ||
      (statusFilter === 'featured' && product.is_featured)

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    featured: products.filter(p => p.is_featured).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
    lowStock: products.filter(p => p.stock_quantity < 5).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            <Package className="h-6 w-6" />
            Product Management
          </h1>
          <p className="text-gray-600">Manage products, listings, and inventory</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Package className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">KSh {stats.totalValue.toLocaleString()}</p>
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
                  placeholder="Search products by title, artist name, or email..."
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
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.artist?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{product.artist?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">KSh {product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${product.stock_quantity < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {product.is_featured && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Product Details</DialogTitle>
                          </DialogHeader>
                          {selectedProduct && (
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <img 
                                  src={selectedProduct.image_url || '/placeholder.svg'} 
                                  alt={selectedProduct.title}
                                  className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium">{selectedProduct.title}</h3>
                                  <p className="text-gray-600">{selectedProduct.description}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant={selectedProduct.is_active ? 'default' : 'secondary'}>
                                      {selectedProduct.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {selectedProduct.is_featured && (
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                        Featured
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="flex gap-2 mt-1">
                                    <Button
                                      size="sm"
                                      variant={selectedProduct.is_active ? "default" : "outline"}
                                      onClick={() => updateProductStatus(selectedProduct.id, true)}
                                    >
                                      Activate
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={!selectedProduct.is_active ? "destructive" : "outline"}
                                      onClick={() => updateProductStatus(selectedProduct.id, false)}
                                    >
                                      Deactivate
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Featured Status</label>
                                  <div className="flex gap-2 mt-1">
                                    <Button
                                      size="sm"
                                      variant={selectedProduct.is_featured ? "default" : "outline"}
                                      onClick={() => toggleFeaturedStatus(selectedProduct.id, !selectedProduct.is_featured)}
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      {selectedProduct.is_featured ? 'Unfeature' : 'Feature'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProductStatus(product.id, !product.is_active)}
                      >
                        {product.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeaturedStatus(product.id, !product.is_featured)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default ProductManagement
