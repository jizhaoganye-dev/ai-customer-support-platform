'use client'

import { useEffect } from 'react'

// ---------------------------------------------------------------------------
// Global Error Boundary — catches unhandled errors in the app
// ---------------------------------------------------------------------------
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.) in production
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          予期しないエラーが発生しました。問題が続く場合はサポートまでお問い合わせください。
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
