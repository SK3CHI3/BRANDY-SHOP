// Artist Withdrawal Service
// Handles all withdrawal-related operations for artists

import { supabase } from '@/lib/supabase'
import { instaPayService } from './instapay'

export interface WithdrawalRequest {
  id?: string
  artist_id: string
  amount: number
  mpesa_phone: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  request_notes?: string
  admin_notes?: string
  requested_at?: string
  reviewed_at?: string
  reviewed_by?: string
  completed_at?: string
  transaction_id?: string
  failure_reason?: string
  created_at?: string
  updated_at?: string
}

export interface WithdrawalTransaction {
  id?: string
  withdrawal_id: string
  transaction_type: 'mpesa_transfer' | 'bank_transfer' | 'manual'
  external_transaction_id?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  provider_response?: any
  fees: number
  net_amount: number
  processed_at?: string
  created_at?: string
  updated_at?: string
}

export interface ArtistEarning {
  id?: string
  artist_id: string
  order_id?: string
  product_id?: string
  earning_type: 'sale' | 'commission' | 'bonus' | 'refund'
  gross_amount: number
  platform_fee: number
  net_amount: number
  status: 'pending' | 'available' | 'withdrawn' | 'on_hold'
  available_for_withdrawal_at?: string
  withdrawn_at?: string
  withdrawal_id?: string
  created_at?: string
  updated_at?: string
}

export interface WithdrawalSummary {
  available_balance: number
  pending_withdrawals: number
  total_withdrawn: number
  minimum_withdrawal: number
  next_available_date?: string
}

class WithdrawalService {
  private readonly MINIMUM_WITHDRAWAL = 1000 // KSh 1,000
  private readonly PLATFORM_FEE_RATE = 0.05 // 5% platform fee
  private readonly WITHDRAWAL_HOLD_DAYS = 7 // 7 days hold period

  // Get artist's withdrawal summary with profile details
  async getWithdrawalSummary(artistId: string): Promise<{ summary: WithdrawalSummary | null; error?: string }> {
    try {
      // Get available earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('*')
        .eq('artist_id', artistId)
        .eq('status', 'available')
        .lte('available_for_withdrawal_at', new Date().toISOString())

      if (earningsError) throw earningsError

      // Get pending withdrawals
      const { data: pendingWithdrawals, error: pendingError } = await supabase
        .from('artist_withdrawals')
        .select('amount')
        .eq('artist_id', artistId)
        .in('status', ['pending', 'approved'])

      if (pendingError) throw pendingError

      // Get total withdrawn amount
      const { data: completedWithdrawals, error: completedError } = await supabase
        .from('artist_withdrawals')
        .select('amount')
        .eq('artist_id', artistId)
        .eq('status', 'completed')

      if (completedError) throw completedError

      // Get next available earnings date
      const { data: nextEarnings, error: nextError } = await supabase
        .from('artist_earnings')
        .select('available_for_withdrawal_at')
        .eq('artist_id', artistId)
        .eq('status', 'pending')
        .order('available_for_withdrawal_at', { ascending: true })
        .limit(1)

      if (nextError) throw nextError

      const availableBalance = earnings?.reduce((sum, earning) => sum + earning.net_amount, 0) || 0
      const pendingAmount = pendingWithdrawals?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0
      const totalWithdrawn = completedWithdrawals?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0

      const summary: WithdrawalSummary = {
        available_balance: availableBalance,
        pending_withdrawals: pendingAmount,
        total_withdrawn: totalWithdrawn,
        minimum_withdrawal: this.MINIMUM_WITHDRAWAL,
        next_available_date: nextEarnings?.[0]?.available_for_withdrawal_at
      }

      return { summary }
    } catch (error) {
      return {
        summary: null,
        error: error instanceof Error ? error.message : 'Failed to get withdrawal summary'
      }
    }
  }

  // Get artist profile with payment details
  async getArtistPaymentProfile(artistId: string): Promise<{ profile: any | null; error?: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          artist_profiles (
            total_earnings,
            completed_orders,
            rating,
            total_reviews,
            is_verified
          )
        `)
        .eq('id', artistId)
        .single()

      if (error) throw error

      return { profile }
    } catch (error) {
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Failed to get artist profile'
      }
    }
  }

  // Create withdrawal request
  async createWithdrawalRequest(
    artistId: string,
    amount: number,
    mpesaPhone: string,
    notes?: string
  ): Promise<{ withdrawal: WithdrawalRequest | null; error?: string }> {
    try {
      // Validate minimum amount
      if (amount < this.MINIMUM_WITHDRAWAL) {
        return {
          withdrawal: null,
          error: `Minimum withdrawal amount is KSh ${this.MINIMUM_WITHDRAWAL.toLocaleString()}`
        }
      }

      // Check available balance
      const { summary, error: summaryError } = await this.getWithdrawalSummary(artistId)
      if (summaryError || !summary) {
        return { withdrawal: null, error: summaryError || 'Failed to check balance' }
      }

      if (amount > summary.available_balance) {
        return {
          withdrawal: null,
          error: `Insufficient balance. Available: KSh ${summary.available_balance.toLocaleString()}`
        }
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(mpesaPhone)
      if (!formattedPhone) {
        return { withdrawal: null, error: 'Invalid M-Pesa phone number format' }
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from('artist_withdrawals')
        .insert({
          artist_id: artistId,
          amount: amount,
          mpesa_phone: formattedPhone,
          request_notes: notes,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { withdrawal: data }
    } catch (error) {
      return {
        withdrawal: null,
        error: error instanceof Error ? error.message : 'Failed to create withdrawal request'
      }
    }
  }

  // Get artist's withdrawal history
  async getWithdrawalHistory(
    artistId: string,
    limit: number = 20
  ): Promise<{ withdrawals: WithdrawalRequest[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_withdrawals')
        .select(`
          *,
          reviewed_by_profile:profiles!reviewed_by(full_name),
          withdrawal_transactions(*)
        `)
        .eq('artist_id', artistId)
        .order('requested_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { withdrawals: data }
    } catch (error) {
      return {
        withdrawals: null,
        error: error instanceof Error ? error.message : 'Failed to fetch withdrawal history'
      }
    }
  }

  // Admin: Get all pending withdrawals
  async getPendingWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_withdrawals')
        .select(`
          *,
          artist:profiles!artist_id(full_name, email, phone),
          artist_profile:artist_profiles!artist_id(total_earnings, completed_orders)
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true })

      if (error) throw error

      return { withdrawals: data }
    } catch (error) {
      return {
        withdrawals: null,
        error: error instanceof Error ? error.message : 'Failed to fetch pending withdrawals'
      }
    }
  }

  // Admin: Approve withdrawal request
  async approveWithdrawal(
    withdrawalId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('artist_withdrawals')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', withdrawalId)
        .eq('status', 'pending')

      if (error) throw error

      // Process the withdrawal automatically
      await this.processApprovedWithdrawal(withdrawalId)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve withdrawal'
      }
    }
  }

  // Admin: Reject withdrawal request
  async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('artist_withdrawals')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          admin_notes: reason,
          failure_reason: reason
        })
        .eq('id', withdrawalId)
        .eq('status', 'pending')

      if (error) throw error

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject withdrawal'
      }
    }
  }

  // Process approved withdrawal via M-Pesa
  private async processApprovedWithdrawal(withdrawalId: string): Promise<void> {
    try {
      // Get withdrawal details
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('artist_withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single()

      if (withdrawalError || !withdrawal) throw new Error('Withdrawal not found')

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('withdrawal_transactions')
        .insert({
          withdrawal_id: withdrawalId,
          transaction_type: 'mpesa_transfer',
          amount: withdrawal.amount,
          currency: 'KES',
          fees: 0, // No fees for M-Pesa transfers
          net_amount: withdrawal.amount,
          status: 'pending'
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Process M-Pesa transfer using withdrawal method
      const paymentResult = await instaPayService.simulateWithdrawal({
        amount: withdrawal.amount,
        phoneNumber: withdrawal.mpesa_phone,
        reference: `WD-${withdrawalId}`,
        description: `Withdrawal payment - KSh ${withdrawal.amount.toLocaleString()}`
      })

      if (paymentResult.success) {
        // Update withdrawal and transaction status
        await Promise.all([
          supabase
            .from('artist_withdrawals')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              transaction_id: paymentResult.transactionId
            })
            .eq('id', withdrawalId),

          supabase
            .from('withdrawal_transactions')
            .update({
              status: 'completed',
              external_transaction_id: paymentResult.transactionId,
              processed_at: new Date().toISOString(),
              provider_response: paymentResult
            })
            .eq('id', transaction.id)
        ])

        // Mark earnings as withdrawn
        await this.markEarningsAsWithdrawn(withdrawal.artist_id, withdrawal.amount, withdrawalId)
      } else {
        // Update withdrawal as failed
        await Promise.all([
          supabase
            .from('artist_withdrawals')
            .update({
              status: 'failed',
              failure_reason: paymentResult.message
            })
            .eq('id', withdrawalId),

          supabase
            .from('withdrawal_transactions')
            .update({
              status: 'failed',
              provider_response: paymentResult
            })
            .eq('id', transaction.id)
        ])
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      // Update withdrawal as failed
      await supabase
        .from('artist_withdrawals')
        .update({
          status: 'failed',
          failure_reason: error instanceof Error ? error.message : 'Processing failed'
        })
        .eq('id', withdrawalId)
    }
  }

  // Mark earnings as withdrawn and handle partial withdrawals
  private async markEarningsAsWithdrawn(
    artistId: string,
    amount: number,
    withdrawalId: string
  ): Promise<void> {
    try {
      // Get available earnings to mark as withdrawn (oldest first)
      const { data: earnings } = await supabase
        .from('artist_earnings')
        .select('*')
        .eq('artist_id', artistId)
        .eq('status', 'available')
        .lte('available_for_withdrawal_at', new Date().toISOString())
        .order('created_at', { ascending: true })

      if (!earnings || earnings.length === 0) {
        console.error('No available earnings found for withdrawal')
        return
      }

      let remainingAmount = amount
      const earningsToUpdate = []
      const earningsToCreate = []

      for (const earning of earnings) {
        if (remainingAmount <= 0) break

        if (earning.net_amount <= remainingAmount) {
          // Full earning withdrawal
          earningsToUpdate.push({
            id: earning.id,
            status: 'withdrawn',
            withdrawn_at: new Date().toISOString(),
            withdrawal_id: withdrawalId
          })
          remainingAmount -= earning.net_amount
        } else {
          // Partial earning withdrawal - split the earning
          // Mark original as withdrawn for the partial amount
          earningsToUpdate.push({
            id: earning.id,
            status: 'withdrawn',
            withdrawn_at: new Date().toISOString(),
            withdrawal_id: withdrawalId,
            net_amount: remainingAmount,
            gross_amount: remainingAmount / (1 - 0.05), // Reverse calculate gross
            platform_fee: (remainingAmount / (1 - 0.05)) * 0.05
          })

          // Create new earning for the remaining amount
          const remainingNetAmount = earning.net_amount - remainingAmount
          const remainingGrossAmount = remainingNetAmount / (1 - 0.05)
          const remainingPlatformFee = remainingGrossAmount * 0.05

          earningsToCreate.push({
            artist_id: artistId,
            order_id: earning.order_id,
            product_id: earning.product_id,
            earning_type: earning.earning_type,
            gross_amount: remainingGrossAmount,
            platform_fee: remainingPlatformFee,
            net_amount: remainingNetAmount,
            status: 'available',
            available_for_withdrawal_at: earning.available_for_withdrawal_at,
            created_at: new Date().toISOString()
          })

          remainingAmount = 0
          break
        }
      }

      // Update existing earnings
      for (const earningUpdate of earningsToUpdate) {
        const updateData: any = {
          status: earningUpdate.status,
          withdrawn_at: earningUpdate.withdrawn_at,
          withdrawal_id: earningUpdate.withdrawal_id
        }

        // If it's a partial withdrawal, update amounts too
        if (earningUpdate.net_amount) {
          updateData.net_amount = earningUpdate.net_amount
          updateData.gross_amount = earningUpdate.gross_amount
          updateData.platform_fee = earningUpdate.platform_fee
        }

        await supabase
          .from('artist_earnings')
          .update(updateData)
          .eq('id', earningUpdate.id)
      }

      // Create new earnings for partial withdrawals
      if (earningsToCreate.length > 0) {
        await supabase
          .from('artist_earnings')
          .insert(earningsToCreate)
      }

      // Update artist total earnings
      await this.updateArtistTotalEarnings(artistId)

      console.log(`Marked KSh ${amount} as withdrawn for artist ${artistId}`)
    } catch (error) {
      console.error('Error marking earnings as withdrawn:', error)
      throw error
    }
  }

  // Update artist total earnings after withdrawal
  private async updateArtistTotalEarnings(artistId: string): Promise<void> {
    try {
      // Calculate total available earnings
      const { data: availableEarnings } = await supabase
        .from('artist_earnings')
        .select('net_amount')
        .eq('artist_id', artistId)
        .eq('status', 'available')

      // Calculate total withdrawn earnings
      const { data: withdrawnEarnings } = await supabase
        .from('artist_earnings')
        .select('net_amount')
        .eq('artist_id', artistId)
        .eq('status', 'withdrawn')

      const totalAvailable = availableEarnings?.reduce((sum, earning) => sum + earning.net_amount, 0) || 0
      const totalWithdrawn = withdrawnEarnings?.reduce((sum, earning) => sum + earning.net_amount, 0) || 0
      const totalEarnings = totalAvailable + totalWithdrawn

      // Update artist profile
      await supabase
        .from('artist_profiles')
        .update({ total_earnings: totalEarnings })
        .eq('id', artistId)
    } catch (error) {
      console.error('Error updating artist total earnings:', error)
    }
  }

  // Format phone number for M-Pesa
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Handle different formats
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+254${cleaned.substring(1)}`
    } else if (cleaned.length === 9) {
      return `+254${cleaned}`
    }

    return null
  }
}

// Export singleton instance
export const withdrawalService = new WithdrawalService()

// Export types
export type { WithdrawalRequest, WithdrawalTransaction, ArtistEarning, WithdrawalSummary }
