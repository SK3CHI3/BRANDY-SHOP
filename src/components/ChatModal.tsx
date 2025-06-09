import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messagingService } from '@/services/messaging'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  MessageCircle,
  User,
  Clock,
  CheckCheck,
  X,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at?: string
}

interface Artist {
  id: string
  full_name: string
  avatar_url?: string
  role: string
  rating?: number
  total_sales?: number
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  artist: Artist
  productTitle?: string
  productId?: string
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  artist, 
  productTitle,
  productId 
}) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user && artist.id) {
      initializeChat()
    }
  }, [isOpen, user, artist.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get or create conversation with the artist
      const { conversation, error } = await messagingService.getOrCreateConversation(
        user.id,
        artist.id
      )

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to initialize chat',
          variant: 'destructive',
        })
        return
      }

      if (conversation) {
        setConversationId(conversation.id)
        await fetchMessages(conversation.id)

        // Send initial message about the product if this is the first interaction
        if (productTitle && messages.length === 0) {
          const initialMessage = `Hi! I'm interested in your design "${productTitle}". Could you tell me more about licensing options?`
          setNewMessage(initialMessage)
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize chat',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const { messages: fetchedMessages, error } = await messagingService.getConversationMessages(convId)

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(fetchedMessages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user || sendingMessage) return

    try {
      setSendingMessage(true)

      const { message, error } = await messagingService.sendMessage(
        conversationId,
        user.id,
        artist.id,
        newMessage.trim()
      )

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        })
        return
      }

      if (message) {
        setMessages(prev => [...prev, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Sign In Required
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Please sign in to chat with artists
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        {/* Chat Header */}
        <DialogHeader className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={artist.avatar_url || '/placeholder.svg'} />
                <AvatarFallback>
                  {artist.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {artist.full_name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="secondary" className="text-xs">
                    {artist.role.charAt(0).toUpperCase() + artist.role.slice(1)}
                  </Badge>
                  {artist.rating && (
                    <span>★ {artist.rating}</span>
                  )}
                  {artist.total_sales && (
                    <span>• {artist.total_sales} sales</span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {productTitle && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Discussing:</strong> {productTitle}
              </p>
            </div>
          )}
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Start a conversation</p>
              <p className="text-sm text-gray-500">
                Send a message to {artist.full_name} about their design
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender_id === user.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                    {message.sender_id === user.id && (
                      <CheckCheck className={`h-3 w-3 ${message.read_at ? 'text-blue-200' : 'text-blue-300'}`} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1"
              disabled={sendingMessage}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatModal
