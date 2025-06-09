import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnhancedQuoteForm from '@/components/EnhancedQuoteForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Palette,
  Package,
  Clock,
  CheckCircle,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';

const RequestQuote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get parameters from URL
  const productType = searchParams.get('product') || '';
  const generatedImage = searchParams.get('image');
  const designConfigParam = searchParams.get('config');
  
  let designConfig = null;
  if (designConfigParam) {
    try {
      designConfig = JSON.parse(decodeURIComponent(designConfigParam));
    } catch (error) {
      console.error('Error parsing design config:', error);
    }
  }

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

  const handleSuccess = () => {
    navigate('/order-tracking');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Request Professional Quote
            </h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-6">
              {productType
                ? `Get a detailed quote for your ${getProductDisplayName(productType)} project`
                : 'Get a detailed quote for your custom design project'
              }
            </p>

            {/* Product Badge - Only show if product is specified */}
            {productType && (
              <div className="flex justify-center">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                  <Palette className="h-4 w-4 mr-2" />
                  {getProductDisplayName(productType)} Design
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Brandy Shop?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're Kenya's leading custom design platform with a proven track record of delivering exceptional results
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Premium Quality</h3>
                <p className="text-sm text-gray-600">High-quality materials and professional printing</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Fast Turnaround</h3>
                <p className="text-sm text-gray-600">Quick delivery without compromising quality</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Team</h3>
                <p className="text-sm text-gray-600">Professional designers and customer support</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Satisfaction Guaranteed</h3>
                <p className="text-sm text-gray-600">100% satisfaction or money back guarantee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnhancedQuoteForm
            generatedImage={generatedImage || undefined}
            productType={productType}
            designConfig={designConfig}
            onSuccess={handleSuccess}
          />
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-gray-600">
              Here's what happens after you submit your quote request
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Quote Review</h3>
              <p className="text-sm text-gray-600">We review your requirements within 2-4 hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Contact & Quote</h3>
              <p className="text-sm text-gray-600">We contact you with detailed pricing and timeline</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Design & Production</h3>
              <p className="text-sm text-gray-600">Upon approval, we start designing and production</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Delivery</h3>
              <p className="text-sm text-gray-600">Fast delivery to your preferred location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions about your quote request
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => window.open('https://wa.me/254714525667?text=Hello! I need help with my quote request for a custom design project. Could you please assist me?', '_blank')}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp Support
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => window.location.href = 'tel:+254714525667'}
            >
              <Clock className="h-5 w-5 text-blue-600" />
              Call Support
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => window.location.href = 'mailto:vomollo101@gmail.com?subject=Quote Request Support&body=Hello, I need help with my quote request for a custom design project. Please assist me.'}
            >
              <MessageCircle className="h-5 w-5 text-red-600" />
              Email Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RequestQuote;
