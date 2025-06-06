
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, User, Heart, ShoppingCart, Send, Sparkles, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import RefreshButton from '@/components/RefreshButton';
import styles from './Marketplace.module.css';

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { categories } = useCategories();
  const { products, loading: productsLoading } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined
  });



  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.artist?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Insert custom request card at strategic positions
  const getProductsWithCustomCard = () => {
    const productsWithCard = [...filteredProducts];
    // Insert custom card after every 8 products, but at least at position 3
    const insertPosition = Math.min(3, Math.floor(productsWithCard.length / 2));
    if (productsWithCard.length > 2) {
      productsWithCard.splice(insertPosition, 0, {
        id: 'custom-request-card',
        isCustomCard: true
      });
    }
    return productsWithCard;
  };

  const productsToDisplay = getProductsWithCustomCard();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Discover Unique Designs</h1>
          <p className="text-xl text-orange-100">Explore thousands of designs from talented Kenyan artists</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search designs, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-h-[48px] text-base"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border rounded-lg min-h-[48px] text-base"
              style={{ fontSize: '16px' }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" className="min-h-[48px] text-sm sm:text-base">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </Button>

            <RefreshButton size="sm" variant="outline" showText={false} className="min-h-[48px]" />

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="min-h-[44px] min-w-[44px]"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="min-h-[44px] min-w-[44px]"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {productsToDisplay.map((product) => (
              product.isCustomCard ? (
                // Custom Request Card
                <div key={product.id} className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-all duration-300">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

                  {/* Special Badge */}
                  <Badge className="absolute top-3 left-3 z-10 bg-yellow-400 text-black font-bold">
                    ✨ Custom
                  </Badge>

                  <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col">
                    {/* Icon Section */}
                    <div className="aspect-square bg-white/20 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Palette className="h-8 w-8 sm:h-12 sm:w-12 text-white mx-auto mb-1 sm:mb-2" />
                        <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-300 mx-auto" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                          Need Something Custom?
                        </h3>
                        <p className="text-white/90 text-xs sm:text-sm mb-3 leading-relaxed">
                          Can't find what you're looking for? Let our team create something unique just for you!
                        </p>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center text-white/80 text-xs mb-4 gap-2">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                            Free Quote
                          </div>
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1"></div>
                            Fast Response
                          </div>
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></div>
                            Expert Design
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link to="/custom-studio" className="block">
                        <Button
                          size="sm"
                          className={`${styles.customButton} ${styles.touchButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Get Custom Design
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
              <Link key={product.id} to={`/product/${product.id}`} className={`block ${styles.productLink}`}>
                <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative ${styles.productCard}`}>
                  {product.is_featured && (
                    <Badge className="absolute top-3 left-3 z-10 bg-yellow-500">
                      Featured
                    </Badge>
                  )}

                  <div className="aspect-square bg-gray-200 rounded-t-lg relative overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className={`${styles.heartButton} ${styles.touchButton}`}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user) {
                          toast({
                            title: 'Sign in required',
                            description: 'Please sign in to add items to favorites',
                            variant: 'destructive',
                          });
                          return;
                        }

                        try {
                          const { data: existingFavorite } = await supabase
                            .from('favorites')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('product_id', product.id)
                            .single();

                          if (existingFavorite) {
                            await supabase
                              .from('favorites')
                              .delete()
                              .eq('user_id', user.id)
                              .eq('product_id', product.id);

                            toast({
                              title: 'Removed from favorites',
                              description: 'Item removed from your favorites',
                            });
                          } else {
                            await supabase
                              .from('favorites')
                              .insert({
                                user_id: user.id,
                                product_id: product.id
                              });

                            toast({
                              title: 'Added to favorites',
                              description: 'Item added to your favorites',
                            });
                          }
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to update favorites',
                            variant: 'destructive',
                          });
                        }
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category?.name || 'Uncategorized'}
                      </Badge>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">4.5</span>
                        <span className="ml-1">(0)</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">{product.title}</h3>

                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="truncate">by {product.artist?.full_name || 'Unknown Artist'}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-base sm:text-lg font-bold text-purple-600">KSh {product.price.toLocaleString()}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">KSh {product.original_price.toLocaleString()}</span>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className={`${styles.actionButtons} ${styles.buttonContainer}`}>
                      <Button
                        className={`flex-1 ${styles.primaryButton} ${styles.touchButton}`}
                        size="sm"
                        disabled={product.stock_quantity === 0}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user) {
                            toast({
                              title: 'Sign in required',
                              description: 'Please sign in to add items to cart',
                              variant: 'destructive',
                            });
                            return;
                          }

                          try {
                            await addToCart(product.id, 1);
                            toast({
                              title: 'Added to cart',
                              description: `${product.title} added to your cart`,
                            });
                          } catch (error) {
                            toast({
                              title: 'Error',
                              description: 'Failed to add item to cart',
                              variant: 'destructive',
                            });
                          }
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Add to Cart</span>
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex-1 ${styles.secondaryButton} ${styles.touchButton}`}
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/custom-studio?product=${product.id}`;
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <span className="text-xs sm:text-sm">Customize</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
