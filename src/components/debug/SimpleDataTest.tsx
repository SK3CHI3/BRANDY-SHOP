import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SimpleDataTest = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testSimpleQueries = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing simple Supabase queries...')
      
      // Test products
      console.log('Fetching products...')
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, title, price, is_active')
        .eq('is_active', true)
        .limit(5)

      console.log('Products result:', { productsData, productsError })

      if (productsError) {
        throw new Error(`Products: ${productsError.message}`)
      }

      // Test categories
      console.log('Fetching categories...')
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(5)

      console.log('Categories result:', { categoriesData, categoriesError })

      if (categoriesError) {
        throw new Error(`Categories: ${categoriesError.message}`)
      }

      setProducts(productsData || [])
      setCategories(categoriesData || [])
      
    } catch (err) {
      console.error('Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testSimpleQueries()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Data Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testSimpleQueries} disabled={loading}>
          {loading ? 'Testing...' : 'Test Data Loading'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900">Error</h4>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Products ({products.length})</h4>
            <div className="space-y-1 text-sm">
              {products.map(product => (
                <div key={product.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{product.title}</div>
                  <div className="text-gray-600">KSh {product.price}</div>
                </div>
              ))}
              {products.length === 0 && !loading && (
                <div className="text-gray-500">No products found</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Categories ({categories.length})</h4>
            <div className="space-y-1 text-sm">
              {categories.map(category => (
                <div key={category.id} className="p-2 bg-gray-50 rounded">
                  {category.name}
                </div>
              ))}
              {categories.length === 0 && !loading && (
                <div className="text-gray-500">No categories found</div>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>Environment Check:</div>
          <div>URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
          <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SimpleDataTest
