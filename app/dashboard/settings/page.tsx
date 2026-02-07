'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'ai'>('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-6">
        {[
          { id: 'profile' as const, label: 'プロフィール' },
          { id: 'notifications' as const, label: '通知設定' },
          { id: 'security' as const, label: 'セキュリティ' },
          { id: 'ai' as const, label: 'AI設定' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === tab.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <p className="text-sm text-emerald-700">設定を保存しました。</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">プロフィール設定</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-brand-700">{user?.fullName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{user?.fullName}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">お名前</label>
                <input type="text" defaultValue={user?.fullName}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">メールアドレス</label>
                <input type="email" defaultValue={user?.email}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">部署</label>
                <input type="text" defaultValue={user?.department}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">役職</label>
                <select defaultValue={user?.role}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="admin">管理者</option>
                  <option value="manager">マネージャー</option>
                  <option value="agent">オペレーター</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
                保存する
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">通知設定</h3>
            {[
              { label: 'カスハラ検知アラート', desc: 'ハラスメントが検知された場合に通知', defaultChecked: true },
              { label: '新規会話の通知', desc: '新しいお問い合わせが入った場合に通知', defaultChecked: true },
              { label: 'エスカレーション通知', desc: '会話がエスカレーションされた場合に通知', defaultChecked: true },
              { label: '日次レポート', desc: '毎日のサマリーレポートをメールで受信', defaultChecked: false },
              { label: '週次アナリティクス', desc: '週間パフォーマンスレポートをメールで受信', defaultChecked: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            ))}
            <div className="pt-2">
              <button onClick={handleSave} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
                保存する
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">セキュリティ設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">現在のパスワード</label>
                <input type="password" placeholder="現在のパスワード"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">新しいパスワード</label>
                <input type="password" placeholder="8文字以上"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">新しいパスワード（確認）</label>
                <input type="password" placeholder="パスワードを再入力"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-sm font-medium text-slate-900">セキュリティ状態</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Row Level Security', status: '有効', ok: true },
                  { label: 'JWT認証', status: '有効', ok: true },
                  { label: '二要素認証', status: '未設定', ok: false },
                  { label: 'APIレート制限', status: '有効 (100/分)', ok: true },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${item.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className={`text-xs ${item.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              パスワードを変更
            </button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">AIモデル</label>
                <select defaultValue="gpt-4-turbo"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="gpt-4-turbo">GPT-4 Turbo (推奨)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (高速)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">カスハラ検知閾値</label>
                <input type="range" min="0" max="100" defaultValue="70" className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>低感度 (0%)</span><span>高感度 (100%)</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">FAQ検索精度</label>
                <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>広範囲</span><span>高精度</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ベクトル次元数</label>
                <input type="text" defaultValue="1536" disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
                <p className="text-xs text-slate-400 mt-1">text-embedding-3-small モデル使用</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button onClick={handleSave} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
                保存する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
