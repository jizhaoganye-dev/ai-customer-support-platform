'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { detectHarassment, analyzeSentiment, buildHandoffContext } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useConversationStore, type LiveMessage } from '@/lib/conversation-store'

interface Message {
  id: string
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  harassment?: { score: number; severity: string; detectedKeywords: string[] }
  sentiment?: 'positive' | 'neutral' | 'negative' | 'anger'
}

// Intelligent AI response engine with context-aware matching
const RESPONSE_RULES: Array<{ patterns: string[]; response: string }> = [
  { patterns: ['返品', '返却', '返送'], response: '返品についてご案内いたします。\n\n■ 返品条件\n・商品到着後14日以内\n・未開封・未使用の商品が対象\n・食品・衛生用品は対象外\n\n■ 手続き方法\n1. マイページ「注文履歴」から該当注文を選択\n2. 「返品申請」ボタンをクリック\n3. 返品理由を選択し送信\n4. 返送用ラベルがメールで届きます\n\n返金は商品到着確認後7営業日以内に処理されます。' },
  { patterns: ['交換', '取り替え', 'サイズ変更'], response: '商品の交換について承ります。\n\n■ 交換可能な場合\n・サイズ/カラー違い → 在庫がある場合、無料で交換可能です\n・初期不良 → 新品と交換いたします（送料弊社負担）\n\n■ 手順\n1. マイページから「交換申請」を提出\n2. 現在の商品を着払いで返送\n3. 新しい商品を2-3営業日でお届け\n\n交換をご希望の場合、注文番号と交換理由をお知らせください。' },
  { patterns: ['配送', '届か', '届い', '届け', '発送', '出荷'], response: '配送状況を確認いたします。\n\n■ 通常配送：注文確定後2-4営業日\n■ お急ぎ便：翌日配送（14時までのご注文）\n■ 日時指定：ご希望の日時に配達\n\n現在の配送状況はマイページ「注文履歴」の追跡番号からリアルタイムで確認できます。\n\n配送に遅延が発生している場合は、注文番号をお知らせいただければ配送業者に直接確認いたします。' },
  { patterns: ['届くまで', '何日', 'いつ届く', '到着日'], response: '到着予定日についてご案内いたします。\n\n■ 標準配送：ご注文から2-4営業日\n■ お急ぎ便：翌日（14時までのご注文、一部地域除く）\n■ 離島・一部地域：+1-2営業日\n\n注文番号をお教えいただければ、正確な到着予定日をお調べいたします。' },
  { patterns: ['ポイント', 'ポイント利用', 'ポイント残高'], response: 'ポイントに関するご案内です。\n\n■ 付与率：購入金額の1%（会員ランクにより最大5%）\n■ 利用方法：1ポイント＝1円としてお支払い時に利用可能\n■ 有効期限：最終ご利用日から1年間\n\n■ ランク別付与率\n・レギュラー：1% ・シルバー：2% ・ゴールド：3% ・プラチナ：5%' },
  { patterns: ['会員', '登録', 'アカウント', 'ログイン'], response: '会員登録・アカウントについてご案内いたします。\n\n■ 新規登録\nウェブサイト右上の「新規登録」→ メールアドレスとお名前で即完了\n\n■ ログインできない場合\n・パスワードリセット：ログイン画面「パスワードを忘れた場合」から再設定\n・アカウントロック：5回連続失敗で30分ロック' },
  { patterns: ['支払', '決済', 'クレジット', '請求', '料金'], response: 'お支払い・ご請求についてご案内いたします。\n\n■ ご利用可能なお支払い方法\n・クレジットカード：VISA / Mastercard / JCB / AMEX\n・銀行振込：ご注文後5営業日以内にお振込み\n・コンビニ払い：セブン、ローソン、ファミマ等\n・代金引換：手数料330円\n\n二重請求や誤請求の場合は速やかに返金処理を行います。' },
  { patterns: ['不良', '壊れ', '故障', '破損', '汚れ', '傷'], response: '商品の不良・破損について、大変申し訳ございません。\n\n■ 対応方法\n1. 不良箇所のお写真を撮影してください\n2. 注文番号・商品名・不良の状態をお知らせください\n\n■ 補償内容\n・到着後30日以内：新品交換 or 全額返金（送料弊社負担）\n・到着後31-90日：修理 or 一部返金' },
  { patterns: ['キャンセル', '取り消し', '取消'], response: '注文のキャンセルについてご案内いたします。\n\n■ キャンセル可能な場合\n・出荷前：マイページから無料でキャンセル可能\n・出荷準備中：お電話にてキャンセル受付\n\n■ 返金タイミング\n・クレジットカード：3-5営業日\n・銀行振込：7営業日以内\n\n注文番号をお知らせいただければ即座に確認いたします。' },
  { patterns: ['見積', '値引', '割引', '安く', '値下げ', 'ディスカウント', '価格交渉'], response: 'お見積り・価格についてご案内いたします。\n\n■ 法人向けボリュームディスカウント\n・10点以上：5%OFF\n・50点以上：10%OFF\n・100点以上：個別見積り対応\n\nご要望の数量と商品を教えていただければ、最適なお見積りをご提示いたします。' },
  { patterns: ['クレーム', '苦情', '不満', '怒', '最悪'], response: 'ご不快な思いをおかけし、誠に申し訳ございません。\n\n■ 迅速な解決のため、以下をお知らせください\n1. 該当する注文番号\n2. 問題の具体的な内容\n3. ご希望される解決方法\n\n■ 対応方針\n・初回回答：2時間以内\n・問題解決：24時間以内を目標\n・必要に応じて上長にエスカレーション' },
  { patterns: ['営業時間', '何時', '電話', '問い合わせ先', '連絡'], response: 'お問い合わせ窓口のご案内です。\n\n■ カスタマーサポート\n・電話：0120-XXX-XXX（平日9:00-18:00）\n・メール：support@company.co.jp\n・チャット：本画面より（平日9:00-20:00、AI応答は24時間）' },
  { patterns: ['お前', 'おまえ', 'テメェ', 'てめえ', 'バカ', 'ばか', '馬鹿', 'バカ野郎', 'ばかやろう', 'アホ', 'あほ', '無能', 'クズ', 'くず', 'ゴミ', 'ごみ', 'クソ', 'くそ', 'ボケ', 'ぼけ', 'カス', 'かす', '死ね', 'しね', '殺す', 'ころす', 'キチガイ', 'きちがい', 'うざい', 'きもい', 'ハゲ', 'デブ', 'ブス', 'タヒね'], response: '【AI対応ガイド】\nお客様のご不満は理解いたしますが、暴言・侮辱的な表現が含まれるため、以下の対応を推奨します。\n\n■ 推奨対応\n1. 「ご不満な点は真摯に受け止めます」と伝える\n2. 「ただし、侮辱的な表現はお控えください」と冷静にお願いする\n3. 改善されない場合は上長にエスカレーション\n\n■ テンプレート回答例\n「お客様のお気持ちは理解いたします。問題の解決に向けて全力で対応いたしますが、人格を否定するような表現につきましてはお控えいただけますようお願い申し上げます。」' },
  { patterns: ['上を出せ', '責任者', '上司', '管理者を呼べ'], response: '【AI対応ガイド】上席対応の要求です。\n\n■ 推奨対応手順\n1. まずお客様の要望を確認\n2. 引き継ぐ場合：これまでの経緯を上席に共有した上で転送\n3. 引き継がない場合：「責任を持って私が最後まで対応いたします」' },
  { patterns: ['訴え', '弁護士', '裁判', '法的', '消費者センター'], response: '【AI対応ガイド】法的措置への言及です。\n\n■ 推奨対応\n1. 冷静に対応し、お客様の権利を尊重する旨を伝える\n2. 社内の法務担当にエスカレーション\n3. 対応履歴を詳細に記録' },
  { patterns: ['拡散', 'SNS', 'ネットに書く', '口コミ', 'レビュー'], response: '【AI対応ガイド】SNS拡散への言及です。\n\n■ 推奨対応\n1. 脅しには屈さず、冷静に対応\n2. お客様の不満の根本原因を把握\n3. 解決策を具体的に提示' },
  { patterns: ['ありがとう', '助かり', '感謝', '解決し'], response: 'お役に立てて光栄です。今後もお困りのことがございましたら、いつでもお気軽にお問い合わせください。\n\n本日はお問い合わせいただきありがとうございました。' },
  { patterns: ['こんにちは', 'はじめまして', 'よろしく'], response: 'お問い合わせいただきありがとうございます。AIカスタマーサポートです。\n\nどのようなご用件でしょうか？以下のようなお問い合わせに対応しております。\n\n・商品の注文・配送\n・返品・交換\n・お支払い・ご請求\n・ポイント・会員情報\n・商品の不良・破損\n\nお気軽にご質問ください。' },
  { patterns: ['在庫', '入荷', '再入荷', '品切れ'], response: '在庫状況についてご案内いたします。\n\n■ 確認方法\n・商品ページに「在庫あり」「残りわずか」「入荷待ち」のステータス表示\n・「再入荷通知」ボタンで入荷時にメール通知\n\n■ 入荷予定\n人気商品は通常1-2週間で再入荷します。' },
  { patterns: ['エラー', 'バグ', '動かない', '表示されない', 'ページ'], response: 'システムの問題について承ります。\n\n■ まずお試しください\n1. ブラウザのキャッシュ・Cookieを削除\n2. 別のブラウザでお試し\n3. アプリを最新版に更新\n\nそれでも解決しない場合、エラーメッセージとご利用のブラウザ/端末をお知らせください。' },
]

function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  for (const rule of RESPONSE_RULES) {
    for (const pattern of rule.patterns) {
      if (msg.includes(pattern.toLowerCase()) || msg.includes(pattern)) {
        return rule.response
      }
    }
  }
  if (msg.length < 5) return 'もう少し詳しくお聞かせいただけますか？'
  if (msg.includes('？') || msg.includes('?') || msg.includes('教えて') || msg.includes('知りたい')) {
    return `ご質問ありがとうございます。\n\n「${userMessage}」について確認いたしました。\n\n専門の担当者がより詳細にご案内できますので、お電話（0120-XXX-XXX）でもお問い合わせいただけます。\n\nこのチャットでも引き続き対応いたします。`
  }
  return `承知いたしました。\n\n正確な対応のため、以下をお教えいただけますでしょうか。\n\n1. 該当する注文番号\n2. 具体的な状況の詳細\n3. ご希望される解決方法\n\n情報をいただき次第、速やかに対応いたします。`
}

export default function ChatPage() {
  const { user } = useAuth()
  const { addConversation, addMessage, addHarassmentEvent, updateConversation, getConversation } = useConversationStore()
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome', role: 'system',
      content: 'AIカスタマーサポートへようこそ。お客様からのお問い合わせを入力してください。AIが自動的にFAQデータベースから最適な回答を検索し、応答を生成します。\n\n怒りの感情を検出した際は自動でダッシュボードにアラートを表示します。',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [handoffReady, setHandoffReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  const toLiveMessage = (role: 'customer' | 'ai' | 'agent' | 'system', content: string, harassment?: { score: number; severity: string; detectedKeywords: string[] }, sentiment?: 'positive' | 'neutral' | 'negative' | 'anger'): LiveMessage => ({
    id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role, content,
    timestamp: new Date().toISOString(),
    harassmentScore: harassment?.score,
    harassmentSeverity: harassment?.severity,
    harassmentKeywords: harassment?.detectedKeywords,
    sentiment,
  })

  const ensureConversation = useCallback((firstMessage: string): string => {
    if (currentConvId) return currentConvId
    const id = `live_conv_${Date.now()}`
    const subject = firstMessage.length > 30 ? firstMessage.slice(0, 30) + '...' : firstMessage
    addConversation({
      id, customerName: 'チャット顧客', customerEmail: 'chat-customer@example.com',
      subject, status: 'active', priority: 'medium',
      assignedTo: user?.fullName || '田中 太郎',
      harassmentScore: 0, sentimentScore: 0,
      createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString(),
      tags: ['AIチャット', 'リアルタイム'], messages: [],
    })
    setCurrentConvId(id)
    return id
  }, [currentConvId, addConversation, user])

  // AI-to-Human Handoff
  const triggerHandoff = useCallback(() => {
    if (!currentConvId) return
    const conv = getConversation(currentConvId)
    if (!conv) return

    const customerMsgs = messages.filter(m => m.role === 'user').map(m => ({ role: 'customer', content: m.content }))
    const latestHarassment = detectHarassment(customerMsgs[customerMsgs.length - 1]?.content || '')
    const context = buildHandoffContext(customerMsgs, latestHarassment)

    updateConversation(currentConvId, {
      status: 'escalated',
      handoffContext: { ...context, handoffTime: new Date().toISOString() },
    })

    const systemMsg: Message = {
      id: `handoff_${Date.now()}`, role: 'system',
      content: `📋 人間オペレーターへの引き継ぎを開始しました。\n\n■ ハンドオフコンテキスト\n${context.summary}\n\n■ 検出された問題: ${context.detectedIssues.join('、')}\n${context.orderNumbers.length > 0 ? `■ 注文番号: ${context.orderNumbers.join(', ')}\n` : ''}■ 感情状態: ${context.sentiment === 'anger' ? '😠 怒り' : context.sentiment === 'negative' ? '😐 不満' : '中立'}\n■ メッセージ数: ${context.messageCount}件\n\nオペレーターに上記コンテキストが共有されました。`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, systemMsg])
    addMessage(currentConvId, toLiveMessage('system', systemMsg.content))
    setHandoffReady(false)
  }, [currentConvId, messages, getConversation, updateConversation, addMessage])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMsg = input.trim()
    setInput('')

    // Harassment detection
    const harassment = detectHarassment(userMsg)
    // Sentiment analysis (simulating Gemini 2.0)
    const sentimentResult = analyzeSentiment(userMsg)

    const userMessage: Message = {
      id: `msg_${Date.now()}`, role: 'user', content: userMsg, timestamp: new Date(),
      harassment: harassment.score > 0 ? harassment : undefined,
      sentiment: sentimentResult.sentiment,
    }
    setMessages(prev => [...prev, userMessage])

    const convId = ensureConversation(userMsg)
    addMessage(convId, toLiveMessage('customer', userMsg, harassment.score > 0 ? harassment : undefined, sentimentResult.sentiment))

    // Record harassment event
    if (harassment.score > 0) {
      const now = new Date()
      addHarassmentEvent({
        id: `harass_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        conversationId: convId, timestamp: now.toISOString(), date: now.toISOString().split('T')[0],
        score: harassment.score, severity: harassment.severity, keywords: harassment.detectedKeywords,
        customerMessage: userMsg,
      })
    }

    // Update conversation with anger status
    if (sentimentResult.isAnger) {
      updateConversation(convId, { angerDetected: true, currentSentiment: 'anger' })
    } else {
      updateConversation(convId, { currentSentiment: sentimentResult.sentiment })
    }

    // Anger alert
    if (sentimentResult.isAnger) {
      const angerAlert: Message = {
        id: `anger_${Date.now()}`, role: 'system',
        content: `😠 感情分析アラート：「怒り」を検出しました（信頼度: ${(sentimentResult.confidence * 100).toFixed(0)}%）\nダッシュボードにアラートが表示されています。エスカレーションを検討してください。`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, angerAlert])
      setHandoffReady(true)
    }

    // Harassment alert
    if (harassment.severity === 'critical' || harassment.severity === 'high') {
      const alertMsg: Message = {
        id: `alert_${Date.now()}`, role: 'system',
        content: `⚠️ カスタマーハラスメント検知 [深刻度: ${harassment.severity === 'critical' ? '緊急' : '高'}]\n検出キーワード: ${harassment.detectedKeywords.join(', ')}\n推奨: ${harassment.severity === 'critical' ? '即座に上長へ報告' : 'エスカレーション検討'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, alertMsg])
      setHandoffReady(true)
    }

    // AI response
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1000))

    const aiResponse = generateAIResponse(userMsg)
    const aiMessage: Message = { id: `ai_${Date.now()}`, role: 'ai', content: aiResponse, timestamp: new Date() }

    setIsTyping(false)
    setMessages(prev => [...prev, aiMessage])
    addMessage(convId, toLiveMessage('ai', aiResponse))
    inputRef.current?.focus()
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <p className="text-sm text-slate-500">RAGベース FAQ自動応答 + 感情分析（Gemini 2.0） + カスハラ検知</p>
        </div>
        <div className="flex items-center gap-3">
          {handoffReady && (
            <button onClick={triggerHandoff} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg border border-amber-300 hover:bg-amber-200 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              人間に引き継ぐ
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">AI応答: オンライン</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="animate-message-in">
              {msg.role === 'system' ? (
                <div className={`mx-auto max-w-lg text-center p-3 rounded-xl text-sm ${
                  msg.content.includes('⚠️') ? 'bg-red-50 text-red-800 border border-red-200' :
                  msg.content.includes('😠') ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                  msg.content.includes('📋') ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  <p className="whitespace-pre-line text-left">{msg.content}</p>
                </div>
              ) : msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-xs sm:max-w-md">
                    <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 flex-wrap">
                      {msg.sentiment && msg.sentiment !== 'neutral' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          msg.sentiment === 'anger' ? 'bg-red-100 text-red-700' :
                          msg.sentiment === 'negative' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {msg.sentiment === 'anger' ? '😠 怒り' : msg.sentiment === 'negative' ? '😐 不満' : '😊 良好'}
                        </span>
                      )}
                      {msg.harassment && msg.harassment.score > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          msg.harassment.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          msg.harassment.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          msg.harassment.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          ハラスメント: {(msg.harassment.score * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15" /></svg>
                  </div>
                  <div className="max-w-xs sm:max-w-md">
                    <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
                      <p className="text-sm text-slate-800 whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">AI</span>
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
        <div className="border-t border-slate-200 p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="お客様のメッセージを入力..."
              className="flex-1 px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping}
              className="px-4 sm:px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
              送信
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            <span>試す:</span>
            {['返品について', '配送状況', 'ポイント利用'].map((q) => (
              <button key={q} onClick={() => setInput(q)} className="text-brand-500 hover:text-brand-600 hover:underline">{q}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
