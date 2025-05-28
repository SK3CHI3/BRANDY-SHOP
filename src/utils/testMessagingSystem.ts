// Test utility for messaging and notifications system
// This file helps test the messaging and notifications functionality

import { supabase } from '@/lib/supabase'
import { messagingService } from '@/services/messaging'
import { notificationsService } from '@/services/notifications'

export class MessagingSystemTester {
  // Test database connectivity
  static async testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test if tables exist
      const { data: tablesData, error: tablesError } = await supabase
        .from('conversations')
        .select('count(*)')
        .limit(1)

      if (tablesError) {
        if (tablesError.code === 'PGRST116' || tablesError.message?.includes('relation') || tablesError.message?.includes('does not exist')) {
          return {
            success: false,
            message: 'Database tables not found. Please run the setup SQL script: src/database/messaging-notifications-setup.sql'
          }
        }
        return {
          success: false,
          message: `Database error: ${tablesError.message}`
        }
      }

      return {
        success: true,
        message: 'Database connection successful. All tables are accessible.'
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Test messaging service
  static async testMessagingService(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Test fetching conversations
      const { conversations, error } = await messagingService.getUserConversations(userId)
      
      if (error) {
        return {
          success: false,
          message: `Messaging service error: ${error}`
        }
      }

      return {
        success: true,
        message: `Messaging service working. Found ${conversations?.length || 0} conversations.`
      }
    } catch (error) {
      return {
        success: false,
        message: `Messaging service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Test notifications service
  static async testNotificationsService(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Test fetching notifications
      const { notifications, error } = await notificationsService.getUserNotifications(userId)
      
      if (error) {
        return {
          success: false,
          message: `Notifications service error: ${error}`
        }
      }

      return {
        success: true,
        message: `Notifications service working. Found ${notifications?.length || 0} notifications.`
      }
    } catch (error) {
      return {
        success: false,
        message: `Notifications service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Create test data
  static async createTestData(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Create a test notification
      const { notification, error } = await notificationsService.createNotification(
        userId,
        'system',
        'Welcome to Brandy Shop!',
        'Your messaging and notifications system is now active and ready to use.',
        '/dashboard',
        'medium',
        { test: true }
      )

      if (error) {
        return {
          success: false,
          message: `Failed to create test notification: ${error}`
        }
      }

      return {
        success: true,
        message: 'Test notification created successfully! Check your notifications page.'
      }
    } catch (error) {
      return {
        success: false,
        message: `Test data creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Run comprehensive test
  static async runComprehensiveTest(userId: string): Promise<{
    databaseConnection: { success: boolean; message: string }
    messagingService: { success: boolean; message: string }
    notificationsService: { success: boolean; message: string }
    testDataCreation: { success: boolean; message: string }
  }> {
    const results = {
      databaseConnection: await this.testDatabaseConnection(),
      messagingService: await this.testMessagingService(userId),
      notificationsService: await this.testNotificationsService(userId),
      testDataCreation: await this.createTestData(userId)
    }

    return results
  }
}

// Helper function to run tests from browser console
export const runMessagingTests = async (userId: string) => {
  console.log('🧪 Running Messaging & Notifications System Tests...')
  
  const results = await MessagingSystemTester.runComprehensiveTest(userId)
  
  console.log('\n📊 Test Results:')
  console.log('================')
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${testName}: ${result.message}`)
  })
  
  const allPassed = Object.values(results).every(r => r.success)
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Messaging and notifications system is fully functional.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the database setup and configuration.')
  }
  
  return results
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).runMessagingTests = runMessagingTests
  (window as any).MessagingSystemTester = MessagingSystemTester
}
