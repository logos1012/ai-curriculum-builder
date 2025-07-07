import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

// 서버사이드에서는 Service Key 사용
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 클라이언트 연결을 위한 anon key 클라이언트
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  logger.error('Missing Supabase anon key')
  throw new Error('Missing Supabase anon key')
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      curriculums: {
        Row: {
          id: string
          user_id: string
          title: string
          target_audience: string | null
          duration: string | null
          type: string | null
          content: any
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_audience?: string | null
          duration?: string | null
          type?: string | null
          content: any
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_audience?: string | null
          duration?: string | null
          type?: string | null
          content?: any
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_histories: {
        Row: {
          id: string
          curriculum_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          curriculum_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          curriculum_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      curriculum_versions: {
        Row: {
          id: string
          curriculum_id: string
          version_number: number
          content: any
          created_at: string
        }
        Insert: {
          id?: string
          curriculum_id: string
          version_number: number
          content: any
          created_at?: string
        }
        Update: {
          id?: string
          curriculum_id?: string
          version_number?: number
          content?: any
          created_at?: string
        }
      }
    }
  }
}

// 연결 테스트 함수
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .select('count')
      .limit(1)

    if (error) {
      logger.error('Supabase connection test failed:', error)
      return false
    }

    logger.info('Supabase connection successful')
    return true
  } catch (error) {
    logger.error('Supabase connection test error:', error)
    return false
  }
}