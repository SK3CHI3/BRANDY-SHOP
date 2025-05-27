import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  debugCurrentUser, 
  fixCurrentUserRole, 
  findUsersWithRoleIssues, 
  batchFixRoleIssues,
  UserDebugInfo 
} from '@/utils/userRoleDebug'
import { UserRole } from '@/lib/supabase'
import { 
  Bug, 
  RefreshCw, 
  User, 
  Shield, 
  Palette,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const RoleDebugPanel = () => {
  const { user, profile } = useAuth()
  const [debugInfo, setDebugInfo] = useState<UserDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [roleIssues, setRoleIssues] = useState<any[]>([])

  const handleDebugCurrentUser = async () => {
    setLoading(true)
    try {
      const info = await debugCurrentUser()
      setDebugInfo(info)
      
      if (info) {
        toast({
          title: 'Debug Complete',
          description: 'Check console for detailed information',
        })
      }
    } catch (error) {
      toast({
        title: 'Debug Failed',
        description: 'Failed to debug user role',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFixRole = async (role: UserRole) => {
    setLoading(true)
    try {
      const result = await fixCurrentUserRole(role)
      
      if (result.success) {
        toast({
          title: 'Role Fixed',
          description: result.message,
        })
        
        // Refresh the page to reload user data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast({
          title: 'Fix Failed',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fix Failed',
        description: 'Failed to fix user role',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFindRoleIssues = async () => {
    setLoading(true)
    try {
      const issues = await findUsersWithRoleIssues()
      setRoleIssues(issues)
      
      toast({
        title: 'Scan Complete',
        description: `Found ${issues.length} role issues`,
      })
    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'Failed to scan for role issues',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBatchFix = async () => {
    setLoading(true)
    try {
      const result = await batchFixRoleIssues()
      
      toast({
        title: 'Batch Fix Complete',
        description: `Fixed ${result.fixed} issues. ${result.errors.length} errors.`,
      })
      
      if (result.errors.length > 0) {
        console.error('Batch fix errors:', result.errors)
      }
      
      // Refresh issues list
      await handleFindRoleIssues()
    } catch (error) {
      toast({
        title: 'Batch Fix Failed',
        description: 'Failed to fix role issues',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist': return <Palette className="h-4 w-4" />
      case 'admin': return <Shield className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artist': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  // Only show to admins or in development
  if (profile?.role !== 'admin' && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            User Role Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current User</h4>
            <div className="space-y-2 text-sm">
              <div>Email: {user?.email}</div>
              <div className="flex items-center gap-2">
                Role: 
                {profile?.role && (
                  <Badge className={getRoleColor(profile.role)}>
                    {getRoleIcon(profile.role)}
                    <span className="ml-1">{profile.role}</span>
                  </Badge>
                )}
              </div>
              <div>Profile ID: {profile?.id}</div>
            </div>
          </div>

          {/* Debug Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleDebugCurrentUser}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug Current User
            </Button>
            
            <Button 
              onClick={() => handleFixRole('customer')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              Fix as Customer
            </Button>
            
            <Button 
              onClick={() => handleFixRole('artist')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Palette className="h-4 w-4 mr-2" />
              Fix as Artist
            </Button>
            
            <Button 
              onClick={() => handleFixRole('admin')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Fix as Admin
            </Button>
          </div>

          {/* Debug Info Display */}
          {debugInfo && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Debug Information
              </h4>
              <div className="space-y-1 text-sm">
                <div>User ID: {debugInfo.userId}</div>
                <div>Email: {debugInfo.email}</div>
                <div>Profile Exists: {debugInfo.profileExists ? 'Yes' : 'No'}</div>
                <div>Artist Profile Exists: {debugInfo.artistProfileExists ? 'Yes' : 'No'}</div>
                {debugInfo.profileData && (
                  <div>Current Role: {debugInfo.profileData.role}</div>
                )}
                <div>Auth Metadata: {JSON.stringify(debugInfo.authMetadata)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System-wide Role Issues */}
      {profile?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Role Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleFindRoleIssues}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan for Issues
              </Button>
              
              {roleIssues.length > 0 && (
                <Button 
                  onClick={handleBatchFix}
                  disabled={loading}
                  size="sm"
                >
                  Fix All Issues
                </Button>
              )}
            </div>

            {roleIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Found {roleIssues.length} issues:</h4>
                {roleIssues.map((issue, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <div className="text-sm">
                      <div className="font-medium">{issue.email}</div>
                      <div className="text-gray-600">{issue.issue}</div>
                      <div>Current Role: {issue.currentRole}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RoleDebugPanel
