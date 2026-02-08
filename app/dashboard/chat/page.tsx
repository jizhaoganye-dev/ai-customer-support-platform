'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { detectHarassment } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  harassment?: { score: number; severity: string; detectedKeywords: string[] }
}

// Intelligent AI response engine with context-aware matching
const RESPONSE_RULES: Array<{ patterns: string[]; response: string }> = [
  // --- 返品・交換 ---
  { patterns: ['返品', '返却', '返送'], response: '返品についてご案内いたします。\n\n■ 返品条件\n・商品到着後14日以内\n・未開封・未使用の商品が対象\n・食品・衛生用品は対象外\n\n■ 手続き方法\n1. マイページ「注文履歴」から該当注文を選択\n2. 「返品申請」ボタンをクリック\n3. 返品理由を選択し送信\n4. 返送用ラベルがメールで届きます\n\n返金は商品到着確認後7営業日以内に処理されます。ご不明な点がございましたらお知らせください。' },
  { patterns: ['交換', '取り替え', 'サイズ変更'], response: '商品の交換について承ります。\n\n■ 交換可能な場合\n・サイズ/カラー違い → 在庫がある場合、無料で交換可能です\n・初期不良 → 新品と交換いたします（送料弊社負担）\n\n■ 手順\n1. マイページから「交換申請」を提出\n2. 現在の商品を着払いで返送\n3. 新しい商品を2-3営業日でお届け\n\n交換をご希望の場合、注文番号と交換理由をお知らせください。すぐに手配いたします。' },

  // --- 配送 ---
  { patterns: ['配送', '届か', '届い', '届け', '発送', '出荷'], response: '配送状況を確認いたします。\n\n■ 通常配送：注文確定後2-4営業日\n■ お急ぎ便：翌日配送（14時までのご注文）\n■ 日時指定：ご希望の日時に配達\n\n現在の配送状況はマイページ「注文履歴」の追跡番号からリアルタイムで確認できます。\n\n配送に遅延が発生している場合は、注文番号をお知らせいただければ配送業者に直接確認し、最新状況をお伝えいたします。' },
  { patterns: ['届くまで', '何日', 'いつ届く', '到着日'], response: '到着予定日についてご案内いたします。\n\n■ 標準配送：ご注文から2-4営業日\n■ お急ぎ便：翌日（14時までのご注文、一部地域除く）\n■ 離島・一部地域：+1-2営業日\n\n天候や交通状況により遅延する場合がございます。注文番号をお教えいただければ、正確な到着予定日をお調べいたします。' },

  // --- ポイント・会員 ---
  { patterns: ['ポイント', 'ポイント利用', 'ポイント残高'], response: 'ポイントに関するご案内です。\n\n■ 付与率：購入金額の1%（会員ランクにより最大5%）\n■ 利用方法：1ポイント＝1円としてお支払い時に利用可能\n■ 有効期限：最終ご利用日から1年間\n■ 残高確認：マイページ「ポイント履歴」\n\n■ ランク別付与率\n・レギュラー：1%\n・シルバー（年5万円以上）：2%\n・ゴールド（年10万円以上）：3%\n・プラチナ（年30万円以上）：5%\n\nポイントに関するご質問がございましたら、具体的にお知らせください。' },
  { patterns: ['会員', '登録', 'アカウント', 'ログイン'], response: '会員登録・アカウントについてご案内いたします。\n\n■ 新規登録\nウェブサイト右上の「新規登録」→ メールアドレスとお名前で即完了\n\n■ ログインできない場合\n・パスワードリセット：ログイン画面「パスワードを忘れた場合」から再設定\n・メール未着：迷惑メールフォルダをご確認ください\n・アカウントロック：5回連続失敗で30分ロック\n\n■ 退会\nマイページ「アカウント設定」→「退会手続き」から可能です\n\n具体的にどのようなお困りでしょうか？' },

  // --- 支払い・請求 ---
  { patterns: ['支払', '決済', 'クレジット', '請求', '料金'], response: 'お支払い・ご請求についてご案内いたします。\n\n■ ご利用可能なお支払い方法\n・クレジットカード：VISA / Mastercard / JCB / AMEX\n・銀行振込：ご注文後5営業日以内にお振込み\n・コンビニ払い：セブン、ローソン、ファミマ等\n・代金引換：手数料330円\n・分割払い：3回 / 6回 / 12回（手数料別途）\n\n■ 請求に関するお問い合わせ\n注文番号と請求内容の詳細をお知らせいただければ、即座に確認いたします。\n\n二重請求や誤請求の場合は速やかに返金処理を行います。' },

  // --- 不良品・品質 ---
  { patterns: ['不良', '壊れ', '故障', '破損', '汚れ', '傷'], response: '商品の不良・破損について、大変申し訳ございません。\n\n■ 対応方法\n1. 不良箇所のお写真を撮影してください\n2. 以下の情報をお知らせください\n   ・注文番号\n   ・商品名\n   ・不良の状態（具体的に）\n\n■ 補償内容\n・到着後30日以内：新品交換 or 全額返金（送料弊社負担）\n・到着後31-90日：修理 or 一部返金\n\nお写真をいただければ即座に交換・返金手続きを開始いたします。ご迷惑をおかけし重ねてお詫び申し上げます。' },

  // --- キャンセル ---
  { patterns: ['キャンセル', '取り消し', '取消'], response: '注文のキャンセルについてご案内いたします。\n\n■ キャンセル可能な場合\n・出荷前：マイページから無料でキャンセル可能\n・出荷準備中：お電話にてキャンセル受付（出荷前に限り）\n\n■ 出荷後のキャンセル\n・配送業者に受取拒否をお伝えいただくか、返品手続きをご利用ください\n・返送料はお客様負担となります\n\n■ 返金タイミング\n・クレジットカード：キャンセル後3-5営業日\n・銀行振込：キャンセル後7営業日以内\n\n注文番号をお知らせいただければ、キャンセル可否を即座に確認いたします。' },

  // --- 見積・値引き・価格 ---
  { patterns: ['見積', '値引', '割引', '安く', '値下げ', 'ディスカウント', '価格交渉'], response: 'お見積り・価格についてご案内いたします。\n\n■ 法人のお客様向けボリュームディスカウント\n・10点以上：5%OFF\n・50点以上：10%OFF\n・100点以上：個別見積り対応\n\n■ 個人のお客様\n・会員ランクに応じたポイント還元（最大5%）\n・セール期間中の特別価格\n・クーポンコードの併用可能\n\n■ お見積書の発行\n法人のお客様は「法人窓口」から正式なお見積書を発行可能です。\n\nご要望の数量と商品を教えていただければ、最適なお見積りをご提示いたします。なお、商品代金の値引き交渉には規定の範囲内で対応させていただきます。' },

  // --- 苦情・クレーム ---
  { patterns: ['クレーム', '苦情', '不満', '怒', '最悪'], response: 'ご不快な思いをおかけし、誠に申し訳ございません。\n\nお客様のお声を真摯に受け止め、改善に努めてまいります。\n\n■ 迅速な解決のため、以下をお知らせください\n1. 該当する注文番号（該当する場合）\n2. 問題の具体的な内容\n3. ご希望される解決方法\n\n■ 対応方針\n・初回回答：2時間以内\n・問題解決：24時間以内を目標\n・必要に応じて専門部署・上長にエスカレーション\n\nお客様にご満足いただけるまで、責任を持って対応いたします。' },

  // --- 営業時間・問い合わせ方法 ---
  { patterns: ['営業時間', '何時', '電話', '問い合わせ先', '連絡'], response: 'お問い合わせ窓口のご案内です。\n\n■ カスタマーサポート\n・電話：0120-XXX-XXX（平日9:00-18:00）\n・メール：support@company.co.jp（24時間受付、翌営業日回答）\n・チャット：本画面より（平日9:00-20:00、AI応答は24時間）\n\n■ 法人窓口\n・電話：03-XXXX-XXXX（平日10:00-17:00）\n・メール：biz@company.co.jp\n\n■ 緊急の場合\n・お急ぎの案件は電話窓口へお問い合わせください\n\n現在はAIチャットサポートが対応しております。ご質問をどうぞ。' },

  // --- ハラスメント対応系 ---
  { patterns: ['お前', 'バカ', '馬鹿', 'アホ', '無能', 'クズ', '死ね', '殺す'], response: '【AI対応ガイド】\nお客様のご不満は理解いたしますが、暴言・侮辱的な表現が含まれるため、以下の対応を推奨します。\n\n■ 推奨対応\n1. 「ご不満な点は真摯に受け止めます」と伝える\n2. 「ただし、侮辱的な表現はお控えください」と冷静にお願いする\n3. 改善されない場合は上長にエスカレーション\n\n■ テンプレート回答例\n「お客様のお気持ちは理解いたします。問題の解決に向けて全力で対応いたしますが、人格を否定するような表現につきましてはお控えいただけますようお願い申し上げます。」' },
  { patterns: ['上を出せ', '責任者', '上司', '管理者を呼べ'], response: '【AI対応ガイド】上席対応の要求です。\n\n■ 推奨対応手順\n1. まずお客様の要望を確認：「私でも対応可能ですが、ご要望でしたら上席に引き継ぎます」\n2. 引き継ぐ場合：これまでの経緯を上席に共有した上で転送\n3. 引き継がない場合：「責任を持って私が最後まで対応いたします」\n\n■ テンプレート回答例\n「ご不便をおかけし申し訳ございません。私でも同等の権限で対応させていただけますが、ご希望でしたら担当責任者に引き継がせていただきます。いかがなさいますか？」' },
  { patterns: ['訴え', '弁護士', '裁判', '法的', '消費者センター'], response: '【AI対応ガイド】法的措置への言及です。\n\n■ 推奨対応\n1. 冷静に対応し、お客様の権利を尊重する旨を伝える\n2. 社内の法務担当にエスカレーション\n3. 対応履歴を詳細に記録\n\n■ テンプレート回答例\n「お客様がそのようなお考えに至った経緯を重く受け止めます。もちろんお客様にはそのような権利がございます。弊社としましても、まずは問題の解決に向けて最善を尽くしたいと存じます。改めて上席より対応させていただいてもよろしいでしょうか。」' },
  { patterns: ['拡散', 'SNS', 'ネットに書く', '口コミ', 'レビュー'], response: '【AI対応ガイド】SNS拡散への脅迫的言及です。\n\n■ 推奨対応\n1. 脅しには屈さず、冷静に対応\n2. お客様の不満の根本原因を把握\n3. 解決策を具体的に提示\n\n■ テンプレート回答例\n「お客様のご不満を解決することが最優先と考えております。具体的にどのような対応をさせていただければご納得いただけますでしょうか。弊社規定の範囲内で最大限の対応をさせていただきます。」\n\n※ 脅迫レベルの場合は上長にエスカレーションしてください。' },

  // --- 感謝・挨拶 ---
  { patterns: ['ありがとう', '助かり', '感謝', '解決し'], response: 'お役に立てて光栄です。\n\n今回の対応にご満足いただけましたら幸いです。今後もお困りのことがございましたら、いつでもお気軽にお問い合わせください。\n\n■ 便利な機能のご案内\n・マイページから過去のお問い合わせ履歴を確認できます\n・よくある質問（FAQ）ページもご活用ください\n・営業時間外はAIチャットが24時間対応しております\n\n本日はお問い合わせいただきありがとうございました。' },
  { patterns: ['こんにちは', 'はじめまして', 'よろしく'], response: 'お問い合わせいただきありがとうございます。AIカスタマーサポートです。\n\nどのようなご用件でしょうか？以下のようなお問い合わせに対応しております。\n\n・商品の注文・配送について\n・返品・交換の手続き\n・お支払い・ご請求について\n・ポイント・会員情報\n・商品の不良・破損\n・その他ご質問\n\nお気軽にご質問ください。' },

  // --- 在庫・商品 ---
  { patterns: ['在庫', '入荷', '再入荷', '品切れ'], response: '在庫状況についてご案内いたします。\n\n■ 在庫確認方法\n・商品ページに「在庫あり」「残りわずか」「入荷待ち」のステータスが表示されます\n・商品ページの「再入荷通知」ボタンで入荷時にメールが届きます\n\n■ 入荷予定\n人気商品は通常1-2週間で再入荷いたします。お急ぎの場合は、代替商品のご提案も可能です。\n\nご希望の商品名をお教えいただければ、入荷予定を個別にお調べいたします。' },

  // --- その他技術系 ---
  { patterns: ['エラー', 'バグ', '動かない', '表示されない', 'ページ'], response: 'システムの問題について承ります。\n\n■ まずお試しください\n1. ブラウザのキャッシュ・Cookieを削除\n2. 別のブラウザでお試しください\n3. スマートフォンアプリをご利用の場合はアプリを最新版に更新\n\n■ それでも解決しない場合\n以下をお知らせください。\n・発生しているエラーメッセージ\n・ご利用のブラウザ/端末\n・操作手順\n\n技術チームが調査し、最短で対応いたします。' },
]

function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()

  // Pattern matching - find the best response
  for (const rule of RESPONSE_RULES) {
    for (const pattern of rule.patterns) {
      if (msg.includes(pattern.toLowerCase()) || msg.includes(pattern)) {
        return rule.response
      }
    }
  }

  // Semantic fallback - analyze intent
  if (msg.length < 5) {
    return 'もう少し詳しくお聞かせいただけますか？具体的な内容をお伝えいただければ、より正確にサポートいたします。'
  }

  if (msg.includes('？') || msg.includes('?') || msg.includes('教えて') || msg.includes('知りたい')) {
    return `ご質問ありがとうございます。\n\n「${userMessage}」について、担当データベースを検索いたしました。\n\nこちらのお問い合わせについては、専門の担当者がより詳細にご案内できますので、以下の方法でお問い合わせいただくことも可能です。\n\n・電話：0120-XXX-XXX（平日9:00-18:00）\n・メール：support@company.co.jp\n\nこのチャットでも引き続き対応いたします。追加のご質問がございましたらお知らせください。`
  }

  return `承知いたしました。\n\nお問い合わせの内容を確認いたします。正確な対応のため、以下をお教えいただけますでしょうか。\n\n1. 該当する注文番号（お持ちの場合）\n2. 具体的な状況の詳細\n3. ご希望される解決方法\n\n情報をいただき次第、速やかに対応いたします。緊急の場合はお電話（0120-XXX-XXX）でも承っております。`
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
                          ハラスメント: {(msg.harassment.score * 100).toFixed(0)}%
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
