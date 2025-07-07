// 공통 타입 정의

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface Curriculum {
  id: string
  user_id: string
  title: string
  target_audience?: string
  duration?: string
  type: 'online' | 'offline' | 'hybrid'
  content: CurriculumContent
  metadata?: CurriculumMetadata
  created_at: string
  updated_at: string
}

export interface CurriculumContent {
  summary?: string
  objectives?: string[]
  chapters: Chapter[]
  resources?: Resource[]
}

export interface Chapter {
  id: string
  title: string
  description?: string
  duration?: string
  sections: Section[]
}

export interface Section {
  id: string
  title: string
  content: string
  type: 'lecture' | 'exercise' | 'discussion' | 'assessment'
  duration?: string
}

export interface Resource {
  id: string
  title: string
  type: 'link' | 'file' | 'video' | 'tool'
  url?: string
  description?: string
}

export interface CurriculumMetadata {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  tools?: string[]
  estimatedCost?: number
  language?: string
}

export interface ChatMessage {
  id: string
  curriculum_id?: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatSession {
  id: string
  curriculum_id?: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface CurriculumVersion {
  id: string
  curriculum_id: string
  version_number: number
  content: CurriculumContent
  created_at: string
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 폼 타입
export interface CreateCurriculumForm {
  title: string
  target_audience: string
  duration: string
  type: 'online' | 'offline' | 'hybrid'
  description?: string
}

export interface EditSectionForm {
  title: string
  content: string
  type: Section['type']
  duration?: string
}

// 상태 타입
export interface AppState {
  user: User | null
  currentCurriculum: Curriculum | null
  curriculums: Curriculum[]
  chatHistory: ChatMessage[]
  editMode: 'chat' | 'direct' | 'hybrid'
  isLoading: boolean
  error: string | null
}

// 이벤트 타입
export interface CurriculumEvent {
  type: 'create' | 'update' | 'delete'
  curriculum: Curriculum
  timestamp: string
}

export interface ChatEvent {
  type: 'message' | 'typing' | 'stop'
  data: any
  timestamp: string
}

// 컴포넌트 props 타입
export interface CurriculumCardProps {
  curriculum: Curriculum
  onEdit?: (curriculum: Curriculum) => void
  onDelete?: (curriculumId: string) => void
  onDuplicate?: (curriculum: Curriculum) => void
}

export interface ChatPanelProps {
  curriculum?: Curriculum
  onMessageSend: (message: string) => void
  messages: ChatMessage[]
  isLoading?: boolean
}

export interface PreviewPanelProps {
  curriculum: Curriculum
  onEdit?: (sectionId: string, content: string) => void
}

// 훅 타입
export interface UseCurriculumReturn {
  curriculums: Curriculum[]
  currentCurriculum: Curriculum | null
  isLoading: boolean
  error: string | null
  createCurriculum: (data: CreateCurriculumForm) => Promise<Curriculum>
  updateCurriculum: (id: string, data: Partial<Curriculum>) => Promise<Curriculum>
  deleteCurriculum: (id: string) => Promise<void>
  getCurriculum: (id: string) => Promise<Curriculum>
  setCurrent: (curriculum: Curriculum | null) => void
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
}

// 필터 타입
export interface CurriculumFilter {
  search?: string
  type?: Curriculum['type']
  target_audience?: string
  sortBy?: 'created_at' | 'updated_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}