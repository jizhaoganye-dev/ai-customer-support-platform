// ============================================================================
// Supabase Client Configuration
// Enterprise-grade setup with connection pooling and error handling
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// ============================================================================
// Client-side Supabase client
// ============================================================================

export const supabaseClient = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// ============================================================================
// Server-side Supabase client (for Server Components and API Routes)
// ============================================================================

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// ============================================================================
// Admin Supabase client (with service role key)
// ============================================================================

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Check if user has required role
 */
export async function checkUserRole(
  userId: string,
  allowedRoles: Array<'admin' | 'agent' | 'manager'>
): Promise<boolean> {
  const profile = await getUserProfile(userId)
  if (!profile) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return allowedRoles.includes((profile as any).role)
}

// ============================================================================
// Realtime subscription helpers
// ============================================================================

export function subscribeToConversations(
  callback: (payload: any) => void
) {
  return supabaseClient
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      callback
    )
    .subscribe()
}

export function subscribeToMessages(
  conversationId: string,
  callback: (payload: any) => void
) {
  return supabaseClient
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe()
}
