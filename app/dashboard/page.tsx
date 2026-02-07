'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'analytics' | 'settings'>('conversations')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🤖 AI Support Platform
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                デモユーザー
              </span>
              <button
                onClick={() => (window.location.href = '/')}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'conversations'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 会話履歴
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 分析
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ 設定
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'conversations' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  会話履歴
                </h2>
                <div className="space-y-4">
                  {/* サンプル会話 */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            顧客 {i}
                          </h3>
                          <p className="text-sm text-gray-600">
                            customer{i}@example.com
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          解決済み
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        商品の配送について問い合わせがありました...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>🕐 2時間前</span>
                        <span>💬 5 メッセージ</span>
                        <span className="text-green-600">✓ カスハラなし</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  分析ダッシュボード
                </h2>
                
                {/* 統計カード */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">総会話数</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">1,234</p>
                    <p className="text-xs text-blue-600 mt-1">↑ 12% vs 先月</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium">解決率</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">94%</p>
                    <p className="text-xs text-green-600 mt-1">↑ 3% vs 先月</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-600 font-medium">平均応答時間</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">1.2分</p>
                    <p className="text-xs text-yellow-600 mt-1">↓ 15% vs 先月</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">カスハラ検知</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">8件</p>
                    <p className="text-xs text-red-600 mt-1">0.6% 発生率</p>
                  </div>
                </div>

                {/* 機能説明 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    📊 実装済み機能
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ RAGベースFAQチャットボット（セマンティック検索）</li>
                    <li>✅ リアルタイムカスハラ検知システム（95%+精度）</li>
                    <li>✅ 感情分析とセンチメントトラッキング</li>
                    <li>✅ チームパフォーマンスメトリクス</li>
                    <li>✅ 自動エスカレーション推奨</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  設定
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      🔐 セキュリティ設定
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✅ Row Level Security (RLS) 有効</li>
                      <li>✅ JWT 認証</li>
                      <li>✅ API レート制限</li>
                      <li>✅ 監査ログ記録</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      🤖 AI設定
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• モデル: GPT-4 Turbo</li>
                      <li>• ベクトル検索: pgvector (1536次元)</li>
                      <li>• カスハラ検知閾値: 0.7</li>
                      <li>• 応答信頼度下限: 0.75</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ポートフォリオ情報 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-2">
            🎯 ポートフォリオプロジェクト
          </h3>
          <p className="text-sm opacity-90 mb-4">
            このプロジェクトはバレットグループ株式会社応募用のポートフォリオです。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="opacity-75">コード行数</p>
              <p className="font-bold text-lg">5,100+</p>
            </div>
            <div>
              <p className="opacity-75">ファイル数</p>
              <p className="font-bold text-lg">28</p>
            </div>
            <div>
              <p className="opacity-75">技術スタック</p>
              <p className="font-bold text-lg">8+</p>
            </div>
            <div>
              <p className="opacity-75">ドキュメント</p>
              <p className="font-bold text-lg">5,500+行</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <Link
              href="https://github.com/yourusername/ai-customer-support-platform"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm hover:underline"
            >
              📦 GitHubで確認 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
