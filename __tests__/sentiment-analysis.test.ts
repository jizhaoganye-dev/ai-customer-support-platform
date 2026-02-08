import { analyzeSentiment } from '@/lib/mock-data'

describe('analyzeSentiment', () => {
  // --- Anger detection ---
  test('detects anger from explicit keywords', () => {
    const result = analyzeSentiment('ふざけるな！許さないぞ！')
    expect(result.sentiment).toBe('anger')
    expect(result.isAnger).toBe(true)
    expect(result.confidence).toBeGreaterThanOrEqual(0.6)
  })

  test('detects anger from harassment words', () => {
    const result = analyzeSentiment('バカ野郎、死ねよ')
    expect(result.sentiment).toBe('anger')
    expect(result.isAnger).toBe(true)
  })

  test('exclamation marks increase anger score', () => {
    const neutral = analyzeSentiment('対応が遅い')
    const angry = analyzeSentiment('対応が遅い！！！')
    expect(angry.confidence).toBeGreaterThanOrEqual(neutral.confidence)
  })

  // --- Negative detection ---
  test('detects negative sentiment for single anger keyword', () => {
    const result = analyzeSentiment('遅いです')
    expect(result.sentiment).toBe('negative')
    expect(result.isAnger).toBe(false)
  })

  // --- Positive detection ---
  test('detects positive sentiment', () => {
    const result = analyzeSentiment('ありがとうございます、助かりました')
    expect(result.sentiment).toBe('positive')
    expect(result.isAnger).toBe(false)
    expect(result.confidence).toBeGreaterThanOrEqual(0.6)
  })

  test('detects positive: 素晴らしい', () => {
    const result = analyzeSentiment('素晴らしい対応でした')
    expect(result.sentiment).toBe('positive')
  })

  // --- Neutral detection ---
  test('returns neutral for informational message', () => {
    const result = analyzeSentiment('注文番号はORD-1234-5678です')
    expect(result.sentiment).toBe('neutral')
    expect(result.isAnger).toBe(false)
    expect(result.confidence).toBe(0.5)
  })

  test('returns neutral for empty string', () => {
    const result = analyzeSentiment('')
    expect(result.sentiment).toBe('neutral')
    expect(result.isAnger).toBe(false)
  })

  // --- Confidence bounds ---
  test('confidence never exceeds 0.95', () => {
    const result = analyzeSentiment('殺す死ねバカアホクソゴミカスふざけるな許さない！！！')
    expect(result.confidence).toBeLessThanOrEqual(0.95)
  })

  test('confidence is at least 0.5', () => {
    const result = analyzeSentiment('普通のメッセージ')
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })
})
