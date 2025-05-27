// Favorites Service
// This service handles user favorites/wishlist functionality

import { supabase } from '@/lib/supabase'

export interface FavoriteItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: {
    id: string
    title: string
    price: number
    image_url: string
    artist_id: string
    artist?: {
      id: string
      name: string
      avatar_url: string
    }
  }
}

class FavoritesService {
  // Add item to favorites
  async addToFavorites(userId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add to favorites' 
      }
    }
  }

  // Remove item from favorites
  async removeFromFavorites(userId: string, productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove from favorites' 
      }
    }
  }

  // Get user's favorites
  async getUserFavorites(userId: string): Promise<{ data: FavoriteItem[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products (
            id,
            title,
            price,
            image_url,
            artist_id,
            artist:artist_profiles (
              id,
              name:full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as FavoriteItem[] }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch favorites' 
      }
    }
  }

  // Check if item is favorited
  async isFavorited(userId: string, productId: string): Promise<{ isFavorited: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return { isFavorited: false, error: error.message }
      }

      return { isFavorited: !!data }
    } catch (error) {
      return { 
        isFavorited: false, 
        error: error instanceof Error ? error.message : 'Failed to check favorite status' 
      }
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, productId: string): Promise<{ 
    isFavorited: boolean; 
    success: boolean; 
    error?: string 
  }> {
    try {
      const { isFavorited, error: checkError } = await this.isFavorited(userId, productId)
      
      if (checkError) {
        return { isFavorited: false, success: false, error: checkError }
      }

      if (isFavorited) {
        const { success, error } = await this.removeFromFavorites(userId, productId)
        return { isFavorited: false, success, error }
      } else {
        const { success, error } = await this.addToFavorites(userId, productId)
        return { isFavorited: true, success, error }
      }
    } catch (error) {
      return { 
        isFavorited: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle favorite' 
      }
    }
  }

  // Get favorites count for a product
  async getFavoritesCount(productId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

      if (error) {
        return { count: 0, error: error.message }
      }

      return { count: count || 0 }
    } catch (error) {
      return { 
        count: 0, 
        error: error instanceof Error ? error.message : 'Failed to get favorites count' 
      }
    }
  }

  // Get most favorited products
  async getMostFavorited(limit: number = 10): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          image_url,
          artist_id,
          favorites_count:favorites(count),
          artist:artist_profiles (
            id,
            name:full_name,
            avatar_url
          )
        `)
        .order('favorites_count', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch most favorited products' 
      }
    }
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService()

// Export types
export type { FavoriteItem }
