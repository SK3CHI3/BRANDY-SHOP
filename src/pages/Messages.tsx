import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  type: 'text' | 'image' | 'file'
  read: boolean
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    avatar: string
    role: 'artist' | 'customer' | 'admin'
    online: boolean
    lastSeen?: string
  }
  lastMessage: Message
  unreadCount: number
  pinned: boolean
  archived: boolean
}

const Messages = () => {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participant: {
        id: 'artist1',
        name: 'Sarah Wanjiku',
        avatar: '/placeholder.svg',
        role: 'artist',
        online: true
      },
      lastMessage: {
        id: 'msg1',
        content: 'I can definitely create that custom design for you! When do you need it by?',
        timestamp: '2024-01-15T14:30:00Z',
        senderId: 'artist1',
        type: 'text',
        read: false
      },
      unreadCount: 2,
      pinned: true,
      archived: false
    },
    {
      id: '2',
      participant: {
        id: 'customer1',
        name: 'John Mwangi',
        avatar: '/placeholder.svg',
        role: 'customer',
        online: false,
        lastSeen: '2024-01-15T12:00:00Z'
      },
      lastMessage: {
        id: 'msg2',
        content: 'Thank you for the quick delivery! The t-shirt looks amazing.',
        timestamp: '2024-01-15T10:15:00Z',
        senderId: 'customer1',
        type: 'text',
        read: true
      },
      unreadCount: 0,
      pinned: false,
      archived: false
    },
    {
      id: '3',
      participant: {
        id: 'admin1',
        name: 'Brandy Support',
        avatar: '/placeholder.svg',
        role: 'admin',
        online: true
      },
      lastMessage: {
        id: 'msg3',
        content: 'Your artist application has been approved! Welcome to Brandy.',
        timestamp: '2024-01-14T16:45:00Z',
        senderId: 'admin1',
        type: 'text',
        read: true
      },
      unreadCount: 0,
      pinned: false,
      archived: false
    }
  ]

  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hi! I love your wildlife designs. Could you create a custom piece featuring elephants?',
      timestamp: '2024-01-15T13:00:00Z',
      senderId: user?.id || 'current-user',
      type: 'text',
      read: true
    },
    {
      id: '2',
      content: 'Hello! Thank you for reaching out. I\'d be happy to create an elephant design for you. What style are you looking for?',
      timestamp: '2024-01-15T13:15:00Z',
      senderId: 'artist1',
      type: 'text',
      read: true
    },
    {
      id: '3',
      content: 'I was thinking something realistic but with a touch of traditional Kenyan patterns in the background.',
      timestamp: '2024-01-15T13:20:00Z',
      senderId: user?.id || 'current-user',
      type: 'text',
      read: true
    },
    {
      id: '4',
      content: 'I can definitely create that custom design for you! When do you need it by?',
      timestamp: '2024-01-15T14:30:00Z',
      senderId: 'artist1',
      type: 'text',
      read: false
    }
  ]

  useEffect(() => {
    // Simulate loading conversations
    setTimeout(() => {
      setConversations(mockConversations)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages)
      // Mark messages as read
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: user?.id || 'current-user',
      type: 'text',
      read: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? { ...conv, lastMessage: message }
          : conv
      )
    )
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

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(conv => conv.id === selectedConversation)

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Communicate with artists, customers, and support
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.participant.avatar} />
                              <AvatarFallback>
                                {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participant.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.participant.name}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className={`text-xs ${getRoleColor(conversation.participant.role)}`}>
                                {conversation.participant.role}
                              </Badge>
                              {conversation.pinned && (
                                <Star className="h-3 w-3 text-yellow-500 ml-2" />
                              )}
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
            {selectedConversation && selectedConv ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConv.participant.avatar} />
                          <AvatarFallback>
                            {selectedConv.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConv.participant.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConv.participant.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedConv.participant.online
                            ? 'Online'
                            : `Last seen ${formatTime(selectedConv.participant.lastSeen || '')}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.timestamp)}</span>
                          {message.senderId === user?.id && (
                            <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-300' : 'text-orange-200'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
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
