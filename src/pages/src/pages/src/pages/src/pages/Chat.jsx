import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { getAblyClient, createChatChannel, subscribeToChannel, publishToChannel, getChannelPresence, enterChannelPresence, leaveChannelPresence } from '../lib/ably'
import { useAuth } from '../context/AuthContext'
import { uploadFile } from '../lib/cloudinary'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [activeRoom, setActiveRoom] = useState('global')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [dailyLimit] = useState(100)
  const [isTyping, setIsTyping] = useState(false)
  const channelRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { user, profile } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Check daily message count
    const today = new Date().toDateString()
    const savedCount = localStorage.getItem(`chat_count_${today}`)
    if (savedCount) {
      setMessageCount(parseInt(savedCount))
    }

    // Initialize Ably channel
    const initChat = async () => {
      try {
        const channel = createChatChannel('grace-chat-global')
        channelRef.current = channel

        // Subscribe to messages
        subscribeToChannel(channel, 'message', (message) => {
          setMessages(prev => [...prev, message.data])
        })

        // Subscribe to typing indicators
        subscribeToChannel(channel, 'typing', (data) => {
          if (data.data.userId !== user?.id) {
            setTypingUsers(prev => {
              if (!prev.includes(data.data.username)) {
                return [...prev, data.data.username]
              }
              return prev
            })
            
            setTimeout(() => {
              setTypingUsers(prev => prev.filter(u => u !== data.data.username))
            }, 3000)
          }
        })

        // Enter presence
        if (user) {
          await enterChannelPresence(channel, {
            username: profile?.username || 'Anonymous',
            userId: user.id,
          })
        }

        // Get presence
        const presence = await getChannelPresence(channel)
        setOnlineUsers(presence.map(p => p.data))

        // Load message history
        const { data: historyData } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', 'global')
          .order('created_at', { ascending: false })
          .limit(50)

        if (historyData) {
          setMessages(historyData.reverse())
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        toast.error('Failed to connect to chat')
      }
    }

    initChat()

    return () => {
      if (channelRef.current && user) {
        leaveChannelPresence(channelRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkMessageLimit = () => {
    const today = new Date().toDateString()
    const savedCount = localStorage.getItem(`chat_count_${today}`)
    const currentCount = savedCount ? parseInt(savedCount) : 0
    
    if (currentCount >= dailyLimit) {
      toast.error('Daily message limit reached. Time to read the Bible! 📖', {
        duration: 5000,
      })
      return false
    }
    
    return true
  }

  const incrementMessageCount = () => {
    const today = new Date().toDateString()
    const savedCount = localStorage.getItem(`chat_count_${today}`)
    const currentCount = savedCount ? parseInt(savedCount) : 0
    const newCount = currentCount + 1
    localStorage.setItem(`chat_count_${today}`, newCount.toString())
    setMessageCount(newCount)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    if (!checkMessageLimit()) return

    const messageData = {
      id: Date.now(),
      room_id: 'global',
      sender_id: user.id,
      sender_name: profile?.username || 'Anonymous',
      sender_avatar: profile?.avatar_url,
      content: newMessage,
      type: 'text',
      created_at: new Date().toISOString(),
    }

    try {
      // Publish to Ably
      await publishToChannel(channelRef.current, 'message', messageData)
      
      // Save to Supabase
      await supabase.from('messages').insert([messageData])

      // Update local state
      setMessages(prev => [...prev, messageData])
      setNewMessage('')
      setShowEmoji(false)
      incrementMessageCount()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const sendFileMessage = async (file) => {
    if (!checkMessageLimit()) return

    try {
      const fileUrl = await uploadFile(file, true)
      
      const messageData = {
        id: Date.now(),
        room_id: 'global',
        sender_id: user.id,
        sender_name: profile?.username || 'Anonymous',
        sender_avatar: profile?.avatar_url,
        content: fileUrl,
        type: file.type.startsWith('image') ? 'image' : 'file',
        file_name: file.name,
        created_at: new Date().toISOString(),
      }

      await publishToChannel(channelRef.current, 'message', messageData)
      await supabase.from('messages').insert([messageData])
      
      setMessages(prev => [...prev, messageData])
      incrementMessageCount()
      toast.success('File sent!')
    } catch (error) {
      console.error('Error sending file:', error)
      toast.error('Failed to send file')
    }
  }

  const handleTyping = () => {
    if (!isTyping && user) {
      setIsTyping(true)
      publishToChannel(channelRef.current, 'typing', {
        userId: user.id,
        username: profile?.username || 'Anonymous',
      })
    }

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmoji(false)
  }

  const deleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return

    try {
      await supabase.from('messages').delete().eq('id', messageId)
      setMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const remainingMessages = dailyLimit - messageCount

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-white font-heading text-xl font-bold">
                  💬 Global Chat
                </h2>
                <p className="text-purple-200 text-sm">
                  {onlineUsers.length} online
                </p>
              </div>
              <div className="text-white text-sm">
                {remainingMessages <= 10 ? (
                  <span className="bg-red-500 px-3 py-1 rounded-full">
                    {remainingMessages} messages left
                  </span>
                ) : (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {remainingMessages} left
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 flex-wrap">
              {onlineUsers.map((onlineUser, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full text-xs"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{onlineUser.username}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-2' : ''}`}>
                  <div className={`p-3 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <p className="text-sm font-semibold mb-1">
                      {message.sender_name}
                    </p>
                    {message.type === 'text' && <p>{message.content}</p>}
                    {message.type === 'image' && (
                      <img src={message.content} alt="Shared" className="rounded-lg max-h-48" />
                    )}
                    {message.type === 'file' && (
                      <a href={message.content} target="_blank" className="underline">
                        📎 {message.file_name}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                    {message.sender_id === user?.id && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {showEmoji && (
              <div className="mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                😊
              </button>
              <label className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer">
                📎
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && sendFileMessage(e.target.files[0])}
                />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button onClick={sendMessage} className="btn-primary">
                Send
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Chat
