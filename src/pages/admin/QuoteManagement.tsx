import React, { useState, useEffect } from 'react';
import { designStudioService } from '@/services/designStudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  User,
  Package
} from 'lucide-react';

const QuoteManagement = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await designStudioService.getAllQuoteRequests();
      if (error) throw new Error(error);
      setQuotes(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch quote requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuote = async (quoteId: string, status: string, price?: number, notes?: string) => {
    try {
      let updateData: any = { status };
      
      if (price) {
        updateData.quoted_price = price;
      }
      
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await designStudioService.updateQuoteRequest(quoteId, updateData);
      
      if (error) throw new Error(error);

      toast({
        title: 'Quote Updated',
        description: 'Quote request has been updated successfully'
      });

      fetchQuotes();
      setShowQuoteDialog(false);
      setSelectedQuote(null);
      setQuotePrice('');
      setAdminNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update quote request',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      reviewing: { color: 'bg-blue-100 text-blue-800', label: 'Reviewing' },
      quoted: { color: 'bg-purple-100 text-purple-800', label: 'Quoted' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Management</h1>
          <p className="text-gray-600">Manage design printing quote requests</p>
        </div>
        <Button onClick={fetchQuotes} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quoted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'quoted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSH {quotes.reduce((sum, q) => sum + (q.quoted_price || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quote requests</h3>
              <p className="text-gray-600">Quote requests will appear here when customers submit them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {quote.design_projects?.project_name || 'Untitled Design'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {quote.product_type} • Quantity: {quote.quantity}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      {quote.profiles?.full_name || 'Unknown Customer'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(quote.created_at)}
                    </div>
                    {quote.quoted_price && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        KSH {quote.quoted_price.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {quote.additional_requirements && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Requirements:</strong> {quote.additional_requirements}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Quote Request Details</DialogTitle>
                        </DialogHeader>
                        {selectedQuote && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Customer</Label>
                                <p className="text-sm">{selectedQuote.profiles?.full_name}</p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p className="text-sm">{selectedQuote.profiles?.email}</p>
                              </div>
                              <div>
                                <Label>Product Type</Label>
                                <p className="text-sm capitalize">{selectedQuote.product_type}</p>
                              </div>
                              <div>
                                <Label>Quantity</Label>
                                <p className="text-sm">{selectedQuote.quantity}</p>
                              </div>
                            </div>
                            
                            {selectedQuote.design_projects?.preview_image_url && (
                              <div>
                                <Label>Design Preview</Label>
                                <img 
                                  src={selectedQuote.design_projects.preview_image_url} 
                                  alt="Design preview"
                                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                                />
                              </div>
                            )}

                            {selectedQuote.additional_requirements && (
                              <div>
                                <Label>Additional Requirements</Label>
                                <p className="text-sm bg-gray-50 p-3 rounded">
                                  {selectedQuote.additional_requirements}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {quote.status === 'pending' && (
                      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowQuoteDialog(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Provide Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Provide Quote</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="quote-price">Quote Price (KSH)</Label>
                              <Input
                                id="quote-price"
                                type="number"
                                placeholder="Enter price..."
                                value={quotePrice}
                                onChange={(e) => setQuotePrice(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="admin-notes">Notes (Optional)</Label>
                              <Textarea
                                id="admin-notes"
                                placeholder="Add any notes for the customer..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleUpdateQuote(
                                  selectedQuote?.id, 
                                  'quoted', 
                                  parseFloat(quotePrice), 
                                  adminNotes
                                )}
                                disabled={!quotePrice}
                                className="flex-1"
                              >
                                Send Quote
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleUpdateQuote(selectedQuote?.id, 'rejected', undefined, adminNotes)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {quote.status === 'quoted' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateQuote(quote.id, 'accepted')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Accepted
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateQuote(quote.id, 'completed')}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteManagement;
