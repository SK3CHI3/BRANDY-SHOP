import React, { useState } from 'react'
import { createAdminUser, verifyAdminUser } from '@/scripts/createAdminUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Shield, CheckCircle, AlertCircle, User, Mail, Key } from 'lucide-react'

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [adminProfile, setAdminProfile] = useState<any>(null)

  const handleCreateAdmin = async () => {
    setLoading(true)
    try {
      const result = await createAdminUser()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        // Verify the admin user was created
        await handleVerifyAdmin()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create admin user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAdmin = async () => {
    setLoading(true)
    try {
      const result = await verifyAdminUser()
      
      if (result.exists) {
        setAdminExists(true)
        setAdminProfile(result.profile)
        toast({
          title: 'Admin Verified',
          description: 'Admin user exists and is properly configured',
        })
      } else {
        setAdminExists(false)
        setAdminProfile(null)
        toast({
          title: 'Admin Not Found',
          description: result.error || 'Admin user does not exist',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify admin user',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // Check if admin exists on component mount
    handleVerifyAdmin()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BRANDY-SHOP Admin Setup</h1>
          <p className="text-gray-600">Configure the administrator account for your platform</p>
        </div>

        {/* Admin Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminExists === null ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span className="text-gray-600">Checking admin status...</span>
                </div>
              ) : adminExists ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Admin account is configured</span>
                  </div>
                  
                  {adminProfile && (
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-sm"><strong>Email:</strong> {adminProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-sm"><strong>Name:</strong> {adminProfile.full_name || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm"><strong>Role:</strong></span>
                        <Badge variant="destructive">{adminProfile.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm"><strong>Verified:</strong></span>
                        <Badge variant={adminProfile.is_verified ? "default" : "secondary"}>
                          {adminProfile.is_verified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">Admin account not found</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Admin Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm"><strong>Email:</strong> starshine@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span className="text-sm"><strong>Password:</strong> tangoDown</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                These are the predefined credentials for the admin account. 
                Make sure to change the password after first login for security.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleVerifyAdmin}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Verify Admin'}
          </Button>
          
          <Button
            onClick={handleCreateAdmin}
            disabled={loading || adminExists === true}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Creating...' : adminExists ? 'Admin Exists' : 'Create Admin'}
          </Button>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Create the admin account using the button above</p>
              <p>2. Navigate to the login page and sign in with the admin credentials</p>
              <p>3. Access the admin panel at <code className="bg-gray-100 px-1 rounded">/admin-panel</code></p>
              <p>4. Change the admin password for security</p>
              <p>5. Start managing your platform!</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        {adminExists && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Admin account is ready!</p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <a href="/login">Go to Login</a>
              </Button>
              <Button asChild>
                <a href="/admin-panel">Go to Admin Panel</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSetup
