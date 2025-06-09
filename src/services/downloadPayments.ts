import { supabase } from '@/lib/supabase';
import { designStudioService } from './designStudio';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer_email: string;
  customer_phone?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  payment_id?: string;
  checkout_url?: string;
  error?: string;
}

class DownloadPaymentService {
  private readonly DOWNLOAD_PRICE = 50; // KSH 50 for downloads
  private readonly CURRENCY = 'KES';

  async initiateDownloadPayment(
    userId: string, 
    designProjectId: string, 
    downloadType: 'png' | 'svg' | 'pdf' | 'bundle',
    userEmail: string,
    userPhone?: string
  ): Promise<{ data: any; error: string | null }> {
    try {
      // First, create a download record with pending status
      const { data: downloadRecord, error: downloadError } = await designStudioService.createDownloadRequest({
        user_id: userId,
        design_project_id: designProjectId,
        download_type: downloadType,
        payment_amount: this.DOWNLOAD_PRICE,
        payment_status: 'pending'
      });

      if (downloadError || !downloadRecord) {
        return { data: null, error: 'Failed to create download record' };
      }

      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount: this.DOWNLOAD_PRICE,
        currency: this.CURRENCY,
        description: `Design Download - ${downloadType.toUpperCase()}`,
        customer_email: userEmail,
        customer_phone: userPhone,
        callback_url: `${window.location.origin}/api/payment-callback`,
        metadata: {
          download_id: downloadRecord.id,
          user_id: userId,
          design_project_id: designProjectId,
          download_type: downloadType
        }
      };

      // For now, simulate payment processing
      // In production, integrate with actual payment gateway (M-Pesa, Stripe, etc.)
      const paymentResponse = await this.processPayment(paymentRequest);

      if (paymentResponse.success) {
        // Update download record with payment reference
        await designStudioService.updateDownloadStatus(
          downloadRecord.id, 
          'completed', 
          paymentResponse.payment_id
        );

        // Generate download URL
        const downloadUrl = await this.generateDownloadUrl(designProjectId, downloadType);
        
        return { 
          data: { 
            download_id: downloadRecord.id,
            payment_id: paymentResponse.payment_id,
            download_url: downloadUrl,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }, 
          error: null 
        };
      } else {
        // Update download record as failed
        await designStudioService.updateDownloadStatus(downloadRecord.id, 'failed');
        return { data: null, error: paymentResponse.error || 'Payment failed' };
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      return { data: null, error: 'Payment processing error' };
    }
  }

  private async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // Simulate payment processing
    // In production, this would integrate with:
    // - M-Pesa STK Push for mobile payments
    // - Stripe for card payments
    // - Other payment gateways

    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve({
            success: true,
            payment_id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            checkout_url: undefined // For direct payments, no checkout URL needed
          });
        } else {
          resolve({
            success: false,
            error: 'Payment declined by provider'
          });
        }
      }, 2000); // Simulate 2-second processing time
    });
  }

  private async generateDownloadUrl(designProjectId: string, downloadType: string): Promise<string> {
    // In production, this would:
    // 1. Generate the actual file (PNG, SVG, PDF)
    // 2. Upload to secure storage (Supabase Storage, AWS S3, etc.)
    // 3. Return signed URL with expiration

    // For now, return a placeholder
    return `https://brandy-shop-downloads.supabase.co/storage/v1/object/sign/downloads/${designProjectId}_${downloadType}_${Date.now()}.${downloadType}`;
  }

  async verifyPayment(paymentId: string): Promise<{ verified: boolean; error?: string }> {
    try {
      // In production, verify payment with the payment provider
      // For now, simulate verification
      
      const { data: downloadRecord, error } = await supabase
        .from('design_downloads')
        .select('*')
        .eq('payment_reference', paymentId)
        .single();

      if (error || !downloadRecord) {
        return { verified: false, error: 'Payment record not found' };
      }

      return { verified: downloadRecord.payment_status === 'completed' };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { verified: false, error: 'Verification failed' };
    }
  }

  async getDownloadHistory(userId: string) {
    return await designStudioService.getDownloads(userId);
  }

  async processRefund(downloadId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, process refund with payment provider
      
      const { data, error } = await designStudioService.updateDownloadStatus(downloadId, 'refunded');
      
      if (error) {
        return { success: false, error: 'Failed to process refund' };
      }

      return { success: true };
    } catch (error) {
      console.error('Refund processing error:', error);
      return { success: false, error: 'Refund processing failed' };
    }
  }

  // M-Pesa specific methods (for Kenyan market)
  async initiateMpesaPayment(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string
  ): Promise<PaymentResponse> {
    // This would integrate with Safaricom M-Pesa API
    // For now, return a simulated response
    
    return {
      success: true,
      payment_id: `mpesa_${Date.now()}`,
      checkout_url: undefined
    };
  }

  async checkMpesaPaymentStatus(checkoutRequestId: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    amount?: number;
    mpesa_receipt?: string;
  }> {
    // This would check M-Pesa payment status
    // For now, return a simulated response
    
    return {
      status: 'completed',
      amount: this.DOWNLOAD_PRICE,
      mpesa_receipt: `MPesa_${Date.now()}`
    };
  }

  // Utility methods
  getDownloadPrice(): number {
    return this.DOWNLOAD_PRICE;
  }

  getCurrency(): string {
    return this.CURRENCY;
  }

  formatPrice(amount: number): string {
    return `${this.CURRENCY} ${amount.toLocaleString()}`;
  }
}

export const downloadPaymentService = new DownloadPaymentService();
