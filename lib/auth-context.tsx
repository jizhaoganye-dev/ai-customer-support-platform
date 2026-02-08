'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'agent' | 'manager'
  avatarUrl?: string
  department: string
  joinedAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USERS: Record<string, User> = {
  'admin@company.co.jp': {
    id: 'usr_001',
    email: 'admin@company.co.jp',
    fullName: '田中 太郎',
    role: 'admin',
    department: 'カスタマーサポート部',
    joinedAt: '2024-04-01',
  },
  'agent@company.co.jp': {
    id: 'usr_002',
    email: 'agent@company.co.jp',
    fullName: '佐藤 花子',
    role: 'agent',
    department: 'カスタマーサポート部',
    joinedAt: '2024-06-15',
  },
}

// Safe localStorage helpers - only execute on client
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem('auth_user', JSON.stringify(user))
  } catch {
    // ignore storage errors
  }
}

function removeStoredUser(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem('auth_user')
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage only on client mount
  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))

    const demoUser = DEMO_USERS[email]
    if (demoUser) {
      setUser(demoUser)
      setStoredUser(demoUser)
      setIsLoading(false)
      return true
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName: email.split('@')[0].replace(/[._]/g, ' '),
      role: 'agent',
      department: 'カスタマーサポート部',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setUser(newUser)
    setStoredUser(newUser)
    setIsLoading(false)
    return true
  }, [])

  const signup = useCallback(async (email: string, _password: string, fullName: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      role: 'agent',
      department: 'カスタマーサポート部',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setUser(newUser)
    setStoredUser(newUser)
    setIsLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    removeStoredUser()
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// --- AuthGate: blocks rendering until auth state is determined ---
interface AuthGateProps {
  children: ReactNode
  /** Content to show while auth is loading. Defaults to a spinner. */
  fallback?: ReactNode
  /** If true, redirect unauthenticated users to login. Default: true */
  requireAuth?: boolean
  /** Redirect path for unauthenticated users. Default: '/' */
  redirectTo?: string
}

export function AuthGate({
  children,
  fallback,
  requireAuth = true,
  redirectTo = '/',
}: AuthGateProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Only act once loading is complete
    if (isLoading) return

    if (requireAuth && !user && !hasRedirected) {
      setHasRedirected(true)
      router.push(redirectTo)
    }
  }, [isLoading, user, requireAuth, redirectTo, router, hasRedirected])

  // Phase 1: Auth is still loading — show fallback, block all children
  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-brand-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-slate-500">認証情報を確認中...</span>
            </div>
          </div>
        )}
      </>
    )
  }

  // Phase 2: Auth determined, but user is not authenticated
  if (requireAuth && !user) {
    // Show fallback while redirect is in progress
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-brand-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-slate-500">ログインページへ移動中...</span>
            </div>
          </div>
        )}
      </>
    )
  }

  // Phase 3: Authenticated — render children (queries can now safely execute)
  return <>{children}</>
}
