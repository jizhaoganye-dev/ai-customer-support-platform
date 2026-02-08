'use client'

import { useState, useMemo } from 'react'
import { ANALYTICS_DATA, CONVERSATIONS } from '@/lib/mock-data'
import { useConversationStore } from '@/lib/conversation-store'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AnalyticsPage() {
  const { harassmentEvents, liveConversations, getRecentHarassmentEvents } = useConversationStore()
  const [period, setPeriod] = useState<7 | 14 | 30>(7)

  const data = useMemo(() => ANALYTICS_DATA.slice(-period), [period])

  const summary = useMemo(() => {
    const totalConv = data.reduce((s, d) => s + d.conversations, 0) + liveConversations.length
    const totalResolved = data.reduce((s, d) => s + d.resolved, 0)
    const avgResponse = +(data.reduce((s, d) => s + d.avgResponseTime, 0) / data.length).toFixed(1)
    const avgSatisfaction = +(data.reduce((s, d) => s + d.satisfactionScore, 0) / data.length).toFixed(1)
    const liveHarassCount = harassmentEvents.length
    const autoResolveRate = Math.round((totalResolved * 0.68) / totalConv * 100)
    const angerCount = liveConversations.filter(c => c.angerDetected).length

    return { totalConv, totalResolved, resolveRate: Math.round(totalResolved / totalConv * 100), autoResolveRate, avgResponse, liveHarassCount, avgSatisfaction, angerCount }
  }, [data, liveConversations, harassmentEvents])

  const chartData = useMemo(() => {
    const liveCountsByDate: Record<string, number> = {}
    harassmentEvents.forEach(e => {
      liveCountsByDate[e.date] = (liveCountsByDate[e.date] || 0) + 1
    })
    return data.map(d => {
      const liveCount = liveCountsByDate[d.date] || 0
      return {
        ...d,
        date: d.date.slice(5),
        fullDate: d.date,
        harassmentDetected: liveCount > 0 ? liveCount : d.harassmentDetected,
        liveHarassment: liveCount,
      }
    })
  }, [data, harassmentEvents])

  // Status distribution: horizontal bar data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { active: 0, resolved: 0, escalated: 0, waiting: 0 }
    CONVERSATIONS.forEach(c => { counts[c.status]++ })
    liveConversations.forEach(c => {
      if (c.status in counts) counts[c.status as keyof typeof counts]++
    })
    return [
      { name: '対応中', value: counts.active, fill: '#3b82f6' },
      { name: '解決済み', value: counts.resolved, fill: '#10b981' },
      { name: 'エスカレーション', value: counts.escalated, fill: '#f59e0b' },
      { name: '待機中', value: counts.waiting, fill: '#8b5cf6' },
      { name: '怒り検知', value: liveConversations.filter(c => c.angerDetected).length, fill: '#ef4444' },
    ].filter(d => d.value > 0)
  }, [liveConversations])

  const recentEvents = useMemo(() => getRecentHarassmentEvents(10), [getRecentHarassmentEvents])

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header + Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-500">カスタマーサポートの包括的な分析データ</p>
        <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 self-start">
          {([7, 14, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${period === p ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {p}日間
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <MiniStat label="総会話数" value={summary.totalConv.toString()} />
        <MiniStat label="解決率" value={`${summary.resolveRate}%`} />
        <MiniStat label="AI自動解決" value={`${summary.autoResolveRate}%`} highlight={summary.autoResolveRate >= 50} highlightColor="green" />
        <MiniStat label="平均応答" value={`${summary.avgResponse}分`} />
        <MiniStat label="カスハラ（実測）" value={summary.liveHarassCount.toString()} highlight={summary.liveHarassCount > 0} />
        <MiniStat label="満足度" value={`${summary.avgSatisfaction}/5`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">会話数推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="conversations" stroke="#6366f1" fill="url(#colorConv)" strokeWidth={2} name="会話数" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 4" name="解決数" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900">カスハラ検知件数</h3>
            {summary.liveHarassCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                実測 {summary.liveHarassCount}件
              </span>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="liveHarassment" fill="#dc2626" radius={[4, 4, 0, 0]} name="リアルタイム検知" stackId="harass" />
                <Bar dataKey="harassmentDetected" fill="#fca5a5" radius={[4, 4, 0, 0]} name="検知件数" stackId="harass" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Horizontal Bar replaces PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">ステータス分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ left: 8, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="件数" barSize={20}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">顧客満足度推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="satisfactionScore" stroke="#10b981" fill="url(#colorSat)" strokeWidth={2} name="満足度" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Harassment Event Log */}
      {recentEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-slate-900">カスハラ検知ログ（リアルタイム）</h3>
            <span className="text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
              {recentEvents.length}件
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {recentEvents.map(event => {
              const severityLabel = event.severity === 'critical' ? '緊急' : event.severity === 'high' ? '高' : event.severity === 'medium' ? '中' : '低'
              const severityColor = event.severity === 'critical' ? 'bg-red-100 text-red-800' : event.severity === 'high' ? 'bg-orange-100 text-orange-800' : event.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              const time = new Date(event.timestamp)
              return (
                <div key={event.id} className="px-5 py-3 sm:px-6 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityColor}`}>{severityLabel}</span>
                      <span className="text-xs text-slate-500">スコア: {(event.score * 100).toFixed(0)}%</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {time.toLocaleDateString('ja-JP')} {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">&quot;{event.customerMessage}&quot;</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {event.keywords.map(kw => (
                      <span key={kw} className="px-1.5 py-0.5 text-xs bg-red-50 text-red-600 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, highlight, highlightColor }: { label: string; value: string; highlight?: boolean; highlightColor?: string }) {
  const isGreen = highlightColor === 'green'
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? (isGreen ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
      <p className={`text-xs ${highlight ? (isGreen ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium') : 'text-slate-500'}`}>{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${highlight ? (isGreen ? 'text-emerald-700' : 'text-red-700') : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
