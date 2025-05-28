// Notifications Service
// This service handles all notification functionality

import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  user_id: string
  type: 'order' | 'message' | 'review' | 'favorite' | 'payment' | 'system'
  title: string
  message: string
  action_url?: string
  read_at?: string
  priority: 'low' | 'medium' | 'high'
  metadata: any
  created_at: string
}

class NotificationsService {
  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50): Promise<{ notifications: Notification[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { notifications: null, error: error.message }
      }

      return { notifications: data || [] }
    } catch (error) {
      return {
        notifications: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      }
    }
  }

  // Get notifications by type
  async getNotificationsByType(userId: string, type: string, limit: number = 50): Promise<{ notifications: Notification[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { notifications: null, error: error.message }
      }

      return { notifications: data || [] }
    } catch (error) {
      return {
        notifications: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      }
    }
  }

  // Get unread notifications
  async getUnreadNotifications(userId: string): Promise<{ notifications: Notification[] | null; count: number; error?: string }> {
    try {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        return { notifications: null, count: 0, error: error.message }
      }

      return { notifications: data || [], count: count || 0 }
    } catch (error) {
      return {
        notifications: null,
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch unread notifications'
      }
    }
  }

  // Create notification
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    actionUrl?: string,
    priority: Notification['priority'] = 'medium',
    metadata: any = {}
  ): Promise<{ notification: Notification | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          action_url: actionUrl,
          priority,
          metadata
        })
        .select()
        .single()

      if (error) {
        return { notification: null, error: error.message }
      }

      return { notification: data }
    } catch (error) {
      return {
        notification: null,
        error: error instanceof Error ? error.message : 'Failed to create notification'
      }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      }
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      }
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete notification'
      }
    }
  }

  // Auto-generate notifications for system events
  async createOrderNotification(userId: string, orderId: string, status: string): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed',
      processing: 'Your order is being prepared for shipment',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully'
    }

    const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}`

    await this.createNotification(
      userId,
      'order',
      'Order Update',
      message,
      `/order-tracking/${orderId}`,
      'high',
      { order_id: orderId, status }
    )
  }

  async createReviewNotification(artistId: string, productId: string, rating: number): Promise<void> {
    await this.createNotification(
      artistId,
      'review',
      'New Review',
      `You received a ${rating}-star review on your design`,
      `/product/${productId}`,
      'medium',
      { product_id: productId, rating }
    )
  }

  async createFavoriteNotification(artistId: string, productId: string): Promise<void> {
    await this.createNotification(
      artistId,
      'favorite',
      'Design Favorited',
      'Someone added your design to their favorites',
      `/product/${productId}`,
      'low',
      { product_id: productId }
    )
  }

  async createPaymentNotification(artistId: string, amount: number): Promise<void> {
    await this.createNotification(
      artistId,
      'payment',
      'Payment Received',
      `You received KSh ${amount.toLocaleString()} for your recent sales`,
      '/analytics',
      'high',
      { amount }
    )
  }

  async createSystemNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<void> {
    await this.createNotification(
      userId,
      'system',
      title,
      message,
      actionUrl,
      'medium',
      {}
    )
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export const notificationsService = new NotificationsService()
