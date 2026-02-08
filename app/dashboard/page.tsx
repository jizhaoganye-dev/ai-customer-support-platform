'use client'

import { useMemo } from 'react'
import { CONVERSATIONS, ANALYTICS_DATA } from '@/lib/mock-data'
import { useConversationStore } from '@/lib/conversation-store'
import { formatDate } from '@/lib/utils'

export default function DashboardOverview() {
  const { liveConversations, harassmentEvents, getRecentHarassmentEvents } = useConversationStore()

  const stats = useMemo(() => {
    const recent = ANALYTICS_DATA.slice(-7)
    const totalConv = recent.reduce((s, d) => s + d.conversations, 0) + liveConversations.length
    const totalResolved = recent.reduce((s, d) => s + d.resolved, 0)
    const avgResponse = +(recent.reduce((s, d) => s + d.avgResponseTime, 0) / recent.length).toFixed(1)
    const avgSatisfaction = +(recent.reduce((s, d) => s + d.satisfactionScore, 0) / recent.length).toFixed(1)
    const liveHarassCount = harassmentEvents.length
    const autoResolveRate = Math.round((totalResolved * 0.68) / totalConv * 100) // 68% of resolved are auto-resolved
    const angerCount = liveConversations.filter(c => c.angerDetected).length

    return { totalConv, totalResolved, resolveRate: Math.round(totalResolved / totalConv * 100), autoResolveRate, avgResponse, liveHarassCount, avgSatisfaction, angerCount }
  }, [liveConversations, harassmentEvents])

  const activeConversations = useMemo(() => {
    const mockActive = CONVERSATIONS.filter(c => c.status === 'active' || c.status === 'escalated').map(c => ({
      id: c.id, customerName: c.customerName, subject: c.subject,
      priority: c.priority, harassmentScore: c.harassmentScore,
      lastMessageAt: c.lastMessageAt, messageCount: c.messageCount,
      assignedTo: c.assignedTo, isLive: false, angerDetected: false,
      handoffContext: undefined as undefined | { summary: string },
    }))
    const liveActive = liveConversations
      .filter(c => c.status === 'active' || c.status === 'escalated')
      .map(c => ({
        id: c.id, customerName: c.customerName, subject: c.subject,
        priority: c.priority, harassmentScore: c.harassmentScore,
        lastMessageAt: new Date(c.lastMessageAt), messageCount: c.messages.length,
        assignedTo: c.assignedTo, isLive: true, angerDetected: c.angerDetected || false,
        handoffContext: c.handoffContext ? { summary: c.handoffContext.summary } : undefined,
      }))
    return [...liveActive, ...mockActive]
  }, [liveConversations])

  const recentActivities = useMemo(() => {
    const liveEvents = getRecentHarassmentEvents(5).map(e => {
      const ago = Math.round((Date.now() - new Date(e.timestamp).getTime()) / 60000)
      const timeLabel = ago < 1 ? 'たった今' : ago < 60 ? `${ago}分前` : `${Math.round(ago / 60)}時間前`
      return {
        text: `カスハラ検知: ${e.severity === 'critical' ? '緊急' : e.severity === 'high' ? '高' : e.severity === 'medium' ? '中' : '低'} [${e.keywords.slice(0, 3).join(', ')}]`,
        time: timeLabel,
        type: 'danger' as const,
      }
    })
    // Anger detection events from live conversations
    const angerEvents = liveConversations.filter(c => c.angerDetected).map(c => ({
      text: `😠 怒り検知: ${c.customerName} — ${c.subject}`,
      time: 'リアルタイム',
      type: 'danger' as const,
    }))
    const staticActivities = [
      { text: '高橋 誠の会話をエスカレーション', time: '1時間前', type: 'warning' as const },
      { text: '鈴木 美咲の問い合わせを解決', time: '3時間前', type: 'success' as const },
      { text: '新規会話: 渡辺 翔太', time: '4時間前', type: 'info' as const },
    ]
    return [...angerEvents, ...liveEvents, ...staticActivities].slice(0, 8)
  }, [getRecentHarassmentEvents, liveConversations])

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* === PRIMARY KPIs (Top-Left Visual Hierarchy) === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Hero KPI: CSAT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:row-span-2">
          <p className="text-sm font-medium text-slate-500 mb-2">顧客満足度（CSAT）</p>
          <div className="flex items-end gap-3 mb-4">
            <p className="text-5xl font-bold text-brand-600">{stats.avgSatisfaction}</p>
            <p className="text-lg text-slate-400 mb-1">/ 5.0</p>
          </div>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className={`w-6 h-6 ${star <= Math.round(stats.avgSatisfaction) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(stats.avgSatisfaction / 5) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">直近7日間の平均</p>
        </div>

        {/* Hero KPI: Auto Resolve Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">AI自動解決率</p>
          <p className="text-4xl font-bold text-emerald-600">{stats.autoResolveRate}%</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.autoResolveRate}%` }} />
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2">+5% 先週比</p>
        </div>

        {/* Hero KPI: Total Resolve Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">全体解決率</p>
          <p className="text-4xl font-bold text-blue-600">{stats.resolveRate}%</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.resolveRate}%` }} />
          </div>
          <p className="text-xs text-blue-600 font-medium mt-2">+3% 先週比</p>
        </div>
      </div>

      {/* === SECONDARY METRICS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <MiniKPI label="今週の会話数" value={stats.totalConv.toString()} sub="+12%" color="blue" />
        <MiniKPI label="平均応答時間" value={`${stats.avgResponse}分`} sub="-15%" color="amber" />
        <MiniKPI label="カスハラ検知" value={`${stats.liveHarassCount}件`} sub={stats.liveHarassCount > 0 ? 'リアルタイム' : '検知なし'} color={stats.liveHarassCount > 0 ? 'red' : 'slate'} />
        <MiniKPI label="怒り検知" value={`${stats.angerCount}件`} sub={stats.angerCount > 0 ? '要注意' : '正常'} color={stats.angerCount > 0 ? 'orange' : 'slate'} />
      </div>

      {/* === ANGER / HARASSMENT ALERT === */}
      {(stats.liveHarassCount > 0 || stats.angerCount > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 sm:px-6 flex flex-col sm:flex-row items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-800">感情分析アラート</p>
            <p className="text-sm text-red-700 mt-0.5">
              {stats.angerCount > 0 && `😠 ${stats.angerCount}件の会話で「怒り」を検出。`}
              {stats.liveHarassCount > 0 && ` カスハラ検知: ${stats.liveHarassCount}件。`}
              {harassmentEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length > 0 &&
                ` うち${harassmentEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length}件は高深刻度。`
              }
              エスカレーションを検討してください。
            </p>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Active Conversations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">対応中の会話</h2>
            <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{activeConversations.length}件</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {activeConversations.map((conv) => (
              <div key={conv.id} className={`px-5 py-4 sm:px-6 hover:bg-slate-50 transition cursor-pointer ${conv.isLive ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 text-sm">{conv.customerName}</p>
                      {conv.isLive && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />ライブ
                        </span>
                      )}
                      {conv.angerDetected && (
                        <span className="px-1.5 py-0.5 text-xs bg-red-50 text-red-700 rounded-full">😠 怒り</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 truncate">{conv.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.harassmentScore > 0.5 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full">カスハラ</span>
                    )}
                    <PriorityBadge priority={conv.priority} />
                  </div>
                </div>
                {/* Handoff Context */}
                {conv.handoffContext && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 text-xs text-amber-800">
                    <p className="font-medium mb-0.5">📋 ハンドオフコンテキスト:</p>
                    <p className="text-amber-700">{conv.handoffContext.summary}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 flex-wrap">
                  <span>{formatDate(conv.lastMessageAt)}</span>
                  <span>{conv.messageCount}件</span>
                  <span className="hidden sm:inline">担当: {conv.assignedTo}</span>
                </div>
              </div>
            ))}
            {activeConversations.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400">対応中の会話はありません</div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">直近のアクティビティ</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-emerald-500' :
                  activity.type === 'warning' ? 'bg-amber-500' :
                  activity.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 break-words">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniKPI({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500', amber: 'border-l-amber-500', red: 'border-l-red-500',
    orange: 'border-l-orange-500', slate: 'border-l-slate-300',
  }
  const subColors: Record<string, string> = {
    blue: 'text-blue-600', amber: 'text-amber-600', red: 'text-red-600',
    orange: 'text-orange-600', slate: 'text-slate-500',
  }
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${colors[color] || colors.slate} px-4 py-3`}>
      <p className="text-xs text-slate-500 truncate">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${subColors[color] || subColors.slate}`}>{sub}</p>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = { low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-50 text-blue-700', high: 'bg-amber-50 text-amber-700', critical: 'bg-red-50 text-red-700' }
  const labels: Record<string, string> = { low: '低', medium: '中', high: '高', critical: '緊急' }
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority] || styles.medium}`}>{labels[priority] || priority}</span>
}
