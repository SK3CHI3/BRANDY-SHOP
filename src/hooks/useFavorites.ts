import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoritesService, FavoriteItem } from '@/services/favorites'
import { toast } from '@/hooks/use-toast'

export const useFavorites = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await favoritesService.getUserFavorites(user.id)
      
      if (error) {
        setError(error)
        toast({
          title: 'Error',
          description: 'Failed to load favorites',
          variant: 'destructive',
        })
      } else {
        setFavorites(data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  // Add to favorites
  const addToFavorites = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to add items to favorites',
        variant: 'destructive',
      })
      return false
    }

    try {
      const { success, error } = await favoritesService.addToFavorites(user.id, productId)
      
      if (success) {
        await fetchFavorites() // Refresh favorites list
        toast({
          title: 'Added to Favorites',
          description: 'Item has been added to your favorites',
        })
        return true
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to add to favorites',
          variant: 'destructive',
        })
        return false
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add to favorites',
        variant: 'destructive',
      })
      return false
    }
  }

  // Remove from favorites
  const removeFromFavorites = async (productId: string) => {
    if (!user) return false

    try {
      const { success, error } = await favoritesService.removeFromFavorites(user.id, productId)
      
      if (success) {
        await fetchFavorites() // Refresh favorites list
        toast({
          title: 'Removed from Favorites',
          description: 'Item has been removed from your favorites',
        })
        return true
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to remove from favorites',
          variant: 'destructive',
        })
        return false
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      })
      return false
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to manage favorites',
        variant: 'destructive',
      })
      return false
    }

    try {
      const { isFavorited, success, error } = await favoritesService.toggleFavorite(user.id, productId)
      
      if (success) {
        await fetchFavorites() // Refresh favorites list
        toast({
          title: isFavorited ? 'Added to Favorites' : 'Removed from Favorites',
          description: isFavorited 
            ? 'Item has been added to your favorites'
            : 'Item has been removed from your favorites',
        })
        return isFavorited
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to update favorites',
          variant: 'destructive',
        })
        return false
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      })
      return false
    }
  }

  // Check if item is favorited
  const isFavorited = (productId: string): boolean => {
    return favorites.some(fav => fav.product_id === productId)
  }

  // Get favorites count
  const favoritesCount = favorites.length

  useEffect(() => {
    fetchFavorites()
  }, [user])

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    favoritesCount,
    refetch: fetchFavorites
  }
}

export const useFavoriteStatus = (productId: string) => {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkFavoriteStatus = async () => {
    if (!user || !productId) {
      setIsFavorited(false)
      setLoading(false)
      return
    }

    try {
      const { isFavorited: favorited } = await favoritesService.isFavorited(user.id, productId)
      setIsFavorited(favorited)
    } catch (err) {
      setIsFavorited(false)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to manage favorites',
        variant: 'destructive',
      })
      return false
    }

    try {
      const { isFavorited: newStatus, success, error } = await favoritesService.toggleFavorite(user.id, productId)
      
      if (success) {
        setIsFavorited(newStatus)
        toast({
          title: newStatus ? 'Added to Favorites' : 'Removed from Favorites',
          description: newStatus 
            ? 'Item has been added to your favorites'
            : 'Item has been removed from your favorites',
        })
        return newStatus
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to update favorites',
          variant: 'destructive',
        })
        return isFavorited
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      })
      return isFavorited
    }
  }

  useEffect(() => {
    checkFavoriteStatus()
  }, [user, productId])

  return {
    isFavorited,
    loading,
    toggleFavorite
  }
}
