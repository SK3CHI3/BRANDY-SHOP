
import { supabase } from '@/lib/supabase'

export interface ArtistCommission {
  id: string
  artist_id: string
  order_id: string
  order_item_id: string
  commission_rate: number
  commission_amount: number
  product_sale_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  paid_at?: string
}

export interface CustomDesignRequest {
  id: string
  customer_id: string
  artist_id?: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  deadline?: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  artist_quote?: number
  artist_response?: string
  request_type: 'artist_direct' | 'platform_managed'
  created_at: string
  updated_at: string
}

export interface DesignCustomizationRequest {
  id: string
  customer_id: string
  artist_id: string
  product_id: string
  customization_details: string
  status: 'pending' | 'approved' | 'rejected'
  artist_response?: string
  additional_cost?: number
  created_at: string
  responded_at?: string
}

export interface ArtistEarningsSummary {
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  total_orders: number
  commission_rate: number
}

class CommissionService {
  // Get artist earnings summary
  async getArtistEarnings(artistId: string): Promise<{ data: ArtistEarningsSummary | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_artist_earnings_summary', { artist_uuid: artistId })
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch earnings' 
      }
    }
  }

  // Get artist commission history
  async getArtistCommissions(artistId: string): Promise<{ data: ArtistCommission[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('artist_commissions')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch commissions' 
      }
    }
  }

  // Update artist commission rate
  async updateCommissionRate(artistId: string, rate: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (rate < 7.7) {
        return { success: false, error: 'Commission rate cannot be below 7.7%' }
      }

      const { error } = await supabase
        .from('artist_profiles')
        .update({ commission_rate: rate })
        .eq('id', artistId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update commission rate' 
      }
    }
  }

  // Create custom design request
  async createCustomRequest(request: {
    artist_id?: string
    title: string
    description: string
    budget_min?: number
    budget_max?: number
    deadline?: string
    request_type: 'artist_direct' | 'platform_managed'
  }): Promise<{ data: CustomDesignRequest | null; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('custom_design_requests')
        .insert({
          customer_id: user.user.id,
          ...request
        })
        .select()
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create request' 
      }
    }
  }

  // Get custom design requests for artist
  async getArtistRequests(artistId: string): Promise<{ data: CustomDesignRequest[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_design_requests')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch requests' 
      }
    }
  }

  // Update custom design request (artist response)
  async respondToRequest(
    requestId: string, 
    response: {
      status: 'accepted' | 'rejected'
      artist_quote?: number
      artist_response: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('custom_design_requests')
        .update({
          ...response,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to respond to request' 
      }
    }
  }

  // Create design customization request
  async requestCustomization(request: {
    artist_id: string
    product_id: string
    customization_details: string
  }): Promise<{ data: DesignCustomizationRequest | null; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('design_customization_requests')
        .insert({
          customer_id: user.user.id,
          ...request
        })
        .select()
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create customization request' 
      }
    }
  }

  // Get customization requests for artist
  async getCustomizationRequests(artistId: string): Promise<{ data: DesignCustomizationRequest[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('design_customization_requests')
        .select(`
          *,
          product:products(title, image_url),
          customer:profiles!customer_id(full_name, email)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch customization requests' 
      }
    }
  }

  // Respond to customization request
  async respondToCustomization(
    requestId: string,
    response: {
      status: 'approved' | 'rejected'
      artist_response: string
      additional_cost?: number
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('design_customization_requests')
        .update({
          ...response,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to respond to customization' 
      }
    }
  }
}

export const commissionService = new CommissionService()
