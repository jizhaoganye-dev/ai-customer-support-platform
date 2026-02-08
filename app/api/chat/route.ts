import { NextRequest, NextResponse } from 'next/server'
import { withSupabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// POST /api/chat — Server-side AI chat endpoint
//
// Strategy:
//   1. If OPENAI_API_KEY is set → call OpenAI GPT for response
//   2. Otherwise → use local rule-based response engine
//
// This demonstrates the ability to integrate real AI APIs while keeping
// the app functional without them (graceful degradation).
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface ChatRequest {
  message: string
  conversationId?: string
  history?: Array<{ role: string; content: string }>
}

// --- Local rule-based fallback (same logic as client, but server-side) ---
const RULES: Array<{ patterns: string[]; response: string }> = [
  { patterns: ['返品', '返却', '返送'], response: '返品についてご案内いたします。\n\n■ 返品条件\n・商品到着後14日以内\n・未開封・未使用の商品が対象\n・食品・衛生用品は対象外\n\n■ 手続き方法\n1. マイページ「注文履歴」から該当注文を選択\n2. 「返品申請」ボタンをクリック\n3. 返品理由を選択し送信\n4. 返送用ラベルがメールで届きます\n\n返金は商品到着確認後7営業日以内に処理されます。' },
  { patterns: ['配送', '届か', '届い', '届け', '発送', '出荷'], response: '配送状況を確認いたします。\n\n■ 通常配送：注文確定後2-4営業日\n■ お急ぎ便：翌日配送（14時までのご注文）\n■ 日時指定：ご希望の日時に配達\n\n現在の配送状況はマイページ「注文履歴」の追跡番号からリアルタイムで確認できます。' },
  { patterns: ['支払', '決済', 'クレジット', '請求', '料金'], response: 'お支払い・ご請求についてご案内いたします。\n\n■ ご利用可能なお支払い方法\n・クレジットカード：VISA / Mastercard / JCB / AMEX\n・銀行振込：ご注文後5営業日以内\n・コンビニ払い：セブン、ローソン、ファミマ等\n・代金引換：手数料330円' },
  { patterns: ['ポイント', 'ポイント利用', 'ポイント残高'], response: 'ポイントに関するご案内です。\n\n■ 付与率：購入金額の1%（会員ランクにより最大5%）\n■ 利用方法：1ポイント＝1円としてお支払い時に利用可能\n■ 有効期限：最終ご利用日から1年間' },
  { patterns: ['キャンセル', '取り消し', '取消'], response: '注文のキャンセルについてご案内いたします。\n\n■ キャンセル可能な場合\n・出荷前：マイページから無料でキャンセル可能\n・出荷準備中：お電話にてキャンセル受付\n\n注文番号をお知らせいただければ即座に確認いたします。' },
  { patterns: ['不良', '壊れ', '故障', '破損'], response: '商品の不良・破損について、大変申し訳ございません。\n\n■ 対応方法\n1. 不良箇所のお写真を撮影してください\n2. 注文番号・商品名・不良の状態をお知らせください\n\n■ 補償内容\n・到着後30日以内：新品交換 or 全額返金（送料弊社負担）' },
]

function localResponse(message: string): string {
  const msg = message.toLowerCase()
  for (const rule of RULES) {
    for (const p of rule.patterns) {
      if (msg.includes(p.toLowerCase()) || message.includes(p)) return rule.response
    }
  }
  return `承知いたしました。正確な対応のため、以下をお教えいただけますでしょうか。\n\n1. 該当する注文番号\n2. 具体的な状況の詳細\n3. ご希望される解決方法\n\n情報をいただき次第、速やかに対応いたします。`
}

// --- OpenAI integration ---
async function openaiResponse(
  message: string,
  history: Array<{ role: string; content: string }>,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `あなたは日本語のカスタマーサポートAIです。丁寧かつ具体的に回答してください。
回答は以下のルールに従ってください：
- 返品・交換・配送・支払い等の問い合わせには具体的な手順を提示
- カスタマーハラスメント（暴言・脅迫）には冷静に対応し、エスカレーションを推奨
- 不明な質問には注文番号等の追加情報を求める
- 回答は日本語で、■マークで項目を分ける`,
        },
        ...history.slice(-6).map((h) => ({
          role: h.role === 'customer' ? 'user' : ('assistant' as const),
          content: h.content,
        })),
        { role: 'user' as const, content: message },
      ],
    }),
  })

  if (!res.ok) {
    console.error('[OpenAI] API error:', res.status, await res.text())
    return localResponse(message)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || localResponse(message)
}

// --- Route handler ---
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, conversationId, history = [] } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Generate response (AI or fallback)
    const useAI = !!OPENAI_API_KEY
    const response = useAI
      ? await openaiResponse(message, history)
      : localResponse(message)

    // Optionally persist to Supabase
    if (conversationId) {
      await withSupabase(
        async (client) => {
          await client.from('messages').insert({
            id: `msg_${Date.now()}`,
            conversation_id: conversationId,
            role: 'ai',
            content: response,
            harassment_score: null,
            harassment_severity: null,
            sentiment: null,
          })
        },
        undefined,
      )
    }

    return NextResponse.json({
      response,
      source: useAI ? 'openai' : 'local',
      model: useAI ? 'gpt-4o-mini' : 'rule-based',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[/api/chat] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
