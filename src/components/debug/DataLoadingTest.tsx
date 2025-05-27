import React from 'react'
import { useProducts, useCategories, useStats, useFeaturedProducts } from '@/hooks/useData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DataLoadingTest = () => {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  const { stats, loading: statsLoading } = useStats()
  const { featuredProducts, loading: featuredLoading } = useFeaturedProducts()

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Data Loading Test</h2>
      
      {/* Products Test */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-blue-600">Loading products...</div>
          ) : productsError ? (
            <div className="text-red-600">Error: {productsError}</div>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center gap-2">
                  <Badge variant="outline">{product.title}</Badge>
                  <span>KSh {product.price}</span>
                  {product.is_featured && <Badge>Featured</Badge>}
                  {product.artist && <span className="text-sm text-gray-600">by {product.artist.full_name}</span>}
                </div>
              ))}
              {products.length === 0 && <div className="text-gray-500">No products found</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Test */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-blue-600">Loading categories...</div>
          ) : categoriesError ? (
            <div className="text-red-600">Error: {categoriesError}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge key={category.id} variant="secondary">{category.name}</Badge>
              ))}
              {categories.length === 0 && <div className="text-gray-500">No categories found</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Test */}
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-blue-600">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.artistCount}</div>
                <div className="text-sm text-gray-600">Artists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.productCount}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.orderCount}</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Products Test */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Products ({featuredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {featuredLoading ? (
            <div className="text-blue-600">Loading featured products...</div>
          ) : (
            <div className="space-y-2">
              {featuredProducts.map(product => (
                <div key={product.id} className="flex items-center gap-2">
                  <Badge variant="outline">{product.title}</Badge>
                  <span>KSh {product.price}</span>
                  <Badge>Featured</Badge>
                  {product.artist && <span className="text-sm text-gray-600">by {product.artist.full_name}</span>}
                </div>
              ))}
              {featuredProducts.length === 0 && <div className="text-gray-500">No featured products found</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>Products Loading: {productsLoading ? 'Yes' : 'No'}</div>
            <div>Categories Loading: {categoriesLoading ? 'Yes' : 'No'}</div>
            <div>Stats Loading: {statsLoading ? 'Yes' : 'No'}</div>
            <div>Featured Loading: {featuredLoading ? 'Yes' : 'No'}</div>
            <div>Products Error: {productsError || 'None'}</div>
            <div>Categories Error: {categoriesError || 'None'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DataLoadingTest
