import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { designStudioService } from '@/services/designStudio';
import { toast } from '@/hooks/use-toast';
import {
  Phone,
  Mail,
  MessageCircle,
  Upload,
  X,
  Clock,
  DollarSign,
  Package,
  Palette,
  FileText,
  Send,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

interface EnhancedQuoteFormProps {
  generatedImage?: string;
  productType?: string;
  designConfig?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const EnhancedQuoteForm: React.FC<EnhancedQuoteFormProps> = ({
  generatedImage,
  productType,
  designConfig,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    // Contact Information
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    location: '',

    // Project Details
    projectTitle: '',
    description: '',
    productType: productType || '',
    quantity: 1,
    size: '',
    colors: [] as string[],
    deadline: '',
    urgency: 'standard',

    // Budget & Preferences
    budgetRange: '',
    additionalServices: [] as string[],
    specialRequirements: '',

    // Communication Preferences
    preferredContact: 'email',
    bestTimeToCall: '',

    // Design Specifications
    designStyle: '',
    targetAudience: '',
    brandGuidelines: '',

    // Additional Notes
    inspirationNotes: '',
    revisionRounds: '2',
    fileFormat: 'png'
  });

  const productSizes = {
    // Apparel sizes
    tshirt: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    hoodie: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    polo: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    'tank-top': ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'long-sleeve': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    jacket: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    vest: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    uniform: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],

    // Headwear
    cap: ['One Size', 'Adjustable', 'Fitted'],
    beanie: ['One Size'],
    'bucket-hat': ['S/M', 'L/XL', 'One Size'],
    visor: ['One Size', 'Adjustable'],
    snapback: ['One Size', 'Adjustable'],

    // Bags
    totebag: ['Small', 'Medium', 'Large'],
    backpack: ['Small', 'Medium', 'Large'],
    'drawstring-bag': ['Standard'],
    'laptop-bag': ['13"', '15"', '17"'],
    'duffel-bag': ['Small', 'Medium', 'Large'],
    'fanny-pack': ['One Size'],

    // Drinkware
    mug: ['11oz', '15oz', '20oz'],
    'travel-mug': ['12oz', '16oz', '20oz'],
    'water-bottle': ['16oz', '20oz', '24oz', '32oz'],
    tumbler: ['12oz', '16oz', '20oz'],
    'wine-glass': ['Standard'],
    'beer-mug': ['16oz', '20oz'],

    // Stationery
    notebook: ['A4', 'A5', 'A6'],
    notepad: ['A4', 'A5', 'A6'],
    diary: ['A4', 'A5', 'Pocket'],
    calendar: ['A3', 'A4', 'Wall'],
    folder: ['A4', 'Legal'],
    'business-card': ['Standard (85x55mm)'],
    letterhead: ['A4'],
    envelope: ['DL', 'C5', 'A4'],

    // Tech
    'phone-case': ['iPhone', 'Samsung', 'Custom'],
    'laptop-sleeve': ['13"', '15"', '17"'],
    'mouse-pad': ['Standard', 'Large', 'XL'],
    'usb-drive': ['8GB', '16GB', '32GB', '64GB'],
    'power-bank': ['5000mAh', '10000mAh', '20000mAh'],
    'phone-stand': ['Universal'],

    // Home & Living
    pillow: ['40x40cm', '50x50cm', '60x60cm'],
    blanket: ['Small', 'Medium', 'Large'],
    coaster: ['Standard (10cm)'],
    'wall-art': ['A4', 'A3', 'A2', 'A1'],
    canvas: ['20x30cm', '30x40cm', '40x60cm', '60x80cm'],
    clock: ['25cm', '30cm', '35cm'],

    // Promotional
    keychain: ['Standard'],
    magnet: ['5cm', '7cm', '10cm'],
    badge: ['25mm', '32mm', '38mm', '58mm'],
    sticker: ['5cm', '7cm', '10cm', 'Custom'],
    lanyard: ['Standard (90cm)'],
    wristband: ['Adult', 'Youth'],

    // Signage
    banner: ['1x2m', '2x3m', '3x6m', 'Custom'],
    poster: ['A4', 'A3', 'A2', 'A1', 'A0'],
    flyer: ['A4', 'A5', 'A6'],
    brochure: ['A4', 'A5', 'Tri-fold'],
    sign: ['A4', 'A3', 'A2', 'Custom'],
    backdrop: ['2x3m', '3x4m', '4x6m', 'Custom'],

    // Default for others
    pen: ['Standard'],
    pencil: ['Standard'],
    custom: ['Custom Size'],
    multiple: ['Various']
  };

  const colorOptions = [
    'Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Purple', 'Orange', 'Pink', 'Yellow', 'Brown'
  ];

  const budgetRanges = [
    'Under KSH 5,000',
    'KSH 5,000 - 10,000',
    'KSH 10,000 - 25,000',
    'KSH 25,000 - 50,000',
    'KSH 50,000 - 100,000',
    'Over KSH 100,000',
    'Let\'s discuss'
  ];

  const additionalServiceOptions = [
    'Rush Delivery (24-48 hours)',
    'Multiple Design Concepts',
    'Brand Guidelines Creation',
    'Social Media Assets',
    'Print-Ready Files',
    'Vector Formats',
    'Packaging Design',
    'Marketing Materials'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateWhatsAppMessage = () => {
    const selectedProduct = formData.productType || productType;
    const product = selectedProduct ? getProductDisplayName(selectedProduct) : 'Custom product';
    const quantity = formData.quantity || 1;
    const budget = formData.budgetRange || 'Not specified';
    const deadline = formData.deadline || 'Flexible';
    const description = formData.description || 'Custom design project';

    let message = `Hello! I would like to request a quote for a custom design project.\n\n`;
    message += `📦 Product: ${product}\n`;
    message += `🔢 Quantity: ${quantity} pieces\n`;
    message += `💰 Budget: ${budget}\n`;
    message += `📅 Deadline: ${deadline}\n`;
    message += `📝 Description: ${description}\n\n`;

    if (generatedImage) {
      message += `🎨 I have an AI-generated design that I'd like to use as a starting point.\n\n`;
    }

    if (formData.colors.length > 0) {
      message += `🎨 Preferred Colors: ${formData.colors.join(', ')}\n`;
    }

    if (formData.additionalServices.length > 0) {
      message += `✨ Additional Services: ${formData.additionalServices.join(', ')}\n`;
    }

    message += `\nPlease provide me with a detailed quote and timeline. Thank you!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/254714525667?text=${message}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to submit a quote request',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Create the quote request with all the comprehensive data
      const selectedProductType = formData.productType || productType || 'custom';
      const quoteData = {
        user_id: user.id,
        product_type: selectedProductType,
        quantity: formData.quantity,
        
        // Combine all form data into additional_requirements
        additional_requirements: JSON.stringify({
          ...formData,
          generatedImage,
          designConfig,
          uploadedFiles: uploadedFiles.map(f => f.name),
          submittedAt: new Date().toISOString()
        }),
        
        deadline: formData.deadline || undefined,
        status: 'pending'
      };

      const { data, error } = await designStudioService.createQuoteRequest(quoteData);
      
      if (error) throw new Error(error);

      toast({
        title: '🎉 Quote Request Submitted!',
        description: 'We\'ll review your request and get back to you within 2-4 hours with a detailed quote.',
      });

      onSuccess?.();
      onClose?.();
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

  const getProductDisplayName = (product: string) => {
    const names: { [key: string]: string } = {
      // Apparel
      'tshirt': 'T-Shirt',
      'hoodie': 'Hoodie / Sweatshirt',
      'polo': 'Polo Shirt',
      'tank-top': 'Tank Top',
      'long-sleeve': 'Long Sleeve Shirt',
      'jacket': 'Jacket',
      'vest': 'Vest',
      'uniform': 'Uniform',

      // Headwear
      'cap': 'Baseball Cap',
      'beanie': 'Beanie',
      'bucket-hat': 'Bucket Hat',
      'visor': 'Visor',
      'snapback': 'Snapback',

      // Bags & Accessories
      'totebag': 'Tote Bag',
      'backpack': 'Backpack',
      'drawstring-bag': 'Drawstring Bag',
      'laptop-bag': 'Laptop Bag',
      'duffel-bag': 'Duffel Bag',
      'fanny-pack': 'Fanny Pack',

      // Drinkware
      'mug': 'Ceramic Mug',
      'travel-mug': 'Travel Mug',
      'water-bottle': 'Water Bottle',
      'tumbler': 'Tumbler',
      'wine-glass': 'Wine Glass',
      'beer-mug': 'Beer Mug',

      // Stationery
      'pen': 'Pens',
      'pencil': 'Pencils',
      'notebook': 'Notebooks',
      'notepad': 'Notepads',
      'diary': 'Diaries',
      'calendar': 'Calendars',
      'folder': 'Folders',
      'business-card': 'Business Cards',
      'letterhead': 'Letterhead',
      'envelope': 'Envelopes',

      // Tech Accessories
      'phone-case': 'Phone Cases',
      'laptop-sleeve': 'Laptop Sleeves',
      'mouse-pad': 'Mouse Pads',
      'usb-drive': 'USB Drives',
      'power-bank': 'Power Banks',
      'phone-stand': 'Phone Stands',

      // Home & Living
      'pillow': 'Pillows',
      'blanket': 'Blankets',
      'coaster': 'Coasters',
      'wall-art': 'Wall Art / Posters',
      'canvas': 'Canvas Prints',
      'clock': 'Wall Clocks',

      // Promotional Items
      'keychain': 'Keychains',
      'magnet': 'Magnets',
      'badge': 'Badges / Pins',
      'sticker': 'Stickers',
      'lanyard': 'Lanyards',
      'wristband': 'Wristbands',

      // Signage & Banners
      'banner': 'Banners',
      'poster': 'Posters',
      'flyer': 'Flyers',
      'brochure': 'Brochures',
      'sign': 'Signs',
      'backdrop': 'Backdrops',

      // Custom
      'custom': 'Custom Product',
      'multiple': 'Multiple Products'
    };
    return names[product] || product.charAt(0).toUpperCase() + product.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Request Professional Quote
        </h1>
        <p className="text-gray-600">
          Get a detailed quote for your {getProductDisplayName(productType)} design project
        </p>
      </div>

      {/* Quick Contact Options */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Need Help? Contact Us Directly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp Chat
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => window.location.href = 'tel:+254714525667'}
            >
              <Phone className="h-5 w-5 text-blue-600" />
              Call Now
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => window.location.href = 'mailto:vomollo101@gmail.com'}
            >
              <Mail className="h-5 w-5 text-red-600" />
              Email Us
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            💬 <strong>Response Time:</strong> WhatsApp & Phone (Instant) | Email (2-4 hours) | Quote Form (2-4 hours)
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generated Design Preview */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Your AI Generated Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img 
                  src={generatedImage} 
                  alt="Generated design" 
                  className="w-24 h-24 object-cover rounded-lg border-2 border-purple-200"
                />
                <div>
                  <p className="font-medium">Design included in quote request</p>
                  <p className="text-sm text-gray-600">This design will be used as the base for your {getProductDisplayName(productType)}</p>
                  <Badge variant="secondary" className="mt-1">AI Generated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Selection - Only show if no product specified */}
        {!productType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Select Product Type *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="productType">What would you like to customize?</Label>
                <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your product type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Apparel */}
                    <SelectItem value="apparel-header" disabled className="font-semibold text-purple-600">
                      👕 APPAREL
                    </SelectItem>
                    <SelectItem value="tshirt">T-Shirt</SelectItem>
                    <SelectItem value="hoodie">Hoodie / Sweatshirt</SelectItem>
                    <SelectItem value="polo">Polo Shirt</SelectItem>
                    <SelectItem value="tank-top">Tank Top</SelectItem>
                    <SelectItem value="long-sleeve">Long Sleeve Shirt</SelectItem>
                    <SelectItem value="jacket">Jacket</SelectItem>
                    <SelectItem value="vest">Vest</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>

                    {/* Headwear */}
                    <SelectItem value="headwear-header" disabled className="font-semibold text-purple-600">
                      🧢 HEADWEAR
                    </SelectItem>
                    <SelectItem value="cap">Baseball Cap</SelectItem>
                    <SelectItem value="beanie">Beanie</SelectItem>
                    <SelectItem value="bucket-hat">Bucket Hat</SelectItem>
                    <SelectItem value="visor">Visor</SelectItem>
                    <SelectItem value="snapback">Snapback</SelectItem>

                    {/* Bags & Accessories */}
                    <SelectItem value="bags-header" disabled className="font-semibold text-purple-600">
                      👜 BAGS & ACCESSORIES
                    </SelectItem>
                    <SelectItem value="totebag">Tote Bag</SelectItem>
                    <SelectItem value="backpack">Backpack</SelectItem>
                    <SelectItem value="drawstring-bag">Drawstring Bag</SelectItem>
                    <SelectItem value="laptop-bag">Laptop Bag</SelectItem>
                    <SelectItem value="duffel-bag">Duffel Bag</SelectItem>
                    <SelectItem value="fanny-pack">Fanny Pack</SelectItem>

                    {/* Drinkware */}
                    <SelectItem value="drinkware-header" disabled className="font-semibold text-purple-600">
                      ☕ DRINKWARE
                    </SelectItem>
                    <SelectItem value="mug">Ceramic Mug</SelectItem>
                    <SelectItem value="travel-mug">Travel Mug</SelectItem>
                    <SelectItem value="water-bottle">Water Bottle</SelectItem>
                    <SelectItem value="tumbler">Tumbler</SelectItem>
                    <SelectItem value="wine-glass">Wine Glass</SelectItem>
                    <SelectItem value="beer-mug">Beer Mug</SelectItem>

                    {/* Stationery */}
                    <SelectItem value="stationery-header" disabled className="font-semibold text-purple-600">
                      ✏️ STATIONERY & OFFICE
                    </SelectItem>
                    <SelectItem value="pen">Pens</SelectItem>
                    <SelectItem value="pencil">Pencils</SelectItem>
                    <SelectItem value="notebook">Notebooks</SelectItem>
                    <SelectItem value="notepad">Notepads</SelectItem>
                    <SelectItem value="diary">Diaries</SelectItem>
                    <SelectItem value="calendar">Calendars</SelectItem>
                    <SelectItem value="folder">Folders</SelectItem>
                    <SelectItem value="business-card">Business Cards</SelectItem>
                    <SelectItem value="letterhead">Letterhead</SelectItem>
                    <SelectItem value="envelope">Envelopes</SelectItem>

                    {/* Tech Accessories */}
                    <SelectItem value="tech-header" disabled className="font-semibold text-purple-600">
                      📱 TECH ACCESSORIES
                    </SelectItem>
                    <SelectItem value="phone-case">Phone Cases</SelectItem>
                    <SelectItem value="laptop-sleeve">Laptop Sleeves</SelectItem>
                    <SelectItem value="mouse-pad">Mouse Pads</SelectItem>
                    <SelectItem value="usb-drive">USB Drives</SelectItem>
                    <SelectItem value="power-bank">Power Banks</SelectItem>
                    <SelectItem value="phone-stand">Phone Stands</SelectItem>

                    {/* Home & Living */}
                    <SelectItem value="home-header" disabled className="font-semibold text-purple-600">
                      🏠 HOME & LIVING
                    </SelectItem>
                    <SelectItem value="pillow">Pillows</SelectItem>
                    <SelectItem value="blanket">Blankets</SelectItem>
                    <SelectItem value="coaster">Coasters</SelectItem>
                    <SelectItem value="wall-art">Wall Art / Posters</SelectItem>
                    <SelectItem value="canvas">Canvas Prints</SelectItem>
                    <SelectItem value="clock">Wall Clocks</SelectItem>

                    {/* Promotional Items */}
                    <SelectItem value="promo-header" disabled className="font-semibold text-purple-600">
                      🎁 PROMOTIONAL ITEMS
                    </SelectItem>
                    <SelectItem value="keychain">Keychains</SelectItem>
                    <SelectItem value="magnet">Magnets</SelectItem>
                    <SelectItem value="badge">Badges / Pins</SelectItem>
                    <SelectItem value="sticker">Stickers</SelectItem>
                    <SelectItem value="lanyard">Lanyards</SelectItem>
                    <SelectItem value="wristband">Wristbands</SelectItem>

                    {/* Signage & Banners */}
                    <SelectItem value="signage-header" disabled className="font-semibold text-purple-600">
                      🪧 SIGNAGE & BANNERS
                    </SelectItem>
                    <SelectItem value="banner">Banners</SelectItem>
                    <SelectItem value="poster">Posters</SelectItem>
                    <SelectItem value="flyer">Flyers</SelectItem>
                    <SelectItem value="brochure">Brochures</SelectItem>
                    <SelectItem value="sign">Signs</SelectItem>
                    <SelectItem value="backdrop">Backdrops</SelectItem>

                    {/* Custom */}
                    <SelectItem value="custom-header" disabled className="font-semibold text-purple-600">
                      ⭐ CUSTOM
                    </SelectItem>
                    <SelectItem value="custom">Custom Product (Describe in details)</SelectItem>
                    <SelectItem value="multiple">Multiple Products</SelectItem>
                  </SelectContent>
                </Select>
                {!formData.productType && (
                  <p className="text-sm text-red-600 mt-2">Please select a product type to continue</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254 700 000 000"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                placeholder="Optional"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location/City</Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Mombasa, Kisumu"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                placeholder="e.g., Company T-Shirts, Event Merchandise, Personal Design"
                value={formData.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project in detail. What's the purpose? Who's the target audience? Any specific requirements?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {(productSizes[productType as keyof typeof productSizes] || []).map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <Label>Preferred Colors</Label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`p-2 text-xs border rounded-md transition-all ${
                      formData.colors.includes(color)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              {formData.colors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {formData.colors.join(', ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Budget & Additional Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budgetRange">Budget Range</Label>
              <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Services (Optional)</Label>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {additionalServiceOptions.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServiceToggle(service)}
                    className={`p-3 text-sm text-left border rounded-md transition-all ${
                      formData.additionalServices.includes(service)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
              {formData.additionalServices.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Selected: {formData.additionalServices.length} service(s)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Design Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Design Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designStyle">Design Style</Label>
                <Select value={formData.designStyle} onValueChange={(value) => handleInputChange('designStyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="bold">Bold & Vibrant</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Young professionals, Students, Corporate"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="brandGuidelines">Brand Guidelines/Colors</Label>
              <Textarea
                id="brandGuidelines"
                placeholder="Do you have specific brand colors, fonts, or guidelines we should follow?"
                value={formData.brandGuidelines}
                onChange={(e) => handleInputChange('brandGuidelines', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload & Inspiration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Inspiration & Reference Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Upload Inspiration Images/Files</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload images, PDFs, or reference files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max 10MB per file. Supports: JPG, PNG, PDF, SVG
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div>
                <Label>Uploaded Files</Label>
                <div className="space-y-2 mt-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="inspirationNotes">Inspiration Notes</Label>
              <Textarea
                id="inspirationNotes"
                placeholder="Describe any specific inspiration, references, or examples you'd like us to consider..."
                value={formData.inspirationNotes}
                onChange={(e) => handleInputChange('inspirationNotes', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bestTimeToCall">Best Time to Call</Label>
                <Select value={formData.bestTimeToCall} onValueChange={(value) => handleInputChange('bestTimeToCall', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Project Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revisionRounds">Revision Rounds Included</Label>
                <Select value={formData.revisionRounds} onValueChange={(value) => handleInputChange('revisionRounds', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Revision</SelectItem>
                    <SelectItem value="2">2 Revisions</SelectItem>
                    <SelectItem value="3">3 Revisions</SelectItem>
                    <SelectItem value="unlimited">Unlimited (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fileFormat">Preferred File Format</Label>
                <Select value={formData.fileFormat} onValueChange={(value) => handleInputChange('fileFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Standard)</SelectItem>
                    <SelectItem value="svg">SVG (Vector)</SelectItem>
                    <SelectItem value="pdf">PDF (Print Ready)</SelectItem>
                    <SelectItem value="all">All Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                placeholder="Any special printing requirements, material preferences, or other specifications..."
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary & Submit */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-600" />
              Quote Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Product:</strong> {getProductDisplayName(productType)}</p>
                <p><strong>Quantity:</strong> {formData.quantity} pieces</p>
                <p><strong>Budget:</strong> {formData.budgetRange || 'Not specified'}</p>
              </div>
              <div>
                <p><strong>Deadline:</strong> {formData.deadline || 'Flexible'}</p>
                <p><strong>Contact:</strong> {formData.preferredContact}</p>
                <p><strong>Services:</strong> {formData.additionalServices.length} selected</p>
              </div>
            </div>

            {generatedImage && (
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm font-medium mb-2">✅ AI Generated Design Included</p>
                <p className="text-xs text-gray-600">Your AI-generated design will be used as the starting point for this project.</p>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>We'll review your request within 2-4 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Our team will contact you via your preferred method</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>You'll receive a detailed quote with timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span>Upon approval, we'll start your project immediately</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !formData.fullName || !formData.email || !formData.phone || !formData.projectTitle || (!productType && !formData.productType)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
              >
                {loading ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Submitting Quote Request...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Quote Request
                  </>
                )}
              </Button>

              {onClose && (
                <Button type="button" variant="outline" onClick={onClose} className="px-6">
                  Cancel
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our terms of service and privacy policy.
              We'll only use your information to process your quote request.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EnhancedQuoteForm;
