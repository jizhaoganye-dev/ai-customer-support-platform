'use client'

import { useState, useMemo } from 'react'
import { CONVERSATIONS, CHAT_MESSAGES_001 } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

export default function ConversationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedConv, setSelectedConv] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter(c => {
      const matchSearch = search === '' ||
        c.customerName.includes(search) ||
        c.subject.includes(search) ||
        c.customerEmail.includes(search)
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const selectedConversation = CONVERSATIONS.find(c => c.id === selectedConv)

  if (selectedConv && selectedConversation) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedConv(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          会話一覧に戻る
        </button>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Conversation Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{selectedConversation.customerName}</h2>
              <p className="text-sm text-slate-500">{selectedConversation.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedConversation.harassmentScore > 0.5 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
                  カスハラ: {(selectedConversation.harassmentScore * 100).toFixed(0)}%
                </span>
              )}
              <StatusBadge status={selectedConversation.status} />
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {CHAT_MESSAGES_001.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-2xl ${
                  msg.role === 'customer' ? 'bg-slate-100 rounded-bl-md' :
                  msg.role === 'ai' ? 'bg-purple-50 border border-purple-100 rounded-br-md' :
                  'bg-brand-600 text-white rounded-br-md'
                }`}>
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {msg.role === 'customer' ? selectedConversation.customerName :
                     msg.role === 'ai' ? 'AI アシスタント' : '担当者'}
                  </p>
                  <p className={`text-sm ${msg.role === 'agent' ? 'text-white' : 'text-slate-800'}`}>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'agent' ? 'text-white/60' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Info bar */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>担当: {selectedConversation.assignedTo}</span>
            <span>{selectedConversation.messageCount} メッセージ</span>
            <span>タグ: {selectedConversation.tags.join(', ')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="名前、件名、メールで検索..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="all">全ステータス</option>
          <option value="active">対応中</option>
          <option value="resolved">解決済み</option>
          <option value="escalated">エスカレーション</option>
          <option value="waiting">待機中</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">{filtered.length}件の会話</p>

      {/* Conversation List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filtered.map(conv => (
          <div key={conv.id} onClick={() => setSelectedConv(conv.id)}
            className="px-5 py-4 hover:bg-slate-50 transition cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 text-sm">{conv.customerName}</p>
                  <PriorityDot priority={conv.priority} />
                </div>
                <p className="text-sm text-slate-600 mt-0.5 truncate">{conv.subject}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {conv.harassmentScore > 0.5 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" title="カスハラ疑い" />
                )}
                <StatusBadge status={conv.status} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>{formatDate(conv.lastMessageAt)}</span>
              <span>{conv.messageCount}件</span>
              <span>{conv.assignedTo}</span>
              <div className="flex gap-1">
                {conv.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-400">
            <p>該当する会話がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    escalated: 'bg-amber-50 text-amber-700 border-amber-200',
    waiting: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  const labels: Record<string, string> = { active: '対応中', resolved: '解決済み', escalated: 'エスカレーション', waiting: '待機中' }
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}>{labels[status]}</span>
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: 'bg-slate-300', medium: 'bg-blue-400', high: 'bg-amber-400', critical: 'bg-red-500' }
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[priority]}`} title={priority} />
}
