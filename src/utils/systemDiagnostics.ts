// System Diagnostics Tool
// This tool helps diagnose messaging, product posting, and notification issues

import { supabase } from '@/lib/supabase'
import { messagingService } from '@/services/messaging'
import { notificationsService } from '@/services/notifications'

export class SystemDiagnostics {
  // Test database connectivity and table existence
  static async testDatabaseTables(): Promise<{
    conversations: boolean
    messages: boolean
    notifications: boolean
    products: boolean
    categories: boolean
    profiles: boolean
    error?: string
  }> {
    const results = {
      conversations: false,
      messages: false,
      notifications: false,
      products: false,
      categories: false,
      profiles: false,
      error: undefined as string | undefined
    }

    try {
      // Test conversations table
      const { error: convError } = await supabase
        .from('conversations')
        .select('count(*)')
        .limit(1)
      results.conversations = !convError

      // Test messages table
      const { error: msgError } = await supabase
        .from('messages')
        .select('count(*)')
        .limit(1)
      results.messages = !msgError

      // Test notifications table
      const { error: notifError } = await supabase
        .from('notifications')
        .select('count(*)')
        .limit(1)
      results.notifications = !notifError

      // Test products table
      const { error: prodError } = await supabase
        .from('products')
        .select('count(*)')
        .limit(1)
      results.products = !prodError

      // Test categories table
      const { error: catError } = await supabase
        .from('categories')
        .select('count(*)')
        .limit(1)
      results.categories = !catError

      // Test profiles table
      const { error: profError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
      results.profiles = !profError

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return results
  }

  // Test messaging functionality
  static async testMessaging(userId: string): Promise<{
    canGetConversations: boolean
    canCreateConversation: boolean
    canSendMessage: boolean
    conversationDetails: any
    error?: string
  }> {
    const results = {
      canGetConversations: false,
      canCreateConversation: false,
      canSendMessage: false,
      conversationDetails: null as any,
      error: undefined as string | undefined
    }

    try {
      // Test getting conversations
      const { conversations, error: convError } = await messagingService.getUserConversations(userId)
      results.canGetConversations = !convError

      if (convError) {
        console.error('Get conversations error:', convError)
        results.error = convError
      }

      // Get another user to test with (not self)
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', userId)
        .limit(1)

      const testReceiverId = otherUsers?.[0]?.id || userId // Fallback to self if no other users

      // Test creating a conversation
      const { conversation, error: createError } = await messagingService.getOrCreateConversation(userId, testReceiverId)
      results.canCreateConversation = !createError

      if (createError) {
        console.error('Create conversation error:', createError)
        if (!results.error) results.error = createError
      }

      results.conversationDetails = {
        conversationId: conversation?.id,
        participantIds: [userId, testReceiverId],
        testReceiver: otherUsers?.[0]?.email || 'self'
      }

      // Test sending a message (if conversation was created)
      if (conversation && !createError) {
        const { message, error: sendError } = await messagingService.sendMessage(
          conversation.id,
          userId,
          testReceiverId,
          'Test message from diagnostics - ' + new Date().toISOString()
        )
        results.canSendMessage = !sendError

        if (sendError) {
          console.error('Send message error:', sendError)
          if (!results.error) results.error = sendError
        }
      }

    } catch (error) {
      console.error('Messaging test error:', error)
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return results
  }

  // Test product posting functionality
  static async testProductPosting(userId: string): Promise<{
    canGetCategories: boolean
    canCreateProduct: boolean
    canUploadToStorage: boolean
    storageDetails: any
    error?: string
  }> {
    const results = {
      canGetCategories: false,
      canCreateProduct: false,
      canUploadToStorage: false,
      storageDetails: null as any,
      error: undefined as string | undefined
    }

    try {
      // Test getting categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(1)
      results.canGetCategories = !catError

      if (catError) {
        console.error('Categories error:', catError)
      }

      // Test storage bucket existence and permissions
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        const productsBucket = buckets?.find(b => b.id === 'products')
        results.storageDetails = {
          bucketExists: !!productsBucket,
          bucketPublic: productsBucket?.public,
          allBuckets: buckets?.map(b => b.id) || []
        }
      } catch (bucketErr) {
        results.storageDetails = { error: bucketErr }
      }

      // Test storage upload (create a small test image file)
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(0, 0, 100, 100)
      }

      const testBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      })

      const testFileName = `test/${userId}_${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(testFileName, testBlob)

      results.canUploadToStorage = !uploadError

      if (uploadError) {
        console.error('Upload error:', uploadError)
        results.error = uploadError.message
      }

      // Clean up test file
      if (!uploadError) {
        await supabase.storage
          .from('products')
          .remove([testFileName])
      }

      // Test product creation (create a test product)
      const { data: productData, error: prodError } = await supabase
        .from('products')
        .insert({
          artist_id: userId,
          title: 'Test Product - Diagnostics',
          description: 'This is a test product created by diagnostics',
          price: 100,
          image_url: 'https://example.com/test.jpg',
          is_active: false // Mark as inactive so it doesn't appear in marketplace
        })
        .select()

      results.canCreateProduct = !prodError

      if (prodError) {
        console.error('Product creation error:', prodError)
        if (!results.error) results.error = prodError.message
      }

      // Clean up test product
      if (!prodError && productData?.[0]) {
        await supabase
          .from('products')
          .delete()
          .eq('id', productData[0].id)
      }

    } catch (error) {
      console.error('Product posting test error:', error)
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return results
  }

  // Test notifications functionality
  static async testNotifications(userId: string): Promise<{
    canGetNotifications: boolean
    canCreateNotification: boolean
    canMarkAsRead: boolean
    error?: string
  }> {
    const results = {
      canGetNotifications: false,
      canCreateNotification: false,
      canMarkAsRead: false,
      error: undefined as string | undefined
    }

    try {
      // Test getting notifications
      const { notifications, error: getError } = await notificationsService.getUserNotifications(userId)
      results.canGetNotifications = !getError

      // Test creating a notification
      const { notification, error: createError } = await notificationsService.createNotification({
        user_id: userId,
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification from diagnostics',
        priority: 'low'
      })
      results.canCreateNotification = !createError

      // Test marking as read
      if (notification && !createError) {
        const { error: readError } = await notificationsService.markAsRead(notification.id)
        results.canMarkAsRead = !readError
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return results
  }

  // Run comprehensive diagnostics
  static async runFullDiagnostics(userId: string): Promise<{
    database: any
    messaging: any
    productPosting: any
    notifications: any
    summary: {
      totalTests: number
      passedTests: number
      failedTests: number
      issues: string[]
    }
  }> {
    console.log('🔍 Running system diagnostics...')

    const database = await this.testDatabaseTables()
    const messaging = await this.testMessaging(userId)
    const productPosting = await this.testProductPosting(userId)
    const notifications = await this.testNotifications(userId)

    // Calculate summary
    const allTests = [
      ...Object.values(database).filter(v => typeof v === 'boolean'),
      ...Object.values(messaging).filter(v => typeof v === 'boolean'),
      ...Object.values(productPosting).filter(v => typeof v === 'boolean'),
      ...Object.values(notifications).filter(v => typeof v === 'boolean')
    ]

    const totalTests = allTests.length
    const passedTests = allTests.filter(Boolean).length
    const failedTests = totalTests - passedTests

    const issues: string[] = []
    if (!database.conversations) issues.push('Conversations table not accessible')
    if (!database.messages) issues.push('Messages table not accessible')
    if (!database.notifications) issues.push('Notifications table not accessible')
    if (!database.products) issues.push('Products table not accessible')
    if (!database.categories) issues.push('Categories table not accessible')
    if (!messaging.canGetConversations) issues.push('Cannot fetch conversations')
    if (!messaging.canSendMessage) issues.push('Cannot send messages')
    if (!productPosting.canCreateProduct) issues.push('Cannot create products')
    if (!productPosting.canUploadToStorage) issues.push('Cannot upload to storage')
    if (!notifications.canGetNotifications) issues.push('Cannot fetch notifications')

    const results = {
      database,
      messaging,
      productPosting,
      notifications,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        issues
      }
    }

    console.log('📊 Diagnostics Results:', results)
    return results
  }
}

// Global function for easy access in browser console
declare global {
  interface Window {
    runSystemDiagnostics: (userId: string) => Promise<any>
  }
}

window.runSystemDiagnostics = SystemDiagnostics.runFullDiagnostics
