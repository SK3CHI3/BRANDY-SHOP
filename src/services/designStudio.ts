import { supabase } from '@/lib/supabase';

export interface DesignProject {
  id: string;
  user_id: string;
  project_name: string;
  product_type: 'tshirt' | 'hoodie' | 'cap' | 'mug' | 'bag' | 'phone-case' | 'notebook' | 'sticker';
  design_data: any;
  preview_image_url?: string;
  status: 'draft' | 'completed' | 'archived';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignDownload {
  id: string;
  user_id: string;
  design_project_id: string;
  download_type: 'png' | 'svg' | 'pdf' | 'bundle';
  payment_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  download_url?: string;
  expires_at?: string;
  downloaded_at?: string;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  user_id: string;
  design_project_id: string;
  product_type: string;
  quantity: number;
  additional_requirements?: string;
  deadline?: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'completed';
  quoted_price?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DesignTemplate {
  id: string;
  created_by?: string;
  template_name: string;
  description?: string;
  product_type: string;
  template_data: any;
  preview_image_url?: string;
  is_premium: boolean;
  price: number;
  category?: string;
  tags?: string[];
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class DesignStudioService {
  // Design Projects
  async createProject(projectData: Partial<DesignProject>) {
    const { data, error } = await supabase
      .from('design_projects')
      .insert([projectData])
      .select()
      .single();

    return { data, error };
  }

  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from('design_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    return { data, error };
  }

  async getProject(projectId: string) {
    const { data, error } = await supabase
      .from('design_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    return { data, error };
  }

  async updateProject(projectId: string, updates: Partial<DesignProject>) {
    const { data, error } = await supabase
      .from('design_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    return { data, error };
  }

  async deleteProject(projectId: string) {
    const { data, error } = await supabase
      .from('design_projects')
      .delete()
      .eq('id', projectId);

    return { data, error };
  }

  // Design Downloads
  async createDownloadRequest(downloadData: Partial<DesignDownload>) {
    const { data, error } = await supabase
      .from('design_downloads')
      .insert([downloadData])
      .select()
      .single();

    return { data, error };
  }

  async getDownloads(userId: string) {
    const { data, error } = await supabase
      .from('design_downloads')
      .select(`
        *,
        design_projects (
          project_name,
          product_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async updateDownloadStatus(downloadId: string, status: string, paymentReference?: string) {
    const updates: any = { payment_status: status };
    if (paymentReference) {
      updates.payment_reference = paymentReference;
    }
    if (status === 'completed') {
      updates.downloaded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('design_downloads')
      .update(updates)
      .eq('id', downloadId)
      .select()
      .single();

    return { data, error };
  }

  // Quote Requests
  async createQuoteRequest(quoteData: Partial<QuoteRequest>) {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([quoteData])
      .select()
      .single();

    return { data, error };
  }

  async getQuoteRequests(userId: string) {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        design_projects (
          project_name,
          product_type,
          preview_image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async updateQuoteRequest(quoteId: string, updates: Partial<QuoteRequest>) {
    const { data, error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', quoteId)
      .select()
      .single();

    return { data, error };
  }

  // Design Templates
  async getTemplates(productType?: string, category?: string) {
    let query = supabase
      .from('design_templates')
      .select('*')
      .eq('is_active', true);

    if (productType) {
      query = query.eq('product_type', productType);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });

    return { data, error };
  }

  async getTemplate(templateId: string) {
    const { data, error } = await supabase
      .from('design_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    return { data, error };
  }

  async createTemplate(templateData: Partial<DesignTemplate>) {
    const { data, error } = await supabase
      .from('design_templates')
      .insert([templateData])
      .select()
      .single();

    return { data, error };
  }

  async incrementTemplateUsage(templateId: string) {
    const { data, error } = await supabase
      .rpc('increment_template_usage', { template_id: templateId });

    return { data, error };
  }

  // Utility functions
  async generatePreviewImage(designData: any): Promise<string> {
    // This would integrate with a service to generate preview images
    // For now, return a placeholder
    return '/api/placeholder/400/400';
  }

  async exportDesign(projectId: string, format: 'png' | 'svg' | 'pdf'): Promise<string> {
    // This would integrate with a design export service
    // For now, return a placeholder URL
    return `https://example.com/exports/${projectId}.${format}`;
  }

  // Admin functions for quote management
  async getAllQuoteRequests() {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        design_projects (
          project_name,
          product_type,
          preview_image_url
        )
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async updateQuotePrice(quoteId: string, price: number, adminNotes?: string) {
    const { data, error } = await supabase
      .from('quote_requests')
      .update({
        quoted_price: price,
        admin_notes: adminNotes,
        status: 'quoted'
      })
      .eq('id', quoteId)
      .select()
      .single();

    return { data, error };
  }
}

export const designStudioService = new DesignStudioService();
