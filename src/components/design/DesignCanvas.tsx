import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Sparkles,
  Wand2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Quote
} from 'lucide-react';
import { deepAIService, AIGenerationRequest, AIGenerationResponse } from '@/services/deepai';
import EnhancedQuoteForm from '@/components/EnhancedQuoteForm';

interface DesignCanvasProps {
  selectedProduct: string;
  onDesignGenerated?: (imageUrl: string) => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  selectedProduct,
  onDesignGenerated
}) => {
  const [designConfig, setDesignConfig] = useState({
    text: '',
    customPrompt: '',
    primaryColor: '',
    secondaryColor: '',
    backgroundColor: '',
    fontFamily: '',
    fontStyle: '',
    designStyle: '',
    theme: '',
    layout: '',
    quantity: 1,
    size: '',
    productColor: '',
    additionalNotes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  // Design configuration options
  const designOptions = {
    primaryColors: [
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'red', label: 'Red', color: '#EF4444' },
      { value: 'blue', label: 'Blue', color: '#3B82F6' },
      { value: 'green', label: 'Green', color: '#10B981' },
      { value: 'purple', label: 'Purple', color: '#8B5CF6' },
      { value: 'orange', label: 'Orange', color: '#F97316' },
      { value: 'pink', label: 'Pink', color: '#EC4899' },
      { value: 'yellow', label: 'Yellow', color: '#EAB308' },
      { value: 'gray', label: 'Gray', color: '#6B7280' }
    ],
    secondaryColors: [
      { value: 'none', label: 'None', color: 'transparent' },
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'red', label: 'Red', color: '#EF4444' },
      { value: 'blue', label: 'Blue', color: '#3B82F6' },
      { value: 'green', label: 'Green', color: '#10B981' },
      { value: 'purple', label: 'Purple', color: '#8B5CF6' },
      { value: 'orange', label: 'Orange', color: '#F97316' },
      { value: 'gold', label: 'Gold', color: '#F59E0B' }
    ],
    backgroundColors: [
      { value: 'transparent', label: 'Transparent', color: 'transparent' },
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'light-gray', label: 'Light Gray', color: '#F3F4F6' },
      { value: 'dark-gray', label: 'Dark Gray', color: '#374151' }
    ],
    fontFamilies: [
      { value: 'arial', label: 'Arial (Clean & Modern)' },
      { value: 'helvetica', label: 'Helvetica (Professional)' },
      { value: 'times', label: 'Times (Classic)' },
      { value: 'georgia', label: 'Georgia (Elegant)' },
      { value: 'impact', label: 'Impact (Bold)' },
      { value: 'comic-sans', label: 'Comic Sans (Playful)' },
      { value: 'courier', label: 'Courier (Typewriter)' },
      { value: 'brush-script', label: 'Brush Script (Handwritten)' }
    ],
    fontStyles: [
      { value: 'normal', label: 'Normal' },
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'bold-italic', label: 'Bold Italic' },
      { value: 'outline', label: 'Outline' },
      { value: 'shadow', label: 'Drop Shadow' },
      { value: 'gradient', label: 'Gradient Fill' }
    ],
    designStyles: [
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'modern', label: 'Modern' },
      { value: 'retro', label: 'Retro' },
      { value: 'grunge', label: 'Grunge' },
      { value: 'elegant', label: 'Elegant' },
      { value: 'playful', label: 'Playful' },
      { value: 'professional', label: 'Professional' }
    ],
    themes: [
      { value: 'motivational', label: 'Motivational' },
      { value: 'funny', label: 'Funny/Humorous' },
      { value: 'sports', label: 'Sports' },
      { value: 'music', label: 'Music' },
      { value: 'nature', label: 'Nature' },
      { value: 'tech', label: 'Technology' },
      { value: 'art', label: 'Artistic' },
      { value: 'business', label: 'Business' },
      { value: 'lifestyle', label: 'Lifestyle' },
      { value: 'custom', label: 'Custom' }
    ],
    layouts: [
      { value: 'center', label: 'Centered' },
      { value: 'top', label: 'Top Aligned' },
      { value: 'bottom', label: 'Bottom Aligned' },
      { value: 'left', label: 'Left Aligned' },
      { value: 'right', label: 'Right Aligned' },
      { value: 'full', label: 'Full Coverage' },
      { value: 'corner', label: 'Corner Placement' }
    ],
    sizes: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: '2XL', label: '2XL' },
      { value: '3XL', label: '3XL' }
    ],
    productColors: [
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'navy', label: 'Navy Blue', color: '#1E3A8A' },
      { value: 'gray', label: 'Gray', color: '#6B7280' },
      { value: 'red', label: 'Red', color: '#DC2626' },
      { value: 'green', label: 'Forest Green', color: '#059669' },
      { value: 'royal', label: 'Royal Blue', color: '#2563EB' },
      { value: 'maroon', label: 'Maroon', color: '#7C2D12' }
    ],
  };

  const updateConfig = (key: string, value: string) => {
    setDesignConfig(prev => ({ ...prev, [key]: value }));
  };

  const buildPromptFromConfig = () => {
    const { text, customPrompt, primaryColor, secondaryColor, backgroundColor, fontFamily, fontStyle, designStyle, theme, layout } = designConfig;

    // Start with custom prompt if provided, otherwise use text
    let prompt = '';
    if (customPrompt.trim()) {
      prompt = customPrompt.trim();
    } else if (text.trim()) {
      prompt = `"${text.trim()}"`;
    } else {
      return '';
    }

    // Add design specifications only if we have text (not custom prompt)
    if (!customPrompt.trim() && text.trim()) {
      const specs = [];

      if (primaryColor) specs.push(`${primaryColor} text`);
      if (secondaryColor && secondaryColor !== 'none') specs.push(`${secondaryColor} accents`);
      if (backgroundColor && backgroundColor !== 'transparent') specs.push(`${backgroundColor} background`);
      if (fontFamily) specs.push(`${fontFamily} font`);
      if (fontStyle && fontStyle !== 'normal') specs.push(`${fontStyle} style`);
      if (designStyle) specs.push(`${designStyle} design`);
      if (theme) specs.push(`${theme} theme`);
      if (layout) specs.push(`${layout} layout`);

      // Add product-specific optimization
      specs.push(`suitable for ${selectedProduct} printing`);
      specs.push('high quality');
      specs.push('professional design');

      if (specs.length > 0) {
        prompt += `, ${specs.join(', ')}`;
      }
    }

    return prompt;
  };

  const handleGenerateImage = async () => {
    const finalPrompt = buildPromptFromConfig();
    if (!finalPrompt) return;

    setIsGenerating(true);
    try {
      const request: AIGenerationRequest = {
        prompt: finalPrompt,
        productType: selectedProduct,
        complexity: 'medium',
        width: '512',
        height: '512',
        imageGeneratorVersion: 'standard',
        negativePrompt: 'blurry, low quality, distorted, watermark, text, signature, bad anatomy, deformed'
      };

      console.log('Generating image with request:', request);
      const result = await deepAIService.generateImage(request);

      if (result.success && result.imageUrl) {
        setGeneratedImages(prev => [result.imageUrl!, ...prev]);
        setSelectedImage(result.imageUrl!);
        onDesignGenerated?.(result.imageUrl!);
        console.log('Image generated successfully:', result.imageUrl);
      } else {
        console.error('AI generation failed:', result.error);
        alert(`Failed to generate image: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert(`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setDesignConfig({
      text: '',
      customPrompt: '',
      primaryColor: '',
      secondaryColor: '',
      backgroundColor: '',
      fontFamily: '',
      fontStyle: '',
      designStyle: '',
      theme: '',
      layout: '',
      quantity: 1,
      size: '',
      productColor: '',
      additionalNotes: ''
    });
    setGeneratedImages([]);
    setSelectedImage(null);
  };

  const getProductDisplayName = (product: string) => {
    const names: { [key: string]: string } = {
      tshirt: 'T-Shirt',
      hoodie: 'Hoodie',
      cap: 'Baseball Cap',
      mug: 'Ceramic Mug',
      totebag: 'Tote Bag'
    };
    return names[product] || product;
  };

  const testAPI = async () => {
    setIsGenerating(true);
    try {
      const result = await deepAIService.testConnection();
      if (result.success) {
        alert('✅ API Connection Successful! DeepAI is working properly.');
      } else {
        alert(`❌ API Connection Failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Design Studio - {getProductDisplayName(selectedProduct)}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column - Quick Config + Preview */}
          <div className="space-y-4">
            {/* Quick Configuration */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="h-4 w-4" />
                  Quick Design
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* Text Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Text/Message
                  </label>
                  <Input
                    placeholder="Enter your text here..."
                    value={designConfig.text}
                    onChange={(e) => updateConfig('text', e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Or Custom Prompt
                  </label>
                  <Textarea
                    placeholder="Describe your design in detail..."
                    value={designConfig.customPrompt}
                    onChange={(e) => updateConfig('customPrompt', e.target.value)}
                    className="w-full text-sm min-h-[60px]"
                  />
                </div>

                {/* Colors Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Design Color
                    </label>
                    <select
                      value={designConfig.primaryColor}
                      onChange={(e) => updateConfig('primaryColor', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.primaryColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Color
                    </label>
                    <select
                      value={designConfig.productColor}
                      onChange={(e) => updateConfig('productColor', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.productColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Font & Size Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font
                    </label>
                    <select
                      value={designConfig.fontFamily}
                      onChange={(e) => updateConfig('fontFamily', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      value={designConfig.size}
                      onChange={(e) => updateConfig('size', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.sizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={designConfig.quantity}
                    onChange={(e) => updateConfig('quantity', parseInt(e.target.value) || 1)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Style & Theme Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Style
                    </label>
                    <select
                      value={designConfig.designStyle}
                      onChange={(e) => updateConfig('designStyle', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.designStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    <select
                      value={designConfig.theme}
                      onChange={(e) => updateConfig('theme', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.themes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Any special requirements or instructions..."
                    value={designConfig.additionalNotes}
                    onChange={(e) => updateConfig('additionalNotes', e.target.value)}
                    className="w-full text-sm min-h-[50px]"
                  />
                </div>



                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || (!designConfig.text.trim() && !designConfig.customPrompt.trim())}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Design
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={testAPI}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full text-xs"
                    size="sm"
                  >
                    Test API Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Advanced Config + Gallery */}
          <div className="space-y-4">
            {/* Advanced Configuration */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* Advanced Options Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Style
                    </label>
                    <select
                      value={designConfig.fontStyle}
                      onChange={(e) => updateConfig('fontStyle', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.fontStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    <select
                      value={designConfig.theme}
                      onChange={(e) => updateConfig('theme', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.themes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Secondary Color
                    </label>
                    <select
                      value={designConfig.secondaryColor}
                      onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.secondaryColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Layout
                    </label>
                    <select
                      value={designConfig.layout}
                      onChange={(e) => updateConfig('layout', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {designOptions.layouts.map((layout) => (
                        <option key={layout.value} value={layout.value}>
                          {layout.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Button */}
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Clear All
                </Button>
              </CardContent>
            </Card>

            {/* Main Preview */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4" />
                  Design Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedImage ? (
                  <div className="space-y-4">
                    {/* Main preview */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 flex items-center justify-center min-h-[350px]">
                      <div className="relative max-w-sm w-full">
                        <img
                          src={selectedImage}
                          alt="Generated design"
                          className="w-full h-auto rounded-lg shadow-2xl"
                        />
                        <div className="absolute -top-2 -right-2 flex gap-2">
                          <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Generated images gallery - compact */}
                    {generatedImages.length > 1 && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-gray-800">All Designs</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {generatedImages.map((imageUrl, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(imageUrl)}
                              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                selectedImage === imageUrl
                                  ? 'border-purple-500 shadow-md'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <img
                                src={imageUrl}
                                alt={`Design ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {selectedImage === imageUrl && (
                                <div className="absolute inset-0 bg-purple-500 bg-opacity-30 flex items-center justify-center">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <Download className="h-4 w-4 mr-2" />
                          Download (KSH 50)
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleGenerateImage}>
                          Generate More
                        </Button>
                      </div>

                      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Quote className="h-4 w-4 mr-2" />
                            Request Professional Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Professional Quote Request</DialogTitle>
                          </DialogHeader>
                          <EnhancedQuoteForm
                            generatedImage={selectedImage || undefined}
                            productType={selectedProduct}
                            designConfig={designConfig}
                            onClose={() => setShowQuoteDialog(false)}
                            onSuccess={() => {
                              setShowQuoteDialog(false);
                              // Could add success callback here
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[350px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">🎨</div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">Ready to Create?</h3>
                      <p className="text-sm text-gray-500 max-w-sm mb-4">
                        Configure your design elements and click "Generate Design" to see your {getProductDisplayName(selectedProduct).toLowerCase()} come to life!
                      </p>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400">
                          Fixed Price: KSH 50 per download
                        </div>
                        <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="bg-white">
                              <FileText className="h-4 w-4 mr-2" />
                              Request Quote Without Design
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Professional Quote Request</DialogTitle>
                            </DialogHeader>
                            <EnhancedQuoteForm
                              productType={selectedProduct}
                              designConfig={designConfig}
                              onClose={() => setShowQuoteDialog(false)}
                              onSuccess={() => {
                                setShowQuoteDialog(false);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;
