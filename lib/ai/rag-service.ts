// ============================================================================
// RAG (Retrieval-Augmented Generation) Service
// Advanced AI service with semantic search and context-aware responses
// ============================================================================

import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  FAQSource,
  ConversationContext,
} from '@/types'

// ============================================================================
// OpenAI/Azure OpenAI Configuration
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY
const OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://api.openai.com/v1'
const MODEL = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4-turbo-preview'

// ============================================================================
// Embedding Generation
// ============================================================================

/**
 * Generate embeddings for text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OPENAI_ENDPOINT}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Embedding generation failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

// ============================================================================
// Semantic Search (using Supabase Vector)
// ============================================================================

/**
 * Search FAQ documents using semantic similarity
 */
export async function searchFAQDocuments(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<FAQSource[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Call Supabase function for vector similarity search
    const { createServerSupabaseClient } = await import('@/lib/supabase/client')
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.rpc('match_faq_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error('FAQ search error:', error)
      return []
    }

    return data.map((doc: any) => ({
      documentId: doc.id,
      title: doc.title,
      content: doc.content,
      relevanceScore: doc.similarity,
    }))
  } catch (error) {
    console.error('Error in searchFAQDocuments:', error)
    return []
  }
}

// ============================================================================
// Context Building
// ============================================================================

/**
 * Build context from conversation history and retrieved documents
 */
function buildContext(
  sources: FAQSource[],
  context?: ConversationContext
): string {
  let contextText = ''

  // Add FAQ sources
  if (sources.length > 0) {
    contextText += '関連するFAQ情報:\n\n'
    sources.forEach((source, index) => {
      contextText += `[${index + 1}] ${source.title}\n${source.content}\n\n`
    })
  }

  // Add conversation history
  if (context?.previousMessages && context.previousMessages.length > 0) {
    contextText += '\n過去の会話履歴:\n'
    const recentMessages = context.previousMessages.slice(-5) // Last 5 messages
    recentMessages.forEach((msg) => {
      const sender = msg.senderType === 'customer' ? '顧客' : 'AI'
      contextText += `${sender}: ${msg.content}\n`
    })
  }

  return contextText
}

// ============================================================================
// AI Chat Completion with RAG
// ============================================================================

/**
 * Generate AI response using RAG (Retrieval-Augmented Generation)
 */
export async function generateChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const startTime = Date.now()

  try {
    // 1. Perform semantic search if RAG is enabled
    let sources: FAQSource[] = []
    if (request.useRAG !== false) {
      sources = await searchFAQDocuments(request.message, 3, 0.75)
    }

    // 2. Build context
    const contextText = buildContext(sources, request.context)

    // 3. Construct system prompt
    const systemPrompt = `あなたは顧客サポート用AIアシスタントです。以下のガイドラインに従って対応してください：

1. 丁寧で親切な対応を心がける
2. 提供されたFAQ情報を優先的に参照する
3. 情報が不足している場合は正直に伝える
4. 複雑な問題は人間のエージェントへのエスカレーションを提案する
5. 回答に自信がない場合は、その旨を明記する

${contextText ? `\n【参照情報】\n${contextText}` : ''}`

    // 4. Call OpenAI API
    const response = await fetch(`${OPENAI_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // 5. Calculate confidence based on source relevance
    const avgRelevance =
      sources.length > 0
        ? sources.reduce((sum, s) => sum + s.relevanceScore, 0) / sources.length
        : 0.5

    const processingTime = Date.now() - startTime

    return {
      content,
      sources: sources.length > 0 ? sources : undefined,
      confidence: avgRelevance,
      metadata: {
        model: MODEL,
        tokens: data.usage?.total_tokens || 0,
        processingTime,
      },
    }
  } catch (error) {
    console.error('Error in generateChatCompletion:', error)
    throw new Error('AI応答の生成に失敗しました')
  }
}

// ============================================================================
// Streaming Response (for real-time updates)
// ============================================================================

/**
 * Generate streaming AI response for better UX
 */
export async function* generateStreamingCompletion(
  request: ChatCompletionRequest
): AsyncGenerator<string> {
  // Search FAQ documents first
  const sources = request.useRAG !== false 
    ? await searchFAQDocuments(request.message, 3, 0.75) 
    : []
  
  const contextText = buildContext(sources, request.context)
  
  const systemPrompt = `あなたは顧客サポート用AIアシスタントです。

${contextText ? `\n【参照情報】\n${contextText}` : ''}`

  const response = await fetch(`${OPENAI_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter((line) => line.trim() !== '')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
