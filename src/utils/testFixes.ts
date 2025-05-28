// Test script to verify fixes are working
import { supabase } from '@/lib/supabase'
import { messagingService } from '@/services/messaging'

export class TestFixes {
  // Test storage upload
  static async testStorageUpload(userId: string): Promise<{
    success: boolean
    error?: string
    publicUrl?: string
  }> {
    try {
      // Create a small test image
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#00FF00'
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = '#000000'
        ctx.font = '16px Arial'
        ctx.fillText('TEST', 30, 55)
      }
      
      const testBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      })
      
      const testFileName = `test/${userId}_${Date.now()}.png`
      console.log('Testing upload to:', testFileName)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(testFileName, testBlob)
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { success: false, error: uploadError.message }
      }
      
      console.log('Upload successful:', uploadData)
      
      // Get public URL
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(testFileName)
      
      // Clean up test file
      await supabase.storage
        .from('products')
        .remove([testFileName])
      
      return { 
        success: true, 
        publicUrl: data.publicUrl 
      }
    } catch (error) {
      console.error('Storage test error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Test message sending
  static async testMessageSending(userId: string): Promise<{
    success: boolean
    error?: string
    messageId?: string
  }> {
    try {
      // Get another user to test with
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', userId)
        .limit(1)

      const testReceiverId = otherUsers?.[0]?.id || userId // Fallback to self

      // Create or get conversation
      const { conversation, error: convError } = await messagingService.getOrCreateConversation(userId, testReceiverId)
      
      if (convError || !conversation) {
        return { success: false, error: convError || 'Failed to create conversation' }
      }

      // Send test message
      const { message, error: sendError } = await messagingService.sendMessage(
        conversation.id,
        userId,
        testReceiverId,
        `Test message from fix verification - ${new Date().toISOString()}`
      )

      if (sendError || !message) {
        return { success: false, error: sendError || 'Failed to send message' }
      }

      return { 
        success: true, 
        messageId: message.id 
      }
    } catch (error) {
      console.error('Message test error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Test product creation
  static async testProductCreation(userId: string): Promise<{
    success: boolean
    error?: string
    productId?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          artist_id: userId,
          title: 'Test Product - Fix Verification',
          description: 'This is a test product to verify fixes are working',
          price: 100,
          image_url: 'https://via.placeholder.com/300x300/00FF00/000000?text=TEST',
          colors: ['red', 'blue'],
          sizes: ['S', 'M', 'L'],
          materials: ['cotton'],
          tags: ['test'],
          stock_quantity: 10,
          is_active: false // Mark as inactive so it doesn't appear in marketplace
        })
        .select()

      if (error) {
        return { success: false, error: error.message }
      }

      const productId = data?.[0]?.id

      // Clean up test product
      if (productId) {
        await supabase
          .from('products')
          .delete()
          .eq('id', productId)
      }

      return {
        success: true,
        productId
      }
    } catch (error) {
      console.error('Product creation test error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Run all tests
  static async runAllTests(userId: string): Promise<{
    storage: any
    messaging: any
    products: any
    summary: {
      totalTests: number
      passedTests: number
      failedTests: number
    }
  }> {
    console.log('🧪 Running fix verification tests...')

    const storage = await this.testStorageUpload(userId)
    const messaging = await this.testMessageSending(userId)
    const products = await this.testProductCreation(userId)

    const tests = [storage.success, messaging.success, products.success]
    const totalTests = tests.length
    const passedTests = tests.filter(Boolean).length
    const failedTests = totalTests - passedTests

    const results = {
      storage,
      messaging,
      products,
      summary: {
        totalTests,
        passedTests,
        failedTests
      }
    }

    console.log('🧪 Fix verification results:', results)
    return results
  }
}

// Make available globally for testing
declare global {
  interface Window {
    testFixes: typeof TestFixes
  }
}

window.testFixes = TestFixes
