
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Heart, ShoppingCart, Star, Send, Palette } from 'lucide-react';

const FeaturedDesigns = () => {
  const { products, productsLoading: loading } = useData();

  // Show first 6 products or fallback to empty array
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Featured Designs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover unique creations from our talented community of Kenyan artists
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="block group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {product.is_featured && (
                    <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Featured
                    </Badge>
                  )}

                  <button className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>

                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category?.name || 'Design'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {product.title}
                    </h3>

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <User className="h-4 w-4 mr-1" />
                      <span>by {product.artist?.full_name || 'Artist'}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-orange-600">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            KSh {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        onClick={(e) => e.preventDefault()}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 hover:bg-orange-50 hover:border-orange-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Customize
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
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products yet</h3>
            <p className="text-gray-600 mb-6">Check back soon for amazing designs from our artists!</p>
            <Link to="/marketplace">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}

        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 hover:border-orange-700 w-full sm:w-auto">
                <Palette className="h-5 w-5 mr-2" />
                View All Designs
              </Button>
            </Link>
            <Link to="/custom-studio">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto">
                <Send className="h-5 w-5 mr-2" />
                Send Custom Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDesigns;
