import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { designStudioService } from '@/services/designStudio';
import { downloadPaymentService } from '@/services/downloadPayments';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomRequestForm from '@/components/CustomRequestForm';
import DesignCanvas from '@/components/design/DesignCanvas';
import EnhancedQuoteForm from '@/components/EnhancedQuoteForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Users,
  MessageSquare,
  Zap,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Download,
  FileText,
  Layers,
  Type,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  CreditCard
} from 'lucide-react';

const CustomStudio = () => {
  const [searchParams] = useSearchParams();
  const { productType } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Get product from URL params or search params
  const selectedProductFromUrl = productType || searchParams.get('product') || 'tshirt';

  const [selectedProduct, setSelectedProduct] = useState(selectedProductFromUrl);
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    quantity: 1,
    message: '',
    deadline: ''
  });

  const products = [
    { id: 'tshirt', name: 'T-Shirt', price: 'From KSH 800', emoji: '👕' },
    { id: 'hoodie', name: 'Hoodie', price: 'From KSH 1,500', emoji: '🧥' },
    { id: 'cap', name: 'Cap', price: 'From KSH 600', emoji: '🧢' },
    { id: 'mug', name: 'Mug', price: 'From KSH 400', emoji: '☕' },
    { id: 'bag', name: 'Tote Bag', price: 'From KSH 700', emoji: '👜' },
    { id: 'phone-case', name: 'Phone Case', price: 'From KSH 500', emoji: '📱' },
    { id: 'notebook', name: 'Notebook', price: 'From KSH 300', emoji: '📓' },
    { id: 'sticker', name: 'Stickers', price: 'From KSH 100', emoji: '🏷️' }
  ];

  // Generate unique ID for new elements
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const selectedElement = designElements.find(el => el.id === selectedElementId) || null;

  const customOptions = [
    {
      title: "Platform Custom Design",
      description: "Get a custom design created by our expert team",
      icon: <Zap className="h-6 w-6" />,
      badge: "Admin Managed",
      badgeColor: "bg-blue-100 text-blue-800",
      features: [
        "Professional design team",
        "Fixed pricing quote",
        "Quality guarantee",
        "Fast turnaround"
      ],
      action: "Request Quote",
      requestType: "platform_managed"
    },
    {
      title: "Work with Artist",
      description: "Connect directly with talented artists for custom work",
      icon: <Users className="h-6 w-6" />,
      badge: "Artist Direct",
      badgeColor: "bg-purple-100 text-purple-800",
      features: [
        "Choose your artist",
        "Direct communication",
        "Negotiate pricing",
        "Unique artistic styles"
      ],
      action: "Find Artists",
      requestType: "artist_direct"
    }
  ];

  // Auto-save design changes
  useEffect(() => {
    const saveDesign = async () => {
      if (user && currentProject) {
        await designStudioService.updateProject(currentProject.id, {
          design_data: { elements: designElements, viewMode },
          updated_at: new Date().toISOString()
        });
      }
    };

    const timeoutId = setTimeout(saveDesign, 1000);
    return () => clearTimeout(timeoutId);
  }, [designElements, viewMode, user, currentProject]);

  // Create or load project on mount
  useEffect(() => {
    const initializeProject = async () => {
      if (user) {
        const projectName = `${selectedProduct} Design - ${new Date().toLocaleDateString()}`;
        const { data, error } = await designStudioService.createProject({
          user_id: user.id,
          project_name: projectName,
          product_type: selectedProduct as any,
          design_data: { elements: designElements, viewMode },
          status: 'draft'
        });

        if (data && !error) {
          setCurrentProject(data);
        }
      }
    };

    initializeProject();
  }, [user, selectedProduct]);

  const handleRequestQuote = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to request a quote',
        variant: 'destructive'
      });
      return;
    }

    if (!currentProject) {
      toast({
        title: 'Save Design First',
        description: 'Please save your design before requesting a quote',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await designStudioService.createQuoteRequest({
        user_id: user.id,
        design_project_id: currentProject.id,
        product_type: selectedProduct,
        quantity: quoteForm.quantity,
        additional_requirements: quoteForm.message,
        deadline: quoteForm.deadline || undefined
      });

      if (error) throw new Error(error);

      toast({
        title: 'Quote Requested',
        description: 'We\'ll get back to you within 24 hours with pricing details'
      });
      setShowQuoteDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quote request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadType: 'png' | 'svg' | 'pdf' | 'bundle' = 'png') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to download your design',
        variant: 'destructive'
      });
      return;
    }

    if (!currentProject) {
      toast({
        title: 'Save Design First',
        description: 'Please save your design before downloading',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await downloadPaymentService.initiateDownloadPayment(
        user.id,
        currentProject.id,
        downloadType,
        user.email || '',
        user.phone
      );

      if (error) throw new Error(error);

      if (data?.download_url) {
        window.open(data.download_url, '_blank');

        toast({
          title: 'Download Ready',
          description: 'Your design has been downloaded successfully!'
        });
      }

      setShowDownloadDialog(false);
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to process download payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
  };

  // Handle element updates
  const handleElementUpdate = (elementId: string, updates: Partial<DesignElement>) => {
    setDesignElements(prev =>
      prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
    );
  };

  // Add new text element
  const handleAddTextElement = () => {
    const newElement: DesignElement = {
      id: generateId(),
      type: 'text',
      content: 'Your Text Here',
      position: { x: 50, y: 50 },
      style: {
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'center',
        rotation: 0,
        textDecoration: 'none'
      },
      layer: designElements.length,
      visible: true
    };

    setDesignElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Delete element
  const handleDeleteElement = (elementId: string) => {
    setDesignElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Reorder layers
  const handleReorderLayers = (elementId: string, direction: 'up' | 'down') => {
    const element = designElements.find(el => el.id === elementId);
    if (!element) return;

    const newLayer = direction === 'up' ? element.layer + 1 : element.layer - 1;
    const maxLayer = Math.max(...designElements.map(el => el.layer));

    if (newLayer < 0 || newLayer > maxLayer) return;

    // Swap layers with the element at the target layer
    const targetElement = designElements.find(el => el.layer === newLayer);
    if (targetElement) {
      handleElementUpdate(targetElement.id, { layer: element.layer });
    }
    handleElementUpdate(elementId, { layer: newLayer });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Palette className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Custom Design Studio</h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Create amazing designs with our advanced design tools
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* AI Design Studio */}
        <div className="mb-8">
          <DesignCanvas
            selectedProduct={selectedProduct}
            onDesignGenerated={(imageUrl) => {
              console.log('Design generated:', imageUrl);
              // You can handle the generated design here
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex-1">
                <FileText className="h-5 w-5 mr-2" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Professional Quote Request</DialogTitle>
              </DialogHeader>
              <EnhancedQuoteForm
                productType={selectedProduct}
                onClose={() => setShowQuoteDialog(false)}
                onSuccess={() => {
                  setShowQuoteDialog(false);
                  toast({
                    title: '🎉 Quote Request Submitted!',
                    description: 'We\'ll review your request and get back to you within 2-4 hours.',
                  });
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="flex-1">
                <Download className="h-5 w-5 mr-2" />
                Download (KSH 50)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Design</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">Premium Download</h3>
                  <p className="text-gray-600 mb-4">
                    Get your design in high-resolution formats (PNG, SVG, PDF)
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-4">KSH 50</div>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => handleDownload('png')} disabled={loading} className="w-full">
                    {loading ? 'Processing...' : 'Download PNG (KSH 50)'}
                  </Button>
                  <Button onClick={() => handleDownload('svg')} disabled={loading} variant="outline" className="w-full">
                    Download SVG (KSH 50)
                  </Button>
                  <Button onClick={() => handleDownload('pdf')} disabled={loading} variant="outline" className="w-full">
                    Download PDF (KSH 50)
                  </Button>
                  <Button onClick={() => handleDownload('bundle')} disabled={loading} variant="secondary" className="w-full">
                    Download All Formats (KSH 100)
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>



        {/* Custom Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {customOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    {option.icon}
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <Badge className={option.badgeColor}>
                    {option.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <p className="text-gray-600">{option.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {option.requestType === 'platform_managed' ? (
                  <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        {option.action}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Custom Design</DialogTitle>
                      </DialogHeader>
                      <CustomRequestForm 
                        onSuccess={handleRequestSuccess}
                        onCancel={() => setShowRequestForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Link to="/artists">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      {option.action}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">How Custom Design Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Submit Request",
                  description: "Tell us about your design needs and budget",
                  icon: <MessageSquare className="h-6 w-6" />
                },
                {
                  step: "2", 
                  title: "Get Quote",
                  description: "Receive pricing and timeline from our team or artist",
                  icon: <Clock className="h-6 w-6" />
                },
                {
                  step: "3",
                  title: "Design Creation",
                  description: "Work with designer to create your perfect design",
                  icon: <Palette className="h-6 w-6" />
                },
                {
                  step: "4",
                  title: "Production",
                  description: "Once approved, we print on your chosen products",
                  icon: <Star className="h-6 w-6" />
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing Design Customization */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">Or Customize Existing Designs</CardTitle>
            <p className="text-gray-600">
              Browse our marketplace and request modifications to existing artist designs
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                Browse Marketplace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CustomStudio;
