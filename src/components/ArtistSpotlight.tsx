
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const ArtistSpotlight = () => {
  const artists = [
    {
      name: "Amina Wanjiku",
      specialty: "Traditional Patterns",
      designs: 47,
      rating: 4.9,
      gradient: "from-orange-400 to-red-500",
      description: "Specializing in authentic Kenyan cultural designs with modern twists"
    },
    {
      name: "David Kiplagat",
      specialty: "Nature & Wildlife",
      designs: 32,
      rating: 4.8,
      gradient: "from-green-400 to-blue-500",
      description: "Bringing Kenya's natural beauty to life through artistic expression"
    },
    {
      name: "Grace Nyong'o",
      specialty: "Typography & Quotes",
      designs: 58,
      rating: 5.0,
      gradient: "from-purple-400 to-pink-500",
      description: "Creating inspiring messages in beautiful, hand-crafted typography"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Artists
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Talented creatives from across Kenya bringing their unique perspectives to life
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {artists.map((artist, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className={`h-48 bg-gradient-to-br ${artist.gradient} flex items-center justify-center`}>
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    ⭐ {artist.rating}
                  </Badge>
                </div>
                
                <p className="text-purple-600 font-medium mb-2">{artist.specialty}</p>
                <p className="text-gray-600 text-sm mb-4">{artist.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{artist.designs} designs</span>
                  <span className="text-sm text-green-600 font-medium">Available now</span>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    View Profile
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Commission
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Join as an Artist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArtistSpotlight;
