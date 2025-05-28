import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useData } from '@/contexts/DataContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileTestSuite from '@/components/MobileTestSuite'
import WithdrawalModal from '@/components/WithdrawalModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import {
  ShoppingCart,
  MessageCircle,
  Wallet,
  RefreshCw,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  Heart,
  Star,
  User,
  Search,
  Filter,
  Plus,
  Minus
} from 'lucide-react'

const MobileTestPage = () => {
  const { user } = useAuth()
  const { addToCart, cartItems, cartCount, cartTotal } = useCart()
  const { forceRefreshAll, products, productsLoading } = useData()
  const [testQuantity, setTestQuantity] = useState(1)
  const [testMessage, setTestMessage] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])

  const runComprehensiveTest = async () => {
    const results = []

    // Test 1: Cart Functionality
    try {
      if (user && products.length > 0) {
        await addToCart(products[0].id, 1)
        results.push({
          name: 'Cart - Add Item',
          status: 'pass',
          message: 'Successfully added item to cart'
        })
      } else {
        results.push({
          name: 'Cart - Add Item',
          status: 'skip',
          message: 'Requires user login and products'
        })
      }
    } catch (error) {
      results.push({
        name: 'Cart - Add Item',
        status: 'fail',
        message: 'Failed to add item to cart'
      })
    }

    // Test 2: Data Refresh
    try {
      await forceRefreshAll()
      results.push({
        name: 'Data Refresh',
        status: 'pass',
        message: 'Successfully refreshed marketplace data'
      })
    } catch (error) {
      results.push({
        name: 'Data Refresh',
        status: 'fail',
        message: 'Failed to refresh data'
      })
    }

    // Test 3: Mobile Touch Targets
    const buttons = document.querySelectorAll('button')
    let touchFriendlyCount = 0
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect()
      if (rect.width >= 44 && rect.height >= 44) {
        touchFriendlyCount++
      }
    })

    results.push({
      name: 'Touch Targets',
      status: touchFriendlyCount / buttons.length > 0.8 ? 'pass' : 'fail',
      message: `${touchFriendlyCount}/${buttons.length} buttons are touch-friendly`
    })

    // Test 4: Form Inputs
    const inputs = document.querySelectorAll('input')
    let mobileOptimizedInputs = 0
    inputs.forEach(input => {
      const rect = input.getBoundingClientRect()
      const styles = window.getComputedStyle(input)
      const fontSize = parseFloat(styles.fontSize)
      
      if (rect.height >= 48 && fontSize >= 16) {
        mobileOptimizedInputs++
      }
    })

    results.push({
      name: 'Form Inputs',
      status: mobileOptimizedInputs / inputs.length > 0.8 ? 'pass' : 'fail',
      message: `${mobileOptimizedInputs}/${inputs.length} inputs are mobile-optimized`
    })

    setTestResults(results)
    
    toast({
      title: 'Test Complete',
      description: `Ran ${results.length} tests. Check results below.`,
    })
  }

  const testAddToCart = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to test cart functionality',
        variant: 'destructive',
      })
      return
    }

    if (products.length === 0) {
      toast({
        title: 'No products',
        description: 'No products available to add to cart',
        variant: 'destructive',
      })
      return
    }

    try {
      await addToCart(products[0].id, testQuantity)
      toast({
        title: 'Success',
        description: `Added ${testQuantity} item(s) to cart`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  const testDataRefresh = async () => {
    try {
      await forceRefreshAll()
      toast({
        title: 'Success',
        description: 'Marketplace data refreshed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh data',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Monitor className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Mobile Responsiveness & Functionality Test
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Comprehensive testing suite for cart functionality, data refresh, and mobile responsiveness
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Cart Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Functionality Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cart Items:</span>
                <Badge>{cartCount}</Badge>
                <span className="text-sm text-gray-600">
                  Total: KSh {cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setTestQuantity(Math.max(1, testQuantity - 1))}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={testQuantity}
                  onChange={(e) => setTestQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center min-h-[48px] text-base"
                  style={{ fontSize: '16px' }}
                  min="1"
                />
                <Button
                  size="sm"
                  onClick={() => setTestQuantity(testQuantity + 1)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={testAddToCart}
                className="w-full min-h-[48px]"
                disabled={!user || products.length === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Test Add to Cart
              </Button>

              {!user && (
                <Alert>
                  <AlertDescription>
                    Sign in to test cart functionality
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Data Refresh Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Data Refresh Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Products:</span>
                <Badge>{products.length}</Badge>
                <span className="text-sm text-gray-600">
                  {productsLoading ? 'Loading...' : 'Loaded'}
                </span>
              </div>

              <Button
                onClick={testDataRefresh}
                className="w-full min-h-[48px]"
                disabled={productsLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Data Refresh
              </Button>

              <Alert>
                <AlertDescription>
                  This tests real-time marketplace data updates
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Withdrawal Testing (Artists Only) */}
          {user?.role === 'artist' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Withdrawal System Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <WithdrawalModal
                  trigger={
                    <Button className="w-full min-h-[48px] bg-green-600 hover:bg-green-700">
                      <Wallet className="h-4 w-4 mr-2" />
                      Test Withdrawal Request
                    </Button>
                  }
                />

                <Alert>
                  <AlertDescription>
                    Tests mobile-optimized withdrawal request form
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Messages Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Test message input..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="min-h-[48px] text-base"
                style={{ fontSize: '16px' }}
              />

              <Button
                onClick={() => {
                  if (testMessage.trim()) {
                    toast({
                      title: 'Message Test',
                      description: 'Message input is working correctly',
                    })
                    setTestMessage('')
                  }
                }}
                className="w-full min-h-[48px]"
                disabled={!testMessage.trim()}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Test Message Input
              </Button>

              <Alert>
                <AlertDescription>
                  Tests mobile-friendly message input with proper font size
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Test Runner */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Comprehensive Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runComprehensiveTest}
              className="w-full min-h-[48px]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{result.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Test Suite */}
        <MobileTestSuite />
      </div>

      <Footer />
    </div>
  )
}

export default MobileTestPage
