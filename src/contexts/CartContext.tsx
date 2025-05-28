import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  customization?: any
  created_at: string
  updated_at: string
  product?: {
    id: string
    title: string
    price: number
    image_url: string
    artist_id: string
    artist?: {
      full_name: string
    }
  }
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  loading: boolean
  addToCart: (productId: string, quantity?: number, customization?: any) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Calculate cart metrics
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0
    return total + (price * item.quantity)
  }, 0)

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (
            id,
            title,
            price,
            image_url,
            artist_id,
            artist:profiles!artist_id (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart items:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1, customization?: any) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add items to your cart',
        variant: 'destructive',
      })
      return
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId)

      if (existingItem) {
        // Update quantity if item exists
        await updateQuantity(existingItem.id, existingItem.quantity + quantity)
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            customization
          })

        if (error) throw error

        await fetchCartItems()
        toast({
          title: 'Added to Cart',
          description: 'Item has been added to your cart',
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user?.id)

      if (error) throw error

      setCartItems(prev => prev.filter(item => item.id !== itemId))
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart',
      })
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      })
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user?.id)

      if (error) throw error

      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      })
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart',
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      })
    }
  }

  // Refresh cart data
  const refreshCart = async () => {
    await fetchCartItems()
  }

  // Fetch cart items when user changes
  useEffect(() => {
    fetchCartItems()
  }, [user])

  const value: CartContextType = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
