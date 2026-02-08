'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ConversationProvider } from '@/lib/conversation-store'
import { type ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConversationProvider>
        {children}
      </ConversationProvider>
    </AuthProvider>
  )
}
