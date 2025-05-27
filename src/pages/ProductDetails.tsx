import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct, useReviews } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  User, 
  MapPin, 
  Palette,
  ArrowLeft,
  Share2
} from 'lucide-react'

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { product, loading, error } = useProduct(id!)
  const { reviews } = useReviews(id!)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  const addToCart = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      })
      return
    }

    setAddingToCart(true)
    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: id!,
          quantity,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: 'Added to cart',
        description: `${product?.title} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id!)
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: id!
          })
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      })
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Link to="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const images = product.images.length > 0 ? product.images : [product.image_url || '/placeholder.svg']

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-orange-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img 
                src={images[selectedImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-orange-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-orange-600">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    KSh {product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Artist Info */}
            {product.artist && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={product.artist.avatar_url || ''} alt={product.artist.full_name || ''} />
                      <AvatarFallback>
                        {product.artist.full_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{product.artist.full_name}</span>
                      </div>
                      <p className="text-sm text-gray-600">Artist</p>
                    </div>
                    <Link to={`/artist/${product.artist.id}`}>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">Quantity:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded px-3 py-1"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={addToCart}
                  disabled={addingToCart || product.stock_quantity === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <Button variant="outline" onClick={toggleFavorite}>
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Link to="/custom-studio" className="block">
                <Button variant="outline" className="w-full">
                  <Palette className="h-4 w-4 mr-2" />
                  Customize This Design
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.customer?.avatar_url || ''} alt={review.customer?.full_name || ''} />
                          <AvatarFallback>
                            {review.customer?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.customer?.full_name || 'Anonymous'}</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetails
