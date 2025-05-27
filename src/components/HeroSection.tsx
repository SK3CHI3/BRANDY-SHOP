
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats, useFeaturedProducts } from '@/hooks/useData';
import { ArrowRight, Sparkles, Palette, Users, Star, Heart } from 'lucide-react';

const HeroSection = () => {
  const { stats, loading } = useStats();
  const { featuredProducts, loading: productsLoading } = useFeaturedProducts();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[80vh]">
          <div className="space-y-3">
            <div className="space-y-3">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm">
                <Sparkles className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Where Creativity Meets Commerce</span>
              </div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight">
                Wear Your
                <span className="block bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  Story
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Connect with Kenya's most talented artists to create custom apparel that speaks your language.
                From unique designs to personalized masterpieces, we bring your vision to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg px-8 py-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                  Explore Designs
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/custom-studio">
                <Button variant="outline" size="lg" className="text-lg px-8 py-5 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 w-full sm:w-auto">
                  Start Creating
                  <Palette className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.artistCount > 0 ? `${stats.artistCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Active Artists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.productCount > 0 ? `${stats.productCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Designs Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.orderCount > 0 ? `${stats.orderCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Orders Completed</div>
              </div>
            </div>
          </div>

          <div className="relative mt-16">
            <div className="relative z-10">
              {productsLoading ? (
                // Loading skeleton - Clean rectangular layout
                <div className="space-y-8">
                  {/* Top row - Two featured products */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First skeleton */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>

                    {/* Second skeleton */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>

                  {/* Bottom row - Custom design card */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-6 shadow-lg animate-pulse border-2 border-orange-200">
                        <div className="aspect-[16/3] bg-orange-200 rounded-xl mb-4"></div>
                        <div className="h-5 bg-orange-300 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-orange-300 rounded w-1/2 mb-3"></div>
                        <div className="h-5 bg-orange-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : featuredProducts.length > 0 ? (
                // Real product data - Clean rectangular layout
                <div className="space-y-8">
                  {/* Top row - Two featured products */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Most Popular Product */}
                    {featuredProducts.length > 0 && (
                      <Link to={`/product/${featuredProducts[0].id}`} className="block group">
                        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-2 border-yellow-200 relative overflow-hidden">
                          {/* Popular badge */}
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                            🔥 Most Liked
                          </div>

                          {/* Decorative elements */}
                          <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20"></div>
                          <div className="absolute bottom-3 left-3 w-6 h-6 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-20"></div>

                          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                            {featuredProducts[0].image_url ? (
                              <img
                                src={featuredProducts[0].image_url}
                                alt={featuredProducts[0].title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <Palette className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{featuredProducts[0].title}</h3>
                            {(featuredProducts[0] as any).favoriteCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500 fill-current" />
                                <span className="text-sm text-gray-500 font-medium">{(featuredProducts[0] as any).favoriteCount}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">by {featuredProducts[0].artist?.full_name || 'Artist'}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-orange-600">KSh {featuredProducts[0].price.toLocaleString()}</p>
                            {(featuredProducts[0] as any).averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-500 font-medium">{(featuredProducts[0] as any).averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* Second Featured Product */}
                    {featuredProducts.length > 1 && (
                      <Link to={`/product/${featuredProducts[1].id}`} className="block group">
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-2 border-blue-200 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full opacity-20"></div>
                          <div className="absolute bottom-3 left-3 w-6 h-6 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20"></div>

                          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                            {featuredProducts[1].image_url ? (
                              <img
                                src={featuredProducts[1].image_url}
                                alt={featuredProducts[1].title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{featuredProducts[1].title}</h3>
                            {(featuredProducts[1] as any).favoriteCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500 fill-current" />
                                <span className="text-sm text-gray-500 font-medium">{(featuredProducts[1] as any).favoriteCount}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">by {featuredProducts[1].artist?.full_name || 'Artist'}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-orange-600">KSh {featuredProducts[1].price.toLocaleString()}</p>
                            {(featuredProducts[1] as any).averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-500 font-medium">{(featuredProducts[1] as any).averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Bottom row - Custom design card */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs">
                      <Link to="/custom-studio" className="block group">
                        <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-2 border-orange-200 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-20"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full opacity-20"></div>

                          <div className="aspect-[4/3] bg-gradient-to-br from-orange-200 to-red-200 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                              <Palette className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Sparkles className="h-2 w-2 text-orange-600" />
                            </div>
                          </div>

                          <h3 className="font-bold text-gray-900 text-sm mb-1">Custom Design</h3>
                          <p className="text-xs text-gray-600 mb-2">Work with an artist</p>
                          <p className="text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">From KSh 2,000</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Empty state - Clean rectangular layout
                <div className="space-y-8">
                  {/* Top row - Two placeholder products */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* First placeholder */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-dashed border-gray-300 relative">
                      <div className="absolute -top-2 -right-2 bg-gray-300 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                        Coming Soon
                      </div>
                      <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-4 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                          <Palette className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-500 text-lg mb-2">Featured Design</h3>
                      <p className="text-sm text-gray-400 mb-3">Amazing designs coming...</p>
                      <p className="text-xl font-bold text-gray-400">KSh ---</p>
                    </div>

                    {/* Second placeholder */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-dashed border-gray-300">
                      <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-4 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-500 text-lg mb-2">Popular Design</h3>
                      <p className="text-sm text-gray-400 mb-3">Trending designs loading...</p>
                      <p className="text-xl font-bold text-gray-400">KSh ---</p>
                    </div>
                  </div>

                  {/* Bottom row - Custom design card */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <Link to="/custom-studio" className="block group">
                        <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-2 border-orange-200 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-20"></div>
                          <div className="absolute bottom-3 left-3 w-6 h-6 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full opacity-20"></div>

                          <div className="aspect-[16/3] bg-gradient-to-br from-orange-200 to-red-200 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Palette className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-orange-600" />
                            </div>
                          </div>

                          <h3 className="font-bold text-gray-900 text-lg mb-2">Custom Design</h3>
                          <p className="text-sm text-gray-600 mb-3">Work with an artist</p>
                          <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">From KSh 2,000</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
