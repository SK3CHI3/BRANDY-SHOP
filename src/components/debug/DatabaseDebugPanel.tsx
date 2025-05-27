import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SupabaseConnectionTest from './SupabaseConnectionTest'
import SimpleDataTest from './SimpleDataTest'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  checkDatabaseConnection,
  createSampleData,
  createMissingTables,
  fixExistingUsers,
  DatabaseInfo
} from '@/utils/databaseDebug'
import {
  Database,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle,
  Copy,
  Table
} from 'lucide-react'

const DatabaseDebugPanel = () => {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSQL, setShowSQL] = useState(false)
  const [sqlCommands, setSqlCommands] = useState('')

  const handleCheckDatabase = async () => {
    setLoading(true)
    try {
      const info = await checkDatabaseConnection()
      setDbInfo(info)

      toast({
        title: 'Database Check Complete',
        description: `Found ${info.tables.length} tables, ${info.errors.length} errors`,
      })
    } catch (error) {
      toast({
        title: 'Database Check Failed',
        description: 'Failed to check database connection',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSampleData = async () => {
    setLoading(true)
    try {
      const result = await createSampleData()

      if (result.success) {
        toast({
          title: 'Sample Data Created',
          description: result.message,
        })
        // Refresh database info
        await handleCheckDatabase()
      } else {
        toast({
          title: 'Sample Data Creation Failed',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Sample Data Creation Failed',
        description: 'Failed to create sample data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShowSQL = async () => {
    try {
      const result = await createMissingTables()
      setSqlCommands(result.message)
      setShowSQL(true)

      toast({
        title: 'SQL Commands Generated',
        description: 'Copy and run these commands in Supabase SQL Editor',
      })
    } catch (error) {
      toast({
        title: 'SQL Generation Failed',
        description: 'Failed to generate SQL commands',
        variant: 'destructive',
      })
    }
  }

  const handleFixUsers = async () => {
    setLoading(true)
    try {
      const result = await fixExistingUsers()

      if (result.success) {
        toast({
          title: 'Users Fixed',
          description: `Fixed ${result.fixed} users successfully`,
        })
        // Refresh database info
        await handleCheckDatabase()
      } else {
        toast({
          title: 'Fix Users Failed',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fix Users Failed',
        description: 'Failed to fix existing users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copied to Clipboard',
        description: 'SQL commands copied successfully',
      })
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Test */}
      <SupabaseConnectionTest />

      {/* Simple Data Test */}
      <SimpleDataTest />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCheckDatabase}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Database
            </Button>

            <Button
              onClick={handleCreateSampleData}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sample Data
            </Button>

            <Button
              onClick={handleShowSQL}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Table className="h-4 w-4 mr-2" />
              Generate SQL
            </Button>

            <Button
              onClick={handleFixUsers}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Fix Existing Users
            </Button>
          </div>

          {/* Database Status */}
          {dbInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  {dbInfo.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  Connection Status
                </h4>
                <div className="text-sm">
                  <div>Connected: {dbInfo.connected ? 'Yes' : 'No'}</div>
                  <div>Tables Found: {dbInfo.tables.length}</div>
                  <div>Errors: {dbInfo.errors.length}</div>
                </div>
              </div>

              {/* Available Tables */}
              {dbInfo.tables.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-900">Available Tables</h4>
                  <div className="flex flex-wrap gap-2">
                    {dbInfo.tables.map(table => (
                      <Badge key={table} variant="outline" className="bg-green-100 text-green-800">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {dbInfo.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-900">Errors Found</h4>
                  <div className="space-y-1 text-sm">
                    {dbInfo.errors.map((error, index) => (
                      <div key={index} className="text-red-800">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data */}
              {Object.keys(dbInfo.sampleData).length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900">Sample Data</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(dbInfo.sampleData).map(([table, data]) => (
                      <div key={table} className="text-blue-800">
                        <strong>{table}:</strong> {data.length} records
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SQL Commands */}
          {showSQL && sqlCommands && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">SQL Commands</h4>
                <Button
                  onClick={() => copyToClipboard(sqlCommands)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono max-h-96 overflow-y-auto">
                <pre>{sqlCommands}</pre>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Copy these commands and run them in your Supabase SQL Editor to create the required tables.
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-900">Instructions</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <div>1. Click "Check Database" to see current status</div>
              <div>2. If tables are missing, click "Generate SQL" to get creation commands</div>
              <div>3. Copy and run the SQL in your Supabase SQL Editor</div>
              <div>4. Click "Fix Existing Users" to fix any role assignment issues</div>
              <div>5. Click "Create Sample Data" to populate tables with test data</div>
              <div>6. Refresh your app to see the data loading</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Console Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Console Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-100 rounded font-mono">
              debugDatabase() - Check database connection and tables
            </div>
            <div className="p-3 bg-gray-100 rounded font-mono">
              setupSampleData() - Create sample data
            </div>
            <div className="p-3 bg-gray-100 rounded font-mono">
              showTableCreationSQL() - Show SQL for creating tables
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Open browser console (F12) and run these commands for debugging
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseDebugPanel
