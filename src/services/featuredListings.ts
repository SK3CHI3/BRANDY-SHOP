import { supabase } from '@/lib/supabase'
import { instaPayService } from './instapay'

export interface FeaturedListing {
  id: string
  product_id: string
  artist_id: string
  payment_amount: number
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  featured_from: string
  featured_until: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  product?: {
    id: string
    title: string
    image_url: string
    price: number
  }
  artist?: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export interface FeaturedListingRequest {
  productId: string
  artistId: string
  duration: number // in days
  paymentMethod: 'mpesa' | 'card'
  phoneNumber?: string // for M-Pesa
  cardDetails?: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
  }
}

export interface FeaturedListingPricing {
  duration: number // days
  price: number // KSh
  discount?: number // percentage
}

class FeaturedListingsService {
  // Pricing tiers for featured listings
  private pricingTiers: FeaturedListingPricing[] = [
    { duration: 7, price: 300 }, // 1 week - KSh 300
    { duration: 14, price: 500, discount: 15 }, // 2 weeks - KSh 500 (15% discount)
    { duration: 30, price: 800, discount: 25 }, // 1 month - KSh 800 (25% discount)
    { duration: 90, price: 2000, discount: 35 }, // 3 months - KSh 2000 (35% discount)
  ]

  // Get pricing options
  getPricingTiers(): FeaturedListingPricing[] {
    return this.pricingTiers
  }

  // Calculate price for duration
  calculatePrice(duration: number): number {
    const tier = this.pricingTiers.find(t => t.duration === duration)
    if (tier) {
      return tier.price
    }
    
    // For custom durations, calculate based on daily rate
    const dailyRate = 50 // KSh 50 per day
    return duration * dailyRate
  }

  // Create featured listing request
  async createFeaturedListing(request: FeaturedListingRequest): Promise<{
    success: boolean
    listingId?: string
    paymentUrl?: string
    error?: string
  }> {
    try {
      const price = this.calculatePrice(request.duration)
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + request.duration)

      // Create featured listing record
      const { data: listing, error: listingError } = await supabase
        .from('featured_listings')
        .insert({
          product_id: request.productId,
          artist_id: request.artistId,
          payment_amount: price,
          payment_method: request.paymentMethod,
          payment_status: 'pending',
          featured_until: featuredUntil.toISOString(),
          is_active: false
        })
        .select()
        .single()

      if (listingError) throw listingError

      // Process payment
      let paymentResult
      if (request.paymentMethod === 'mpesa' && request.phoneNumber) {
        paymentResult = await instaPayService.initiatePayment({
          amount: price,
          phoneNumber: request.phoneNumber,
          orderId: listing.id,
          description: `Featured listing for product`,
          currency: 'KES',
          customerEmail: '', // Will be filled from user profile
          customerName: '', // Will be filled from user profile
          callbackUrl: `${window.location.origin}/api/payments/featured-callback`
        })
      } else if (request.paymentMethod === 'card' && request.cardDetails) {
        paymentResult = await instaPayService.processCardPayment({
          amount: price,
          currency: 'KES',
          orderId: listing.id,
          description: `Featured listing for product`,
          customerEmail: '',
          customerName: '',
          callbackUrl: `${window.location.origin}/api/payments/featured-callback`,
          ...request.cardDetails
        })
      } else {
        throw new Error('Invalid payment method or missing payment details')
      }

      if (paymentResult?.success) {
        // Update listing with transaction ID
        await supabase
          .from('featured_listings')
          .update({ 
            transaction_id: paymentResult.transactionId,
            payment_status: paymentResult.status === 'completed' ? 'completed' : 'pending'
          })
          .eq('id', listing.id)

        return {
          success: true,
          listingId: listing.id,
          paymentUrl: paymentResult.paymentUrl
        }
      } else {
        // Delete the listing if payment failed
        await supabase
          .from('featured_listings')
          .delete()
          .eq('id', listing.id)

        return {
          success: false,
          error: paymentResult?.message || 'Payment failed'
        }
      }
    } catch (error) {
      console.error('Error creating featured listing:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create featured listing'
      }
    }
  }

  // Get artist's featured listings
  async getArtistFeaturedListings(artistId: string): Promise<{
    data: FeaturedListing[] | null
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('featured_listings')
        .select(`
          *,
          product:products(id, title, image_url, price),
          artist:profiles(id, full_name, avatar_url)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch featured listings'
      }
    }
  }

  // Get active featured products
  async getActiveFeaturedProducts(): Promise<{
    data: any[] | null
    error?: string
  }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('featured_listings')
        .select(`
          *,
          product:products(
            id, title, description, price, image_url, artist_id,
            artist:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('is_active', true)
        .eq('payment_status', 'completed')
        .lte('featured_from', now)
        .gte('featured_until', now)
        .order('featured_from', { ascending: false })

      if (error) throw error

      return { data: data?.map(listing => listing.product) || [] }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch featured products'
      }
    }
  }

  // Handle payment callback
  async handlePaymentCallback(listingId: string, paymentStatus: string, transactionId?: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      }

      if (transactionId) {
        updateData.transaction_id = transactionId
      }

      if (paymentStatus === 'completed') {
        updateData.is_active = true
        
        // Also update the product's is_featured status
        const { data: listing } = await supabase
          .from('featured_listings')
          .select('product_id')
          .eq('id', listingId)
          .single()

        if (listing) {
          await supabase
            .from('products')
            .update({ is_featured: true })
            .eq('id', listing.product_id)
        }
      }

      const { error } = await supabase
        .from('featured_listings')
        .update(updateData)
        .eq('id', listingId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment status'
      }
    }
  }

  // Expire featured listings
  async expireFeaturedListings(): Promise<{
    success: boolean
    expiredCount?: number
    error?: string
  }> {
    try {
      const now = new Date().toISOString()
      
      // Get expired listings
      const { data: expiredListings, error: fetchError } = await supabase
        .from('featured_listings')
        .select('id, product_id')
        .eq('is_active', true)
        .lt('featured_until', now)

      if (fetchError) throw fetchError

      if (expiredListings && expiredListings.length > 0) {
        // Deactivate expired listings
        const { error: updateError } = await supabase
          .from('featured_listings')
          .update({ is_active: false })
          .in('id', expiredListings.map(l => l.id))

        if (updateError) throw updateError

        // Update products to remove featured status
        const productIds = expiredListings.map(l => l.product_id)
        await supabase
          .from('products')
          .update({ is_featured: false })
          .in('id', productIds)

        return {
          success: true,
          expiredCount: expiredListings.length
        }
      }

      return { success: true, expiredCount: 0 }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to expire featured listings'
      }
    }
  }

  // Get featured listings revenue stats
  async getFeaturedListingsRevenue(): Promise<{
    totalRevenue: number
    monthlyRevenue: number
    activeListings: number
    error?: string
  }> {
    try {
      // Get total revenue
      const { data: totalData, error: totalError } = await supabase
        .from('featured_listings')
        .select('payment_amount')
        .eq('payment_status', 'completed')

      if (totalError) throw totalError

      const totalRevenue = totalData?.reduce((sum, listing) => sum + listing.payment_amount, 0) || 0

      // Get monthly revenue
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('featured_listings')
        .select('payment_amount')
        .eq('payment_status', 'completed')
        .gte('created_at', monthStart.toISOString())

      if (monthlyError) throw monthlyError

      const monthlyRevenue = monthlyData?.reduce((sum, listing) => sum + listing.payment_amount, 0) || 0

      // Get active listings count
      const now = new Date().toISOString()
      const { count: activeListings, error: countError } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('payment_status', 'completed')
        .lte('featured_from', now)
        .gte('featured_until', now)

      if (countError) throw countError

      return {
        totalRevenue,
        monthlyRevenue,
        activeListings: activeListings || 0
      }
    } catch (error) {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeListings: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue stats'
      }
    }
  }
}

export const featuredListingsService = new FeaturedListingsService()
