// Dynamic Pricing Calculator for Custom Design Studio
// Based on Kenyan market research and branding service costs

interface Product {
  id: string;
  name: string;
  basePrice: number;
  sizes: string[];
  colors: string[];
}

interface PricingFactors {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  brandingMethod: string;
  designComplexity: 'simple' | 'medium' | 'complex';
  quantity: number;
  isAIGenerated: boolean;
  aiComplexity?: 'simple' | 'medium' | 'complex';
  aiVariations?: number;
  rushOrder?: boolean;
  customPackaging?: boolean;
}

interface PriceBreakdown {
  baseProductCost: number;
  sizePremium: number;
  brandingCost: number;
  aiGenerationCost: number;
  complexityMultiplier: number;
  quantityDiscount: number;
  rushOrderFee: number;
  packagingFee: number;
  subtotal: number;
  platformFee: number;
  total: number;
  pricePerUnit: number;
  savings: number;
}

class PricingCalculatorService {
  // Size multipliers based on market research
  private sizeMultipliers = {
    'S': 1.0, 'M': 1.0, 'L': 1.0, 'XL': 1.1, 'XXL': 1.2,
    '11oz': 1.0, '15oz': 1.15, '500ml': 1.0, '750ml': 1.1, '1L': 1.2,
    'Small': 1.0, 'Medium': 1.1, 'Large': 1.2, 'A5': 1.0, 'A4': 1.15,
    '5000mAh': 1.0, '10000mAh': 1.4, '8GB': 1.0, '16GB': 1.3, '32GB': 1.8,
    'Standard': 1.0, 'One Size': 1.0
  };

  // Branding method costs (KSh) - Reasonable pricing for Kenyan market
  private brandingMethods = {
    'none': { baseCost: 0, complexityMultiplier: 1.0, minQuantity: 1 },
    'screen_printing': { baseCost: 200, complexityMultiplier: 1.0, minQuantity: 10 },
    'digital_printing': { baseCost: 300, complexityMultiplier: 1.2, minQuantity: 1 },
    'embroidery': { baseCost: 250, complexityMultiplier: 1.1, minQuantity: 5 },
    'heat_transfer': { baseCost: 150, complexityMultiplier: 1.0, minQuantity: 1 },
    'ai_generated': { baseCost: 250, complexityMultiplier: 1.3, minQuantity: 1 }
  };

  // Design complexity multipliers - More reasonable for small items
  private complexityMultipliers = {
    simple: 1.0,    // 1-2 colors, basic shapes
    medium: 1.2,    // 3-4 colors, moderate detail
    complex: 1.4    // 5+ colors, high detail
  };

  // Quantity discount tiers
  private quantityDiscounts = [
    { min: 1, max: 9, discount: 0 },      // No discount
    { min: 10, max: 24, discount: 0.05 }, // 5% discount
    { min: 25, max: 49, discount: 0.10 }, // 10% discount
    { min: 50, max: 99, discount: 0.15 }, // 15% discount
    { min: 100, max: 199, discount: 0.20 }, // 20% discount
    { min: 200, max: Infinity, discount: 0.25 } // 25% discount
  ];

  // AI generation costs
  private aiGenerationCosts = {
    simple: 500,   // KSh 500 for simple AI generation
    medium: 800,   // KSh 800 for medium complexity
    complex: 1200  // KSh 1200 for complex generation
  };

  // Platform fee percentage - Reduced for competitive pricing
  private platformFeeRate = 0.02; // 2% platform fee

  // Calculate comprehensive pricing
  calculatePrice(factors: PricingFactors): PriceBreakdown {
    const {
      product,
      selectedSize,
      brandingMethod,
      designComplexity,
      quantity,
      isAIGenerated,
      aiComplexity = 'medium',
      aiVariations = 1,
      rushOrder = false,
      customPackaging = false
    } = factors;

    // Base product cost
    const baseProductCost = product.basePrice * quantity;

    // Size premium
    const sizeMultiplier = this.sizeMultipliers[selectedSize as keyof typeof this.sizeMultipliers] || 1.0;
    const sizePremium = (baseProductCost * (sizeMultiplier - 1));

    // Branding cost calculation
    const brandingConfig = this.brandingMethods[brandingMethod as keyof typeof this.brandingMethods] || this.brandingMethods['none'];
    const complexityMult = this.complexityMultipliers[designComplexity];
    const brandingCostPerUnit = brandingConfig.baseCost * brandingConfig.complexityMultiplier * complexityMult;
    const brandingCost = brandingCostPerUnit * quantity;

    // AI generation cost (one-time fee)
    let aiGenerationCost = 0;
    if (isAIGenerated) {
      const baseAICost = this.aiGenerationCosts[aiComplexity];
      const variationMultiplier = aiVariations > 1 ? 1 + (aiVariations - 1) * 0.5 : 1;
      aiGenerationCost = baseAICost * variationMultiplier;
    }

    // Subtotal before discounts
    const subtotalBeforeDiscount = baseProductCost + sizePremium + brandingCost + aiGenerationCost;

    // Quantity discount
    const discountTier = this.quantityDiscounts.find(tier => quantity >= tier.min && quantity <= tier.max);
    const discountRate = discountTier ? discountTier.discount : 0;
    const quantityDiscount = subtotalBeforeDiscount * discountRate;

    // Rush order fee (50% surcharge)
    const rushOrderFee = rushOrder ? subtotalBeforeDiscount * 0.5 : 0;

    // Custom packaging fee
    const packagingFee = customPackaging ? quantity * 50 : 0; // KSh 50 per unit

    // Calculate subtotal
    const subtotal = subtotalBeforeDiscount - quantityDiscount + rushOrderFee + packagingFee;

    // Platform fee
    const platformFee = subtotal * this.platformFeeRate;

    // Final total
    const total = subtotal + platformFee;

    // Price per unit
    const pricePerUnit = total / quantity;

    // Calculate savings from quantity discount
    const savings = quantityDiscount;

    return {
      baseProductCost,
      sizePremium,
      brandingCost,
      aiGenerationCost,
      complexityMultiplier: complexityMult,
      quantityDiscount,
      rushOrderFee,
      packagingFee,
      subtotal,
      platformFee,
      total,
      pricePerUnit,
      savings
    };
  }

  // Get quantity discount information
  getQuantityDiscountInfo(quantity: number): { discount: number; nextTier?: { quantity: number; discount: number } } {
    const currentTier = this.quantityDiscounts.find(tier => quantity >= tier.min && quantity <= tier.max);
    const nextTier = this.quantityDiscounts.find(tier => tier.min > quantity);

    return {
      discount: currentTier ? currentTier.discount : 0,
      nextTier: nextTier ? { quantity: nextTier.min, discount: nextTier.discount } : undefined
    };
  }

  // Calculate bulk pricing tiers for display
  calculateBulkPricingTiers(factors: PricingFactors): Array<{ quantity: number; pricePerUnit: number; totalPrice: number; savings: number }> {
    const quantities = [1, 10, 25, 50, 100, 200];
    
    return quantities.map(qty => {
      const pricing = this.calculatePrice({ ...factors, quantity: qty });
      return {
        quantity: qty,
        pricePerUnit: pricing.pricePerUnit,
        totalPrice: pricing.total,
        savings: pricing.savings
      };
    });
  }

  // Estimate delivery time based on factors
  estimateDeliveryTime(factors: PricingFactors): { min: number; max: number; description: string } {
    const { brandingMethod, quantity, isAIGenerated, rushOrder } = factors;

    let baseDays = 3; // Base processing time

    // Adjust for branding method
    if (brandingMethod === 'screen_printing' && quantity > 50) {
      baseDays += 2;
    } else if (brandingMethod === 'embroidery') {
      baseDays += 1;
    }

    // Adjust for AI generation
    if (isAIGenerated) {
      baseDays += 1; // Extra day for AI generation and approval
    }

    // Adjust for quantity
    if (quantity > 100) {
      baseDays += 2;
    } else if (quantity > 50) {
      baseDays += 1;
    }

    // Rush order
    if (rushOrder) {
      baseDays = Math.max(1, Math.ceil(baseDays / 2));
    }

    const minDays = baseDays;
    const maxDays = baseDays + 2;

    let description = `${minDays}-${maxDays} business days`;
    if (rushOrder) {
      description += ' (Rush Order)';
    }

    return { min: minDays, max: maxDays, description };
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  // Get recommended branding method based on factors
  getRecommendedBrandingMethod(product: Product, quantity: number, designComplexity: string): string {
    // Screen printing for large quantities with simple designs
    if (quantity >= 25 && designComplexity === 'simple') {
      return 'screen_printing';
    }

    // Digital printing for complex designs or medium quantities
    if (designComplexity === 'complex' || (quantity >= 10 && quantity < 50)) {
      return 'digital_printing';
    }

    // Embroidery for caps and polo shirts
    if (product.id === 'cap' || product.id === 'polo') {
      return 'embroidery';
    }

    // Heat transfer for small quantities
    if (quantity < 10) {
      return 'heat_transfer';
    }

    return 'digital_printing'; // Default recommendation
  }

  // Validate minimum quantities for branding methods
  validateMinimumQuantity(brandingMethod: string, quantity: number): { valid: boolean; minQuantity: number } {
    const method = this.brandingMethods[brandingMethod as keyof typeof this.brandingMethods];
    if (!method) {
      return { valid: false, minQuantity: 1 };
    }

    return {
      valid: quantity >= method.minQuantity,
      minQuantity: method.minQuantity
    };
  }
}

// Export singleton instance
export const pricingCalculatorService = new PricingCalculatorService();

// Export types
export type { PricingFactors, PriceBreakdown, Product };
