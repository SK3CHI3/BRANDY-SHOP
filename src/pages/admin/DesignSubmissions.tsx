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
  Upload,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  User,
  Calendar,
  FileImage,
  AlertTriangle
} from 'lucide-react'

interface DesignSubmission {
  id: string
  artist_id: string
  title: string
  description: string
  category: string
  tags: string[]
  image_url: string
  high_res_url: string
  watermarked_url: string
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  admin_notes?: string
  submission_date: string
  review_date?: string
  reviewed_by?: string
  artist?: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

const DesignSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<DesignSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState<DesignSubmission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchDesignSubmissions()
  }, [])

  const fetchDesignSubmissions = async () => {
    try {
      setLoading(true)
      
      // Mock design submission data (in real app, this would come from design_submissions table)
      const mockSubmissions: DesignSubmission[] = [
        {
          id: '1',
          artist_id: 'artist1',
          title: 'Traditional Kikuyu Patterns',
          description: 'Authentic geometric patterns inspired by Kikuyu traditional art',
          category: 'Traditional',
          tags: ['kikuyu', 'geometric', 'traditional', 'patterns'],
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
          high_res_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1200&fit=crop&crop=center',
          watermarked_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
          status: 'pending',
          submission_date: '2024-06-08T10:00:00Z',
          artist: {
            full_name: 'Mary Wanjiku',
            email: 'mary@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '2',
          artist_id: 'artist2',
          title: 'Modern Nairobi Skyline',
          description: 'Contemporary illustration of Nairobi city skyline with artistic flair',
          category: 'Modern',
          tags: ['nairobi', 'skyline', 'modern', 'city'],
          image_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=400&fit=crop&crop=center',
          high_res_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1200&h=1200&fit=crop&crop=center',
          watermarked_url: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=400&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
          status: 'approved',
          submission_date: '2024-06-07T14:00:00Z',
          review_date: '2024-06-08T09:00:00Z',
          reviewed_by: 'admin',
          admin_notes: 'Excellent quality and originality. Approved for catalog.',
          artist: {
            full_name: 'John Kamau',
            email: 'john@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '3',
          artist_id: 'artist3',
          title: 'Swahili Calligraphy Art',
          description: 'Beautiful Swahili phrases in artistic calligraphy style',
          category: 'Typography',
          tags: ['swahili', 'calligraphy', 'typography', 'art'],
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&crop=center',
          high_res_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=1200&fit=crop&crop=center',
          watermarked_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
          status: 'featured',
          submission_date: '2024-06-06T16:00:00Z',
          review_date: '2024-06-07T10:00:00Z',
          reviewed_by: 'admin',
          admin_notes: 'Outstanding work. Featured in main catalog.',
          artist: {
            full_name: 'Amina Hassan',
            email: 'amina@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '4',
          artist_id: 'artist4',
          title: 'Wildlife Silhouettes',
          description: 'Kenyan wildlife silhouettes in minimalist style',
          category: 'Wildlife',
          tags: ['wildlife', 'silhouettes', 'minimalist', 'kenya'],
          image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop&crop=center',
          high_res_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=1200&fit=crop&crop=center',
          watermarked_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop&crop=center&blend=000000&sat=-100&exp=15&balph=50',
          status: 'rejected',
          submission_date: '2024-06-05T12:00:00Z',
          review_date: '2024-06-06T15:00:00Z',
          reviewed_by: 'admin',
          admin_notes: 'Similar designs already exist in catalog. Please submit more unique work.',
          artist: {
            full_name: 'Peter Mwangi',
            email: 'peter@example.com',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        }
      ]

      setSubmissions(mockSubmissions)
    } catch (error) {
      console.error('Error fetching design submissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load design submissions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (submissionId: string, status: string, notes?: string) => {
    try {
      // Update local state (in real app, this would update the database)
      setSubmissions(submissions.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: status as any,
              admin_notes: notes,
              review_date: new Date().toISOString(),
              reviewed_by: 'admin'
            }
          : submission
      ))

      toast({
        title: 'Success',
        description: `Design submission ${status}`,
      })

      setSelectedSubmission(null)
      setReviewNotes('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      featured: { variant: 'default' as const, icon: Star, color: 'text-yellow-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.artist?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || submission.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    featured: submissions.filter(s => s.status === 'featured').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  const categories = ['Traditional', 'Modern', 'Typography', 'Wildlife', 'Abstract', 'Cultural']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design submissions...</p>
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
            <Upload className="h-6 w-6" />
            Design Submissions
          </h1>
          <p className="text-gray-600">Review and approve artist design submissions for catalog</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileImage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search by title, artist, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Design Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Design</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={submission.watermarked_url || '/placeholder.svg'} 
                        alt={submission.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{submission.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{submission.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={submission.artist?.avatar_url || '/placeholder.svg'} 
                        alt={submission.artist?.full_name}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                      <div>
                        <div className="font-medium">{submission.artist?.full_name}</div>
                        <div className="text-sm text-gray-500">{submission.artist?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {submission.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {submission.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{submission.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>{new Date(submission.submission_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Review Design Submission</DialogTitle>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <img 
                                    src={selectedSubmission.image_url || '/placeholder.svg'} 
                                    alt={selectedSubmission.title}
                                    className="w-full h-64 object-cover rounded"
                                  />
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold">{selectedSubmission.title}</h3>
                                    <p className="text-gray-600">{selectedSubmission.description}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Artist</h4>
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={selectedSubmission.artist?.avatar_url || '/placeholder.svg'} 
                                        alt={selectedSubmission.artist?.full_name}
                                        className="w-10 h-10 object-cover rounded-full"
                                      />
                                      <div>
                                        <p className="font-medium">{selectedSubmission.artist?.full_name}</p>
                                        <p className="text-sm text-gray-500">{selectedSubmission.artist?.email}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Details</h4>
                                    <p><strong>Category:</strong> {selectedSubmission.category}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</p>
                                    <p><strong>Submitted:</strong> {new Date(selectedSubmission.submission_date).toLocaleDateString()}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedSubmission.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedSubmission.admin_notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Previous Review Notes</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    {selectedSubmission.admin_notes}
                                  </p>
                                </div>
                              )}

                              {selectedSubmission.status === 'pending' && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Review Notes</label>
                                    <Textarea
                                      placeholder="Add notes about this submission..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved', reviewNotes)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'featured', reviewNotes)}
                                      className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      Feature
                                    </Button>
                                    <Button
                                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected', reviewNotes)}
                                      variant="destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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

export default DesignSubmissions
