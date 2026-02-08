import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// ---------------------------------------------------------------------------
// Supabase client – gracefully falls back to null when env vars are absent.
// All consuming code MUST check `supabase !== null` before use.
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase: SupabaseClient<Database> | null =
  url && key ? createClient<Database>(url, key) : null

export const isSupabaseConfigured = (): boolean => supabase !== null

// ---------------------------------------------------------------------------
// Helper: run a query only when Supabase is available
// ---------------------------------------------------------------------------
export async function withSupabase<T>(
  fn: (client: SupabaseClient<Database>) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!supabase) return fallback
  try {
    return await fn(supabase)
  } catch (err) {
    console.warn('[Supabase] Query failed, using fallback:', err)
    return fallback
  }
}
