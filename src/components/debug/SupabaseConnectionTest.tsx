import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [testResults, setTestResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setConnectionStatus('testing')
    setError(null)
    setTestResults([])

    try {
      console.log('Testing Supabase connection...')
      
      // Test 1: Simple products query
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, price')
        .limit(3)

      console.log('Products query result:', { products, productsError })

      if (productsError) {
        throw new Error(`Products query failed: ${productsError.message}`)
      }

      // Test 2: Categories query
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(3)

      console.log('Categories query result:', { categories, categoriesError })

      if (categoriesError) {
        throw new Error(`Categories query failed: ${categoriesError.message}`)
      }

      // Test 3: Profiles query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(3)

      console.log('Profiles query result:', { profiles, profilesError })

      if (profilesError) {
        throw new Error(`Profiles query failed: ${profilesError.message}`)
      }

      setTestResults([
        { name: 'Products', count: products?.length || 0, data: products },
        { name: 'Categories', count: categories?.length || 0, data: categories },
        { name: 'Profiles', count: profiles?.length || 0, data: profiles }
      ])

      setConnectionStatus('connected')
    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnectionStatus('failed')
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'failed' ? 'destructive' : 'secondary'}
          >
            {connectionStatus === 'testing' ? 'Testing...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Failed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
          Test Connection
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Error</h4>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results</h4>
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{result.name}</span>
                  <Badge variant="outline">{result.count} records</Badge>
                </div>
                {result.data && result.data.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <pre>{JSON.stringify(result.data[0], null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
          <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupabaseConnectionTest
