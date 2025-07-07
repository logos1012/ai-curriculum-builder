// Claude API 클라이언트 설정
// 실제 Claude API 호출은 백엔드에서 처리하고, 프론트엔드는 백엔드 API를 통해 통신

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface CurriculumContext {
  targetAudience?: string
  duration?: string
  type?: 'online' | 'offline'
  currentContent?: string
  chatHistory: ChatMessage[]
}

export class ClaudeAPIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  }

  // 일반 채팅 API 호출
  async chat(message: string, context: CurriculumContext): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/claude/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Claude API 호출 오류:', error)
      throw error
    }
  }

  // 스트리밍 채팅 API 호출
  async *streamChat(message: string, context: CurriculumContext): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/api/claude/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body reader is not available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                yield parsed.content
              }
            } catch (e) {
              // JSON 파싱 오류 무시
            }
          }
        }
      }
    } catch (error) {
      console.error('Claude 스트리밍 API 호출 오류:', error)
      throw error
    }
  }

  // 커리큘럼 콘텐츠 개선 API 호출
  async enhanceContent(content: string, context: CurriculumContext): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/claude/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.enhancedContent
    } catch (error) {
      console.error('Claude 콘텐츠 개선 API 호출 오류:', error)
      throw error
    }
  }
}

export const claudeClient = new ClaudeAPIClient()