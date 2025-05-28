// DeepAI Integration Service for AI-powered design generation
// Using DeepAI's free API for image generation

interface DeepAIConfig {
  apiKey: string;
  baseUrl: string;
}

interface AIPromptTemplate {
  category: string;
  productType: string;
  prompts: string[];
  styleModifiers: string[];
}

interface AIGenerationRequest {
  prompt: string;
  productType: string;
  style?: string;
  colors?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
}

interface AIGenerationResponse {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
  generationId?: string;
}

class DeepAIService {
  private config: DeepAIConfig;
  private promptTemplates: AIPromptTemplate[] = [];

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_DEEPAI_API_KEY || '2f4d1478-155b-49d3-83be-42394d1a1152',
      baseUrl: 'https://api.deepai.org/api'
    };

    this.initializePromptTemplates();
  }

  private initializePromptTemplates() {
    this.promptTemplates = [
      {
        category: 'apparel',
        productType: 'tshirt',
        prompts: [
          'Create a vibrant African-inspired geometric pattern',
          'Design a modern Kenyan cultural motif with traditional symbols',
          'Generate a minimalist wildlife silhouette featuring African animals',
          'Create an urban streetwear graphic with Swahili text',
          'Design a bold artistic interpretation of Nairobi skyline',
          'Generate a tribal pattern with contemporary twist',
          'Create a motivational quote design in elegant typography'
        ],
        styleModifiers: ['bold', 'minimalist', 'vintage', 'modern', 'artistic', 'geometric', 'organic']
      },
      {
        category: 'apparel',
        productType: 'hoodie',
        prompts: [
          'Design an urban streetwear graphic with Kenyan pride elements',
          'Create a bold artistic interpretation of Mount Kenya',
          'Generate a hip-hop inspired design with African elements',
          'Design a sports-themed graphic with Kenyan athletics',
          'Create a music-inspired design with traditional instruments'
        ],
        styleModifiers: ['urban', 'bold', 'artistic', 'sporty', 'musical']
      },
      {
        category: 'promotional',
        productType: 'mug',
        prompts: [
          'Create a coffee-themed design with Kenyan coffee beans',
          'Design an inspirational quote with beautiful typography',
          'Generate a cute animal illustration',
          'Create a geometric pattern suitable for mugs',
          'Design a nature-inspired botanical pattern'
        ],
        styleModifiers: ['cute', 'elegant', 'inspirational', 'natural', 'geometric']
      },
      {
        category: 'corporate',
        productType: 'notebook',
        prompts: [
          'Create a professional geometric pattern',
          'Design an elegant minimalist cover',
          'Generate a sophisticated business-themed design',
          'Create a productivity-inspired motivational design',
          'Design a clean corporate pattern'
        ],
        styleModifiers: ['professional', 'elegant', 'minimalist', 'sophisticated', 'clean']
      }
    ];
  }

  // Get guided prompts based on product type
  getGuidedPrompts(productType: string): string[] {
    const template = this.promptTemplates.find(t => t.productType === productType);
    return template ? template.prompts : [
      'Create a unique and creative design',
      'Generate an artistic pattern',
      'Design something beautiful and eye-catching'
    ];
  }

  // Get style modifiers for a product type
  getStyleModifiers(productType: string): string[] {
    const template = this.promptTemplates.find(t => t.productType === productType);
    return template ? template.styleModifiers : ['modern', 'creative', 'unique'];
  }

  // Build enhanced prompt with product-specific context
  buildEnhancedPrompt(request: AIGenerationRequest): string {
    const { prompt, productType, style, colors, complexity } = request;
    
    let enhancedPrompt = prompt;

    // Add product context
    if (productType === 'tshirt' || productType === 'hoodie') {
      enhancedPrompt += ', suitable for apparel printing, high contrast';
    } else if (productType === 'mug') {
      enhancedPrompt += ', suitable for mug printing, wraparound design';
    } else if (productType === 'cap') {
      enhancedPrompt += ', suitable for cap embroidery, compact design';
    }

    // Add style modifier
    if (style) {
      enhancedPrompt += `, ${style} style`;
    }

    // Add color preferences
    if (colors && colors.length > 0) {
      enhancedPrompt += `, using colors: ${colors.join(', ')}`;
    }

    // Add complexity guidance
    if (complexity === 'simple') {
      enhancedPrompt += ', simple and clean design, minimal details';
    } else if (complexity === 'complex') {
      enhancedPrompt += ', detailed and intricate design, rich in elements';
    }

    // Add quality and format specifications
    enhancedPrompt += ', high quality, vector-style, print-ready, professional design';

    return enhancedPrompt;
  }

  // Generate AI image using DeepAI
  async generateImage(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const enhancedPrompt = this.buildEnhancedPrompt(request);
      console.log('Generating AI image with prompt:', enhancedPrompt);

      const formData = new FormData();
      formData.append('text', enhancedPrompt);

      const response = await fetch(`${this.config.baseUrl}/text2img`, {
        method: 'POST',
        headers: {
          'Api-Key': this.config.apiKey,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.output_url) {
        throw new Error('No image URL returned from DeepAI');
      }

      return {
        success: true,
        imageUrl: data.output_url,
        prompt: enhancedPrompt,
        generationId: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate AI image'
      };
    }
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testRequest: AIGenerationRequest = {
        prompt: 'simple test image',
        productType: 'tshirt',
        complexity: 'simple'
      };

      const result = await this.generateImage(testRequest);

      if (result.success) {
        return { success: true, message: 'DeepAI connection successful' };
      } else {
        return { success: false, message: result.error || 'Connection test failed' };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  // Generate multiple variations
  async generateVariations(request: AIGenerationRequest, count: number = 3): Promise<AIGenerationResponse[]> {
    const variations: AIGenerationResponse[] = [];
    
    for (let i = 0; i < count; i++) {
      // Add variation to prompt
      const variationRequest = {
        ...request,
        prompt: `${request.prompt}, variation ${i + 1}, unique interpretation`
      };
      
      const result = await this.generateImage(variationRequest);
      variations.push(result);

      // Add delay to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay for API stability
      }
    }
    
    return variations;
  }

  // Calculate AI generation cost based on complexity
  calculateAIGenerationCost(complexity: 'simple' | 'medium' | 'complex', variations: number = 1): number {
    const baseCosts = {
      simple: 500,   // KSh 500 for simple AI generation
      medium: 800,   // KSh 800 for medium complexity
      complex: 1200  // KSh 1200 for complex generation
    };

    const baseCost = baseCosts[complexity];
    const variationMultiplier = variations > 1 ? 1 + (variations - 1) * 0.5 : 1;
    
    return Math.round(baseCost * variationMultiplier);
  }

  // Validate and optimize prompt for better results
  optimizePrompt(prompt: string, productType: string): string {
    let optimized = prompt.trim();
    
    // Remove potentially problematic words
    const problematicWords = ['nsfw', 'inappropriate', 'violent', 'offensive'];
    problematicWords.forEach(word => {
      optimized = optimized.replace(new RegExp(word, 'gi'), '');
    });

    // Add product-specific optimization
    const productOptimizations = {
      tshirt: 'flat design, centered composition',
      hoodie: 'bold graphics, street art style',
      mug: 'wraparound design, coffee theme friendly',
      cap: 'compact logo style, embroidery friendly',
      bag: 'large format design, tote bag suitable'
    };

    const optimization = productOptimizations[productType as keyof typeof productOptimizations];
    if (optimization) {
      optimized += `, ${optimization}`;
    }

    return optimized;
  }
}

// Export singleton instance
export const deepAIService = new DeepAIService();

// Export types
export type { AIGenerationRequest, AIGenerationResponse, AIPromptTemplate };
