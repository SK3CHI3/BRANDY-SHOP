import { supabase } from '@/lib/supabase'
import { instaPayService } from './instapay'

export interface DesignLicense {
  id: string
  design_id: string
  customer_id: string
  artist_id: string
  license_type: 'standard' | 'exclusive' | 'commercial'
  license_price: number
  platform_fee: number
  artist_earnings: number
  status: 'pending' | 'paid' | 'delivered' | 'expired' | 'cancelled'
  payment_method?: string
  transaction_id?: string
  license_terms?: string
  usage_rights?: string
  expires_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  design?: {
    title: string
    image_url: string
    watermarked_url?: string
    high_res_url?: string
    artist?: {
      full_name: string
      email: string
    }
  }
  customer?: {
    full_name: string
    email: string
  }
}

export interface LicenseFile {
  id: string
  license_id: string
  file_name: string
  file_url: string
  file_type: 'png' | 'jpg' | 'svg' | 'pdf' | 'ai' | 'psd'
  file_size?: number
  download_count: number
  created_at: string
}

export interface LicensePurchaseRequest {
  design_id: string
  customer_id: string
  license_type: 'standard' | 'exclusive' | 'commercial'
  payment_method: 'mpesa' | 'card'
  mpesa_phone?: string
  card_details?: {
    number: string
    expiry: string
    cvv: string
  }
}

class LicensingService {
  // Purchase a design license
  async purchaseLicense(request: LicensePurchaseRequest): Promise<{
    license?: DesignLicense
    payment_url?: string
    error?: string
  }> {
    try {
      // Get design details
      const { data: design, error: designError } = await supabase
        .from('products')
        .select(`
          id, title, artist_id, license_price, license_type,
          artist:profiles!artist_id(full_name, email)
        `)
        .eq('id', request.design_id)
        .single()

      if (designError || !design) {
        return { error: 'Design not found' }
      }

      if (design.is_free) {
        return { error: 'This design is free and does not require a license purchase' }
      }

      const licensePrice = design.license_price || 0
      if (licensePrice <= 0) {
        return { error: 'Invalid license price' }
      }

      // Create license record
      const { data: license, error: licenseError } = await supabase
        .from('design_licenses')
        .insert({
          design_id: request.design_id,
          customer_id: request.customer_id,
          artist_id: design.artist_id,
          license_type: request.license_type,
          license_price: licensePrice,
          status: 'pending',
          payment_method: request.payment_method,
          license_terms: this.generateLicenseTerms(request.license_type),
          usage_rights: this.generateUsageRights(request.license_type)
        })
        .select()
        .single()

      if (licenseError || !license) {
        return { error: 'Failed to create license record' }
      }

      // Process payment
      let paymentResult
      if (request.payment_method === 'mpesa') {
        paymentResult = await instaPayService.initiatePayment({
          amount: licensePrice,
          currency: 'KES',
          phoneNumber: request.mpesa_phone!,
          orderId: license.id,
          description: `License for ${design.title}`,
          callbackUrl: `${window.location.origin}/api/license-payment-callback`,
          customerEmail: '', // Will be filled from user profile
          customerName: ''
        })
      } else {
        // Card payment simulation
        paymentResult = await this.simulateCardPayment(licensePrice, license.id)
      }

      if (!paymentResult.success) {
        // Delete the license record if payment failed
        await supabase.from('design_licenses').delete().eq('id', license.id)
        return { error: paymentResult.message }
      }

      // Update license with transaction ID
      await supabase
        .from('design_licenses')
        .update({ 
          transaction_id: paymentResult.transactionId,
          status: paymentResult.status === 'completed' ? 'paid' : 'pending'
        })
        .eq('id', license.id)

      return { 
        license: license as DesignLicense,
        payment_url: paymentResult.paymentUrl 
      }

    } catch (error) {
      console.error('License purchase error:', error)
      return { error: 'Failed to process license purchase' }
    }
  }

  // Get customer's licenses
  async getCustomerLicenses(customerId: string): Promise<{
    licenses?: DesignLicense[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('design_licenses')
        .select(`
          *,
          design:products!design_id(
            title, image_url, watermarked_url, high_res_url,
            artist:profiles!artist_id(full_name, email)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { licenses: data as DesignLicense[] }
    } catch (error) {
      return { error: 'Failed to fetch licenses' }
    }
  }

  // Get artist's license sales
  async getArtistLicenses(artistId: string): Promise<{
    licenses?: DesignLicense[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('design_licenses')
        .select(`
          *,
          design:products!design_id(title, image_url),
          customer:profiles!customer_id(full_name, email)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { licenses: data as DesignLicense[] }
    } catch (error) {
      return { error: 'Failed to fetch artist licenses' }
    }
  }

  // Admin: Get all licenses
  async getAllLicenses(): Promise<{
    licenses?: DesignLicense[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('design_licenses')
        .select(`
          *,
          design:products!design_id(
            title, image_url,
            artist:profiles!artist_id(full_name, email)
          ),
          customer:profiles!customer_id(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { licenses: data as DesignLicense[] }
    } catch (error) {
      return { error: 'Failed to fetch all licenses' }
    }
  }

  // Update license status
  async updateLicenseStatus(licenseId: string, status: DesignLicense['status']): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase
        .from('design_licenses')
        .update({ status })
        .eq('id', licenseId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update license status' }
    }
  }

  // Deliver license files
  async deliverLicenseFiles(licenseId: string, files: Omit<LicenseFile, 'id' | 'license_id' | 'created_at' | 'download_count'>[]): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Insert license files
      const { error: filesError } = await supabase
        .from('license_files')
        .insert(
          files.map(file => ({
            license_id: licenseId,
            ...file,
            download_count: 0
          }))
        )

      if (filesError) throw filesError

      // Update license status to delivered
      const { error: statusError } = await supabase
        .from('design_licenses')
        .update({ status: 'delivered' })
        .eq('id', licenseId)

      if (statusError) throw statusError

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to deliver license files' }
    }
  }

  // Get license files for a customer
  async getLicenseFiles(licenseId: string): Promise<{
    files?: LicenseFile[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('license_files')
        .select('*')
        .eq('license_id', licenseId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { files: data as LicenseFile[] }
    } catch (error) {
      return { error: 'Failed to fetch license files' }
    }
  }

  // Generate license terms based on type
  private generateLicenseTerms(licenseType: string): string {
    const terms = {
      standard: 'Non-exclusive usage rights for personal and commercial use. You may use this design for your own projects but cannot resell or redistribute the design files.',
      exclusive: 'Exclusive usage rights for the specified period. During this time, the design will not be licensed to other customers.',
      commercial: 'Commercial usage rights with attribution required. You may use this design for commercial purposes with proper attribution to the original artist.'
    }
    return terms[licenseType as keyof typeof terms] || terms.standard
  }

  // Generate usage rights based on type
  private generateUsageRights(licenseType: string): string {
    const rights = {
      standard: 'Digital and print media, websites, social media, marketing materials. No resale rights.',
      exclusive: 'All usage rights including resale and redistribution during the exclusive period.',
      commercial: 'Commercial use in products, advertising, and marketing with attribution required.'
    }
    return rights[licenseType as keyof typeof rights] || rights.standard
  }

  // Simulate card payment (replace with real payment processor)
  private async simulateCardPayment(amount: number, orderId: string) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: Math.random() > 0.1, // 90% success rate
      transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Payment processed successfully',
      status: 'completed' as const
    }
  }
}

export const licensingService = new LicensingService()
