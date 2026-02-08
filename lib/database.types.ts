// ---------------------------------------------------------------------------
// Supabase Database Types (generated-style, matches schema.sql)
// ---------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'agent' | 'manager'
          department: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          subject: string
          status: 'active' | 'resolved' | 'escalated' | 'waiting'
          priority: 'low' | 'medium' | 'high' | 'critical'
          assigned_to: string
          harassment_score: number
          sentiment_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'customer' | 'ai' | 'agent' | 'system'
          content: string
          harassment_score: number | null
          harassment_severity: string | null
          sentiment: 'positive' | 'neutral' | 'negative' | 'anger' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      harassment_events: {
        Row: {
          id: string
          conversation_id: string
          score: number
          severity: string
          keywords: string[]
          customer_message: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['harassment_events']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['harassment_events']['Insert']>
      }
    }
    Functions: {
      match_faq_documents: {
        Args: { query_embedding: number[]; match_threshold: number; match_count: number }
        Returns: Array<{ id: string; title: string; content: string; similarity: number }>
      }
    }
  }
}
