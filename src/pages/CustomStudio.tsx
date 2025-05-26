
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Type, Upload, Undo, Redo, Download, Save } from 'lucide-react';

const CustomStudio = () => {
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');
  const [fontSize, setFontSize] = useState(24);

  const products = [
    { id: 'tshirt', name: 'T-Shirt', price: 1500, image: '/placeholder.svg' },
    { id: 'hoodie', name: 'Hoodie', price: 2500, image: '/placeholder.svg' },
    { id: 'cap', name: 'Cap', price: 1200, image: '/placeholder.svg' },
    { id: 'mug', name: 'Mug', price: 800, image: '/placeholder.svg' },
  ];

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Design Studio</h1>
          <p className="text-gray-600">Create your unique design or customize existing ones</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Design Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Design Canvas</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Canvas Area */}
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <img 
                  src={products.find(p => p.id === selectedProduct)?.image} 
                  alt="Product"
                  className="max-w-full max-h-full object-contain"
                />
                {customText && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      color: selectedColor === '#ffffff' ? '#000000' : selectedColor 
                    }}
                  >
                    {customText}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button variant="outline" className="flex-1 mr-2">
                  <Save className="h-4 w-4 mr-2" />
                  Save Design
                </Button>
                <Button className="flex-1 ml-2 bg-gradient-to-r from-orange-600 to-red-600">
                  Add to Cart - KSh {products.find(p => p.id === selectedProduct)?.price.toLocaleString()}
                </Button>
              </div>
            </div>
          </div>

          {/* Design Tools */}
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Select Product</h3>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedProduct === product.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={product.image} alt={product.name} className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">KSh {product.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Tools */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Add Text
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text Content</label>
                  <Textarea
                    placeholder="Enter your text..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <Input
                    type="range"
                    min="12"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                  <div className="text-sm text-gray-500 mt-1">{fontSize}px</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select className="w-full p-2 border rounded-lg">
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Color Tools */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Colors
              </h3>
              
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Custom Color</label>
                <Input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full h-12"
                />
              </div>
            </div>

            {/* Upload Tools */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Design
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Drag & drop your design here</p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomStudio;
