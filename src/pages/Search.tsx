import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search as SearchIcon,
  Filter,
  Grid,
  List,
  User,
  Heart,
  ShoppingCart,
  Star,
  Palette,
  Package,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SearchProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url: string;
  stock_quantity: number;
  category?: {
    name: string;
  };
  artist?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface SearchArtist {
  id: string;
  full_name: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  specialty?: string;
  product_count?: number;
  follower_count?: number;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: SearchProduct[];
    artists: SearchArtist[];
  }>({
    products: [],
    artists: []
  });
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        if (error) throw error;

        const categoryNames = ['All Categories', ...(data?.map(cat => cat.name) || [])];
        setCategories(categoryNames);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(['All Categories', 'T-Shirts', 'Hoodies', 'Mugs', 'Caps', 'Posters', 'Stickers']);
      }
    };

    fetchCategories();
  }, []);

  // Perform search when query changes
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  // Perform search when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [sortBy, selectedCategory, priceRange]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ products: [], artists: [] });
      return;
    }

    setLoading(true);
    try {
      // Search products
      let productsQuery = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          original_price,
          image_url,
          stock_quantity,
          category:categories(name),
          artist:profiles!products_artist_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`);

      // Apply category filter
      if (selectedCategory !== 'all' && selectedCategory !== 'all-categories') {
        productsQuery = productsQuery.eq('category.name', selectedCategory);
      }

      // Apply price range filter
      if (priceRange.min) {
        productsQuery = productsQuery.gte('price', parseInt(priceRange.min));
      }
      if (priceRange.max) {
        productsQuery = productsQuery.lte('price', parseInt(priceRange.max));
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          productsQuery = productsQuery.order('created_at', { ascending: false });
          break;
        case 'price-low':
          productsQuery = productsQuery.order('price', { ascending: true });
          break;
        case 'price-high':
          productsQuery = productsQuery.order('price', { ascending: false });
          break;
        default:
          productsQuery = productsQuery.order('created_at', { ascending: false });
      }

      const { data: products, error: productsError } = await productsQuery.limit(20);

      if (productsError) throw productsError;

      // Search artists
      const { data: artists, error: artistsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          bio,
          location,
          avatar_url,
          specialty
        `)
        .eq('role', 'artist')
        .or(`full_name.ilike.%${query}%, bio.ilike.%${query}%, specialty.ilike.%${query}%`)
        .limit(10);

      if (artistsError) throw artistsError;

      setSearchResults({
        products: products || [],
        artists: artists || []
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    } else {
      setSearchParams({});
      setSearchResults({ products: [], artists: [] });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });
      }

      toast({
        title: 'Added to cart',
        description: 'Product added to your cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);

        toast({
          title: 'Removed from favorites',
          description: 'Product removed from your favorites',
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        toast({
          title: 'Added to favorites',
          description: 'Product added to your favorites',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search'}
          </h1>
          
          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for designs, artists, or categories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {categories.map(category => (
                <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="relevance">Most Relevant</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <div className="flex gap-2">
              <Input
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24"
              />
              <span className="self-center">-</span>
              <Input
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24"
              />
            </div>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="products">
              Products ({searchResults.products.length})
            </TabsTrigger>
            <TabsTrigger value="artists">
              Artists ({searchResults.artists.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              {/* Products Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {searchResults.products.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                            <img
                              src={product.image_url || '/placeholder.svg'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => toggleFavorite(product.id)}
                              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white"
                            >
                              <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                            {product.stock_quantity === 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Badge variant="secondary">Out of Stock</Badge>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.category?.name || 'Uncategorized'}
                            </Badge>

                            <h3 className="font-semibold text-gray-900">{product.title}</h3>

                            <div className="flex items-center gap-2">
                              {renderStars(4.5)}
                              <span className="text-sm text-gray-600">(0)</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-orange-600">
                                KSh {product.price.toLocaleString()}
                              </span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  KSh {product.original_price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {product.artist && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>by {product.artist.full_name}</span>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => addToCart(product.id)}
                                disabled={product.stock_quantity === 0}
                                className="flex-1"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add to Cart
                              </Button>
                              <Link to={`/product/${product.id}`}>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Artists Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Artists</h2>
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                          <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.artists.map((artist) => (
                      <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                          <img
                            src={artist.avatar_url || '/placeholder.svg'}
                            alt={artist.full_name}
                            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                          />
                          <h3 className="font-semibold text-gray-900 mb-1">{artist.full_name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{artist.specialty || 'Artist'}</p>
                          {artist.location && (
                            <p className="text-xs text-gray-500 mb-4">{artist.location}</p>
                          )}

                          <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="text-center">
                              <div className="font-medium">{artist.product_count || 0}</div>
                              <div>Products</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{artist.follower_count || 0}</div>
                              <div>Followers</div>
                            </div>
                          </div>

                          <Link to={`/artist/${artist.id}`}>
                            <Button size="sm" className="w-full">
                              <Palette className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {/* Products only view */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {searchResults.products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  {/* Same product card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="mt-6">
            {/* Artists only view */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.artists.map((artist) => (
                <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                  {/* Same artist card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {searchQuery && searchResults.products.length === 0 && searchResults.artists.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse our categories
            </p>
            <Link to="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
