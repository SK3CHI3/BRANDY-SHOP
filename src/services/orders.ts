// Orders Service
// This service handles order management and tracking

import { supabase } from '@/lib/supabase'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  customization?: any
  product?: {
    id: string
    title: string
    image_url: string
    artist_id: string
  }
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address: any
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  created_at: string
  updated_at: string
  estimated_delivery?: string
  tracking_number?: string
  items?: OrderItem[]
}

export interface OrderTracking {
  id: string
  order_id: string
  status: string
  description: string
  timestamp: string
  location?: string
}

class OrdersService {
  // Create a new order
  async createOrder(orderData: {
    user_id: string
    items: Array<{
      product_id: string
      quantity: number
      price: number
      customization?: any
    }>
    shipping_address: any
    payment_method: string
    total_amount: number
  }): Promise<{ order: Order | null; error?: string }> {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          order_number: orderNumber,
          status: 'pending',
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        return { order: null, error: orderError.message }
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id)
        return { order: null, error: itemsError.message }
      }

      // Create initial tracking entry
      await this.addTrackingUpdate(order.id, 'Order Placed', 'Your order has been received and is being processed')

      return { order: order as Order }
    } catch (error) {
      return { 
        order: null, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      }
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<{ order: Order | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            *,
            product:products (
              id,
              title,
              image_url,
              artist_id
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data as Order }
    } catch (error) {
      return { 
        order: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch order' 
      }
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<{ order: Order | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            *,
            product:products (
              id,
              title,
              image_url,
              artist_id
            )
          )
        `)
        .eq('order_number', orderNumber)
        .single()

      if (error) {
        return { order: null, error: error.message }
      }

      return { order: data as Order }
    } catch (error) {
      return { 
        order: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch order' 
      }
    }
  }

  // Get user orders
  async getUserOrders(userId: string, limit: number = 20): Promise<{ orders: Order[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            *,
            product:products (
              id,
              title,
              image_url,
              artist_id
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { orders: null, error: error.message }
      }

      return { orders: data as Order[] }
    } catch (error) {
      return { 
        orders: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      }
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order status' 
      }
    }
  }

  // Update payment status
  async updatePaymentStatus(
    orderId: string, 
    paymentStatus: Order['payment_status'], 
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      }

      if (transactionId) {
        updateData.transaction_id = transactionId
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        return { success: false, error: error.message }
      }

      // If payment is completed, update order status to confirmed
      if (paymentStatus === 'completed') {
        await this.updateOrderStatus(orderId, 'confirmed')
        await this.addTrackingUpdate(orderId, 'Payment Confirmed', 'Payment has been successfully processed')
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update payment status' 
      }
    }
  }

  // Add tracking update
  async addTrackingUpdate(
    orderId: string, 
    status: string, 
    description: string, 
    location?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status,
          description,
          location,
          timestamp: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add tracking update' 
      }
    }
  }

  // Get order tracking
  async getOrderTracking(orderId: string): Promise<{ tracking: OrderTracking[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true })

      if (error) {
        return { tracking: null, error: error.message }
      }

      return { tracking: data as OrderTracking[] }
    } catch (error) {
      return { 
        tracking: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch order tracking' 
      }
    }
  }

  // Get orders for artist (their products)
  async getArtistOrders(artistId: string, limit: number = 20): Promise<{ orders: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (*),
          product:products (
            id,
            title,
            image_url,
            artist_id
          )
        `)
        .eq('product.artist_id', artistId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { orders: null, error: error.message }
      }

      return { orders: data }
    } catch (error) {
      return { 
        orders: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch artist orders' 
      }
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService()

// Export types
export type { Order, OrderItem, OrderTracking }
