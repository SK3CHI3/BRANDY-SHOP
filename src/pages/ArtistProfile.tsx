
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Star, MapPin, Calendar, MessageCircle, Heart, Share2, User, Loader2, ArrowLeft, Palette } from 'lucide-react';

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [artist, setArtist] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Fetch artist data
  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch artist profile with artist_profile data
        const { data: artistData, error: artistError } = await supabase
          .from('profiles')
          .select(`
            *,
            artist_profile:artist_profiles(*)
          `)
          .eq('id', id)
          .eq('role', 'artist')
          .single();

        if (artistError) throw artistError;

        setArtist(artistData);

        // Fetch artist's products (portfolio)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            favorites(id)
          `)
          .eq('artist_id', id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (productsError) throw productsError;

        setPortfolio(productsData || []);

        // Fetch reviews for this artist (don't throw error if table doesn't exist)
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            customer:profiles!customer_id(full_name, avatar_url),
            product:products(title)
          `)
          .eq('artist_id', id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (reviewsError) {
          console.warn('Reviews fetch error:', reviewsError);
          setReviews([]);
        } else {
          setReviews(reviewsData || []);
        }

        // Check if current user is following this artist (don't throw error if table doesn't exist)
        if (user) {
          const { data: followData, error: followError } = await supabase
            .from('artist_followers')
            .select('id')
            .eq('artist_id', id)
            .eq('follower_id', user.id)
            .single();

          if (followError) {
            console.warn('Follow check error:', followError);
            setIsFollowing(false);
          } else {
            setIsFollowing(!!followData);
          }
        }

        // Get followers count (don't throw error if table doesn't exist)
        const { count: followersCount, error: followersError } = await supabase
          .from('artist_followers')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', id);

        if (followersError) {
          console.warn('Followers count error:', followersError);
          setFollowersCount(0);
        } else {
          setFollowersCount(followersCount || 0);
        }

      } catch (error) {
        console.error('Error fetching artist data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load artist profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id, user]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to follow artists',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('artist_followers')
          .delete()
          .eq('artist_id', id)
          .eq('follower_id', user.id);

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast({
          title: 'Unfollowed',
          description: `You are no longer following ${artist?.full_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('artist_followers')
          .insert({
            artist_id: id,
            follower_id: user.id,
          });

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({
          title: 'Following',
          description: `You are now following ${artist?.full_name}`,
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading artist profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
            <p className="text-gray-600 mb-6">The artist profile you're looking for doesn't exist.</p>
            <Link to="/marketplace">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-80 lg:h-96 relative overflow-hidden">
          {artist.artist_profile?.[0]?.cover_image ? (
            <img
              src={artist.artist_profile[0].cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Floating Elements */}
          <div className="absolute top-8 right-8 hidden lg:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-pulse">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-12 left-8 hidden lg:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-pulse delay-1000">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Profile Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              {/* Avatar and Info */}
              <div className="flex items-end gap-6">
                <div className="relative">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl p-1 shadow-2xl">
                    <Avatar className="w-full h-full rounded-xl">
                      <AvatarImage src={artist.avatar_url} alt={artist.full_name} />
                      <AvatarFallback className="text-2xl lg:text-3xl rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                        {artist.full_name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {artist.artist_profile?.[0]?.verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-2xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                    {artist.full_name}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                      {artist.artist_profile?.[0]?.specialty || 'Artist'}
                    </Badge>
                    {artist.artist_profile?.[0]?.verified && (
                      <Badge className="bg-green-500/20 backdrop-blur-sm text-green-100 border-green-300/30">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-white/90 text-sm lg:text-base">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{artist.location || 'Kenya'}</span>
                    <span className="mx-3">•</span>
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {formatDate(artist.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 lg:ml-auto">
                <Button
                  variant="outline"
                  onClick={handleFollow}
                  className={`backdrop-blur-sm border-white/30 text-white hover:bg-white/20 ${
                    isFollowing ? 'bg-white/20' : 'bg-white/10'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Link to={`/messages?artist=${id}`}>
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {portfolio.length}
              </div>
              <div className="text-sm text-gray-600">Designs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {followersCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200 rounded-xl p-1">
                <TabsTrigger
                  value="portfolio"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Portfolio
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-8">
                {portfolio.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {portfolio.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                      >
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                          <img
                            src={item.image_url || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Floating Action */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                              <Heart className="h-4 w-4 text-gray-700" />
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                              {item.category?.name || 'Design'}
                            </Badge>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Heart className="h-4 w-4 mr-1" />
                              <span>{item.favorites?.length || 0}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              KSh {item.price?.toLocaleString() || '0'}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <ArrowLeft className="h-5 w-5 text-purple-600 rotate-180" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="h-16 w-16 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No designs yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      This talented artist is working on their first designs. Check back soon for amazing creations!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About {artist.full_name}</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {artist.artist_profile?.[0]?.bio || artist.bio ||
                         `${artist.full_name} is a talented artist creating amazing designs on Brandy Shop. Their unique style and creative vision bring fresh perspectives to every project.`}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-purple-600" />
                        Skills & Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artist.artist_profile?.[0]?.skills ?
                          artist.artist_profile[0].skills.map((skill: string) => (
                            <Badge key={skill} className="bg-white/80 text-purple-700 border-purple-200 hover:bg-white">
                              {skill}
                            </Badge>
                          )) : (
                            <Badge className="bg-white/80 text-purple-700 border-purple-200">Design</Badge>
                          )
                        }
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Palette className="h-5 w-5 mr-2 text-blue-600" />
                        Specialties
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/80 text-blue-700 border-blue-200 hover:bg-white">
                          {artist.artist_profile?.[0]?.specialty || 'Custom Design'}
                        </Badge>
                        {portfolio.length > 0 && (
                          <Badge className="bg-white/80 text-blue-700 border-blue-200 hover:bg-white">
                            {portfolio.length} Design{portfolio.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Cards */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">Member Since</div>
                      <div className="text-gray-600 text-sm mt-1">{formatDate(artist.created_at)}</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <MapPin className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">Location</div>
                      <div className="text-gray-600 text-sm mt-1">{artist.location || 'Kenya'}</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <MessageCircle className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                      <div className="font-semibold text-gray-900">Response Time</div>
                      <div className="text-gray-600 text-sm mt-1">
                        {artist.artist_profile?.[0]?.response_time || 'Within 24 hours'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                              <AvatarImage src={review.customer?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                                {review.customer?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.customer?.full_name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatRelativeTime(review.created_at)}
                              </p>
                              {review.product && (
                                <p className="text-sm text-purple-600 font-medium mt-1">
                                  for "{review.product.title}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Verified Purchase
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="h-16 w-16 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No reviews yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      This artist is building their reputation. Be the first to work with them and leave a review!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Commission Card - Featured */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <Palette className="h-6 w-6 mr-2" />
                  <h3 className="text-xl font-bold">Commission a Design</h3>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Get a custom design made just for you by {artist.full_name}. Bring your vision to life!
                </p>
                <Link to={`/commission/${id}`}>
                  <Button className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold shadow-lg">
                    Start Project
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to={`/messages?artist=${id}`}>
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                    <MessageCircle className="h-4 w-4 mr-3" />
                    Send Message
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className={`w-full justify-start transition-all duration-200 ${
                    isFollowing
                      ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                      : 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700'
                  }`}
                  onClick={handleFollow}
                >
                  <Heart className={`h-4 w-4 mr-3 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow Artist'}
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                  <Share2 className="h-4 w-4 mr-3" />
                  Share Profile
                </Button>
              </div>
            </div>

            {/* Artist Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Artist Highlights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700 font-medium">Rating</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-700 font-medium">Designs</span>
                  </div>
                  <div className="font-bold text-gray-900">{portfolio.length}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium">Response</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {artist.artist_profile?.[0]?.response_time || 'Within 24h'}
                    </div>
                  </div>
                </div>

                {artist.artist_profile?.[0]?.verified && (
                  <div className="flex items-center justify-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700 font-semibold">Verified Artist</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistProfile;
