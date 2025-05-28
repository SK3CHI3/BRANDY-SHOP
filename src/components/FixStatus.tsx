import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Play, RefreshCw } from 'lucide-react'

declare global {
  interface Window {
    testFixes: any
  }
}

const FixStatus = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    if (!user || !window.testFixes) return

    setTesting(true)
    try {
      const results = await window.testFixes.runAllTests(user.id)
      setTestResults(results)
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="text-xs">
        {success ? "FIXED" : "ISSUE"}
      </Badge>
    )
  }

  if (!user) return null

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">System Status</CardTitle>
        <Button 
          onClick={runTests} 
          disabled={testing}
          size="sm"
          className="w-full"
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test All Fixes
            </>
          )}
        </Button>
      </CardHeader>
      
      {testResults && (
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Storage Upload</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.storage.success)}
              {getStatusBadge(testResults.storage.success)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Message Sending</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.messaging.success)}
              {getStatusBadge(testResults.messaging.success)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Product Creation</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.products.success)}
              {getStatusBadge(testResults.products.success)}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {testResults.summary.passedTests}/{testResults.summary.totalTests}
              </div>
              <div className="text-xs text-gray-600">Tests Passing</div>
            </div>
          </div>
          
          {testResults.summary.failedTests > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {testResults.storage.error && <div>Storage: {testResults.storage.error}</div>}
              {testResults.messaging.error && <div>Messaging: {testResults.messaging.error}</div>}
              {testResults.products.error && <div>Products: {testResults.products.error}</div>}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default FixStatus
