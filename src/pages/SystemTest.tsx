import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SystemDiagnostics } from '@/utils/systemDiagnostics'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  RefreshCw,
  Database,
  MessageSquare,
  Upload,
  Bell
} from 'lucide-react'

const SystemTest = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    if (!user) return

    setTesting(true)
    try {
      const results = await SystemDiagnostics.runFullDiagnostics(user.id)
      setTestResults(results)
    } catch (error) {
      console.error('Error running diagnostics:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "PASS" : "FAIL"}
      </Badge>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please sign in to run system diagnostics</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Diagnostics</h1>
          <p className="text-gray-600">
            Test messaging, product posting, and notification functionality
          </p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        {testResults && (
          <div className="grid gap-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Test Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.summary.passedTests}
                    </div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.summary.failedTests}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResults.summary.totalTests}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
                
                {testResults.summary.issues.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-600 mb-2">Issues Found:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {testResults.summary.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Conversations Table</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.database.conversations)}
                      {getStatusBadge(testResults.database.conversations)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Messages Table</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.database.messages)}
                      {getStatusBadge(testResults.database.messages)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notifications Table</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.database.notifications)}
                      {getStatusBadge(testResults.database.notifications)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Products Table</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.database.products)}
                      {getStatusBadge(testResults.database.products)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Categories Table</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.database.categories)}
                      {getStatusBadge(testResults.database.categories)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messaging System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Get Conversations</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.messaging.canGetConversations)}
                      {getStatusBadge(testResults.messaging.canGetConversations)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Create Conversation</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.messaging.canCreateConversation)}
                      {getStatusBadge(testResults.messaging.canCreateConversation)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Send Message</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.messaging.canSendMessage)}
                      {getStatusBadge(testResults.messaging.canSendMessage)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Posting Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Product Posting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Get Categories</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.productPosting.canGetCategories)}
                      {getStatusBadge(testResults.productPosting.canGetCategories)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Upload to Storage</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.productPosting.canUploadToStorage)}
                      {getStatusBadge(testResults.productPosting.canUploadToStorage)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Create Product</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.productPosting.canCreateProduct)}
                      {getStatusBadge(testResults.productPosting.canCreateProduct)}
                    </div>
                  </div>

                  {/* Storage Details */}
                  {testResults.productPosting.storageDetails && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Storage Details:</h4>
                      <div className="text-xs space-y-1">
                        <div>Bucket Exists: {testResults.productPosting.storageDetails.bucketExists ? '✅' : '❌'}</div>
                        <div>Bucket Public: {testResults.productPosting.storageDetails.bucketPublic ? '✅' : '❌'}</div>
                        <div>Available Buckets: {testResults.productPosting.storageDetails.allBuckets?.join(', ') || 'None'}</div>
                      </div>
                    </div>
                  )}

                  {testResults.productPosting.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      Error: {testResults.productPosting.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Get Notifications</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.notifications.canGetNotifications)}
                      {getStatusBadge(testResults.notifications.canGetNotifications)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Create Notification</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.notifications.canCreateNotification)}
                      {getStatusBadge(testResults.notifications.canCreateNotification)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mark as Read</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResults.notifications.canMarkAsRead)}
                      {getStatusBadge(testResults.notifications.canMarkAsRead)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default SystemTest
