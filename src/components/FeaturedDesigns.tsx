
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Heart, ShoppingCart, Star, Send, Palette, Download, Crown, MessageCircle } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import LicensePurchaseModal from '@/components/LicensePurchaseModal';
import { featuredListingsService } from '@/services/featuredListings';

const FeaturedDesigns = () => {
  const { products, productsLoading: loading } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Fetch featured products from paid listings
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setFeaturedLoading(true);
      try {
        const { data, error } = await featuredListingsService.getActiveFeaturedProducts();
        if (error) {
          console.error('Error fetching featured products:', error);
          // Fallback to first 3 products if featured listings fail
          setFeaturedProducts(products.slice(0, 3));
        } else {
          // Limit to 3 featured products and ensure they have required properties
          const validFeaturedProducts = (data || [])
            .slice(0, 3)
            .map(product => ({
              ...product,
              is_featured: true // Ensure featured flag is set
            }));

          // If we have less than 3 featured products, fill with regular products
          if (validFeaturedProducts.length < 3) {
            const remainingSlots = 3 - validFeaturedProducts.length;
            const regularProducts = products
              .filter(p => !validFeaturedProducts.some(fp => fp.id === p.id))
              .slice(0, remainingSlots);
            setFeaturedProducts([...validFeaturedProducts, ...regularProducts]);
          } else {
            setFeaturedProducts(validFeaturedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to first 3 products
        setFeaturedProducts(products.slice(0, 3));
      } finally {
        setFeaturedLoading(false);
      }
    };

    if (products.length > 0) {
      fetchFeaturedProducts();
    } else {
      setFeaturedProducts([]);
      setFeaturedLoading(loading);
    }
  }, [products, loading]);

  const handleContactArtist = (product: any) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to contact artists',
        variant: 'destructive',
      });
      return;
    }
    setSelectedProduct(product);
    setChatModalOpen(true);
  };

  const handleLicensePurchase = (product: any) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase licenses',
        variant: 'destructive',
      });
      return;
    }
    setSelectedProduct(product);
    setLicenseModalOpen(true);
  };

  const handleFreeDownload = (product: any) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to download designs',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Download started',
      description: `Downloading ${product.title}...`,
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Featured Designs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Discover unique creations from our talented community of Kenyan artists
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-green-600" />
              <span>Free Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span>Premium Licenses</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              <span>Print Services</span>
            </div>
          </div>
        </div>

        {featuredLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
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
              <Link key={product.id} to={`/marketplace`} className="block group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {product.is_free ? (
                      <Badge className="bg-green-500 text-white">
                        <Download className="h-3 w-3 mr-1" />
                        Free
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Licensed
                      </Badge>
                    )}
                  </div>

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
                      <div className="flex flex-col">
                        {product.is_free ? (
                          <div>
                            <span className="text-lg font-bold text-green-600">FREE</span>
                            <div className="text-xs text-gray-500">License included</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-lg font-bold text-purple-600">
                              KSh {(product.license_price || product.price).toLocaleString()}
                            </span>
                            <div className="text-xs text-gray-500">
                              {product.license_type?.charAt(0).toUpperCase() + product.license_type?.slice(1)} License
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">{product.artist?.total_sales || 0} sales</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {product.is_free ? (
                        <>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.preventDefault();
                              handleFreeDownload(product);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Free Download
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 hover:bg-orange-50 hover:border-orange-300"
                            onClick={(e) => e.preventDefault()}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            onClick={(e) => {
                              e.preventDefault();
                              handleContactArtist(product);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 hover:bg-purple-50 hover:border-purple-300"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLicensePurchase(product);
                            }}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            License
                          </Button>
                        </>
                      )}
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
            <Link to="/request-quote">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto">
                <Send className="h-5 w-5 mr-2" />
                Request Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedProduct && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setSelectedProduct(null);
          }}
          artist={{
            id: selectedProduct.artist_id,
            full_name: selectedProduct.artist?.full_name || 'Unknown Artist',
            avatar_url: selectedProduct.artist?.avatar_url,
            role: 'artist',
            rating: selectedProduct.artist?.rating,
            total_sales: selectedProduct.artist?.total_sales
          }}
          productTitle={selectedProduct.title}
          productId={selectedProduct.id}
        />
      )}

      {/* License Purchase Modal */}
      {selectedProduct && (
        <LicensePurchaseModal
          isOpen={licenseModalOpen}
          onClose={() => {
            setLicenseModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </section>
  );
};

export default FeaturedDesigns;
