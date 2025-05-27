
import React from 'react';
import { Link } from 'react-router-dom';
import { useArtists } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, Palette, MessageCircle } from 'lucide-react';

const ArtistSpotlight = () => {
  const { artists, loading } = useArtists();

  // Show first 3 artists
  const featuredArtists = artists.slice(0, 3);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Meet Our Artists
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Talented creatives from across Kenya bringing their unique perspectives to life
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredArtists.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredArtists.map((artist) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="block group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 flex items-center justify-center relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name || ''} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        {artist.full_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    {artist.is_verified && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {artist.full_name || 'Artist'}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {artist.artist_profile?.rating || 0}
                        </span>
                      </div>
                    </div>

                    <p className="text-orange-600 font-medium mb-2">
                      {artist.artist_profile?.specialty || 'Creative Artist'}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {artist.bio || 'Passionate artist creating beautiful designs for the community.'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {artist.artist_profile?.completed_orders || 0} orders completed
                      </span>
                      <span className="text-sm text-green-600 font-medium">Available now</span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                        <Palette className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" className="flex-1 hover:bg-orange-50">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists yet</h3>
            <p className="text-gray-600 mb-6">Be the first to join our creative community!</p>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              Join as Artist
            </Button>
          </div>
        )}

        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/artists">
              <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50">
                <User className="h-5 w-5 mr-2" />
                View All Artists
              </Button>
            </Link>
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <Palette className="h-5 w-5 mr-2" />
              Join as an Artist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtistSpotlight;
