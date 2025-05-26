
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Image } from 'lucide-react';

const FeaturedDesigns = () => {
  const designs = [
    {
      id: 1,
      title: "Swahili Proverbs Collection",
      artist: "Amina Wanjiku",
      price: "KSh 1,500",
      category: "T-Shirts",
      gradient: "from-orange-400 to-red-500",
      popular: true
    },
    {
      id: 2,
      title: "Mount Kenya Landscape",
      artist: "David Kiplagat",
      price: "KSh 2,200",
      category: "Hoodies",
      gradient: "from-green-400 to-blue-500",
      popular: false
    },
    {
      id: 3,
      title: "Kenyan Coffee Art",
      artist: "Grace Nyong'o",
      price: "KSh 1,300",
      category: "Mugs",
      gradient: "from-amber-400 to-orange-600",
      popular: true
    },
    {
      id: 4,
      title: "Ankara Fusion Design",
      artist: "James Mwangi",
      price: "KSh 1,800",
      category: "Caps",
      gradient: "from-purple-400 to-pink-500",
      popular: false
    },
    {
      id: 5,
      title: "Wildlife Conservation",
      artist: "Sarah Adhiambo",
      price: "KSh 2,000",
      category: "T-Shirts",
      gradient: "from-emerald-400 to-teal-500",
      popular: true
    },
    {
      id: 6,
      title: "Nairobi Street Art",
      artist: "Michael Ochieng",
      price: "KSh 1,700",
      category: "Tank Tops",
      gradient: "from-indigo-400 to-purple-500",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Designs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover unique creations from our talented community of Kenyan artists
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs.map((design) => (
            <div key={design.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              {design.popular && (
                <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Popular
                </Badge>
              )}
              
              <div className={`aspect-square bg-gradient-to-br ${design.gradient} flex items-center justify-center relative overflow-hidden`}>
                <Image className="h-20 w-20 text-white/70" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {design.category}
                  </Badge>
                  <span className="text-lg font-bold text-purple-600">
                    {design.price}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {design.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  <span>by {design.artist}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Buy Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
            View All Designs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDesigns;
