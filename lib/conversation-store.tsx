'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'

// --- Types ---
export interface LiveMessage {
  id: string
  role: 'customer' | 'ai' | 'agent' | 'system'
  content: string
  timestamp: string // ISO string for serialization
  harassmentScore?: number
  harassmentSeverity?: string
  harassmentKeywords?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative' | 'anger'
}

export interface HandoffContext {
  summary: string
  detectedIssues: string[]
  orderNumbers: string[]
  sentiment: string
  harassmentLevel: string
  messageCount: number
  handoffTime: string
}

export interface LiveConversation {
  id: string
  customerName: string
  customerEmail: string
  subject: string
  status: 'active' | 'resolved' | 'escalated' | 'waiting'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string
  harassmentScore: number
  sentimentScore: number
  currentSentiment?: 'positive' | 'neutral' | 'negative' | 'anger'
  angerDetected?: boolean
  handoffContext?: HandoffContext
  createdAt: string
  lastMessageAt: string
  tags: string[]
  messages: LiveMessage[]
}

export interface HarassmentEvent {
  id: string
  conversationId: string
  timestamp: string // ISO string
  date: string // YYYY-MM-DD for grouping
  score: number
  severity: string
  keywords: string[]
  customerMessage: string
}

interface ConversationStore {
  liveConversations: LiveConversation[]
  harassmentEvents: HarassmentEvent[]
  addConversation: (conv: LiveConversation) => void
  addMessage: (conversationId: string, message: LiveMessage) => void
  addHarassmentEvent: (event: HarassmentEvent) => void
  updateConversation: (conversationId: string, updates: Partial<LiveConversation>) => void
  getConversation: (conversationId: string) => LiveConversation | undefined
  getMessages: (conversationId: string) => LiveMessage[]
  getHarassmentCountByDate: (date: string) => number
  getTotalHarassmentCount: () => number
  getRecentHarassmentEvents: (limit: number) => HarassmentEvent[]
}

const ConversationContext = createContext<ConversationStore | null>(null)

const STORAGE_KEY = 'ai-support-live-conversations'
const HARASSMENT_EVENTS_KEY = 'ai-support-harassment-events'

// Safe localStorage helpers - guarded for SSR safety
function loadFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>([])
  const [harassmentEvents, setHarassmentEvents] = useState<HarassmentEvent[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setLiveConversations(loadFromStorage<LiveConversation>(STORAGE_KEY))
    setHarassmentEvents(loadFromStorage<HarassmentEvent>(HARASSMENT_EVENTS_KEY))
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (liveConversations.length > 0) {
      saveToStorage(STORAGE_KEY, liveConversations)
    }
  }, [liveConversations])

  useEffect(() => {
    if (harassmentEvents.length > 0) {
      saveToStorage(HARASSMENT_EVENTS_KEY, harassmentEvents)
    }
  }, [harassmentEvents])

  const addConversation = useCallback((conv: LiveConversation) => {
    setLiveConversations(prev => {
      const exists = prev.find(c => c.id === conv.id)
      if (exists) return prev
      return [conv, ...prev]
    })
  }, [])

  const addMessage = useCallback((conversationId: string, message: LiveMessage) => {
    setLiveConversations(prev => {
      return prev.map(conv => {
        if (conv.id !== conversationId) return conv
        const exists = conv.messages.find(m => m.id === message.id)
        if (exists) return conv
        const maxHarassment = Math.max(conv.harassmentScore, message.harassmentScore || 0)
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessageAt: message.timestamp,
          harassmentScore: maxHarassment,
          priority: maxHarassment > 0.7 ? 'critical' : maxHarassment > 0.4 ? 'high' : conv.priority,
          status: maxHarassment > 0.7 ? 'escalated' : conv.status,
        }
      })
    })
  }, [])

  const addHarassmentEvent = useCallback((event: HarassmentEvent) => {
    setHarassmentEvents(prev => {
      const exists = prev.find(e => e.id === event.id)
      if (exists) return prev
      return [event, ...prev]
    })
  }, [])

  const updateConversation = useCallback((conversationId: string, updates: Partial<LiveConversation>) => {
    setLiveConversations(prev =>
      prev.map(conv => conv.id === conversationId ? { ...conv, ...updates } : conv)
    )
  }, [])

  const getConversation = useCallback((conversationId: string) => {
    return liveConversations.find(c => c.id === conversationId)
  }, [liveConversations])

  const getMessages = useCallback((conversationId: string) => {
    return liveConversations.find(c => c.id === conversationId)?.messages || []
  }, [liveConversations])

  const getHarassmentCountByDate = useCallback((date: string) => {
    return harassmentEvents.filter(e => e.date === date).length
  }, [harassmentEvents])

  const getTotalHarassmentCount = useCallback(() => {
    return harassmentEvents.length
  }, [harassmentEvents])

  const getRecentHarassmentEvents = useCallback((limit: number) => {
    return harassmentEvents.slice(0, limit)
  }, [harassmentEvents])

  const value = useMemo(() => ({
    liveConversations,
    harassmentEvents,
    addConversation,
    addMessage,
    addHarassmentEvent,
    updateConversation,
    getConversation,
    getMessages,
    getHarassmentCountByDate,
    getTotalHarassmentCount,
    getRecentHarassmentEvents,
  }), [liveConversations, harassmentEvents, addConversation, addMessage, addHarassmentEvent, updateConversation, getConversation, getMessages, getHarassmentCountByDate, getTotalHarassmentCount, getRecentHarassmentEvents])

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversationStore() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversationStore must be used within ConversationProvider')
  return ctx
}
