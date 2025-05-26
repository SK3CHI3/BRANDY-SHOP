
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, MapPin, Star, MessageCircle, Palette, Search } from 'lucide-react';

const Artists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    'all', 'Traditional Patterns', 'Nature & Wildlife', 'Typography', 
    'Abstract Art', 'Portraits', 'Logo Design'
  ];

  const artists = [
    {
      id: 1,
      name: "Amina Wanjiku",
      specialty: "Traditional Patterns",
      location: "Nairobi",
      designs: 47,
      rating: 4.9,
      reviews: 156,
      earnings: "50K+",
      avatar: "/placeholder.svg",
      coverImage: "/placeholder.svg",
      bio: "Specializing in authentic Kenyan cultural designs with modern twists. My work celebrates our rich heritage.",
      isVerified: true,
      responseTime: "2 hours",
      completedOrders: 234,
      languages: ["English", "Swahili"],
      priceRange: "KSh 1,500 - 5,000"
    },
    {
      id: 2,
      name: "David Kiplagat",
      specialty: "Nature & Wildlife",
      location: "Nakuru",
      designs: 32,
      rating: 4.8,
      reviews: 89,
      earnings: "30K+",
      avatar: "/placeholder.svg",
      coverImage: "/placeholder.svg",
      bio: "Bringing Kenya's natural beauty to life through artistic expression. Conservation through art.",
      isVerified: true,
      responseTime: "4 hours",
      completedOrders: 167,
      languages: ["English", "Swahili"],
      priceRange: "KSh 2,000 - 6,000"
    },
    {
      id: 3,
      name: "Grace Nyong'o",
      specialty: "Typography",
      location: "Kisumu",
      designs: 58,
      rating: 5.0,
      reviews: 203,
      earnings: "80K+",
      avatar: "/placeholder.svg",
      coverImage: "/placeholder.svg",
      bio: "Creating inspiring messages in beautiful, hand-crafted typography that speaks to the soul.",
      isVerified: true,
      responseTime: "1 hour",
      completedOrders: 445,
      languages: ["English", "Swahili", "Luo"],
      priceRange: "KSh 1,000 - 4,000"
    },
  ];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || artist.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Meet Our Talented Artists</h1>
          <p className="text-xl text-purple-100">Connect with creative professionals from across Kenya</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search artists by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty === 'all' ? 'All Specialties' : specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Artists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-500 relative">
                <img src={artist.coverImage} alt="Cover" className="w-full h-full object-cover" />
                {artist.isVerified && (
                  <Badge className="absolute top-3 right-3 bg-green-500">
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* Profile Section */}
              <div className="p-6 -mt-8 relative">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-full p-1 shadow-lg">
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {artist.location}
                    </div>
                  </div>
                </div>
                
                <p className="text-purple-600 font-medium mb-2">{artist.specialty}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">{artist.designs}</div>
                    <div className="text-xs text-gray-500">Designs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {artist.rating}
                    </div>
                    <div className="text-xs text-gray-500">{artist.reviews} reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">{artist.earnings}</div>
                    <div className="text-xs text-gray-500">Earned</div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Response Time:</span>
                    <span className="font-medium">{artist.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed Orders:</span>
                    <span className="font-medium">{artist.completedOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price Range:</span>
                    <span className="font-medium">{artist.priceRange}</span>
                  </div>
                </div>
                
                {/* Languages */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {artist.languages.map((language) => (
                    <Badge key={language} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Palette className="h-4 w-4 mr-2" />
                    View Portfolio
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No artists found matching your criteria.</p>
          </div>
        )}
        
        {/* Call to Action */}
        <div className="text-center mt-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Are You An Artist?</h2>
          <p className="text-gray-600 mb-6">Join our community and start earning from your creativity</p>
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Join as an Artist
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Artists;
