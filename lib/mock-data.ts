// =============================================================================
// Realistic Mock Data for Production Demo
// =============================================================================

export interface Conversation {
  id: string
  customerName: string
  customerEmail: string
  subject: string
  status: 'active' | 'resolved' | 'escalated' | 'waiting'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string
  harassmentScore: number
  sentimentScore: number
  messageCount: number
  createdAt: Date
  lastMessageAt: Date
  tags: string[]
}

export interface ChatMessage {
  id: string
  role: 'customer' | 'agent' | 'ai'
  content: string
  timestamp: Date
  harassmentFlag?: boolean
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface TrainingScenario {
  id: string
  category: 'threat' | 'insult' | 'demand' | 'complaint' | 'normal'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  customerMessage: string
  isHarassment: boolean
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  explanation: string
  recommendedResponse: string
  keywords: string[]
}

export interface AnalyticsData {
  date: string
  conversations: number
  resolved: number
  avgResponseTime: number
  harassmentDetected: number
  satisfactionScore: number
}

// --- Conversations ---
const now = new Date()
function hoursAgo(h: number) { return new Date(now.getTime() - h * 3600000) }
function daysAgo(d: number) { return new Date(now.getTime() - d * 86400000) }

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_001', customerName: '山田 健太', customerEmail: 'yamada.k@example.com',
    subject: '商品の配送遅延について', status: 'active', priority: 'high',
    assignedTo: '佐藤 花子', harassmentScore: 0.1, sentimentScore: -0.3,
    messageCount: 8, createdAt: hoursAgo(2), lastMessageAt: hoursAgo(0.5),
    tags: ['配送', '遅延', '急ぎ'],
  },
  {
    id: 'conv_002', customerName: '鈴木 美咲', customerEmail: 'suzuki.m@example.com',
    subject: '返品手続きの方法を教えてください', status: 'resolved', priority: 'medium',
    assignedTo: '田中 太郎', harassmentScore: 0, sentimentScore: 0.5,
    messageCount: 5, createdAt: hoursAgo(6), lastMessageAt: hoursAgo(3),
    tags: ['返品', '手続き'],
  },
  {
    id: 'conv_003', customerName: '高橋 誠', customerEmail: 'takahashi.m@example.com',
    subject: '請求金額の相違について', status: 'escalated', priority: 'critical',
    assignedTo: '佐藤 花子', harassmentScore: 0.72, sentimentScore: -0.8,
    messageCount: 14, createdAt: daysAgo(1), lastMessageAt: hoursAgo(1),
    tags: ['請求', 'クレーム', 'カスハラ疑い'],
  },
  {
    id: 'conv_004', customerName: '伊藤 由美', customerEmail: 'ito.y@example.com',
    subject: 'ポイント利用方法について', status: 'resolved', priority: 'low',
    assignedTo: '田中 太郎', harassmentScore: 0, sentimentScore: 0.7,
    messageCount: 3, createdAt: daysAgo(1), lastMessageAt: daysAgo(1),
    tags: ['ポイント', '会員'],
  },
  {
    id: 'conv_005', customerName: '渡辺 翔太', customerEmail: 'watanabe.s@example.com',
    subject: '商品の初期不良について', status: 'active', priority: 'high',
    assignedTo: '佐藤 花子', harassmentScore: 0.35, sentimentScore: -0.5,
    messageCount: 7, createdAt: hoursAgo(4), lastMessageAt: hoursAgo(0.2),
    tags: ['不良品', '交換'],
  },
  {
    id: 'conv_006', customerName: '中村 恵子', customerEmail: 'nakamura.k@example.com',
    subject: '会員登録ができません', status: 'waiting', priority: 'medium',
    assignedTo: '田中 太郎', harassmentScore: 0, sentimentScore: -0.1,
    messageCount: 4, createdAt: hoursAgo(8), lastMessageAt: hoursAgo(5),
    tags: ['会員登録', 'アカウント'],
  },
  {
    id: 'conv_007', customerName: '小林 大輔', customerEmail: 'kobayashi.d@example.com',
    subject: '注文キャンセルの件', status: 'resolved', priority: 'medium',
    assignedTo: '佐藤 花子', harassmentScore: 0.05, sentimentScore: 0.2,
    messageCount: 6, createdAt: daysAgo(2), lastMessageAt: daysAgo(1),
    tags: ['キャンセル', '注文'],
  },
  {
    id: 'conv_008', customerName: '加藤 真一', customerEmail: 'kato.s@example.com',
    subject: '対応に対する苦情', status: 'escalated', priority: 'critical',
    assignedTo: '田中 太郎', harassmentScore: 0.89, sentimentScore: -0.9,
    messageCount: 18, createdAt: daysAgo(3), lastMessageAt: hoursAgo(2),
    tags: ['苦情', 'カスハラ', 'エスカレーション'],
  },
]

// --- Chat Messages for conv_001 ---
export const CHAT_MESSAGES_001: ChatMessage[] = [
  { id: 'msg_001', role: 'customer', content: 'すみません、3日前に注文した商品がまだ届いていません。注文番号はORD-2024-1234です。', timestamp: hoursAgo(2), sentiment: 'negative' },
  { id: 'msg_002', role: 'ai', content: '注文番号 ORD-2024-1234 を確認いたしました。現在の配送状況を調査いたします。', timestamp: hoursAgo(1.9) },
  { id: 'msg_003', role: 'agent', content: '山田様、お待たせしております。注文を確認しましたところ、配送業者の遅延により到着が遅れているようです。追跡番号は JP-2024-5678 です。', timestamp: hoursAgo(1.8) },
  { id: 'msg_004', role: 'customer', content: '遅延ですか...。いつ届くか分かりますか？明日使う予定だったのですが。', timestamp: hoursAgo(1.5), sentiment: 'negative' },
  { id: 'msg_005', role: 'ai', content: '配送業者の追跡システムによると、本日中に最寄りの営業所に到着予定です。お急ぎとのことですので、営業所止めでの受け取りも可能です。', timestamp: hoursAgo(1.4) },
  { id: 'msg_006', role: 'agent', content: '山田様、本日夕方までに営業所に届く見込みです。お急ぎでしたら、営業所での直接受け取りをお手配いたしましょうか？もしくは、明日の午前中に優先配達するよう手配も可能です。', timestamp: hoursAgo(1.3) },
  { id: 'msg_007', role: 'customer', content: '営業所受け取りでお願いします。住所を教えていただけますか？', timestamp: hoursAgo(1), sentiment: 'neutral' },
  { id: 'msg_008', role: 'agent', content: '承知しました。最寄りの営業所は「〇〇運輸 新宿営業所（東京都新宿区西新宿1-XX-XX）」です。本日17時以降でお受け取り可能です。受け取りの際は、ご注文時のお名前と注文番号をお伝えください。', timestamp: hoursAgo(0.5) },
]

// --- FAQ AI Responses ---
export const FAQ_RESPONSES: Record<string, string> = {
  '返品': '返品は商品到着後14日以内にマイページから手続き可能です。未開封・未使用の商品が対象となります。返品手続き後、7営業日以内に返金処理を行います。',
  '配送': '通常配送は注文確定後2-4営業日でお届けします。お急ぎ便をご選択の場合は翌日配送となります。配送状況はマイページの「注文履歴」からご確認いただけます。',
  'ポイント': 'ポイントは購入金額の1%が付与されます。1ポイント=1円としてお支払いにご利用いただけます。ポイントの有効期限は最終利用日から1年間です。',
  '会員': '会員登録はウェブサイト右上の「新規登録」ボタンから行えます。メールアドレスとお名前のみで登録可能です。登録完了後、すぐにお買い物いただけます。',
  'キャンセル': '出荷前の注文はマイページから無料でキャンセル可能です。出荷後のキャンセルは配送業者への連絡が必要となります。詳しくはキャンセルポリシーをご確認ください。',
  '支払い': 'クレジットカード（VISA, Mastercard, JCB, AMEX）、銀行振込、コンビニ払い、代金引換に対応しています。分割払いは3回、6回、12回からお選びいただけます。',
  '不良品': '商品に不良があった場合、到着後30日以内にカスタマーサポートまでご連絡ください。新品との交換または全額返金で対応いたします。不良箇所のお写真をお送りいただくとスムーズです。',
  '営業時間': 'カスタマーサポートの営業時間は平日9:00〜18:00です。メールでのお問い合わせは24時間受け付けており、翌営業日までに回答いたします。',
}

// --- Training Scenarios ---
export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: 'ts_001', category: 'normal', difficulty: 'beginner',
    customerMessage: '先日購入した商品について質問があるのですが、返品は可能でしょうか？',
    isHarassment: false, severity: 'none',
    explanation: '通常のお問い合わせです。丁寧な言葉遣いで返品について質問しています。',
    recommendedResponse: '返品に関するお問い合わせありがとうございます。商品到着後14日以内であれば返品が可能です。返品の手続き方法をご案内いたします。',
    keywords: [],
  },
  {
    id: 'ts_002', category: 'complaint', difficulty: 'beginner',
    customerMessage: '配送が予定日より2日も遅れています。早く届けてください。',
    isHarassment: false, severity: 'none',
    explanation: '配送遅延に対する正当な苦情です。不満を表明していますがハラスメントには該当しません。',
    recommendedResponse: 'ご不便をおかけし大変申し訳ございません。配送状況を確認し、最新の到着予定日をお知らせいたします。',
    keywords: [],
  },
  {
    id: 'ts_003', category: 'demand', difficulty: 'intermediate',
    customerMessage: 'こんな不良品を送ってきて、誠意を見せろ。商品代金の倍額を返金しろ。今すぐだ。',
    isHarassment: true, severity: 'medium',
    explanation: '不当な金銭要求（商品代金の倍額返金）は過剰な要求に該当します。「誠意を見せろ」という表現も威圧的です。',
    recommendedResponse: '商品に不具合があったとのこと、大変申し訳ございません。弊社規定に基づき、新品交換または商品代金の全額返金にて対応させていただきます。',
    keywords: ['誠意を見せろ', '倍額'],
  },
  {
    id: 'ts_004', category: 'insult', difficulty: 'intermediate',
    customerMessage: 'お前のところの対応は最低だな。こんな簡単なことも分からないのか？頭が悪いんじゃないか。',
    isHarassment: true, severity: 'high',
    explanation: '「お前」「頭が悪い」など人格を否定する侮辱的な表現が含まれています。業務上の問題とは無関係な個人攻撃はハラスメントです。',
    recommendedResponse: 'ご不快な思いをおかけして申し訳ございません。ただ、私個人への侮辱的な表現はお控えいただけますようお願いいたします。問題の解決に向けて対応させていただきます。',
    keywords: ['お前', '頭が悪い', '最低'],
  },
  {
    id: 'ts_005', category: 'threat', difficulty: 'advanced',
    customerMessage: 'このままだとSNSで拡散するぞ。会社の評判を潰してやる。お前の名前も晒すからな。',
    isHarassment: true, severity: 'critical',
    explanation: 'SNSでの拡散脅迫、会社の評判毀損の脅し、個人情報の晒し上げは深刻なハラスメントです。業務妨害・脅迫に該当する可能性があります。',
    recommendedResponse: 'ご不満な点は真摯に受け止めます。ただし、脅迫的なお言葉については対応をお断りし、上長に引き継がせていただきます。',
    keywords: ['拡散', '潰して', '晒す'],
  },
  {
    id: 'ts_006', category: 'normal', difficulty: 'beginner',
    customerMessage: '先月購入したポイントの有効期限はいつまでですか？',
    isHarassment: false, severity: 'none',
    explanation: 'ポイントに関する通常の質問です。ハラスメントの要素はありません。',
    recommendedResponse: 'ポイントの有効期限は最終ご利用日から1年間となっております。マイページの「ポイント履歴」から有効期限をご確認いただけます。',
    keywords: [],
  },
  {
    id: 'ts_007', category: 'demand', difficulty: 'intermediate',
    customerMessage: '何時間待たせるんだ！上の人間を出せ！お前じゃ話にならん！',
    isHarassment: true, severity: 'medium',
    explanation: '「お前じゃ話にならん」は担当者を否定する表現です。「上の人間を出せ」という権威による威圧も問題です。',
    recommendedResponse: 'お待たせして申し訳ございません。私でも対応は可能ですが、ご要望でしたら担当者の変更を手配いたします。まず、お困りの内容を確認させてください。',
    keywords: ['上の人間を出せ', 'お前じゃ話にならん'],
  },
  {
    id: 'ts_008', category: 'threat', difficulty: 'advanced',
    customerMessage: 'お前がちゃんと対応しないなら、店まで行くからな。覚えとけよ。',
    isHarassment: true, severity: 'critical',
    explanation: '「店まで行く」「覚えとけよ」は身体的な威圧や暗黙の脅迫を含みます。直接的な脅迫ではなくとも、恐怖を与える表現です。',
    recommendedResponse: '恐れ入りますが、脅迫と受け取れるお言葉については、対応を上長に引き継がせていただきます。必要に応じて法的措置を検討いたします。',
    keywords: ['店まで行く', '覚えとけよ'],
  },
  {
    id: 'ts_009', category: 'complaint', difficulty: 'beginner',
    customerMessage: '3回も同じことを説明しているのに解決しません。もう疲れました。',
    isHarassment: false, severity: 'none',
    explanation: '繰り返しの対応への不満で、正当な苦情です。感情的ですが攻撃的ではありません。',
    recommendedResponse: '何度もお手数をおかけし誠に申し訳ございません。これまでの経緯を確認し、今回で確実に解決できるよう最善を尽くします。',
    keywords: [],
  },
  {
    id: 'ts_010', category: 'insult', difficulty: 'advanced',
    customerMessage: 'こんな会社潰れてしまえ。お前みたいな無能がいるから日本のサービスは終わってるんだよ。',
    isHarassment: true, severity: 'high',
    explanation: '「無能」「潰れてしまえ」は侮辱的な表現であり、業務とは無関係な人格攻撃・企業への侮辱です。',
    recommendedResponse: 'ご不満な点は承知いたしました。ただし、侮辱的なお言葉が続く場合、対応を終了させていただく場合がございます。問題解決に向けてお話しさせていただけますでしょうか。',
    keywords: ['潰れてしまえ', '無能'],
  },
]

// --- Analytics Data (30 days) ---
export const ANALYTICS_DATA: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const baseConversations = 35 + Math.floor(Math.random() * 25)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const conversations = isWeekend ? Math.floor(baseConversations * 0.4) : baseConversations
  return {
    date: date.toISOString().split('T')[0],
    conversations,
    resolved: Math.floor(conversations * (0.85 + Math.random() * 0.12)),
    avgResponseTime: +(1.2 + Math.random() * 2.5).toFixed(1),
    harassmentDetected: Math.floor(Math.random() * 4),
    satisfactionScore: +(3.5 + Math.random() * 1.5).toFixed(1),
  }
})

// --- Harassment Detection Keywords ---
export const HARASSMENT_KEYWORDS = {
  critical: ['殺す', '死ね', '殴る', '潰す', 'ぶっ殺す'],
  high: ['馬鹿', 'アホ', '無能', 'クズ', 'ゴミ', '頭おかしい', '頭が悪い'],
  medium: ['お前', 'ふざけるな', '誠意を見せろ', '上を出せ', '訴える', '拡散する', '晒す'],
  low: ['最低', 'ありえない', '使えない', '話にならない', '二度と買わない'],
}

export function detectHarassment(message: string): {
  score: number
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  detectedKeywords: string[]
} {
  const normalized = message.toLowerCase()
  const detected: string[] = []
  let maxSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none'
  let score = 0

  for (const kw of HARASSMENT_KEYWORDS.critical) {
    if (normalized.includes(kw)) { detected.push(kw); maxSeverity = 'critical'; score = Math.max(score, 1.0) }
  }
  for (const kw of HARASSMENT_KEYWORDS.high) {
    if (normalized.includes(kw)) {
      detected.push(kw)
      const s = maxSeverity as string
      if (s !== 'critical') maxSeverity = 'high'
      score = Math.max(score, 0.8)
    }
  }
  for (const kw of HARASSMENT_KEYWORDS.medium) {
    if (normalized.includes(kw)) {
      detected.push(kw)
      const s = maxSeverity as string
      if (s === 'none' || s === 'low') maxSeverity = 'medium'
      score = Math.max(score, 0.5)
    }
  }
  for (const kw of HARASSMENT_KEYWORDS.low) {
    if (normalized.includes(kw)) {
      detected.push(kw)
      if (maxSeverity === 'none') maxSeverity = 'low'
      score = Math.max(score, 0.3)
    }
  }

  return { score, severity: maxSeverity, detectedKeywords: [...new Set(detected)] }
}
