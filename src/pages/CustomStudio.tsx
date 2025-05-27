
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Upload, Save, ShoppingCart, Sparkles, Calculator,
  Layers, Settings, Plus, Minus, Grid3X3, Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AIPromptBuilder from '@/components/AIPromptBuilder';
import { deepAIService, AIGenerationRequest } from '@/services/deepai';
import { pricingCalculatorService, PricingFactors } from '@/services/pricingCalculator';

const CustomStudio = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [baseProduct, setBaseProduct] = useState<any>(null);

  // AI-related state
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [useAIDesign, setUseAIDesign] = useState(false);

  // Product configuration state
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedProductColor, setSelectedProductColor] = useState('White');
  const [brandingMethod] = useState('digital_printing');
  const [quantity, setQuantity] = useState(1);

  // Custom request modal state
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState({
    productType: '',
    description: '',
    quantity: 1,
    budget: '',
    deadline: '',
    contactInfo: ''
  });

  // Product category state
  const [selectedCategory, setSelectedCategory] = useState<'apparel' | 'promotional' | 'corporate'>('apparel');

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      // Fetch the base product details
      fetchProductDetails(productId);
    }
  }, [searchParams]);

  const fetchProductDetails = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setBaseProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  // Comprehensive product catalog with correct Kenyan market pricing
  const productCategories = {
    apparel: [
      { id: 'tshirt', name: '👕 T-Shirt', basePrice: 1200, image: '/placeholder.svg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Black', 'Navy', 'Red', 'Green'] },
      { id: 'polo', name: '👔 Polo Shirt', basePrice: 1500, image: '/placeholder.svg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Black', 'Navy', 'Red'] },
      { id: 'hoodie', name: '🧥 Hoodie', basePrice: 2600, image: '/placeholder.svg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Navy', 'Grey', 'Maroon'] },
      { id: 'cap', name: '🧢 Baseball Cap', basePrice: 900, image: '/placeholder.svg', sizes: ['One Size'], colors: ['Black', 'Navy', 'White', 'Red', 'Khaki'] },
      { id: 'jacket', name: '🧥 Jacket', basePrice: 3750, image: '/placeholder.svg', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Navy', 'Grey'] },
    ],
    promotional: [
      { id: 'mug', name: '☕ Ceramic Mug', basePrice: 600, image: '/placeholder.svg', sizes: ['11oz', '15oz'], colors: ['White', 'Black', 'Blue', 'Red'] },
      { id: 'bottle', name: '💧 Water Bottle', basePrice: 900, image: '/placeholder.svg', sizes: ['500ml', '750ml', '1L'], colors: ['White', 'Black', 'Blue', 'Steel'] },
      { id: 'umbrella', name: '☂️ Umbrella', basePrice: 1125, image: '/placeholder.svg', sizes: ['Standard'], colors: ['Black', 'Navy', 'Red', 'Green'] },
      { id: 'bag', name: '👜 Canvas Bag', basePrice: 1075, image: '/placeholder.svg', sizes: ['Small', 'Medium', 'Large'], colors: ['Natural', 'Black', 'Navy', 'Red'] },
      { id: 'notebook', name: '📓 Notebook', basePrice: 550, image: '/placeholder.svg', sizes: ['A5', 'A4'], colors: ['Black', 'Blue', 'Red', 'Green'] },
    ],
    corporate: [
      { id: 'powerbank', name: '🔋 Power Bank', basePrice: 2500, image: '/placeholder.svg', sizes: ['5000mAh', '10000mAh'], colors: ['Black', 'White', 'Silver'] },
      { id: 'flashdrive', name: '💾 Flash Drive', basePrice: 1400, image: '/placeholder.svg', sizes: ['8GB', '16GB', '32GB'], colors: ['Black', 'Silver', 'Blue'] },
      { id: 'keychain', name: '🔑 Keychain', basePrice: 400, image: '/placeholder.svg', sizes: ['Standard'], colors: ['Silver', 'Gold', 'Black'] },
      { id: 'pen', name: '🖊️ Executive Pen', basePrice: 325, image: '/placeholder.svg', sizes: ['Standard'], colors: ['Black', 'Blue', 'Silver'] },
    ]
  };

  const allProducts = [...productCategories.apparel, ...productCategories.promotional, ...productCategories.corporate];

  // Helper functions
  const getCurrentProduct = () => {
    return allProducts.find(p => p.id === selectedProduct) || allProducts[0];
  };

  const getProductsByCategory = (category: 'apparel' | 'promotional' | 'corporate') => {
    return productCategories[category] || [];
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'apparel': return '👕 Apparel';
      case 'promotional': return '🎁 Promotional Items';
      case 'corporate': return '💼 Corporate Gifts';
      default: return category;
    }
  };

  const handleAIGeneration = async (request: AIGenerationRequest) => {
    setIsGeneratingAI(true);
    try {
      const result = await deepAIService.generateImage(request);
      if (result.success && result.imageUrl) {
        setAiGeneratedImage(result.imageUrl);
        setAiPrompt(result.prompt || '');
        setUseAIDesign(true);
        toast({
          title: 'AI Design Generated!',
          description: 'Your custom design has been created successfully.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: result.error || 'Failed to generate AI design',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong during AI generation',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const calculateCurrentPrice = () => {
    const product = getCurrentProduct();
    if (!product) {
      return {
        total: 0,
        pricePerUnit: 0,
        baseProductCost: 0,
        brandingCost: 0,
        aiGenerationCost: 0,
        sizePremium: 0,
        complexityMultiplier: 1,
        quantityDiscount: 0,
        rushOrderFee: 0,
        packagingFee: 0,
        subtotal: 0,
        platformFee: 0,
        savings: 0
      };
    }

    // Determine if any customization is applied
    const hasCustomization = useAIDesign || customText.trim().length > 0;

    const factors: PricingFactors = {
      product,
      selectedSize,
      selectedColor: selectedProductColor,
      brandingMethod: hasCustomization ? (useAIDesign ? 'ai_generated' : 'heat_transfer') : 'none',
      designComplexity: 'simple', // Default to simple for better pricing
      quantity,
      isAIGenerated: useAIDesign,
      aiComplexity: 'simple' // Default to simple AI complexity
    };

    return pricingCalculatorService.calculatePrice(factors);
  };

  // Handle custom design request submission
  const handleCustomRequest = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send custom design requests',
        variant: 'destructive',
      });
      return;
    }

    if (!customRequest.productType || !customRequest.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in product type and description',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabase
        .from('custom_design_requests')
        .insert({
          user_id: user.id,
          product_type: customRequest.productType,
          description: customRequest.description,
          quantity: customRequest.quantity,
          budget: customRequest.budget,
          deadline: customRequest.deadline,
          contact_info: customRequest.contactInfo,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      toast({
        title: 'Request sent successfully!',
        description: 'Our team will review your custom design request and get back to you soon.',
      });

      setIsCustomRequestOpen(false);
      setCustomRequest({
        productType: '',
        description: '',
        quantity: 1,
        budget: '',
        deadline: '',
        contactInfo: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send custom design request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Simple Header */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold">AI Design Studio</h1>
            </div>
            <div className="text-sm opacity-90">Create • Design • Order</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* Progressive Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                ✓
              </div>
              <span className="ml-3 text-sm font-semibold text-purple-700">Choose Product</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                2
              </div>
              <span className="ml-3 text-sm font-semibold text-orange-700">Design</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-green-500 rounded-full opacity-50"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-3 text-sm font-medium text-gray-500">Order</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Step 1: Product Selection */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Grid3X3 className="h-5 w-5 mr-2 text-purple-600" />
                  Select Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                  <Select value={selectedCategory} onValueChange={(value: 'apparel' | 'promotional' | 'corporate') => {
                    setSelectedCategory(value);
                    // Auto-select first product from new category
                    const categoryProducts = getProductsByCategory(value);
                    if (categoryProducts.length > 0) {
                      setSelectedProduct(categoryProducts[0].id);
                    }
                  }}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apparel">👕 Apparel</SelectItem>
                      <SelectItem value="promotional">🎁 Promotional Items</SelectItem>
                      <SelectItem value="corporate">💼 Corporate Gifts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getCategoryDisplayName(selectedCategory)} Products
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {getProductsByCategory(selectedCategory).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          selectedProduct === product.id
                            ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg flex items-center justify-center text-2xl">
                            {product.name.split(' ')[0]}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-sm text-gray-900">{product.name}</div>
                            <div className="text-xs text-purple-600 font-bold">
                              KSh {product.basePrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {product.sizes.length} sizes • {product.colors.length} colors
                            </div>
                          </div>
                          {selectedProduct === product.id && (
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Search All Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔍 Quick Search All Products
                  </label>
                  <Select value={selectedProduct} onValueChange={(value) => {
                    setSelectedProduct(value);
                    // Update category based on selected product
                    const product = allProducts.find(p => p.id === value);
                    if (product) {
                      for (const [category, products] of Object.entries(productCategories)) {
                        if (products.some(p => p.id === value)) {
                          setSelectedCategory(category as 'apparel' | 'promotional' | 'corporate');
                          break;
                        }
                      }
                    }
                  }}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Search all products..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {Object.entries(productCategories).map(([category, products]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                            {getCategoryDisplayName(category)}
                          </div>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id} className="pl-4">
                              <div className="flex items-center justify-between w-full">
                                <span>{product.name}</span>
                                <span className="text-purple-600 font-semibold ml-2">
                                  KSh {product.basePrice.toLocaleString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Custom Design Request - Prominent Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-xl shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-all duration-300">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        Need Something Custom?
                      </h4>
                    </div>

                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      Can't find what you're looking for? Send us your custom design requirements and our team will bring your vision to life!
                    </p>

                    <div className="flex items-center text-white/80 text-xs mb-4">
                      <div className="flex items-center mr-4">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Free Consultation
                      </div>
                      <div className="flex items-center mr-4">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        Quick Response
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        Expert Design
                      </div>
                    </div>

                    <Dialog open={isCustomRequestOpen} onOpenChange={setIsCustomRequestOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="lg"
                          className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Send className="h-5 w-5 mr-2" />
                          Send Custom Request
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Custom Design Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                          <Input
                            placeholder="e.g., Custom T-shirt, Branded Mug, etc."
                            value={customRequest.productType}
                            onChange={(e) => setCustomRequest({...customRequest, productType: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                          <Textarea
                            placeholder="Describe your custom design requirements, colors, text, logos, etc."
                            rows={3}
                            value={customRequest.description}
                            onChange={(e) => setCustomRequest({...customRequest, description: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              value={customRequest.quantity}
                              onChange={(e) => setCustomRequest({...customRequest, quantity: parseInt(e.target.value) || 1})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (KSh)</label>
                            <Input
                              placeholder="Optional"
                              value={customRequest.budget}
                              onChange={(e) => setCustomRequest({...customRequest, budget: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                          <Input
                            type="date"
                            value={customRequest.deadline}
                            onChange={(e) => setCustomRequest({...customRequest, deadline: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                          <Input
                            placeholder="Phone number or email (optional)"
                            value={customRequest.contactInfo}
                            onChange={(e) => setCustomRequest({...customRequest, contactInfo: e.target.value})}
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsCustomRequestOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={handleCustomRequest}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Request
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Configuration */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Configure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentProduct()?.sizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <Select value={selectedProductColor} onValueChange={setSelectedProductColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentProduct()?.colors.map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center font-semibold w-20"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Design Canvas */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-orange-600" />
                    Design Canvas
                  </div>
                  <div className="text-sm text-gray-500 font-normal">
                    {getCurrentProduct()?.name}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Canvas */}
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group hover:border-orange-400 transition-colors">
                    {/* Product Base */}
                    <img
                      src={getCurrentProduct()?.image}
                      alt="Product"
                      className="max-w-[80%] max-h-[80%] object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                    />

                    {/* AI Generated Design Overlay */}
                    {useAIDesign && aiGeneratedImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <img
                            src={aiGeneratedImage}
                            alt="AI Generated Design"
                            className="max-w-[60%] max-h-[60%] object-contain rounded-lg shadow-lg"
                          />
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                            ✨ AI
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Text Overlay */}
                    {customText && !useAIDesign && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          fontSize: `${Math.min(fontSize, 32)}px`,
                          color: selectedColor === '#ffffff' ? '#000000' : selectedColor,
                          fontWeight: 'bold',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {customText}
                      </div>
                    )}

                    {/* Canvas Info Overlay */}
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {selectedSize} • {selectedProductColor}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{getCurrentProduct()?.name}</div>
                        <div className="text-sm text-gray-600">
                          {selectedSize} • {selectedProductColor} • Qty: {quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          KSh {calculateCurrentPrice().total.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quantity > 1 && `KSh ${calculateCurrentPrice().pricePerUnit.toLocaleString()} each`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Design Tools & Actions */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                  Design Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ai" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai">AI</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="mt-4">
                    <AIPromptBuilder
                      productType={selectedProduct}
                      onPromptGenerated={(request) => setAiPrompt(request.prompt)}
                      onGenerateImage={handleAIGeneration}
                      isGenerating={isGeneratingAI}
                    />
                  </TabsContent>

                  <TabsContent value="text" className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                      <Textarea
                        placeholder="Enter your text..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        max={48}
                        min={12}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {colors.slice(0, 10).map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded border-2 transition-all ${
                              selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <Input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-3">Drag & drop your design</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Pricing & Actions */}
            <Card className="mt-4 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Display */}
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Price:</span>
                    <span className="text-xl font-bold text-orange-600">
                      KSh {calculateCurrentPrice().total.toLocaleString()}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <div className="text-sm text-gray-600 mb-2">
                      KSh {calculateCurrentPrice().pricePerUnit.toLocaleString()} per item
                    </div>
                  )}
                  {useAIDesign && (
                    <div className="flex items-center text-sm text-purple-600">
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI design included
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Design
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
                    onClick={async () => {
                      if (!user) {
                        toast({
                          title: 'Sign in required',
                          description: 'Please sign in to add custom designs to cart',
                          variant: 'destructive',
                        });
                        return;
                      }

                      try {
                        const pricing = calculateCurrentPrice();
                        const customizationData = {
                          text: customText,
                          color: selectedColor,
                          fontSize: fontSize,
                          productType: selectedProduct,
                          aiGenerated: useAIDesign,
                          aiImage: aiGeneratedImage,
                          aiPrompt: aiPrompt,
                          size: selectedSize,
                          productColor: selectedProductColor,
                          brandingMethod: useAIDesign ? 'ai_generated' : brandingMethod,
                          quantity: quantity,
                          pricing: pricing
                        };

                        await supabase
                          .from('cart_items')
                          .insert({
                            user_id: user.id,
                            product_id: baseProduct?.id || 'custom-' + selectedProduct,
                            quantity: quantity,
                            customization_data: customizationData
                          });

                        toast({
                          title: 'Custom design added to cart',
                          description: `${quantity} item(s) added for KSh ${pricing.total.toLocaleString()}`,
                        });
                      } catch (error) {
                        toast({
                          title: 'Error',
                          description: 'Failed to add custom design to cart',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomStudio;
