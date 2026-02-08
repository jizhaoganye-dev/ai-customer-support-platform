import { detectHarassment } from '@/lib/mock-data'

describe('detectHarassment', () => {
  // --- Critical severity ---
  test('detects critical harassment: 殺す', () => {
    const result = detectHarassment('殺すぞお前')
    expect(result.severity).toBe('critical')
    expect(result.score).toBeGreaterThanOrEqual(0.9)
    expect(result.detectedKeywords.length).toBeGreaterThan(0)
  })

  test('detects critical harassment: 死ね', () => {
    const result = detectHarassment('死ね')
    expect(result.severity).toBe('critical')
    expect(result.score).toBe(1.0)
  })

  // --- High severity ---
  test('detects high severity: バカ野郎 (katakana)', () => {
    const result = detectHarassment('バカ野郎')
    expect(result.severity).toBe('high')
    expect(result.score).toBeGreaterThanOrEqual(0.7)
  })

  test('detects high severity: ばかやろう (hiragana)', () => {
    const result = detectHarassment('ばかやろう')
    expect(result.severity).toBe('high')
    expect(result.score).toBeGreaterThanOrEqual(0.7)
  })

  test('detects high severity: クソ', () => {
    const result = detectHarassment('クソみたいな対応だな')
    expect(result.severity).toBe('high')
    expect(result.score).toBeGreaterThanOrEqual(0.7)
    expect(result.detectedKeywords).toContain('クソ')
  })

  // --- Medium severity ---
  test('detects medium severity: ふざけるな', () => {
    const result = detectHarassment('ふざけるな、いい加減にしろ')
    expect(result.severity).toBe('medium')
    expect(result.score).toBeGreaterThanOrEqual(0.5)
    expect(result.detectedKeywords.length).toBeGreaterThanOrEqual(2)
  })

  test('detects medium severity: 訴える', () => {
    const result = detectHarassment('弁護士に相談して訴えるぞ')
    expect(result.severity).toBe('medium')
  })

  // --- Low severity ---
  test('detects low severity: ありえない', () => {
    const result = detectHarassment('ありえない対応ですね')
    expect(result.severity).toBe('low')
    expect(result.score).toBeGreaterThanOrEqual(0.3)
  })

  // --- No harassment ---
  test('returns none for normal message', () => {
    const result = detectHarassment('返品手続きについて教えてください')
    expect(result.severity).toBe('none')
    expect(result.score).toBe(0)
    expect(result.detectedKeywords).toHaveLength(0)
  })

  test('returns none for polite complaint', () => {
    const result = detectHarassment('商品がまだ届いていないのですが、確認していただけますか')
    expect(result.severity).toBe('none')
    expect(result.score).toBe(0)
  })

  // --- Multiple keywords bonus ---
  test('multiple keywords increase score', () => {
    const result = detectHarassment('バカ、アホ、ゴミ、カス')
    expect(result.score).toBeGreaterThan(0.8)
    expect(result.detectedKeywords.length).toBeGreaterThanOrEqual(3)
  })

  // --- Edge cases ---
  test('handles empty string', () => {
    const result = detectHarassment('')
    expect(result.severity).toBe('none')
    expect(result.score).toBe(0)
  })

  test('deduplicates detected keywords', () => {
    const result = detectHarassment('バカバカバカ')
    const uniqueKeywords = new Set(result.detectedKeywords)
    expect(result.detectedKeywords.length).toBe(uniqueKeywords.size)
  })
})
