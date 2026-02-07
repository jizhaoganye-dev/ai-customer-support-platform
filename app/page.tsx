'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@company.co.jp')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('メールアドレスまたはパスワードが正しくありません。')
      }
    } catch {
      setError('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
            </div>
            <h1 className="text-2xl font-bold">AI Support Platform</h1>
          </div>
          <p className="text-slate-400 text-sm">カスタマーハラスメント対策 AI プラットフォーム</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              AIでカスタマー対応を<br />安全に、効率的に。
            </h2>
            <p className="text-slate-300 leading-relaxed">
              リアルタイムハラスメント検知、AI自動応答、感情分析を統合した
              次世代カスタマーサポートプラットフォーム。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-brand-400">95%+</p>
              <p className="text-sm text-slate-400 mt-1">ハラスメント検知精度</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-emerald-400">1.2分</p>
              <p className="text-sm text-slate-400 mt-1">平均初回応答時間</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-amber-400">94%</p>
              <p className="text-sm text-slate-400 mt-1">問題解決率</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-3xl font-bold text-sky-400">4.6/5</p>
              <p className="text-sm text-slate-400 mt-1">顧客満足度</p>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          &copy; 2026 AI Support Platform. Built with Next.js, TypeScript, Supabase.
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                </div>
                <span className="text-lg font-bold text-slate-900">AI Support Platform</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">ログイン</h2>
              <p className="text-slate-500 mt-1">アカウント情報を入力してください</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  メールアドレス
                </label>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  placeholder="name@company.co.jp" required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    パスワード
                  </label>
                  <button type="button" className="text-xs text-brand-600 hover:text-brand-700">
                    パスワードを忘れた場合
                  </button>
                </div>
                <input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  placeholder="8文字以上" required minLength={8}
                />
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                <label htmlFor="remember" className="text-sm text-slate-600">ログイン状態を保持</label>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ログイン中...
                  </span>
                ) : 'ログイン'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                アカウントをお持ちでない場合は{' '}
                <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-medium">
                  新規登録
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-sm font-medium text-white mb-2">テストアカウント</p>
            <div className="space-y-1 text-xs text-slate-300">
              <p>管理者: admin@company.co.jp / password123</p>
              <p>オペレーター: agent@company.co.jp / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
