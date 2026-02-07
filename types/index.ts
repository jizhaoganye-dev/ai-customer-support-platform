// ============================================================================
// Core Types for AI Customer Support Platform
// ============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ============================================================================
// Database Types (Supabase)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'agent' | 'manager'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          agent_id: string | null
          status: 'open' | 'in_progress' | 'resolved' | 'escalated'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          harassment_detected: boolean
          harassment_score: number | null
          sentiment_score: number | null
          category: string | null
          tags: string[]
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['conversations']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_type: 'customer' | 'agent' | 'ai'
          content: string
          metadata: Json | null
          harassment_flags: string[] | null
          emotion: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      faq_documents: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          embedding: number[] | null
          usage_count: number
          helpfulness_score: number
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['faq_documents']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['faq_documents']['Insert']>
      }
      harassment_patterns: {
        Row: {
          id: string
          pattern: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          category: string
          description: string | null
          is_active: boolean
          detection_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['harassment_patterns']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['harassment_patterns']['Insert']>
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          event_data: Json
          user_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_faq_documents: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: Array<{
          id: string
          title: string
          content: string
          category: string
          similarity: number
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// Application Types
// ============================================================================

export interface User {
  id: string
  email: string
  fullName: string | null
  role: 'admin' | 'agent' | 'manager'
  avatarUrl: string | null
}

export interface Conversation {
  id: string
  customerName: string
  customerEmail: string
  agent: User | null
  status: 'open' | 'in_progress' | 'resolved' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  harassmentDetected: boolean
  harassmentScore: number | null
  sentimentScore: number | null
  category: string | null
  tags: string[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
}

export interface Message {
  id: string
  conversationId: string
  senderType: 'customer' | 'agent' | 'ai'
  content: string
  metadata?: Record<string, any>
  harassmentFlags?: string[]
  emotion?: string
  createdAt: Date
}

export interface FAQDocument {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  usageCount: number
  helpfulnessScore: number
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface HarassmentPattern {
  id: string
  pattern: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string | null
  isActive: boolean
  detectionCount: number
}

// ============================================================================
// AI Service Types
// ============================================================================

export interface ChatCompletionRequest {
  message: string
  conversationId: string
  context?: ConversationContext
  useRAG?: boolean
}

export interface ChatCompletionResponse {
  content: string
  sources?: FAQSource[]
  confidence: number
  metadata?: {
    model: string
    tokens: number
    processingTime: number
  }
}

export interface FAQSource {
  documentId: string
  title: string
  content: string
  relevanceScore: number
}

export interface ConversationContext {
  previousMessages: Message[]
  customerProfile?: {
    name: string
    email: string
    history: string[]
  }
}

export interface HarassmentDetectionResult {
  isHarassment: boolean
  score: number // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical' | null
  flags: string[]
  detectedPatterns: HarassmentPattern[]
  recommendation: 'continue' | 'escalate' | 'terminate'
  explanation: string
}

export interface SentimentAnalysisResult {
  score: number // -1 to 1
  label: 'negative' | 'neutral' | 'positive'
  emotions: {
    anger: number
    disgust: number
    fear: number
    joy: number
    sadness: number
    surprise: number
  }
  confidence: number
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardMetrics {
  totalConversations: number
  activeConversations: number
  resolvedToday: number
  averageResolutionTime: number // minutes
  harassmentDetectionRate: number // percentage
  customerSatisfactionScore: number // 0-10
  aiAccuracyRate: number // percentage
  topCategories: Array<{ category: string; count: number }>
  timeSeriesData: TimeSeriesDataPoint[]
}

export interface TimeSeriesDataPoint {
  timestamp: string
  conversations: number
  harassment: number
  satisfaction: number
}

export interface AgentPerformance {
  agentId: string
  agentName: string
  conversationsHandled: number
  averageResponseTime: number // seconds
  customerRating: number // 0-5
  escalationRate: number // percentage
  resolutionRate: number // percentage
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ============================================================================
// Form Types
// ============================================================================

export interface CreateConversationForm {
  customerName: string
  customerEmail: string
  initialMessage: string
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface CreateFAQForm {
  title: string
  content: string
  category: string
  tags: string[]
}

export interface UpdateProfileForm {
  fullName?: string
  avatarUrl?: string
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketMessage {
  type: 'new_message' | 'conversation_updated' | 'harassment_alert' | 'agent_assigned'
  payload: any
  timestamp: string
}

export interface RealtimeNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  createdAt: Date
}
