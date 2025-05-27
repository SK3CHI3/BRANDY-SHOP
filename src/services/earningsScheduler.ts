// Earnings Scheduler Service
// Handles scheduled maintenance of artist earnings and automatic status updates

import { supabase } from '@/lib/supabase'

export interface EarningsMaintenanceResult {
  pending_updated: number
  artists_affected: number
  total_amount_released: number
  execution_time: string
}

export interface EarningsStatistics {
  total_artists: number
  total_earnings: number
  pending_earnings: number
  available_earnings: number
  withdrawn_earnings: number
  pending_withdrawals: number
  completed_withdrawals: number
}

class EarningsSchedulerService {
  // Run scheduled maintenance to update pending earnings to available
  async runScheduledMaintenance(): Promise<{ result: EarningsMaintenanceResult | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('scheduled_earnings_maintenance')

      if (error) throw error

      return { result: data?.[0] || null }
    } catch (error) {
      console.error('Scheduled earnings maintenance failed:', error)
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Maintenance failed'
      }
    }
  }

  // Update specific pending earnings to available (manual trigger)
  async updatePendingEarnings(): Promise<{ updated_count: number; affected_artists: string[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('update_pending_earnings_to_available')

      if (error) throw error

      const result = data?.[0] || { updated_count: 0, affected_artists: [] }
      
      return {
        updated_count: result.updated_count,
        affected_artists: result.affected_artists || []
      }
    } catch (error) {
      console.error('Failed to update pending earnings:', error)
      return {
        updated_count: 0,
        affected_artists: [],
        error: error instanceof Error ? error.message : 'Update failed'
      }
    }
  }

  // Get comprehensive earnings statistics
  async getEarningsStatistics(): Promise<{ statistics: EarningsStatistics | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_earnings_statistics')

      if (error) throw error

      return { statistics: data?.[0] || null }
    } catch (error) {
      console.error('Failed to get earnings statistics:', error)
      return {
        statistics: null,
        error: error instanceof Error ? error.message : 'Failed to get statistics'
      }
    }
  }

  // Process earnings for a specific order (manual trigger for testing)
  async processOrderEarnings(orderId: string): Promise<{ earnings_created: number; total_amount: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('process_order_earnings', { order_uuid: orderId })

      if (error) throw error

      const result = data?.[0] || { earnings_created: 0, total_amount: 0 }
      
      return {
        earnings_created: result.earnings_created,
        total_amount: result.total_amount
      }
    } catch (error) {
      console.error('Failed to process order earnings:', error)
      return {
        earnings_created: 0,
        total_amount: 0,
        error: error instanceof Error ? error.message : 'Processing failed'
      }
    }
  }

  // Get earnings that are ready to be made available
  async getPendingEarningsReadyForRelease(): Promise<{ earnings: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_earnings')
        .select(`
          id,
          artist_id,
          gross_amount,
          platform_fee,
          net_amount,
          available_for_withdrawal_at,
          created_at,
          artist:profiles!artist_id(full_name, email)
        `)
        .eq('status', 'pending')
        .lte('available_for_withdrawal_at', new Date().toISOString())
        .order('available_for_withdrawal_at', { ascending: true })

      if (error) throw error

      return { earnings: data || [] }
    } catch (error) {
      console.error('Failed to get pending earnings:', error)
      return {
        earnings: [],
        error: error instanceof Error ? error.message : 'Failed to get pending earnings'
      }
    }
  }

  // Get recent earnings activity
  async getRecentEarningsActivity(limit: number = 20): Promise<{ activities: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_earnings')
        .select(`
          id,
          artist_id,
          order_id,
          earning_type,
          gross_amount,
          platform_fee,
          net_amount,
          status,
          created_at,
          updated_at,
          artist:profiles!artist_id(full_name, email),
          order:orders!order_id(id, total_amount)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { activities: data || [] }
    } catch (error) {
      console.error('Failed to get recent earnings activity:', error)
      return {
        activities: [],
        error: error instanceof Error ? error.message : 'Failed to get activity'
      }
    }
  }

  // Get maintenance log
  async getMaintenanceLog(limit: number = 50): Promise<{ logs: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('maintenance_log')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { logs: data || [] }
    } catch (error) {
      console.error('Failed to get maintenance log:', error)
      return {
        logs: [],
        error: error instanceof Error ? error.message : 'Failed to get logs'
      }
    }
  }

  // Check if earnings maintenance is needed
  async isMaintenanceNeeded(): Promise<{ needed: boolean; count: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_earnings')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')
        .lte('available_for_withdrawal_at', new Date().toISOString())

      if (error) throw error

      const count = data?.length || 0
      
      return {
        needed: count > 0,
        count: count
      }
    } catch (error) {
      console.error('Failed to check maintenance status:', error)
      return {
        needed: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Check failed'
      }
    }
  }

  // Schedule automatic maintenance (this would typically be called by a cron job)
  async scheduleAutomaticMaintenance(): Promise<void> {
    try {
      const { needed, count } = await this.isMaintenanceNeeded()
      
      if (needed && count > 0) {
        console.log(`Running automatic maintenance for ${count} pending earnings...`)
        
        const { result, error } = await this.runScheduledMaintenance()
        
        if (error) {
          console.error('Automatic maintenance failed:', error)
        } else if (result) {
          console.log(`Automatic maintenance completed:`, result)
        }
      } else {
        console.log('No maintenance needed at this time')
      }
    } catch (error) {
      console.error('Automatic maintenance scheduling failed:', error)
    }
  }

  // Format earnings amount for display
  formatAmount(amount: number): string {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Calculate platform fee
  calculatePlatformFee(grossAmount: number, feeRate: number = 0.05): number {
    return grossAmount * feeRate
  }

  // Calculate net amount after platform fee
  calculateNetAmount(grossAmount: number, feeRate: number = 0.05): number {
    return grossAmount * (1 - feeRate)
  }
}

// Export singleton instance
export const earningsSchedulerService = new EarningsSchedulerService()

// Export types
export type { EarningsMaintenanceResult, EarningsStatistics }
