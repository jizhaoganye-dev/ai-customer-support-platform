'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// --- Types ---
export interface LiveMessage {
  id: string
  role: 'customer' | 'ai' | 'agent' | 'system'
  content: string
  timestamp: string // ISO string for serialization
  harassmentScore?: number
  harassmentSeverity?: string
  harassmentKeywords?: string[]
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
  createdAt: string
  lastMessageAt: string
  tags: string[]
  messages: LiveMessage[]
}

interface ConversationStore {
  liveConversations: LiveConversation[]
  addConversation: (conv: LiveConversation) => void
  addMessage: (conversationId: string, message: LiveMessage) => void
  updateConversation: (conversationId: string, updates: Partial<LiveConversation>) => void
  getConversation: (conversationId: string) => LiveConversation | undefined
  getMessages: (conversationId: string) => LiveMessage[]
}

const ConversationContext = createContext<ConversationStore | null>(null)

const STORAGE_KEY = 'ai-support-live-conversations'

function loadFromStorage(): LiveConversation[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveToStorage(conversations: LiveConversation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // ignore storage errors
  }
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setLiveConversations(loadFromStorage())
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (liveConversations.length > 0) {
      saveToStorage(liveConversations)
    }
  }, [liveConversations])

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

  return (
    <ConversationContext.Provider value={{
      liveConversations,
      addConversation,
      addMessage,
      updateConversation,
      getConversation,
      getMessages,
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversationStore() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversationStore must be used within ConversationProvider')
  return ctx
}
