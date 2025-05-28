// Messaging Service
// This service handles all messaging functionality

import { supabase } from '@/lib/supabase'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  read_at?: string
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
  }
  receiver?: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
  }
}

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_id?: string
  last_message_at: string
  created_at: string
  updated_at: string
  participant?: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
    is_online?: boolean
    last_seen?: string
  }
  last_message?: Message
  unread_count: number
}

class MessagingService {
  // Get or create conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string): Promise<{ conversation: Conversation | null; error?: string }> {
    try {
      // Ensure consistent ordering of participant IDs
      const [participant1, participant2] = [userId1, userId2].sort()

      // First, try to find existing conversation with simple query
      const { data: existingConversations, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${participant1},participant_2_id.eq.${participant2}),and(participant_1_id.eq.${participant2},participant_2_id.eq.${participant1})`)

      if (findError) {
        console.error('Error finding conversation:', findError)
      }

      if (existingConversations && existingConversations.length > 0) {
        const existingConversation = existingConversations[0]

        // Get participant details
        const { data: participantsData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .in('id', [participant1, participant2])

        const participantsMap = new Map(participantsData?.map(p => [p.id, p]) || [])
        const otherParticipantId = existingConversation.participant_1_id === userId1 ? existingConversation.participant_2_id : existingConversation.participant_1_id
        const otherParticipant = participantsMap.get(otherParticipantId)

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', existingConversation.id)
          .eq('receiver_id', userId1)
          .is('read_at', null)

        return {
          conversation: {
            ...existingConversation,
            participant: otherParticipant,
            unread_count: unreadCount || 0
          }
        }
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: participant1,
          participant_2_id: participant2
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        return { conversation: null, error: createError.message }
      }

      // Get participant details for new conversation
      const { data: participantsData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', [participant1, participant2])

      const participantsMap = new Map(participantsData?.map(p => [p.id, p]) || [])
      const otherParticipantId = newConversation.participant_1_id === userId1 ? newConversation.participant_2_id : newConversation.participant_1_id
      const otherParticipant = participantsMap.get(otherParticipantId)

      return {
        conversation: {
          ...newConversation,
          participant: otherParticipant,
          unread_count: 0
        }
      }
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error)
      return {
        conversation: null,
        error: error instanceof Error ? error.message : 'Failed to get conversation'
      }
    }
  }

  // Get user's conversations
  async getUserConversations(userId: string): Promise<{ conversations: Conversation[] | null; error?: string }> {
    try {
      // First, get basic conversation data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (conversationsError) {
        return { conversations: null, error: conversationsError.message }
      }

      if (!conversationsData || conversationsData.length === 0) {
        return { conversations: [] }
      }

      // Get participant details separately
      const participantIds = new Set<string>()
      conversationsData.forEach(conv => {
        participantIds.add(conv.participant_1_id)
        participantIds.add(conv.participant_2_id)
      })

      const { data: participantsData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', Array.from(participantIds))

      const participantsMap = new Map(participantsData?.map(p => [p.id, p]) || [])

      // Get user status for all participants
      const { data: statusData } = await supabase
        .from('user_status')
        .select('user_id, is_online, last_seen')
        .in('user_id', Array.from(participantIds))

      const statusMap = new Map(statusData?.map(s => [s.user_id, s]) || [])

      // Process conversations
      const processedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherParticipantId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
          const otherParticipant = participantsMap.get(otherParticipantId)
          const status = statusMap.get(otherParticipantId)

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', userId)
            .is('read_at', null)

          // Get last message if exists
          let lastMessage = null
          if (conv.last_message_id) {
            const { data: messageData } = await supabase
              .from('messages')
              .select('id, content, created_at, sender_id')
              .eq('id', conv.last_message_id)
              .single()

            lastMessage = messageData
          }

          return {
            ...conv,
            participant: otherParticipant ? {
              ...otherParticipant,
              is_online: status?.is_online || false,
              last_seen: status?.last_seen
            } : null,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      return { conversations: processedConversations.filter(c => c.participant) }
    } catch (error) {
      return {
        conversations: null,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations'
      }
    }
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<{ messages: Message[] | null; error?: string }> {
    try {
      // Get basic message data
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (messagesError) {
        return { messages: null, error: messagesError.message }
      }

      if (!messagesData || messagesData.length === 0) {
        return { messages: [] }
      }

      // Get unique user IDs
      const userIds = new Set<string>()
      messagesData.forEach(msg => {
        userIds.add(msg.sender_id)
        userIds.add(msg.receiver_id)
      })

      // Get user details
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', Array.from(userIds))

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

      // Combine messages with user data
      const messagesWithUsers = messagesData.map(msg => ({
        ...msg,
        sender: usersMap.get(msg.sender_id),
        receiver: usersMap.get(msg.receiver_id)
      }))

      return { messages: messagesWithUsers }
    } catch (error) {
      return {
        messages: null,
        error: error instanceof Error ? error.message : 'Failed to fetch messages'
      }
    }
  }

  // Send a message
  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<{ message: Message | null; error?: string }> {
    try {
      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: 'text'
        })
        .select()
        .single()

      if (messageError) {
        return { message: null, error: messageError.message }
      }

      // Get sender and receiver details
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', [senderId, receiverId])

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

      const messageWithUsers = {
        ...messageData,
        sender: usersMap.get(senderId),
        receiver: usersMap.get(receiverId)
      }

      return { message: messageWithUsers }
    } catch (error) {
      return {
        message: null,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .is('read_at', null)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read'
      }
    }
  }

  // Update user online status
  async updateUserStatus(userId: string, isOnline: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: isOnline ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      }
    }
  }

  // Search conversations
  async searchConversations(userId: string, query: string): Promise<{ conversations: Conversation[] | null; error?: string }> {
    try {
      const { conversations, error } = await this.getUserConversations(userId)
      
      if (error || !conversations) {
        return { conversations: null, error }
      }

      const filtered = conversations.filter(conv =>
        conv.participant?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        conv.last_message?.content?.toLowerCase().includes(query.toLowerCase())
      )

      return { conversations: filtered }
    } catch (error) {
      return {
        conversations: null,
        error: error instanceof Error ? error.message : 'Failed to search conversations'
      }
    }
  }
}

export const messagingService = new MessagingService()
