// Final comprehensive test to verify all fixes
import { supabase } from '@/lib/supabase'

export class FinalTest {
  static async runComprehensiveTest(): Promise<{
    categories: { success: boolean; count: number; error?: string }
    reviews: { success: boolean; error?: string }
    products: { success: boolean; count: number; latestProduct?: any; error?: string }
    messaging: { success: boolean; error?: string }
    storage: { success: boolean; error?: string }
    summary: { totalTests: number; passedTests: number; issues: string[] }
  }> {
    console.log('🧪 Running final comprehensive test...')

    const results = {
      categories: { success: false, count: 0, error: undefined as string | undefined },
      reviews: { success: false, error: undefined as string | undefined },
      products: { success: false, count: 0, latestProduct: undefined as any, error: undefined as string | undefined },
      messaging: { success: false, error: undefined as string | undefined },
      storage: { success: false, error: undefined as string | undefined },
      summary: { totalTests: 5, passedTests: 0, issues: [] as string[] }
    }

    // Test 1: Categories with is_active filter
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)

      if (catError) {
        results.categories.error = catError.message
      } else {
        results.categories.success = true
        results.categories.count = categories?.length || 0
      }
    } catch (error) {
      results.categories.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 2: Reviews with artist_id filter
    try {
      const { data: reviews, error: reviewError } = await supabase
        .from('reviews')
        .select('*, customer:profiles!customer_id(full_name, avatar_url), product:products(title)')
        .eq('artist_id', 'd8e695e2-212e-4adc-91f5-da52b849ff7b')
        .order('created_at', { ascending: false })
        .limit(5)

      if (reviewError) {
        results.reviews.error = reviewError.message
      } else {
        results.reviews.success = true
      }
    } catch (error) {
      results.reviews.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 3: Products with all new columns
    try {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, title, colors, sizes, materials, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (prodError) {
        results.products.error = prodError.message
      } else {
        results.products.success = true
        results.products.count = products?.length || 0
        results.products.latestProduct = products?.[0]
      }
    } catch (error) {
      results.products.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 4: Message sending
    try {
      const { data: messageData, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: '12535707-7580-43bb-b76b-c24add63f5e7',
          sender_id: 'd8e695e2-212e-4adc-91f5-da52b849ff7b',
          receiver_id: 'ad17b4d6-d2f9-4a0b-9f67-2b74546aabe3',
          content: 'Final test message - ' + new Date().toISOString()
        })
        .select()

      if (msgError) {
        results.messaging.error = msgError.message
      } else {
        results.messaging.success = true
      }
    } catch (error) {
      results.messaging.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 5: Storage bucket access
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      
      if (bucketError) {
        results.storage.error = bucketError.message
      } else {
        const productsBucket = buckets?.find(b => b.id === 'products')
        if (productsBucket) {
          results.storage.success = true
        } else {
          results.storage.error = 'Products bucket not found'
        }
      }
    } catch (error) {
      results.storage.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Calculate summary
    const tests = [
      results.categories.success,
      results.reviews.success,
      results.products.success,
      results.messaging.success,
      results.storage.success
    ]

    results.summary.passedTests = tests.filter(Boolean).length
    
    // Collect issues
    if (!results.categories.success) results.summary.issues.push(`Categories: ${results.categories.error}`)
    if (!results.reviews.success) results.summary.issues.push(`Reviews: ${results.reviews.error}`)
    if (!results.products.success) results.summary.issues.push(`Products: ${results.products.error}`)
    if (!results.messaging.success) results.summary.issues.push(`Messaging: ${results.messaging.error}`)
    if (!results.storage.success) results.summary.issues.push(`Storage: ${results.storage.error}`)

    console.log('🧪 Final test results:', results)
    return results
  }
}

// Make available globally
declare global {
  interface Window {
    runFinalTest: () => Promise<any>
  }
}

window.runFinalTest = FinalTest.runComprehensiveTest
