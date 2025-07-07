import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 타입 정의
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