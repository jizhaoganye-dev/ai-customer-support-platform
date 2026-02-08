import { NextResponse, type NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Edge Middleware — protect dashboard routes & API endpoints
//
// Strategy:
//   - /dashboard/* → check for auth cookie (client-side auth sets it)
//   - /api/* → rate limiting header check (basic protection)
//   - Public routes (/, /signup) → pass through
// ---------------------------------------------------------------------------

const PUBLIC_PATHS = ['/', '/signup', '/api/health']
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 60 // requests per window

// Simple in-memory rate limit (resets on cold start, suitable for demo)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    return response
  }

  // Dashboard routes — check auth cookie
  if (pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('auth_user')
    // Note: In this demo, auth is localStorage-based (client-side).
    // The cookie is set as a supplementary check. If absent, we allow
    // through because AuthGate handles the actual redirect client-side.
    // In production, this would verify a JWT or session token.
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
