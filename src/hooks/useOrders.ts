import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ordersService, Order, OrderTracking } from '@/services/orders'
import { toast } from '@/hooks/use-toast'

export const useOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { orders, error } = await ordersService.getUserOrders(user.id)
      
      if (error) {
        setError(error)
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        })
      } else {
        setOrders(orders || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  // Create new order
  const createOrder = async (orderData: {
    items: Array<{
      product_id: string
      quantity: number
      price: number
      customization?: any
    }>
    shipping_address: any
    payment_method: string
    total_amount: number
  }) => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to place an order',
        variant: 'destructive',
      })
      return null
    }

    try {
      const { order, error } = await ordersService.createOrder({
        user_id: user.id,
        ...orderData
      })
      
      if (error) {
        toast({
          title: 'Order Failed',
          description: error,
          variant: 'destructive',
        })
        return null
      } else {
        await fetchOrders() // Refresh orders list
        toast({
          title: 'Order Created',
          description: 'Your order has been created successfully',
        })
        return order
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      })
      return null
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user])

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: fetchOrders
  }
}

export const useOrder = (orderId?: string, orderNumber?: string) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!orderId && !orderNumber) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let result

      if (orderId) {
        result = await ordersService.getOrder(orderId)
      } else if (orderNumber) {
        result = await ordersService.getOrderByNumber(orderNumber)
      }

      if (result?.error) {
        setError(result.error)
        setOrder(null)
      } else {
        setOrder(result?.order || null)
        setError(null)
      }
    } catch (err) {
      setError('Failed to load order')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId, orderNumber])

  return {
    order,
    loading,
    error,
    refetch: fetchOrder
  }
}

export const useOrderTracking = (orderId: string) => {
  const [tracking, setTracking] = useState<OrderTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTracking = async () => {
    if (!orderId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { tracking, error } = await ordersService.getOrderTracking(orderId)
      
      if (error) {
        setError(error)
        setTracking([])
      } else {
        setTracking(tracking || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load tracking information')
      setTracking([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracking()
  }, [orderId])

  return {
    tracking,
    loading,
    error,
    refetch: fetchTracking
  }
}

export const useArtistOrders = () => {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArtistOrders = async () => {
    if (!user || !profile || profile.role !== 'artist') {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { orders, error } = await ordersService.getArtistOrders(user.id)
      
      if (error) {
        setError(error)
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        })
      } else {
        setOrders(orders || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtistOrders()
  }, [user, profile])

  return {
    orders,
    loading,
    error,
    refetch: fetchArtistOrders
  }
}
