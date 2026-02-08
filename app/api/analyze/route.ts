import { NextRequest, NextResponse } from 'next/server'
import { withSupabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// POST /api/analyze — Server-side harassment detection + sentiment analysis
//
// Strategy:
//   1. If OPENAI_API_KEY is set → use AI for nuanced analysis
//   2. Otherwise → use local keyword-based detection
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface AnalyzeRequest {
  message: string
  conversationId?: string
}

// --- Local keyword-based detection (mirrors lib/mock-data.ts) ---
const HARASSMENT_KEYWORDS = {
  critical: ['殺す', 'ころす', '死ね', 'しね', 'タヒね', '殺してやる', 'ぶっ殺'],
  high: ['バカ', 'ばか', '馬鹿', 'バカ野郎', 'ばかやろう', 'アホ', 'あほ', '無能', 'クズ', 'くず', 'ゴミ', 'ごみ', 'クソ', 'くそ', 'ボケ', 'ぼけ', 'カス', 'かす'],
  medium: ['ふざけるな', 'ふざけんな', 'いい加減にしろ', 'うざい', 'きもい', '最低', 'ありえない'],
  low: ['訴える', '弁護士', 'SNSに書く', '拡散', '上を出せ', '責任者'],
}

const ANGER_KEYWORDS = [
  'ふざけ', 'ふざけるな', '怒', '腹立', '許さない', '許せない', 'ありえない', '最悪', 'いつまで',
  ...HARASSMENT_KEYWORDS.critical, ...HARASSMENT_KEYWORDS.high, ...HARASSMENT_KEYWORDS.medium,
]

function localAnalyze(message: string) {
  const msg = message.toLowerCase()
  let harassmentScore = 0
  let severity = 'none'
  const detectedKeywords: string[] = []

  for (const [sev, keywords] of Object.entries(HARASSMENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (msg.includes(kw.toLowerCase()) || message.includes(kw)) {
        detectedKeywords.push(kw)
        const weight = sev === 'critical' ? 0.9 : sev === 'high' ? 0.7 : sev === 'medium' ? 0.5 : 0.3
        harassmentScore = Math.max(harassmentScore, weight)
        if (!severity || weight > (severity === 'critical' ? 0.9 : severity === 'high' ? 0.7 : severity === 'medium' ? 0.5 : 0.3)) {
          severity = sev
        }
      }
    }
  }

  let angerScore = 0
  for (const kw of ANGER_KEYWORDS) {
    if (msg.includes(kw.toLowerCase()) || message.includes(kw)) angerScore++
  }
  const exclamations = (message.match(/[！!]+/g) || []).length
  angerScore += exclamations * 0.5

  const sentiment = angerScore >= 2 ? 'anger' : angerScore >= 1 ? 'negative' : 'neutral'
  const confidence = angerScore >= 2 ? Math.min(0.95, 0.6 + angerScore * 0.1) : 0.5

  return {
    harassment: { score: harassmentScore, severity, keywords: detectedKeywords, isHarassment: harassmentScore > 0 },
    sentiment: { sentiment, confidence, isAnger: sentiment === 'anger' },
  }
}

// --- AI-powered analysis ---
async function aiAnalyze(message: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `日本語のカスタマーメッセージを分析し、以下のJSON形式で返してください:
{
  "harassment": { "score": 0-1, "severity": "none|low|medium|high|critical", "keywords": [], "isHarassment": bool },
  "sentiment": { "sentiment": "positive|neutral|negative|anger", "confidence": 0-1, "isAnger": bool }
}
暴言・侮辱・脅迫・人格否定をharassmentとして検出。怒りの感情をsentimentで分析。`,
        },
        { role: 'user', content: message },
      ],
    }),
  })

  if (!res.ok) return localAnalyze(message)
  const data = await res.json()
  try {
    return JSON.parse(data.choices[0].message.content)
  } catch {
    return localAnalyze(message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { message, conversationId } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const useAI = !!OPENAI_API_KEY
    const result = useAI ? await aiAnalyze(message) : localAnalyze(message)

    // Persist harassment event to Supabase if detected
    if (result.harassment.isHarassment && conversationId) {
      await withSupabase(
        async (client) => {
          await client.from('harassment_events').insert({
            id: `harass_${Date.now()}`,
            conversation_id: conversationId,
            score: result.harassment.score,
            severity: result.harassment.severity,
            keywords: result.harassment.keywords,
            customer_message: message,
          })
        },
        undefined,
      )
    }

    return NextResponse.json({
      ...result,
      source: useAI ? 'openai' : 'local',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[/api/analyze] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
