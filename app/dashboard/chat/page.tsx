'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FAQ_RESPONSES, detectHarassment } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  harassment?: { score: number; severity: string; keywords: string[] }
}

function generateAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(keyword.toLowerCase()) || lower.includes(keyword)) {
      return response
    }
  }

  if (lower.includes('注文') || lower.includes('オーダー')) {
    return '注文に関するお問い合わせですね。注文番号をお伝えいただければ、状況を確認いたします。マイページの「注文履歴」からも最新状況をご確認いただけます。'
  }
  if (lower.includes('ありがとう') || lower.includes('助かり')) {
    return 'お役に立てて光栄です。他にご不明な点がございましたら、いつでもお気軽にお問い合わせください。'
  }
  if (lower.includes('クレーム') || lower.includes('苦情')) {
    return 'ご不便をおかけし申し訳ございません。詳細をお聞かせいただければ、責任を持って対応いたします。必要に応じて担当部署へエスカレーションいたします。'
  }

  return `お問い合わせありがとうございます。「${userMessage.slice(0, 20)}${userMessage.length > 20 ? '...' : ''}」について確認いたします。少々お待ちください。\n\nFAQデータベースを検索中...\n該当する回答が見つかりました。詳しい内容について担当者が対応いたします。他にご質問があればお気軽にどうぞ。`
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'AIカスタマーサポートへようこそ。お客様からのお問い合わせを入力してください。AIが自動的にFAQデータベースから最適な回答を検索し、応答を生成します。',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')

    // Harassment detection
    const harassment = detectHarassment(userMsg)

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
      harassment: harassment.score > 0 ? harassment : undefined,
    }

    setMessages(prev => [...prev, userMessage])

    // Show harassment alert if detected
    if (harassment.severity === 'critical' || harassment.severity === 'high') {
      const alertMsg: Message = {
        id: `alert_${Date.now()}`,
        role: 'system',
        content: `⚠️ カスタマーハラスメント検知 [深刻度: ${harassment.severity === 'critical' ? '緊急' : '高'}]\n検出キーワード: ${harassment.detectedKeywords.join(', ')}\n推奨アクション: ${harassment.severity === 'critical' ? '即座に対応終了し、上長に報告してください。' : '慎重に対応し、エスカレーションを検討してください。'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, alertMsg])
    }

    // AI response with typing delay
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1000))

    const aiResponse = generateAIResponse(userMsg)
    const aiMessage: Message = {
      id: `ai_${Date.now()}`,
      role: 'ai',
      content: aiResponse,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages(prev => [...prev, aiMessage])
    inputRef.current?.focus()
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">RAGベース FAQ自動応答 + リアルタイムカスハラ検知</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">AI応答: オンライン</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="animate-message-in">
              {msg.role === 'system' ? (
                <div className={`mx-auto max-w-lg text-center p-3 rounded-lg text-sm ${
                  msg.content.includes('⚠️') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-50 text-slate-600'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              ) : msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-md">
                    <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {msg.harassment && msg.harassment.score > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          msg.harassment.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          msg.harassment.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          msg.harassment.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          ハラスメントスコア: {(msg.harassment.score * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15" /></svg>
                  </div>
                  <div className="max-w-md">
                    <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
                      <p className="text-sm text-slate-800 whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">AI ({user?.fullName})</span>
                      <span className="text-xs text-slate-400">{msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-message-in">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" /></svg>
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="お客様のメッセージを入力（例: 返品について教えてください）"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>試してみてください:</span>
            {['返品について', '配送状況', 'ポイント利用'].map((q) => (
              <button key={q} onClick={() => setInput(q)} className="text-brand-500 hover:text-brand-600 hover:underline">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
