import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
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
  SortAsc,
  User,
  Palette,
  Lock,
  ArrowLeft
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

interface FavoriteItem {
  id: string
  product_id: string
  created_at: string
  product: {
    id: string
    title: string
    price: number
    original_price?: number
    image_url: string
    stock_quantity: number
    category?: {
      name: string
    }
    artist?: {
      id: string
      full_name: string
      avatar_url?: string
    }
  }
}

const Favorites = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [filterCategory, setFilterCategory] = useState('all')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')

  // Fetch favorites from Supabase
  const fetchFavorites = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          product:products (
            id,
            title,
            price,
            original_price,
            image_url,
            stock_quantity,
            category:categories (
              name
            ),
            artist:profiles!products_artist_id_fkey (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const removeFavorite = async (itemId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setFavorites(prev => prev.filter(item => item.id !== itemId))
      toast({
        title: 'Removed from Favorites',
        description: 'Item has been removed from your favorites list',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from favorites',
        variant: 'destructive',
      })
    }
  }

  const addToCart = async (item: FavoriteItem) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      })
      return
    }

    if (item.product.stock_quantity === 0) {
      toast({
        title: 'Out of Stock',
        description: 'This item is currently out of stock',
        variant: 'destructive',
      })
      return
    }

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.product_id)
        .single()

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: 1
          })
      }

      toast({
        title: 'Added to Cart',
        description: `${item.product.title} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  const categories = ['all', ...Array.from(new Set(favorites.map(item => item.product.category?.name).filter(Boolean)))]

  const filteredFavorites = favorites.filter(item =>
    filterCategory === 'all' || item.product.category?.name === filterCategory
  )

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'price-low':
        return a.product.price - b.product.price
      case 'price-high':
        return b.product.price - a.product.price
      case 'rating':
        return 0 // We'll implement rating later
      default:
        return 0
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Icon with lock overlay */}
            <div className="relative inline-block mb-8">
              <Heart className="h-24 w-24 text-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Favorites Collection
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to save and manage your favorite designs from talented Kenyan artists.
              Build your personal collection of amazing artwork!
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Save Designs</h3>
                <p className="text-sm text-gray-600">Keep track of designs you love</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Quick Access</h3>
                <p className="text-sm text-gray-600">Easy access to your saved items</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Palette className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Discover Artists</h3>
                <p className="text-sm text-gray-600">Follow your favorite creators</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => openAuthModal('signin')}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
              >
                <User className="h-5 w-5 mr-2" />
                Sign In to View Favorites
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openAuthModal('signup')}
                className="border-red-500 text-red-500 hover:bg-red-50 px-8 py-3 text-lg"
              >
                <Palette className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>

            {/* Continue shopping link */}
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="inline-flex items-center text-gray-600 hover:text-red-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Discover amazing designs
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
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
                      src={item.product.image_url || '/placeholder.svg'}
                      alt={item.product.title}
                      className={`w-full h-full object-cover ${
                        viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                      }`}
                    />
                    {item.product.stock_quantity === 0 && (
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
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {item.product.title}
                          </h3>
                        </Link>

                        {item.product.artist && (
                          <Link to={`/artist/${item.product.artist.id}`}>
                            <p className="text-sm text-gray-600 hover:text-orange-600 transition-colors mb-2">
                              by {item.product.artist.full_name}
                            </p>
                          </Link>
                        )}

                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              4.5 (0) {/* TODO: Implement real ratings */}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              KSh {item.product.price.toLocaleString()}
                            </span>
                            {item.product.original_price && item.product.original_price > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                KSh {item.product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.product.category?.name || 'Uncategorized'}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          Added {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div className={`flex gap-2 ${
                        viewMode === 'list' ? 'flex-col justify-center ml-4' : ''
                      }`}>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={item.product.stock_quantity === 0}
                          className={viewMode === 'list' ? 'w-32' : 'flex-1'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={viewMode === 'list' ? 'w-32' : ''}
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/product/${item.product.id}`)
                            toast({
                              title: 'Link Copied',
                              description: 'Product link copied to clipboard',
                            })
                          }}
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
