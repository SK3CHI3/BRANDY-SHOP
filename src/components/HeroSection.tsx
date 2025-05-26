
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image, User } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Wear 
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}Creativity
                </span>
                <br />Delivered
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with talented Kenyan artists to create custom apparel that tells your story. 
                From unique designs to personalized products, we make creativity wearable.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                Browse Designs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                Create Custom
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600">Active Artists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">2,000+</div>
                <div className="text-sm text-gray-600">Designs Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">5,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mb-4 flex items-center justify-center">
                    <Image className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Maasai Heritage Tee</h3>
                  <p className="text-sm text-gray-600">by @KenyanArtist</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">KSh 1,800</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-4 flex items-center justify-center">
                    <Image className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Safari Sunset Cap</h3>
                  <p className="text-sm text-gray-600">by @WildlifeDesigner</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">KSh 1,200</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-4 flex items-center justify-center">
                    <Image className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Nairobi Skyline Hoodie</h3>
                  <p className="text-sm text-gray-600">by @UrbanCreative</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">KSh 2,500</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Custom Design</h3>
                  <p className="text-sm text-gray-600">Work with an artist</p>
                  <p className="text-lg font-bold text-purple-600 mt-2">From KSh 2,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
