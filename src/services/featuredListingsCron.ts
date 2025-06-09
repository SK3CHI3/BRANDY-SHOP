import { supabase } from '@/lib/supabase'

/**
 * Cron job service for managing featured listings
 * This should be called periodically (e.g., every hour) to:
 * 1. Expire featured listings that have passed their end date
 * 2. Update product featured status accordingly
 * 3. Clean up inactive listings
 */

class FeaturedListingsCronService {
  
  /**
   * Main cron job function to handle featured listing expiry
   * Should be called every hour or as needed
   */
  async runExpiryJob(): Promise<{
    success: boolean
    expiredCount: number
    updatedProducts: number
    error?: string
  }> {
    try {
      console.log('🕐 Running featured listings expiry job...')
      
      // Call the database function to handle expiry
      const { data, error } = await supabase.rpc('handle_featured_listing_expiry')
      
      if (error) {
        console.error('❌ Featured listings expiry job failed:', error)
        return {
          success: false,
          expiredCount: 0,
          updatedProducts: 0,
          error: error.message
        }
      }
      
      // Get counts of expired listings and updated products
      const expiredCount = await this.getExpiredListingsCount()
      const updatedProducts = await this.getRecentlyUpdatedProductsCount()
      
      console.log(`✅ Featured listings expiry job completed. Expired: ${expiredCount}, Updated products: ${updatedProducts}`)
      
      return {
        success: true,
        expiredCount,
        updatedProducts
      }
    } catch (error) {
      console.error('❌ Featured listings expiry job error:', error)
      return {
        success: false,
        expiredCount: 0,
        updatedProducts: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Get count of recently expired listings
   */
  private async getExpiredListingsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
        .lt('featured_until', new Date().toISOString())
        .gte('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting expired listings count:', error)
      return 0
    }
  }
  
  /**
   * Get count of recently updated products (featured status removed)
   */
  private async getRecentlyUpdatedProductsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', false)
        .gte('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting updated products count:', error)
      return 0
    }
  }
  
  /**
   * Manually expire a specific featured listing
   */
  async expireSpecificListing(listingId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Get the listing details first
      const { data: listing, error: fetchError } = await supabase
        .from('featured_listings')
        .select('product_id')
        .eq('id', listingId)
        .single()
      
      if (fetchError) throw fetchError
      
      // Deactivate the listing
      const { error: updateError } = await supabase
        .from('featured_listings')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', listingId)
      
      if (updateError) throw updateError
      
      // Check if product has any other active featured listings
      const { data: otherListings, error: checkError } = await supabase
        .from('featured_listings')
        .select('id')
        .eq('product_id', listing.product_id)
        .eq('is_active', true)
        .eq('payment_status', 'completed')
        .lte('featured_from', new Date().toISOString())
        .gt('featured_until', new Date().toISOString())
      
      if (checkError) throw checkError
      
      // If no other active listings, remove featured status from product
      if (!otherListings || otherListings.length === 0) {
        const { error: productUpdateError } = await supabase
          .from('products')
          .update({ 
            is_featured: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', listing.product_id)
        
        if (productUpdateError) throw productUpdateError
      }
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to expire listing'
      }
    }
  }
  
  /**
   * Get statistics about featured listings
   */
  async getStats(): Promise<{
    totalActive: number
    totalExpired: number
    totalRevenue: number
    monthlyRevenue: number
    expiringToday: number
    expiringThisWeek: number
  }> {
    try {
      const now = new Date()
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Get active listings count
      const { count: totalActive } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('payment_status', 'completed')
        .lte('featured_from', now.toISOString())
        .gt('featured_until', now.toISOString())
      
      // Get expired listings count
      const { count: totalExpired } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
        .lt('featured_until', now.toISOString())
      
      // Get total revenue
      const { data: revenueData } = await supabase
        .from('featured_listings')
        .select('payment_amount')
        .eq('payment_status', 'completed')
      
      const totalRevenue = revenueData?.reduce((sum, item) => sum + item.payment_amount, 0) || 0
      
      // Get monthly revenue
      const { data: monthlyData } = await supabase
        .from('featured_listings')
        .select('payment_amount')
        .eq('payment_status', 'completed')
        .gte('created_at', monthStart.toISOString())
      
      const monthlyRevenue = monthlyData?.reduce((sum, item) => sum + item.payment_amount, 0) || 0
      
      // Get listings expiring today
      const { count: expiringToday } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('featured_until', todayEnd.toISOString())
        .gt('featured_until', now.toISOString())
      
      // Get listings expiring this week
      const { count: expiringThisWeek } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('featured_until', weekEnd.toISOString())
        .gt('featured_until', now.toISOString())
      
      return {
        totalActive: totalActive || 0,
        totalExpired: totalExpired || 0,
        totalRevenue,
        monthlyRevenue,
        expiringToday: expiringToday || 0,
        expiringThisWeek: expiringThisWeek || 0
      }
    } catch (error) {
      console.error('Error getting featured listings stats:', error)
      return {
        totalActive: 0,
        totalExpired: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        expiringToday: 0,
        expiringThisWeek: 0
      }
    }
  }
  
  /**
   * Send notifications to artists about expiring featured listings
   */
  async notifyExpiringListings(): Promise<{
    success: boolean
    notificationsSent: number
    error?: string
  }> {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)
      
      // Get listings expiring in the next 24 hours
      const { data: expiringListings, error } = await supabase
        .from('featured_listings')
        .select(`
          id,
          featured_until,
          payment_amount,
          product:products(id, title),
          artist:profiles(id, full_name, email)
        `)
        .eq('is_active', true)
        .eq('payment_status', 'completed')
        .lte('featured_until', tomorrow.toISOString())
        .gt('featured_until', new Date().toISOString())
      
      if (error) throw error
      
      let notificationsSent = 0
      
      // In a real implementation, you would send emails or push notifications here
      // For now, we'll just log the notifications that would be sent
      for (const listing of expiringListings || []) {
        console.log(`📧 Would notify ${listing.artist?.full_name} (${listing.artist?.email}) about expiring featured listing for "${listing.product?.title}"`)
        notificationsSent++
      }
      
      return {
        success: true,
        notificationsSent
      }
    } catch (error) {
      return {
        success: false,
        notificationsSent: 0,
        error: error instanceof Error ? error.message : 'Failed to send notifications'
      }
    }
  }
}

// Export singleton instance
export const featuredListingsCronService = new FeaturedListingsCronService()

// Export function for easy cron job setup
export const runFeaturedListingsExpiry = () => featuredListingsCronService.runExpiryJob()

// Example usage in a cron job or scheduled function:
/*
// Set up a cron job to run every hour
setInterval(async () => {
  const result = await runFeaturedListingsExpiry()
  console.log('Featured listings expiry job result:', result)
}, 60 * 60 * 1000) // Every hour

// Or use with a proper cron job library like node-cron:
// import cron from 'node-cron'
// cron.schedule('0 * * * *', runFeaturedListingsExpiry) // Every hour
*/
