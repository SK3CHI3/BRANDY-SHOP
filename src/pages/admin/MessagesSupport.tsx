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
  MessageSquare,
  Search,
  Filter,
  Eye,
  Reply,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Send
} from 'lucide-react'

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  created_at: string
  updated_at: string
  user?: {
    full_name: string
    email: string
    phone?: string
  }
  responses?: Array<{
    id: string
    message: string
    is_admin: boolean
    created_at: string
    admin_name?: string
  }>
}

const MessagesSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    fetchSupportTickets()
  }, [])

  const fetchSupportTickets = async () => {
    try {
      setLoading(true)
      
      // Mock data for support tickets since we don't have this table yet
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          user_id: 'user1',
          subject: 'Order not received',
          message: 'I placed an order 2 weeks ago but haven\'t received it yet. Order number: ORD-001',
          status: 'open',
          priority: 'high',
          category: 'Order Issues',
          created_at: '2024-06-08T10:30:00Z',
          updated_at: '2024-06-08T10:30:00Z',
          user: {
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+254712345678'
          },
          responses: []
        },
        {
          id: '2',
          user_id: 'user2',
          subject: 'Payment issue',
          message: 'My payment was deducted but order shows as pending. Please help.',
          status: 'in_progress',
          priority: 'urgent',
          category: 'Payment Issues',
          created_at: '2024-06-07T14:20:00Z',
          updated_at: '2024-06-08T09:15:00Z',
          user: {
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+254723456789'
          },
          responses: [
            {
              id: 'r1',
              message: 'We are looking into your payment issue. Please provide your transaction ID.',
              is_admin: true,
              created_at: '2024-06-08T09:15:00Z',
              admin_name: 'Admin User'
            }
          ]
        },
        {
          id: '3',
          user_id: 'user3',
          subject: 'Product quality concern',
          message: 'The product I received doesn\'t match the description on the website.',
          status: 'resolved',
          priority: 'medium',
          category: 'Product Quality',
          created_at: '2024-06-06T16:45:00Z',
          updated_at: '2024-06-07T11:30:00Z',
          user: {
            full_name: 'Mike Johnson',
            email: 'mike@example.com'
          },
          responses: [
            {
              id: 'r2',
              message: 'We apologize for the inconvenience. We\'ll arrange a replacement for you.',
              is_admin: true,
              created_at: '2024-06-07T11:30:00Z',
              admin_name: 'Admin User'
            }
          ]
        },
        {
          id: '4',
          user_id: 'user4',
          subject: 'Account verification',
          message: 'I need help verifying my artist account. Uploaded documents but no response.',
          status: 'open',
          priority: 'low',
          category: 'Account Issues',
          created_at: '2024-06-05T12:00:00Z',
          updated_at: '2024-06-05T12:00:00Z',
          user: {
            full_name: 'Sarah Wilson',
            email: 'sarah@example.com',
            phone: '+254734567890'
          },
          responses: []
        }
      ]

      setTickets(mockTickets)
    } catch (error) {
      console.error('Error fetching support tickets:', error)
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      // Update local state (in real app, this would update the database)
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: status as any, updated_at: new Date().toISOString() }
          : ticket
      ))

      toast({
        title: 'Success',
        description: `Ticket status updated to ${status}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      })
    }
  }

  const sendResponse = async (ticketId: string, message: string) => {
    try {
      const newResponse = {
        id: `r${Date.now()}`,
        message,
        is_admin: true,
        created_at: new Date().toISOString(),
        admin_name: 'Admin User'
      }

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              responses: [...(ticket.responses || []), newResponse],
              status: 'in_progress' as any,
              updated_at: new Date().toISOString()
            }
          : ticket
      ))

      setResponseMessage('')
      
      toast({
        title: 'Success',
        description: 'Response sent successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'destructive' as const, icon: AlertCircle },
      in_progress: { variant: 'default' as const, icon: Clock },
      resolved: { variant: 'default' as const, icon: CheckCircle },
      closed: { variant: 'secondary' as const, icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, color: 'text-gray-600' },
      medium: { variant: 'default' as const, color: 'text-blue-600' },
      high: { variant: 'destructive' as const, color: 'text-orange-600' },
      urgent: { variant: 'destructive' as const, color: 'text-red-600' },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low

    return (
      <Badge variant={config.variant} className={config.color}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support tickets...</p>
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
            <MessageSquare className="h-6 w-6" />
            Messages & Support
          </h1>
          <p className="text-gray-600">Manage customer support tickets and communications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets by subject, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.user?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{ticket.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {ticket.message}
                    </div>
                  </TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Support Ticket Details</DialogTitle>
                          </DialogHeader>
                          {selectedTicket && (
                            <div className="space-y-4">
                              {/* Ticket Info */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{selectedTicket.user?.full_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{selectedTicket.user?.email}</span>
                                  </div>
                                  {selectedTicket.user?.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm">{selectedTicket.user.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="mb-2">
                                    <span className="text-sm text-gray-600">Priority: </span>
                                    {getPriorityBadge(selectedTicket.priority)}
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-sm text-gray-600">Status: </span>
                                    {getStatusBadge(selectedTicket.status)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Original Message */}
                              <div>
                                <h4 className="font-medium mb-2">Original Message</h4>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h5 className="font-medium text-blue-900">{selectedTicket.subject}</h5>
                                  <p className="text-blue-800 mt-1">{selectedTicket.message}</p>
                                </div>
                              </div>

                              {/* Responses */}
                              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Responses</h4>
                                  <div className="space-y-2">
                                    {selectedTicket.responses.map((response) => (
                                      <div 
                                        key={response.id} 
                                        className={`p-3 rounded-lg ${
                                          response.is_admin ? 'bg-green-50 ml-4' : 'bg-gray-50 mr-4'
                                        }`}
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="font-medium text-sm">
                                            {response.is_admin ? response.admin_name : selectedTicket.user?.full_name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(response.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-sm">{response.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Response Form */}
                              <div>
                                <h4 className="font-medium mb-2">Send Response</h4>
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => sendResponse(selectedTicket.id, responseMessage)}
                                      disabled={!responseMessage.trim()}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Response
                                    </Button>
                                    <Select 
                                      value={selectedTicket.status} 
                                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        disabled={ticket.status === 'in_progress'}
                      >
                        <Reply className="h-4 w-4" />
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

export default MessagesSupport
