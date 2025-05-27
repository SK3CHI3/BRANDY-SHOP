// Instapay API Integration Service
// This service handles all payment processing through Instapay API

interface InstaPayConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  orderId: string;
  description: string;
  callbackUrl: string;
  customerEmail?: string;
  customerName?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  timestamp: string;
  failureReason?: string;
}

class InstaPayService {
  private config: InstaPayConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_INSTAPAY_API_KEY || 'test_api_key',
      baseUrl: import.meta.env.VITE_INSTAPAY_BASE_URL || 'https://api.instapay.co.ke',
      environment: (import.meta.env.VITE_INSTAPAY_ENV as 'sandbox' | 'production') || 'sandbox'
    };
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Environment': this.config.environment
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('InstaPay API Error:', error);
      throw error;
    }
  }

  // Initiate M-Pesa payment
  async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest('/v1/payments/mpesa/stk-push', {
        amount: paymentData.amount,
        phone_number: this.formatPhoneNumber(paymentData.phoneNumber),
        account_reference: paymentData.orderId,
        transaction_desc: paymentData.description,
        callback_url: paymentData.callbackUrl,
        customer_email: paymentData.customerEmail,
        customer_name: paymentData.customerName
      });

      return {
        success: response.success,
        transactionId: response.transaction_id,
        message: response.message || 'Payment initiated successfully',
        status: 'pending'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initiate payment. Please try again.',
        status: 'failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await this.makeRequest('/v1/payments/status', {
        transaction_id: transactionId
      });

      return {
        transactionId: response.transaction_id,
        status: response.status,
        amount: response.amount,
        currency: response.currency || 'KES',
        timestamp: response.timestamp,
        failureReason: response.failure_reason
      };
    } catch (error) {
      throw new Error('Failed to check payment status');
    }
  }

  // Process card payment
  async processCardPayment(paymentData: PaymentRequest & {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest('/v1/payments/card', {
        amount: paymentData.amount,
        currency: paymentData.currency,
        card_number: paymentData.cardNumber,
        expiry_month: paymentData.expiryMonth,
        expiry_year: paymentData.expiryYear,
        cvv: paymentData.cvv,
        order_id: paymentData.orderId,
        description: paymentData.description,
        customer_email: paymentData.customerEmail,
        customer_name: paymentData.customerName
      });

      return {
        success: response.success,
        transactionId: response.transaction_id,
        message: response.message || 'Payment processed successfully',
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        message: 'Card payment failed. Please check your details and try again.',
        status: 'failed'
      };
    }
  }

  // Format phone number for M-Pesa (Kenyan format)
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }

    return cleaned;
  }

  // Validate phone number
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return /^254[17]\d{8}$/.test(formatted);
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      {
        id: 'mpesa',
        name: 'M-Pesa',
        description: 'Pay with your M-Pesa mobile money',
        icon: '📱',
        supported: true
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        supported: true
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: '🏦',
        supported: false // Not implemented yet
      }
    ];
  }

  // Calculate transaction fees
  calculateFees(amount: number, paymentMethod: string): number {
    const feeRates = {
      mpesa: 0.015, // 1.5%
      card: 0.025,  // 2.5%
      bank: 0.01    // 1%
    };

    const rate = feeRates[paymentMethod as keyof typeof feeRates] || 0.025;
    return Math.round(amount * rate);
  }

  // Initiate M-Pesa withdrawal/transfer
  async initiateWithdrawal(withdrawalData: {
    amount: number;
    phoneNumber: string;
    reference: string;
    description: string;
  }): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest('/v1/payments/mpesa/b2c', {
        amount: withdrawalData.amount,
        phone_number: this.formatPhoneNumber(withdrawalData.phoneNumber),
        reference: withdrawalData.reference,
        description: withdrawalData.description,
        occasion: 'Artist Withdrawal'
      });

      return {
        success: response.success,
        transactionId: response.transaction_id,
        message: response.message || 'Withdrawal initiated successfully',
        status: 'pending'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initiate withdrawal. Please try again.',
        status: 'failed'
      };
    }
  }

  // Check withdrawal status
  async checkWithdrawalStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await this.makeRequest(`/v1/payments/status/${transactionId}`);

      return {
        transactionId: response.transaction_id,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        timestamp: response.timestamp,
        failureReason: response.failure_reason
      };
    } catch (error) {
      return {
        transactionId,
        status: 'failed',
        amount: 0,
        currency: 'KES',
        timestamp: new Date().toISOString(),
        failureReason: 'Failed to check status'
      };
    }
  }

  // Simulate payment for development/testing
  async simulatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different outcomes based on amount
    const amount = paymentData.amount;

    if (amount < 100) {
      return {
        success: false,
        message: 'Minimum payment amount is KSh 100',
        status: 'failed'
      };
    }

    if (amount > 100000) {
      return {
        success: false,
        message: 'Payment amount exceeds daily limit',
        status: 'failed'
      };
    }

    // 90% success rate for simulation
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Payment completed successfully',
        status: 'completed'
      };
    } else {
      return {
        success: false,
        message: 'Payment failed. Please try again.',
        status: 'failed'
      };
    }
  }

  // Simulate withdrawal for development/testing
  async simulateWithdrawal(withdrawalData: {
    amount: number;
    phoneNumber: string;
    reference: string;
    description: string;
  }): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate different outcomes based on amount
    const amount = withdrawalData.amount;

    if (amount < 1000) {
      return {
        success: false,
        message: 'Minimum withdrawal amount is KSh 1,000',
        status: 'failed'
      };
    }

    if (amount > 150000) {
      return {
        success: false,
        message: 'Withdrawal amount exceeds daily limit',
        status: 'failed'
      };
    }

    // 95% success rate for withdrawals (higher than payments)
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `WTH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Withdrawal completed successfully',
        status: 'completed'
      };
    } else {
      return {
        success: false,
        message: 'Withdrawal failed. Please try again later.',
        status: 'failed'
      };
    }
  }
}

// Export singleton instance
export const instaPayService = new InstaPayService();

// Export types for use in components
export type { PaymentRequest, PaymentResponse, PaymentStatus };
