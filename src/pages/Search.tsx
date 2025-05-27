import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock search results
  const searchResults = {
    products: [
      {
        id: '1',
        title: 'Kenyan Wildlife T-Shirt',
        description: 'Beautiful wildlife design featuring elephants and acacia trees',
        price: 1500,
        originalPrice: 2000,
        image: '/placeholder.svg',
        artist: { name: 'Sarah Wanjiku', avatar: '/placeholder.svg' },
        rating: 4.8,
        reviews: 24,
        category: 'T-Shirts',
        tags: ['wildlife', 'kenya', 'nature']
      },
      {
        id: '2',
        title: 'Traditional Patterns Hoodie',
        description: 'Modern hoodie with traditional Kenyan patterns',
        price: 2500,
        image: '/placeholder.svg',
        artist: { name: 'John Mwangi', avatar: '/placeholder.svg' },
        rating: 4.9,
        reviews: 18,
        category: 'Hoodies',
        tags: ['traditional', 'patterns', 'culture']
      }
    ],
    artists: [
      {
        id: '1',
        name: 'Sarah Wanjiku',
        specialty: 'Wildlife Art',
        location: 'Nairobi, Kenya',
        avatar: '/placeholder.svg',
        rating: 4.9,
        products: 15,
        followers: 234
      },
      {
        id: '2',
        name: 'John Mwangi',
        specialty: 'Traditional Patterns',
        location: 'Mombasa, Kenya',
        avatar: '/placeholder.svg',
        rating: 4.7,
        products: 22,
        followers: 189
      }
    ]
  };

  const categories = [
    'All Categories',
    'T-Shirts',
    'Hoodies',
    'Mugs',
    'Caps',
    'Posters',
    'Stickers'
  ];

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      // Perform search here
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
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

    toast({
      title: 'Added to cart',
      description: 'Product added to your cart',
    });
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

    toast({
      title: 'Added to favorites',
      description: 'Product added to your favorites',
    });
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
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {searchResults.products.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white"
                          >
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          
                          <h3 className="font-semibold text-gray-900">{product.title}</h3>
                          
                          <div className="flex items-center gap-2">
                            {renderStars(product.rating)}
                            <span className="text-sm text-gray-600">({product.reviews})</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orange-600">
                              KSh {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                KSh {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>by {product.artist.name}</span>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => addToCart(product.id)}
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
              </div>

              {/* Artists Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Artists</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.artists.map((artist) => (
                    <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-16 h-16 rounded-full mx-auto mb-4"
                        />
                        <h3 className="font-semibold text-gray-900 mb-1">{artist.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{artist.specialty}</p>
                        <p className="text-xs text-gray-500 mb-4">{artist.location}</p>
                        
                        <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="text-center">
                            <div className="font-medium">{artist.products}</div>
                            <div>Products</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{artist.followers}</div>
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
