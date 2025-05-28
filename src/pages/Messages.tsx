import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messagingService, type Message, type Conversation } from '@/services/messaging'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Star,
  Archive,
  Trash2,
  Circle,
  CheckCheck,
  Lock,
  ArrowLeft,
  User,
  Palette,
  Users
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Link } from 'react-router-dom'

// Interfaces are now imported from the messaging service

const Messages = () => {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null)

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { conversations, error } = await messagingService.getUserConversations(user.id)

      if (error) {
        console.error('Error fetching conversations:', error)
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        })
        return
      }

      setConversations(conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { messages, error } = await messagingService.getConversationMessages(conversationId)

      if (error) {
        console.error('Error fetching messages:', error)
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        })
        return
      }

      setMessages(messages || [])

      // Mark messages as read
      if (user) {
        await messagingService.markMessagesAsRead(conversationId, user.id)
        // Update conversation unread count
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, unread_count: 0 }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchConversations()

      // Update user status to online
      messagingService.updateUserStatus(user.id, true)

      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            const newMessage = payload.new as Message

            // If the message is for the currently selected conversation, add it to messages
            if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
              setMessages(prev => [...prev, newMessage])
            }

            // Update conversations list
            fetchConversations()

            // Show toast notification
            toast({
              title: 'New Message',
              description: 'You have received a new message',
            })
          }
        )
        .subscribe()

      setRealtimeSubscription(subscription)
    }

    // Cleanup function
    return () => {
      if (user) {
        messagingService.updateUserStatus(user.id, false)
      }
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription)
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sendingMessage) return

    try {
      setSendingMessage(true)
      console.log('Sending message:', {
        conversationId: selectedConversation.id,
        senderId: user.id,
        receiverId: selectedConversation.participant?.id,
        content: newMessage.trim()
      })

      // Validate required data
      if (!selectedConversation.participant?.id) {
        throw new Error('Invalid conversation participant')
      }

      const { message, error } = await messagingService.sendMessage(
        selectedConversation.id,
        user.id,
        selectedConversation.participant.id,
        newMessage.trim()
      )

      if (error) {
        console.error('Messaging service error:', error)
        toast({
          title: 'Error',
          description: `Failed to send message: ${error}`,
          variant: 'destructive',
        })
        return
      }

      if (message) {
        console.log('Message sent successfully:', message)
        setMessages(prev => [...prev, message])
        setNewMessage('')

        // Update conversations list to reflect new last message
        fetchConversations()

        toast({
          title: 'Message Sent',
          description: 'Your message has been delivered',
        })
      } else {
        throw new Error('No message returned from service')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!user) return

    if (query.trim()) {
      try {
        const { conversations, error } = await messagingService.searchConversations(user.id, query)

        if (error) {
          console.error('Error searching conversations:', error)
          return
        }

        setConversations(conversations || [])
      } catch (error) {
        console.error('Error searching conversations:', error)
      }
    } else {
      // If search is empty, fetch all conversations
      fetchConversations()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artist': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredConversations = conversations

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  // Create a test conversation for demonstration
  const createTestConversation = async () => {
    if (!user || import.meta.env.PROD) return

    try {
      // Find another user to create a conversation with
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .neq('id', user.id)
        .limit(1)

      if (!otherUsers || otherUsers.length === 0) {
        toast({
          title: 'No Other Users',
          description: 'No other users found to create a test conversation',
          variant: 'destructive',
        })
        return
      }

      const otherUser = otherUsers[0]

      // Create or get conversation
      const { conversation, error } = await messagingService.getOrCreateConversation(user.id, otherUser.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create test conversation',
          variant: 'destructive',
        })
        return
      }

      if (conversation) {
        // Send a test message
        await messagingService.sendMessage(
          conversation.id,
          user.id,
          otherUser.id,
          `Hello! This is a test message from ${user.user_metadata?.full_name || 'Test User'}.`
        )

        // Refresh conversations
        fetchConversations()

        toast({
          title: 'Test Conversation Created',
          description: `Created conversation with ${otherUser.full_name}`,
        })
      }
    } catch (error) {
      console.error('Error creating test conversation:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Icon with lock overlay */}
            <div className="relative inline-block mb-8">
              <MessageCircle className="h-24 w-24 text-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Connect & Communicate
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to access your messages and communicate directly with artists,
              customers, and support. Build relationships and collaborate on amazing projects!
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Direct Communication</h3>
                <p className="text-sm text-gray-600">Chat with artists and customers</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Palette className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Project Collaboration</h3>
                <p className="text-sm text-gray-600">Work together on custom designs</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Support</h3>
                <p className="text-sm text-gray-600">Get help when you need it</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => openAuthModal('signin')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <User className="h-5 w-5 mr-2" />
                Sign In to Messages
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openAuthModal('signup')}
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
              >
                <Palette className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>

            {/* Continue shopping link */}
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Explore marketplace
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Communicate with artists, customers, and support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Conversations</CardTitle>
                  <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px] min-w-[44px]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 min-h-[48px] text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {loading ? (
                  <div className="space-y-3 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 sm:p-8 text-center">
                    <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Start a conversation with artists, customers, or support</p>
                    {!import.meta.env.PROD && (
                      <Button
                        size="sm"
                        onClick={createTestConversation}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
                      >
                        Create Test Conversation
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                        }`}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                              <AvatarImage src={conversation.participant?.avatar_url || '/placeholder.svg'} />
                              <AvatarFallback className="text-xs sm:text-sm">
                                {conversation.participant?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participant?.is_online && (
                              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {conversation.participant?.full_name || 'Unknown User'}
                              </h4>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {conversation.last_message?.content || 'No messages yet'}
                              </p>
                              {conversation.unread_count > 0 && (
                                <Badge className="bg-orange-500 text-white text-xs flex-shrink-0 ml-2">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className={`text-xs ${getRoleColor(conversation.participant?.role || 'customer')}`}>
                                {conversation.participant?.role || 'customer'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConversation.participant?.avatar_url || '/placeholder.svg'} />
                          <AvatarFallback>
                            {selectedConversation.participant?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.participant?.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.participant?.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.participant?.is_online
                            ? 'Online'
                            : selectedConversation.participant?.last_seen
                              ? `Last seen ${formatTime(selectedConversation.participant.last_seen)}`
                              : 'Offline'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.sender_id === user?.id ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.created_at)}</span>
                          {message.sender_id === user?.id && (
                            <CheckCheck className={`h-3 w-3 ${message.read_at ? 'text-blue-300' : 'text-orange-200'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px] min-w-[44px]">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px] min-w-[44px]">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 min-h-[48px] text-base"
                      style={{ fontSize: '16px' }}
                    />
                    <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px] min-w-[44px]">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="min-h-[48px] min-w-[48px] flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Messages
