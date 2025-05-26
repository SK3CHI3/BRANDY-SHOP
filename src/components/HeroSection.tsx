
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Palette, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm">
                <Sparkles className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Where Creativity Meets Commerce</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Wear Your
                <span className="block bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  Story
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Connect with Kenya's most talented artists to create custom apparel that speaks your language. 
                From unique designs to personalized masterpieces, we bring your vision to life.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Explore Designs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-orange-300 text-orange-700 hover:bg-orange-50">
                Start Creating
                <Palette className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600 font-medium">Active Artists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">2,000+</div>
                <div className="text-sm text-gray-600 font-medium">Designs Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">5,000+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Palette className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Maasai Heritage Tee</h3>
                    <p className="text-sm text-gray-600">by @KenyanArtist</p>
                    <p className="text-xl font-bold text-orange-600 mt-2">KSh 1,800</p>
                  </div>
                  
                  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Safari Sunset Cap</h3>
                    <p className="text-sm text-gray-600">by @WildlifeDesigner</p>
                    <p className="text-xl font-bold text-orange-600 mt-2">KSh 1,200</p>
                  </div>
                </div>
                
                <div className="space-y-6 pt-12">
                  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Nairobi Skyline Hoodie</h3>
                    <p className="text-sm text-gray-600">by @UrbanCreative</p>
                    <p className="text-xl font-bold text-orange-600 mt-2">KSh 2,500</p>
                  </div>
                  
                  <div className="group bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-orange-200">
                    <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                        <Palette className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Custom Design</h3>
                    <p className="text-sm text-gray-600">Work with an artist</p>
                    <p className="text-xl font-bold text-orange-600 mt-2">From KSh 2,000</p>
                  </div>
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
