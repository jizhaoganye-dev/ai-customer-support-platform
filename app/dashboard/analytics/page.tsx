'use client'

import { useState, useMemo } from 'react'
import { ANALYTICS_DATA, CONVERSATIONS } from '@/lib/mock-data'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<7 | 14 | 30>(7)

  const data = useMemo(() => ANALYTICS_DATA.slice(-period), [period])

  const summary = useMemo(() => {
    const totalConv = data.reduce((s, d) => s + d.conversations, 0)
    const totalResolved = data.reduce((s, d) => s + d.resolved, 0)
    const avgResponse = +(data.reduce((s, d) => s + d.avgResponseTime, 0) / data.length).toFixed(1)
    const totalHarass = data.reduce((s, d) => s + d.harassmentDetected, 0)
    const avgSatisfaction = +(data.reduce((s, d) => s + d.satisfactionScore, 0) / data.length).toFixed(1)
    return { totalConv, totalResolved, resolveRate: Math.round(totalResolved / totalConv * 100), avgResponse, totalHarass, avgSatisfaction }
  }, [data])

  const statusDistribution = useMemo(() => {
    const counts = { active: 0, resolved: 0, escalated: 0, waiting: 0 }
    CONVERSATIONS.forEach(c => { counts[c.status]++ })
    return [
      { name: '対応中', value: counts.active, color: '#3b82f6' },
      { name: '解決済み', value: counts.resolved, color: '#10b981' },
      { name: 'エスカレーション', value: counts.escalated, color: '#f59e0b' },
      { name: '待機中', value: counts.waiting, color: '#8b5cf6' },
    ]
  }, [])

  const chartData = useMemo(() => data.map(d => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  })), [data])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">カスタマーサポートの包括的な分析データ</p>
        <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
          {([7, 14, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${period === p ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {p}日間
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat label="総会話数" value={summary.totalConv.toString()} />
        <MiniStat label="解決率" value={`${summary.resolveRate}%`} />
        <MiniStat label="平均応答" value={`${summary.avgResponse}分`} />
        <MiniStat label="カスハラ件数" value={summary.totalHarass.toString()} />
        <MiniStat label="満足度" value={`${summary.avgSatisfaction}/5`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
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

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">カスハラ検知件数</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="harassmentDetected" fill="#ef4444" radius={[4, 4, 0, 0]} name="検知件数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">ステータス分布</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusDistribution.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
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
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  )
}
