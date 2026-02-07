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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))

    const demoUser = DEMO_USERS[email]
    if (demoUser) {
      setUser(demoUser)
      localStorage.setItem('auth_user', JSON.stringify(demoUser))
      setIsLoading(false)
      return true
    }

    // Allow any email to login for demonstration
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName: email.split('@')[0].replace(/[._]/g, ' '),
      role: 'agent',
      department: 'カスタマーサポート部',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setUser(newUser)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
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
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
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
