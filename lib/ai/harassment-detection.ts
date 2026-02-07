// ============================================================================
// Customer Harassment Detection System
// Advanced NLP-based detection with severity classification
// ============================================================================

import type {
  HarassmentDetectionResult,
  HarassmentPattern,
  SentimentAnalysisResult,
} from '@/types'

// ============================================================================
// Harassment Pattern Database (In production, load from database)
// ============================================================================

const HARASSMENT_KEYWORDS = {
  critical: [
    '殺す',
    'ころす',
    '死ね',
    'しね',
    '自殺',
    '殴る',
    '暴力',
    '脅迫',
    'テロ',
  ],
  high: [
    'バカ',
    'ばか',
    'アホ',
    'あほ',
    'クズ',
    'くず',
    'ゴミ',
    'ごみ',
    '無能',
    '役立たず',
    '給料泥棒',
    '辞めろ',
    '訴える',
    '裁判',
    '弁護士',
  ],
  medium: [
    'ふざけるな',
    'いい加減',
    'なめるな',
    '責任者',
    '上司',
    'クレーム',
    '許せない',
    '納得できない',
  ],
  low: ['ダメ', 'だめ', '最悪', 'ひどい', '遅い', '困る'],
}

const HARASSMENT_PATTERNS: HarassmentPattern[] = [
  {
    id: 'p1',
    pattern: '生命に関する脅迫',
    severity: 'critical',
    category: '暴力的脅迫',
    description: '殺害や暴力を示唆する表現',
    isActive: true,
    detectionCount: 0,
  },
  {
    id: 'p2',
    pattern: '人格否定',
    severity: 'high',
    category: '侮辱',
    description: '相手の人格や能力を否定する表現',
    isActive: true,
    detectionCount: 0,
  },
  {
    id: 'p3',
    pattern: '法的措置の示唆',
    severity: 'high',
    category: '威圧',
    description: '訴訟や法的手段を仄めかす表現',
    isActive: true,
    detectionCount: 0,
  },
  {
    id: 'p4',
    pattern: '威圧的な要求',
    severity: 'medium',
    category: '強要',
    description: '高圧的な態度での要求',
    isActive: true,
    detectionCount: 0,
  },
  {
    id: 'p5',
    pattern: '過度な不満表明',
    severity: 'low',
    category: '不満',
    description: '感情的な不満の表現',
    isActive: true,
    detectionCount: 0,
  },
]

// ============================================================================
// Advanced Harassment Detection using AI
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY
const OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://api.openai.com/v1'

/**
 * Detect harassment using AI-powered analysis
 */
export async function detectHarassment(
  message: string
): Promise<HarassmentDetectionResult> {
  try {
    // 1. Keyword-based quick scan
    const keywordResult = performKeywordScan(message)

    // 2. If critical keywords found, immediate escalation
    if (keywordResult.severity === 'critical') {
      return {
        isHarassment: true,
        score: 1.0,
        severity: 'critical',
        flags: keywordResult.flags,
        detectedPatterns: keywordResult.patterns,
        recommendation: 'terminate',
        explanation:
          '重大な脅迫的表現が検出されました。直ちに対応を終了し、管理者にエスカレーションしてください。',
      }
    }

    // 3. AI-powered深度分析
    const aiAnalysis = await performAIAnalysis(message)

    // 4. Combine keyword and AI results
    const combinedScore = Math.max(keywordResult.score, aiAnalysis.score)
    const combinedFlags = [...new Set([...keywordResult.flags, ...aiAnalysis.flags])]

    // 5. Determine severity and recommendation
    const severity = determineSeverity(combinedScore)
    const recommendation = determineRecommendation(severity, combinedScore)

    return {
      isHarassment: combinedScore > 0.3,
      score: combinedScore,
      severity,
      flags: combinedFlags,
      detectedPatterns: keywordResult.patterns,
      recommendation,
      explanation: generateExplanation(combinedScore, severity, combinedFlags),
    }
  } catch (error) {
    console.error('Error in detectHarassment:', error)
    // Fail-safe: treat as potential harassment
    return {
      isHarassment: true,
      score: 0.5,
      severity: 'medium',
      flags: ['analysis_error'],
      detectedPatterns: [],
      recommendation: 'escalate',
      explanation: '分析エラーが発生しました。念のため管理者に確認してください。',
    }
  }
}

// ============================================================================
// Keyword-based Scan
// ============================================================================

interface KeywordScanResult {
  score: number
  severity: 'low' | 'medium' | 'high' | 'critical' | null
  flags: string[]
  patterns: HarassmentPattern[]
}

function performKeywordScan(message: string): KeywordScanResult {
  const normalizedMessage = message.toLowerCase()
  const flags: string[] = []
  const detectedPatterns: HarassmentPattern[] = []
  let maxSeverity: 'low' | 'medium' | 'high' | 'critical' | null = null
  let score = 0

  // Check critical keywords
  for (const keyword of HARASSMENT_KEYWORDS.critical) {
    if (normalizedMessage.includes(keyword)) {
      flags.push(`critical_keyword:${keyword}`)
      maxSeverity = 'critical'
      score = 1.0
      detectedPatterns.push(HARASSMENT_PATTERNS[0]) // 暴力的脅迫
    }
  }

  // Check high severity keywords
  if (score < 1.0) {
    for (const keyword of HARASSMENT_KEYWORDS.high) {
      if (normalizedMessage.includes(keyword)) {
        flags.push(`high_keyword:${keyword}`)
        if (!maxSeverity || maxSeverity === 'low' || maxSeverity === 'medium') {
          maxSeverity = 'high'
        }
        score = Math.max(score, 0.8)
        detectedPatterns.push(HARASSMENT_PATTERNS[1]) // 人格否定
      }
    }
  }

  // Check medium severity keywords
  if (score < 0.8) {
    for (const keyword of HARASSMENT_KEYWORDS.medium) {
      if (normalizedMessage.includes(keyword)) {
        flags.push(`medium_keyword:${keyword}`)
        if (!maxSeverity || maxSeverity === 'low') {
          maxSeverity = 'medium'
        }
        score = Math.max(score, 0.5)
        detectedPatterns.push(HARASSMENT_PATTERNS[3]) // 威圧的な要求
      }
    }
  }

  // Check low severity keywords
  if (score < 0.5) {
    for (const keyword of HARASSMENT_KEYWORDS.low) {
      if (normalizedMessage.includes(keyword)) {
        flags.push(`low_keyword:${keyword}`)
        if (!maxSeverity) {
          maxSeverity = 'low'
        }
        score = Math.max(score, 0.3)
        detectedPatterns.push(HARASSMENT_PATTERNS[4]) // 過度な不満
      }
    }
  }

  return {
    score,
    severity: maxSeverity,
    flags: [...new Set(flags)],
    patterns: [...new Set(detectedPatterns)],
  }
}

// ============================================================================
// AI-powered Analysis
// ============================================================================

async function performAIAnalysis(message: string): Promise<{
  score: number
  flags: string[]
}> {
  try {
    const prompt = `以下の顧客メッセージを分析し、カスタマーハラスメントの可能性を評価してください。

メッセージ: "${message}"

以下の観点から0.0〜1.0のスコアで評価してください：
1. 暴力的・脅迫的表現
2. 侮辱的・攻撃的表現
3. 威圧的・強要的表現
4. 感情的に不適切な表現

JSON形式で回答してください：
{
  "score": 0.0〜1.0のスコア,
  "flags": ["検出された問題のリスト"],
  "reasoning": "判断理由"
}`

    const response = await fetch(`${OPENAI_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'あなたはカスタマーハラスメント検知の専門家です。客観的かつ正確に分析してください。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return {
      score: result.score || 0,
      flags: result.flags || [],
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return { score: 0, flags: [] }
  }
}

// ============================================================================
// Sentiment Analysis
// ============================================================================

export async function analyzeSentiment(message: string): Promise<SentimentAnalysisResult> {
  try {
    const prompt = `以下のテキストの感情分析を行ってください。

テキスト: "${message}"

JSON形式で回答してください：
{
  "score": -1.0〜1.0の感情スコア（負＝ネガティブ、正＝ポジティブ）,
  "label": "negative" | "neutral" | "positive",
  "emotions": {
    "anger": 0.0〜1.0,
    "disgust": 0.0〜1.0,
    "fear": 0.0〜1.0,
    "joy": 0.0〜1.0,
    "sadness": 0.0〜1.0,
    "surprise": 0.0〜1.0
  },
  "confidence": 0.0〜1.0
}`

    const response = await fetch(`${OPENAI_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'あなたは感情分析の専門家です。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.statusText}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return result
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return {
      score: 0,
      label: 'neutral',
      emotions: {
        anger: 0,
        disgust: 0,
        fear: 0,
        joy: 0,
        sadness: 0,
        surprise: 0,
      },
      confidence: 0,
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineSeverity(
  score: number
): 'low' | 'medium' | 'high' | 'critical' | null {
  if (score >= 0.9) return 'critical'
  if (score >= 0.7) return 'high'
  if (score >= 0.5) return 'medium'
  if (score >= 0.3) return 'low'
  return null
}

function determineRecommendation(
  severity: 'low' | 'medium' | 'high' | 'critical' | null,
  score: number
): 'continue' | 'escalate' | 'terminate' {
  if (severity === 'critical' || score >= 0.9) return 'terminate'
  if (severity === 'high' || score >= 0.6) return 'escalate'
  return 'continue'
}

function generateExplanation(
  score: number,
  severity: 'low' | 'medium' | 'high' | 'critical' | null,
  flags: string[]
): string {
  if (score === 0) {
    return '問題となる表現は検出されませんでした。'
  }

  if (severity === 'critical') {
    return '深刻なカスタマーハラスメントが検出されました。安全のため、直ちに対応を終了し、管理者に報告してください。'
  }

  if (severity === 'high') {
    return '重度のカスタマーハラスメントの可能性があります。管理者またはスーパーバイザーにエスカレーションすることを推奨します。'
  }

  if (severity === 'medium') {
    return '不適切な表現が含まれています。慎重に対応し、必要に応じてエスカレーションを検討してください。'
  }

  if (severity === 'low') {
    return '軽度の不適切な表現が含まれていますが、通常の対応で問題ありません。'
  }

  return 'カスタマーハラスメントの兆候が見られます。注意して対応してください。'
}
