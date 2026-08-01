import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MessageSquare, AlertTriangle, Heart, RotateCcw } from 'lucide-react'
import { Button, Card } from '@/components/ui/Primitives'
import { freedomWallDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { FreedomMessage, NoteColor } from '@/lib/types'

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', shadow: 'shadow-yellow-300/50' },
  { name: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', shadow: 'shadow-pink-300/50' },
  { name: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', shadow: 'shadow-blue-300/50' },
  { name: 'green', bg: 'bg-green-200', border: 'border-green-300', shadow: 'shadow-green-300/50' },
  { name: 'orange', bg: 'bg-orange-200', border: 'border-orange-300', shadow: 'shadow-orange-300/50' },
]

const ROTATIONS = [-2, -1, 0, 1, 2, 3, -3]

// Basic bad word filter
const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'die']

function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return BAD_WORDS.some(word => lowerText.includes(word))
}

export default function Community() {
  const [messages, setMessages] = useState<FreedomMessage[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow')
  const [warning, setWarning] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      const data = await freedomWallDb.list()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWarning('')

    if (!newMessage.trim()) {
      setWarning('Please write a message')
      return
    }

    if (newMessage.length > 200) {
      setWarning('Message must be 200 characters or less')
      return
    }

    if (containsBadWords(newMessage)) {
      setWarning('Please keep it positive - inappropriate language is not allowed')
      return
    }

    try {
      await freedomWallDb.submit({
        message: newMessage.trim(),
        color: selectedColor,
      })
      setNewMessage('')
      setShowForm(false)
      setSelectedColor('yellow')
      await loadMessages()
    } catch (error) {
      setWarning('Failed to post message. Please try again.')
    }
  }

  async function handleLike(id: string) {
    try {
      await freedomWallDb.like(id)
      await loadMessages()
    } catch (error) {
      console.error('Failed to like message:', error)
    }
  }

  function getRandomRotation() {
    return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]
  }

  function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto" />
          <p className="mt-4 text-ink-600">Loading freedom wall...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-navy-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-8 w-8 text-gold-400" />
              <h1 className="text-3xl font-extrabold">Community Freedom Wall</h1>
            </div>
            <p className="text-navy-100/80 max-w-2xl">
              Share your thoughts, ideas, and messages with the community. This is a space for positive expression - keep it respectful and kind!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-6xl mx-auto px-6 mt-6"
      >
        <Card className="bg-amber-50 border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Community Guidelines</p>
            <p className="text-amber-700 mt-1">
              Please be respectful and positive. Inappropriate language, bullying, or harmful content will be removed. 
              Keep messages under 200 characters.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Add Message Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-6xl mx-auto px-6 mt-6"
      >
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Your Message
          </Button>
        ) : (
          <Card className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-ink-900 mb-4">Add Your Message</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share something positive..."
                className="w-full p-4 border border-surface-muted rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                rows={4}
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-ink-400">
                <span>{newMessage.length}/200 characters</span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-ink-900 mb-2">Choose note color:</p>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name as NoteColor)}
                      className={`w-8 h-8 rounded-full ${color.bg} ${color.border} border-2 ${
                        selectedColor === color.name ? 'ring-2 ring-navy-900 ring-offset-2' : ''
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>

              {warning && (
                <p className="mt-4 text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {warning}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  className="bg-navy-900 text-white hover:bg-navy-800 rounded-xl px-6 py-2"
                >
                  Post Message
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setNewMessage('')
                    setWarning('')
                    setSelectedColor('yellow')
                  }}
                  variant="ghost"
                  className="rounded-xl px-6 py-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </motion.div>

      {/* Freedom Wall */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-6xl mx-auto px-6 py-8"
      >
        <div className="bg-amber-900/20 rounded-3xl p-8 min-h-[600px] border-4 border-amber-800/30 shadow-inner">
          {/* Corkboard texture */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, #8B4513 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          {messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-16 w-16 text-amber-600/50 mx-auto mb-4" />
              <p className="text-ink-400 text-lg">No messages yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
              {messages.map((msg, index) => {
                const colorConfig = COLORS.find(c => c.name === msg.color) || getRandomColor()
                const rotation = getRandomRotation()
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.8, rotate: rotation - 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: rotation }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`${colorConfig.bg} ${colorConfig.border} ${colorConfig.shadow} border-2 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform cursor-pointer`}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        boxShadow: `4px 4px 12px ${colorConfig.shadow.replace('shadow-', '')}`,
                      }}
                    >
                      {/* Push pin */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-md border-2 border-red-700" />
                      </div>

                      <p className="text-sm font-medium text-ink-900 mb-3 leading-relaxed min-h-[60px]">
                        {msg.message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-ink-600">
                        <span>{formatDate(msg.createdAt)}</span>
                        <button
                          onClick={() => handleLike(msg.id)}
                          className="flex items-center gap-1 hover:text-red-600 transition-colors"
                        >
                          <Heart className="h-3 w-3" />
                          {msg.likes}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-6xl mx-auto px-6 pb-8"
      >
        <Button
          onClick={loadMessages}
          variant="ghost"
          className="flex items-center gap-2 text-ink-600 hover:text-ink-900"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh Wall
        </Button>
      </motion.div>
    </div>
  )
}
