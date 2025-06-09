import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Bell,
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  Users,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Megaphone
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement'
  target_audience: 'all' | 'customers' | 'artists' | 'specific'
  status: 'draft' | 'scheduled' | 'sent'
  scheduled_at?: string
  sent_at?: string
  created_at: string
  recipient_count?: number
  read_count?: number
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    target_audience: 'all' as const,
    scheduled_at: ''
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Mock data for notifications since we don't have this table yet
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Platform Maintenance Scheduled',
          message: 'We will be performing scheduled maintenance on June 15th from 2:00 AM to 4:00 AM EAT. The platform may be temporarily unavailable during this time.',
          type: 'warning',
          target_audience: 'all',
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: '2024-06-08T09:30:00Z',
          recipient_count: 52,
          read_count: 38
        },
        {
          id: '2',
          title: 'New Payment Method Available',
          message: 'We\'ve added support for Airtel Money! You can now use Airtel Money for all your purchases on BRANDY-SHOP.',
          type: 'success',
          target_audience: 'customers',
          status: 'sent',
          sent_at: '2024-06-07T14:30:00Z',
          created_at: '2024-06-07T14:00:00Z',
          recipient_count: 37,
          read_count: 29
        },
        {
          id: '3',
          title: 'Artist Commission Update',
          message: 'Starting July 1st, artist commission rates will be updated. Please check your dashboard for details.',
          type: 'info',
          target_audience: 'artists',
          status: 'scheduled',
          scheduled_at: '2024-06-30T09:00:00Z',
          created_at: '2024-06-06T16:00:00Z',
          recipient_count: 15
        },
        {
          id: '4',
          title: 'Welcome to BRANDY-SHOP!',
          message: 'Thank you for joining our creative marketplace. Explore amazing products from talented Kenyan artists.',
          type: 'announcement',
          target_audience: 'customers',
          status: 'draft',
          created_at: '2024-06-05T12:00:00Z'
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }

      const notification: Notification = {
        id: `notif_${Date.now()}`,
        ...newNotification,
        status: newNotification.scheduled_at ? 'scheduled' : 'draft',
        created_at: new Date().toISOString(),
        recipient_count: newNotification.target_audience === 'all' ? 52 : 
                        newNotification.target_audience === 'customers' ? 37 : 15
      }

      setNotifications([notification, ...notifications])
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target_audience: 'all',
        scheduled_at: ''
      })
      setShowCreateDialog(false)

      toast({
        title: 'Success',
        description: 'Notification created successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create notification',
        variant: 'destructive',
      })
    }
  }

  const sendNotification = async (notificationId: string) => {
    try {
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { 
              ...notif, 
              status: 'sent' as const, 
              sent_at: new Date().toISOString(),
              read_count: 0
            }
          : notif
      ))

      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return
    }

    try {
      setNotifications(notifications.filter(notif => notif.id !== notificationId))
      
      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      })
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      info: { variant: 'default' as const, icon: Bell },
      warning: { variant: 'destructive' as const, icon: AlertCircle },
      success: { variant: 'default' as const, icon: CheckCircle },
      error: { variant: 'destructive' as const, icon: AlertCircle },
      announcement: { variant: 'default' as const, icon: Megaphone },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Edit },
      scheduled: { variant: 'default' as const, icon: Clock },
      sent: { variant: 'default' as const, icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    draft: notifications.filter(n => n.status === 'draft').length,
    totalRecipients: notifications.filter(n => n.status === 'sent').reduce((sum, n) => sum + (n.recipient_count || 0), 0),
    totalReads: notifications.filter(n => n.status === 'sent').reduce((sum, n) => sum + (n.read_count || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
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
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-gray-600">Manage system notifications and announcements</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Notification title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Notification message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(value: any) => setNewNotification({...newNotification, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select 
                    value={newNotification.target_audience} 
                    onValueChange={(value: any) => setNewNotification({...newNotification, target_audience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="artists">Artists</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Schedule (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newNotification.scheduled_at}
                  onChange={(e) => setNewNotification({...newNotification, scheduled_at: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createNotification} className="bg-red-600 hover:bg-red-700">
                  Create Notification
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-orange-600">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Read Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalRecipients > 0 ? Math.round((stats.totalReads / stats.totalRecipients) * 100) : 0}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.target_audience === 'all' ? 'All Users' : 
                       notification.target_audience.charAt(0).toUpperCase() + notification.target_audience.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    {notification.recipient_count && (
                      <div>
                        <div className="font-medium">{notification.recipient_count}</div>
                        {notification.read_count !== undefined && (
                          <div className="text-sm text-gray-500">
                            {notification.read_count} read
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Notification Details</DialogTitle>
                          </DialogHeader>
                          {selectedNotification && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Title</h4>
                                <p>{selectedNotification.title}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Message</h4>
                                <p className="text-gray-600">{selectedNotification.message}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Type</h4>
                                  {getTypeBadge(selectedNotification.type)}
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Status</h4>
                                  {getStatusBadge(selectedNotification.status)}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Target Audience</h4>
                                <Badge variant="outline">
                                  {selectedNotification.target_audience === 'all' ? 'All Users' : 
                                   selectedNotification.target_audience.charAt(0).toUpperCase() + selectedNotification.target_audience.slice(1)}
                                </Badge>
                              </div>

                              {selectedNotification.scheduled_at && (
                                <div>
                                  <h4 className="font-medium mb-2">Scheduled For</h4>
                                  <p>{new Date(selectedNotification.scheduled_at).toLocaleString()}</p>
                                </div>
                              )}

                              {selectedNotification.sent_at && (
                                <div>
                                  <h4 className="font-medium mb-2">Sent At</h4>
                                  <p>{new Date(selectedNotification.sent_at).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {notification.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendNotification(notification.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
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

export default Notifications
