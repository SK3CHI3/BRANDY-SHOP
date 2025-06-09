import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer'

import PromoteProductModal from '@/components/PromoteProductModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Palette, ShoppingBag, Shield, User, Settings, BarChart3, Package, Users, Star, Heart, TrendingUp, Eye, Zap } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // State for dynamic data
  const [dashboardData, setDashboardData] = useState({
    // Artist data
    totalDesigns: 0,
    totalEarnings: 0,
    activeOrders: 0,
    averageRating: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalFollowers: 0,
    recentProducts: [],
    recentOrders: [],
    recentReviews: [],
    // Customer data
    customerOrders: 0,
    customerFavorites: 0,
    customerWishlist: 0,
    customerReviews: 0,
    recentCustomerOrders: [],
    recentFavoriteProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedProductToPromote, setSelectedProductToPromote] = useState<any>(null);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !profile) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (profile.role === 'artist') {
          // Fetch artist-specific data
          const [
            productsResult,
            ordersResult,
            reviewsResult,
            followersResult
          ] = await Promise.all([
            // Get artist's products
            supabase
              .from('products')
              .select('*, favorites(id)')
              .eq('artist_id', user.id)
              .eq('is_active', true),

            // Get orders for artist's products (if orders table exists)
            supabase
              .from('order_items')
              .select(`
                *,
                order:orders(id, status, created_at, customer_id),
                product:products!inner(artist_id)
              `)
              .eq('product.artist_id', user.id)
              .limit(10),

            // Get reviews for artist
            supabase
              .from('reviews')
              .select(`
                *,
                customer:profiles!customer_id(full_name, avatar_url),
                product:products(title)
              `)
              .eq('artist_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5),

            // Get followers count
            supabase
              .from('artist_followers')
              .select('*', { count: 'exact', head: true })
              .eq('artist_id', user.id)
          ]);

          const products = productsResult.data || [];
          const orders = ordersResult.data || [];
          const reviews = reviewsResult.data || [];
          const followersCount = followersResult.count || 0;

          // Calculate metrics
          const totalEarnings = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
          const totalFavorites = products.reduce((sum, product) => sum + (product.favorites?.length || 0), 0);
          const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

          setDashboardData({
            totalDesigns: products.length,
            totalEarnings,
            activeOrders: orders.filter(order => order.order?.status === 'processing' || order.order?.status === 'confirmed').length,
            averageRating,
            totalViews: products.reduce((sum, product) => sum + (product.view_count || 0), 0),
            totalFavorites,
            totalFollowers: followersCount,
            recentProducts: products.slice(0, 6),
            recentOrders: orders.slice(0, 5),
            recentReviews: reviews
          });
        } else if (profile.role === 'customer') {
          // Fetch customer-specific data
          const [
            ordersResult,
            favoritesResult,
            reviewsResult
          ] = await Promise.all([
            // Get customer's orders
            supabase
              .from('orders')
              .select(`
                id,
                order_number,
                status,
                total_amount,
                created_at,
                order_items (
                  id,
                  quantity,
                  price,
                  product:products (
                    id,
                    title,
                    image_url,
                    artist:profiles!products_artist_id_fkey (
                      id,
                      full_name
                    )
                  )
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),

            // Get customer's favorites
            supabase
              .from('favorites')
              .select(`
                id,
                created_at,
                product:products (
                  id,
                  title,
                  price,
                  image_url,
                  artist:profiles!products_artist_id_fkey (
                    id,
                    full_name
                  )
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),

            // Get customer's reviews
            supabase
              .from('reviews')
              .select(`
                id,
                rating,
                comment,
                created_at,
                product:products (
                  id,
                  title,
                  image_url
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
          ]);

          const orders = ordersResult.data || [];
          const favorites = favoritesResult.data || [];
          const reviews = reviewsResult.data || [];

          setDashboardData({
            ...dashboardData,
            customerOrders: orders.length,
            customerFavorites: favorites.length,
            customerWishlist: favorites.length, // Using favorites as wishlist
            customerReviews: reviews.length,
            recentCustomerOrders: orders.slice(0, 5),
            recentFavoriteProducts: favorites.slice(0, 6)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist':
        return <Palette className="h-6 w-6" />;
      case 'admin':
        return <Shield className="h-6 w-6" />;
      default:
        return <ShoppingBag className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artist':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'artist':
        return 'Welcome to your Artist Studio! Manage your designs, track earnings, and connect with customers.';
      case 'admin':
        return 'Welcome to the Admin Panel! Monitor platform activity, manage users, and oversee operations.';
      default:
        return 'Welcome to your Customer Dashboard! Explore designs, track orders, and manage your profile.';
    }
  };

  const getDashboardCards = (role: string) => {
    switch (role) {
      case 'artist':
        return [
          {
            title: 'Total Designs',
            value: loading ? '...' : dashboardData.totalDesigns.toString(),
            icon: <Palette className="h-4 w-4" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: '+2 this month'
          },
          {
            title: 'Total Earnings',
            value: loading ? '...' : `KSh ${dashboardData.totalEarnings.toLocaleString()}`,
            icon: <BarChart3 className="h-4 w-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+12% this month'
          },
          {
            title: 'Active Orders',
            value: loading ? '...' : dashboardData.activeOrders.toString(),
            icon: <Package className="h-4 w-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: '3 pending'
          },
          {
            title: 'Average Rating',
            value: loading ? '...' : dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : 'New',
            icon: <Star className="h-4 w-4" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            change: `${dashboardData.recentReviews.length} reviews`
          },
        ];
      case 'admin':
        return [
          { title: 'Total Users', value: '1,234', icon: <Users className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Total Artists', value: '156', icon: <Palette className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
          { title: 'Total Orders', value: '2,890', icon: <Package className="h-4 w-4" />, color: 'text-green-600', bgColor: 'bg-green-50' },
          { title: 'Revenue', value: 'KSh 890,000', icon: <BarChart3 className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        ];
      default:
        return [
          {
            title: 'Orders',
            value: loading ? '...' : dashboardData.customerOrders.toString(),
            icon: <Package className="h-4 w-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: dashboardData.recentCustomerOrders.filter((order: any) => ['pending', 'confirmed', 'processing'].includes(order.status)).length > 0
              ? `${dashboardData.recentCustomerOrders.filter((order: any) => ['pending', 'confirmed', 'processing'].includes(order.status)).length} active`
              : 'All delivered'
          },
          {
            title: 'Favorites',
            value: loading ? '...' : dashboardData.customerFavorites.toString(),
            icon: <Heart className="h-4 w-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            change: 'Saved items'
          },
          {
            title: 'Wishlist',
            value: loading ? '...' : dashboardData.customerWishlist.toString(),
            icon: <ShoppingBag className="h-4 w-4" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: 'Items to buy'
          },
          {
            title: 'Reviews',
            value: loading ? '...' : dashboardData.customerReviews.toString(),
            icon: <Star className="h-4 w-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: 'Reviews given'
          },
        ];
    }
  };

  const dashboardCards = getDashboardCards(profile.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              {getRoleIcon(profile.role)}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {profile.role === 'artist' ? 'Artist Studio' :
                 profile.role === 'admin' ? 'Admin Panel' :
                 'Customer Dashboard'}
              </h1>
            </div>
            <Badge className={getRoleColor(profile.role)}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            {getWelcomeMessage(profile.role)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">{card.title}</CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor || 'bg-gray-50'} flex-shrink-0`}>
                  <div className={card.color}>{card.icon}</div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                {card.change && (
                  <p className="text-xs text-gray-500 line-clamp-2">{card.change}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Artist-specific sections */}
        {profile.role === 'artist' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Recent Designs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.recentProducts.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentProducts.slice(0, 4).map((product: any) => (
                      <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 truncate">{product.title}</p>
                            {product.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>KSh {product.price?.toLocaleString()}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{product.favorites?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          onClick={() => {
                            setSelectedProductToPromote(product);
                            setPromoteModalOpen(true);
                          }}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Promote
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Palette className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No designs yet</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/upload-design')}
                    >
                      Upload Your First Design
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentReviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border-l-4 border-yellow-400 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            by {review.customer?.full_name || 'Anonymous'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                        {review.product && (
                          <p className="text-xs text-gray-500 mt-1">
                            for "{review.product.title}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet</p>
                    <p className="text-sm">Reviews will appear here when customers rate your designs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer-specific sections */}
        {profile.role === 'customer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.recentCustomerOrders.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentCustomerOrders.slice(0, 4).map((order: any) => (
                      <div key={order.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                           onClick={() => navigate(`/order-tracking/${order.id}`)}>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">Order #{order.order_number}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>KSh {order.total_amount?.toLocaleString()}</span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                order.status === 'processing' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No orders yet</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/marketplace')}
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favorite Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.recentFavoriteProducts.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentFavoriteProducts.slice(0, 4).map((favorite: any) => (
                      <div key={favorite.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                           onClick={() => navigate(`/product/${favorite.product.id}`)}>
                        <img
                          src={favorite.product.image_url || '/placeholder.svg'}
                          alt={favorite.product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{favorite.product.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>KSh {favorite.product.price?.toLocaleString()}</span>
                            {favorite.product.artist && (
                              <>
                                <span>•</span>
                                <span>by {favorite.product.artist.full_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No favorites yet</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/marketplace')}
                    >
                      Discover Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin-specific sections */}
        {profile.role === 'admin' && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Payment System Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Payment Model</h3>
                  <p className="text-gray-600">
                    BRANDY-SHOP uses a direct payment system where artists receive payments directly from customers.
                    No withdrawal management needed!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {profile.role === 'artist' && (
                <>
                  <Button
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm"
                    onClick={() => navigate('/upload-design')}
                  >
                    <Palette className="h-4 w-4 sm:h-6 sm:w-6" />
                    Upload New Design
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-blue-50 hover:border-blue-200 text-xs sm:text-sm"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-green-50 hover:border-green-200 text-xs sm:text-sm"
                    onClick={() => navigate('/artist-studio')}
                  >
                    <Package className="h-4 w-4 sm:h-6 sm:w-6" />
                    Manage Studio
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-yellow-50 hover:border-yellow-200 text-xs sm:text-sm"
                    onClick={() => {
                      if (dashboardData.recentProducts.length > 0) {
                        setSelectedProductToPromote(dashboardData.recentProducts[0]);
                        setPromoteModalOpen(true);
                      } else {
                        toast({
                          title: 'No products to promote',
                          description: 'Upload a design first to promote it',
                          variant: 'destructive'
                        });
                      }
                    }}
                  >
                    <Zap className="h-4 w-4 sm:h-6 sm:w-6" />
                    Promote Design
                  </Button>
                </>
              )}

              {profile.role === 'admin' && (
                <>
                  <Button
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/admin-panel')}
                  >
                    <Users className="h-6 w-6" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    View Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/admin-panel')}
                  >
                    <Settings className="h-6 w-6" />
                    Platform Settings
                  </Button>
                </>
              )}

              {profile.role === 'customer' && (
                <>
                  <Button
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => navigate('/marketplace')}
                  >
                    <ShoppingBag className="h-6 w-6" />
                    Browse Marketplace
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => navigate('/order-tracking')}
                  >
                    <Package className="h-6 w-6" />
                    Track Orders
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-200"
                    onClick={() => navigate('/favorites')}
                  >
                    <Heart className="h-6 w-6" />
                    View Favorites
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />

      {/* Promote Product Modal */}
      {selectedProductToPromote && (
        <PromoteProductModal
          isOpen={promoteModalOpen}
          onClose={() => {
            setPromoteModalOpen(false);
            setSelectedProductToPromote(null);
          }}
          product={selectedProductToPromote}
        />
      )}
    </div>
  );
};

export default Dashboard;
