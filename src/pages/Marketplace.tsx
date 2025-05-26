
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, User, Heart, ShoppingCart } from 'lucide-react';

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'T-Shirts', 'Hoodies', 'Caps', 'Mugs', 'Tank Tops', 'Accessories'
  ];

  const products = [
    {
      id: 1,
      title: "Swahili Proverbs Collection",
      artist: "Amina Wanjiku",
      price: 1500,
      originalPrice: 2000,
      category: "T-Shirts",
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 156,
      isPopular: true,
      isFavorited: false,
      inStock: true
    },
    {
      id: 2,
      title: "Mount Kenya Landscape",
      artist: "David Kiplagat",
      price: 2200,
      category: "Hoodies",
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 89,
      isPopular: false,
      isFavorited: true,
      inStock: true
    },
    {
      id: 3,
      title: "Kenyan Coffee Art",
      artist: "Grace Nyong'o",
      price: 1300,
      category: "Mugs",
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 234,
      isPopular: true,
      isFavorited: false,
      inStock: false
    },
    // Add more products...
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search designs, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
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

        {/* Products Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              {product.isPopular && (
                <Badge className="absolute top-3 left-3 z-10 bg-yellow-500">
                  Popular
                </Badge>
              )}
              
              <div className="aspect-square bg-gray-200 rounded-t-lg relative overflow-hidden">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white">
                  <Heart className={`h-4 w-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{product.rating}</span>
                    <span className="ml-1">({product.reviews})</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <User className="h-4 w-4 mr-1" />
                  <span>by {product.artist}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">KSh {product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">KSh {product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
