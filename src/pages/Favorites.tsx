import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Trash2, 
  Share2,
  Filter,
  Grid3X3,
  List,
  Search,
  SortAsc
} from 'lucide-react'

interface FavoriteItem {
  id: string
  title: string
  artist: {
    id: string
    name: string
    avatar: string
  }
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  addedAt: string
  inStock: boolean
}

const Favorites = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [filterCategory, setFilterCategory] = useState('all')

  // Mock favorites data
  const mockFavorites: FavoriteItem[] = [
    {
      id: '1',
      title: 'Kenyan Wildlife Safari T-Shirt',
      artist: {
        id: 'artist1',
        name: 'Sarah Wanjiku',
        avatar: '/placeholder.svg'
      },
      price: 1500,
      originalPrice: 2000,
      image: '/placeholder.svg',
      rating: 4.8,
      reviewCount: 124,
      category: 'T-Shirts',
      addedAt: '2024-01-15T10:30:00Z',
      inStock: true
    },
    {
      id: '2',
      title: 'Traditional Maasai Patterns Hoodie',
      artist: {
        id: 'artist2',
        name: 'John Mwangi',
        avatar: '/placeholder.svg'
      },
      price: 2500,
      image: '/placeholder.svg',
      rating: 4.9,
      reviewCount: 89,
      category: 'Hoodies',
      addedAt: '2024-01-14T15:20:00Z',
      inStock: true
    },
    {
      id: '3',
      title: 'Nairobi Skyline Coffee Mug',
      artist: {
        id: 'artist3',
        name: 'Grace Njeri',
        avatar: '/placeholder.svg'
      },
      price: 800,
      image: '/placeholder.svg',
      rating: 4.6,
      reviewCount: 67,
      category: 'Mugs',
      addedAt: '2024-01-13T09:45:00Z',
      inStock: false
    },
    {
      id: '4',
      title: 'Kikuyu Proverbs Canvas Tote',
      artist: {
        id: 'artist4',
        name: 'Peter Kamau',
        avatar: '/placeholder.svg'
      },
      price: 1200,
      image: '/placeholder.svg',
      rating: 4.7,
      reviewCount: 45,
      category: 'Bags',
      addedAt: '2024-01-12T14:10:00Z',
      inStock: true
    }
  ]

  useEffect(() => {
    // Simulate loading favorites
    setTimeout(() => {
      setFavorites(mockFavorites)
      setLoading(false)
    }, 1000)
  }, [])

  const removeFavorite = (itemId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId))
    toast({
      title: 'Removed from Favorites',
      description: 'Item has been removed from your favorites list',
    })
  }

  const addToCart = (item: FavoriteItem) => {
    if (!item.inStock) {
      toast({
        title: 'Out of Stock',
        description: 'This item is currently out of stock',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Added to Cart',
      description: `${item.title} has been added to your cart`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const categories = ['all', ...Array.from(new Set(favorites.map(item => item.category)))]

  const filteredFavorites = favorites.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  )

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-4">Please sign in to view your favorites</p>
            <Button>Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} in your favorites
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring and add items to your favorites to see them here
            </p>
            <Link to="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Favorites Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {sortedFavorites.map((item) => (
                <Card key={item.id} className={`group hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={`relative ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
                  }`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full h-full object-cover ${
                        viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                      }`}
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex justify-between h-full' : ''}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        
                        <Link to={`/artist/${item.artist.id}`}>
                          <p className="text-sm text-gray-600 hover:text-orange-600 transition-colors mb-2">
                            by {item.artist.name}
                          </p>
                        </Link>

                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {item.rating} ({item.reviewCount})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              KSh {item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                KSh {item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          Added {formatDate(item.addedAt)}
                        </p>
                      </div>

                      <div className={`flex gap-2 ${
                        viewMode === 'list' ? 'flex-col justify-center ml-4' : ''
                      }`}>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className={viewMode === 'list' ? 'w-32' : 'flex-1'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={viewMode === 'list' ? 'w-32' : ''}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  )
}

export default Favorites
