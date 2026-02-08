import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// GET /api/health — Health check endpoint for monitoring
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseConfigured() ? 'connected' : 'not configured (using localStorage)',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured (using local rules)',
    },
    version: '1.0.0',
  })
}
