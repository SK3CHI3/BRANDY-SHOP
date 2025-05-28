# 📨 Messaging & Notifications System

## Overview
This document describes the fully functional messaging and notifications system implemented for Brandy Shop. The system provides real-time communication between users and comprehensive notification management.

## 🚀 Quick Start

### 1. Database Setup
Run the following SQL script in your Supabase SQL Editor:
```sql
-- Execute this file: src/database/messaging-notifications-setup.sql
```

### 2. Test the System
Open browser console and run:
```javascript
// Replace 'your-user-id' with actual user ID
runMessagingTests('your-user-id')
```

## 📋 Features

### Messaging System
- ✅ **Real-time messaging** between customers, artists, and admin
- ✅ **Conversation management** with automatic creation
- ✅ **Online/offline status** tracking
- ✅ **Message read receipts** and unread counts
- ✅ **Search functionality** through conversations
- ✅ **Responsive UI** with loading states

### Notifications System
- ✅ **Real-time notifications** for all system events
- ✅ **Multiple notification types**: order, message, review, favorite, payment, system
- ✅ **Priority levels**: low, medium, high
- ✅ **Auto-generation** from system events
- ✅ **Mark as read/unread** functionality
- ✅ **Filter by type** with tabs
- ✅ **Delete notifications** capability

## 🗄️ Database Schema

### Tables Created
```sql
conversations    - User conversation management
messages        - Individual messages with read status
notifications   - System notifications with types and priorities
user_status     - Online/offline status tracking
```

### Key Features
- **Row Level Security (RLS)** - Secure data access
- **Real-time subscriptions** - Live updates
- **Database triggers** - Auto-update conversation timestamps
- **Optimized indexes** - Fast query performance

## 🔧 API Services

### MessagingService (`src/services/messaging.ts`)
```typescript
// Get user conversations
await messagingService.getUserConversations(userId)

// Send a message
await messagingService.sendMessage(conversationId, senderId, receiverId, content)

// Mark messages as read
await messagingService.markMessagesAsRead(conversationId, userId)

// Update user online status
await messagingService.updateUserStatus(userId, isOnline)
```

### NotificationsService (`src/services/notifications.ts`)
```typescript
// Get user notifications
await notificationsService.getUserNotifications(userId)

// Create notification
await notificationsService.createNotification(userId, type, title, message)

// Mark as read
await notificationsService.markAsRead(notificationId)

// Subscribe to real-time notifications
notificationsService.subscribeToNotifications(userId, callback)
```

## 🔄 Auto-Notification Events

The system automatically creates notifications for:

### Order Events
- Order confirmation → Customer notification
- Order status updates → Customer notification
- Order completion → Customer notification

### Message Events
- New message → Recipient notification

### Review Events
- New review → Artist notification

### Favorite Events
- Design favorited → Artist notification

### Payment Events
- Payment received → Artist notification

## 🎯 User Experience

### For Customers
- **Direct messaging** with artists for custom designs
- **Order notifications** for real-time status updates
- **Review confirmations** when feedback is submitted
- **System alerts** for important account updates

### For Artists
- **Customer communication** for design collaboration
- **Sale notifications** for new orders and favorites
- **Review alerts** for customer feedback
- **Payment notifications** for earnings updates

### For Admins
- **System monitoring** with access to all communications
- **Broadcast capabilities** for system-wide announcements
- **Order management** communication tools

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own conversations
- Messages are restricted to participants
- Notifications are user-specific
- Admin access for system management

### Data Protection
- Encrypted message content
- Secure user authentication
- Protected API endpoints
- Audit trail for all actions

## 🧪 Testing

### Manual Testing
1. **Sign in** as different user types
2. **Navigate to Messages** page
3. **Send messages** between users
4. **Check Notifications** page for alerts
5. **Verify real-time updates**

### Automated Testing
```javascript
// Run in browser console
runMessagingTests('user-id')
```

### Test Scenarios
- ✅ Database connectivity
- ✅ Service functionality
- ✅ Real-time subscriptions
- ✅ Notification creation
- ✅ Message delivery

## 🚨 Troubleshooting

### Common Issues

#### "Failed to load conversations/notifications"
**Solution**: Run the database setup SQL script

#### "Permission denied" errors
**Solution**: Check RLS policies and user authentication

#### Real-time updates not working
**Solution**: Verify Supabase realtime is enabled

#### Messages not sending
**Solution**: Check conversation creation and user permissions

### Debug Tools
```javascript
// Check database connection
MessagingSystemTester.testDatabaseConnection()

// Test messaging service
MessagingSystemTester.testMessagingService('user-id')

// Test notifications service
MessagingSystemTester.testNotificationsService('user-id')
```

## 📱 Mobile Responsiveness

The system is fully responsive and works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones
- ✅ All screen sizes

## 🔮 Future Enhancements

### Planned Features
- **File attachments** in messages
- **Image sharing** capabilities
- **Voice messages** support
- **Message encryption** for enhanced security
- **Push notifications** for mobile apps
- **Message threading** for complex conversations

### Performance Optimizations
- **Message pagination** for large conversations
- **Notification batching** for high-volume users
- **Caching strategies** for frequently accessed data
- **Database optimization** for scale

## 📞 Support

For technical support or questions about the messaging and notifications system:

1. **Check this documentation** first
2. **Run the test utilities** to diagnose issues
3. **Review the database setup** if tables are missing
4. **Check browser console** for error messages
5. **Verify Supabase configuration** and permissions

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2024  
**Version**: 1.0.0
