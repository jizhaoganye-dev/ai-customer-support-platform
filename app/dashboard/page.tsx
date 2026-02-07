'use client'

import { useMemo } from 'react'
import { CONVERSATIONS, ANALYTICS_DATA } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

export default function DashboardOverview() {
  const stats = useMemo(() => {
    const recent = ANALYTICS_DATA.slice(-7)
    const totalConv = recent.reduce((s, d) => s + d.conversations, 0)
    const totalResolved = recent.reduce((s, d) => s + d.resolved, 0)
    const avgResponse = +(recent.reduce((s, d) => s + d.avgResponseTime, 0) / recent.length).toFixed(1)
    const totalHarass = recent.reduce((s, d) => s + d.harassmentDetected, 0)
    const avgSatisfaction = +(recent.reduce((s, d) => s + d.satisfactionScore, 0) / recent.length).toFixed(1)
    return { totalConv, totalResolved, resolveRate: Math.round(totalResolved / totalConv * 100), avgResponse, totalHarass, avgSatisfaction }
  }, [])

  const activeConversations = CONVERSATIONS.filter(c => c.status === 'active' || c.status === 'escalated')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="今週の会話数" value={stats.totalConv.toString()} change="+12%" positive icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" color="blue" />
        <StatCard label="解決率" value={`${stats.resolveRate}%`} change="+3%" positive icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="green" />
        <StatCard label="平均応答時間" value={`${stats.avgResponse}分`} change="-15%" positive icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="amber" />
        <StatCard label="カスハラ検知" value={`${stats.totalHarass}件`} change={stats.totalHarass > 5 ? '注意' : '正常'} positive={stats.totalHarass <= 5} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Conversations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">対応中の会話</h2>
            <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{activeConversations.length}件</span>
          </div>
          <div className="divide-y divide-slate-100">
            {activeConversations.map((conv) => (
              <div key={conv.id} className="px-5 py-4 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{conv.customerName}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{conv.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.harassmentScore > 0.5 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full">カスハラ疑い</span>
                    )}
                    <PriorityBadge priority={conv.priority} />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{formatDate(conv.lastMessageAt)}</span>
                  <span>{conv.messageCount}メッセージ</span>
                  <span>担当: {conv.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats / Activity */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">顧客満足度</h3>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-600">{stats.avgSatisfaction}</p>
              <p className="text-sm text-slate-500 mt-1">/ 5.0</p>
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= Math.round(stats.avgSatisfaction) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">直近のアクティビティ</h3>
            <div className="space-y-3">
              {[
                { text: '高橋 誠の会話をエスカレーション', time: '1時間前', type: 'warning' },
                { text: '鈴木 美咲の問い合わせを解決', time: '3時間前', type: 'success' },
                { text: '新規会話: 渡辺 翔太', time: '4時間前', type: 'info' },
                { text: 'カスハラ検知アラート発生', time: '5時間前', type: 'danger' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-emerald-500' :
                    activity.type === 'warning' ? 'bg-amber-500' :
                    activity.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-700">{activity.text}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, change, positive, icon, color }: {
  label: string; value: string; change: string; positive: boolean; icon: string; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className={`text-xs mt-1 font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{change}</p>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-50 text-blue-700',
    high: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  }
  const labels: Record<string, string> = { low: '低', medium: '中', high: '高', critical: '緊急' }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority]}`}>{labels[priority]}</span>
  )
}
