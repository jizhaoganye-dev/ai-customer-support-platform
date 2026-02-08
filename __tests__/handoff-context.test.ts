import { buildHandoffContext } from '@/lib/mock-data'

describe('buildHandoffContext', () => {
  test('builds context from customer messages', () => {
    const messages = [
      { role: 'customer', content: '商品が届いていません' },
      { role: 'ai', content: '確認いたします' },
      { role: 'customer', content: '注文番号はORD-1234-5678です' },
    ]
    const harassment = { score: 0, severity: 'none' }

    const context = buildHandoffContext(messages, harassment)

    expect(context.messageCount).toBe(2) // 2 customer messages
    expect(context.detectedIssues).toContain('配送問題')
    expect(context.orderNumbers).toContain('ORD-1234-5678')
    expect(context.summary).toContain('2件のメッセージ')
  })

  test('detects multiple issues', () => {
    const messages = [
      { role: 'customer', content: '商品が壊れていたので返品したい。返金もしてほしい。' },
    ]
    const harassment = { score: 0, severity: 'none' }

    const context = buildHandoffContext(messages, harassment)

    expect(context.detectedIssues).toContain('返品・交換')
    expect(context.detectedIssues).toContain('商品不良')
    expect(context.detectedIssues).toContain('請求・返金')
  })

  test('includes harassment warning when score > 0.5', () => {
    const messages = [
      { role: 'customer', content: 'バカ野郎、ふざけるな' },
    ]
    const harassment = { score: 0.8, severity: 'high' }

    const context = buildHandoffContext(messages, harassment)

    expect(context.summary).toContain('カスハラ検知')
    expect(context.detectedIssues).toContain('カスハラ対応')
    expect(context.harassmentLevel).toBe('high')
  })

  test('detects anger sentiment in last message', () => {
    const messages = [
      { role: 'customer', content: '最初は普通でした' },
      { role: 'customer', content: 'ふざけるな！許さないぞ！' },
    ]
    const harassment = { score: 0.5, severity: 'medium' }

    const context = buildHandoffContext(messages, harassment)

    expect(context.sentiment).toBe('anger')
  })

  test('defaults to general inquiry when no specific issue', () => {
    const messages = [
      { role: 'customer', content: 'こんにちは、相談があります' },
    ]
    const harassment = { score: 0, severity: 'none' }

    const context = buildHandoffContext(messages, harassment)

    expect(context.detectedIssues).toContain('一般問い合わせ')
  })

  test('handles empty messages array', () => {
    const context = buildHandoffContext([], { score: 0, severity: 'none' })

    expect(context.messageCount).toBe(0)
    expect(context.detectedIssues).toContain('一般問い合わせ')
  })
})
