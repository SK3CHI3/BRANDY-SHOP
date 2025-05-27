
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArtists } from '@/hooks/useData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Star, MessageCircle, Palette, Search } from 'lucide-react';

const Artists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const { artists, loading } = useArtists();

  const specialties = [
    'all', 'Traditional Patterns', 'Nature & Wildlife', 'Typography',
    'Abstract Art', 'Portraits', 'Logo Design'
  ];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = (artist.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (artist.artist_profile?.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (artist.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || artist.artist_profile?.specialty === selectedSpecialty;
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading artists...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtists.map((artist) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Cover Image */}
                  <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-500 relative">
                    <img src="/placeholder.svg" alt="Cover" className="w-full h-full object-cover" />
                    {artist.is_verified && (
                      <Badge className="absolute top-3 right-3 bg-green-500">
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Profile Section */}
                  <div className="p-6 -mt-8 relative">
                    <div className="flex items-center mb-4">
                      <Avatar className="w-16 h-16 bg-white rounded-full p-1 shadow-lg">
                        <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name || ''} />
                        <AvatarFallback>
                          {artist.full_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">{artist.full_name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {artist.location || 'Kenya'}
                        </div>
                      </div>
                    </div>

                    <p className="text-purple-600 font-medium mb-2">{artist.artist_profile?.specialty || 'Artist'}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artist.bio || 'Passionate artist creating beautiful designs.'}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-bold text-lg">0</div>
                        <div className="text-xs text-gray-500">Designs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {artist.artist_profile?.rating || 0}
                        </div>
                        <div className="text-xs text-gray-500">{artist.artist_profile?.total_reviews || 0} reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">
                          KSh {artist.artist_profile?.total_earnings?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-500">Earned</div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Response Time:</span>
                        <span className="font-medium">{artist.artist_profile?.response_time || '24 hours'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Completed Orders:</span>
                        <span className="font-medium">{artist.artist_profile?.completed_orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price Range:</span>
                        <span className="font-medium">{artist.artist_profile?.price_range || 'Contact for pricing'}</span>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(artist.artist_profile?.languages || ['English']).map((language) => (
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
              </Link>
            ))}
          </div>
        )}

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
