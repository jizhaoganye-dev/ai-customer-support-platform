'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // デモ用：実際の認証はSupabaseで実装
    alert('ログイン機能は開発中です。デモ用のダッシュボードに移動します。')
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AIサポートログイン
            </h1>
            <p className="text-gray-600">
              カスタマーサポートプラットフォーム
            </p>
          </div>

          {/* ログインフォーム */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              ログイン
            </button>
          </form>

          {/* サインアップリンク */}
          <p className="text-center mt-6 text-sm text-gray-600">
            アカウントをお持ちではありませんか？{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              サインアップ
            </Link>
          </p>

          {/* デモ情報 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              🎯 ポートフォリオデモ
            </p>
            <p className="text-xs text-blue-700">
              このプロジェクトはバレットグループ応募用のポートフォリオです。
              実際の機能を確認するには「ログイン」をクリックしてください。
            </p>
          </div>
        </div>

        {/* 技術スタック表示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Built with Next.js 14 + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}
