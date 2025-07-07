import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  User, 
  Curriculum, 
  ChatMessage, 
  AppState 
} from '@/types'

interface AppStore extends AppState {
  // User actions
  setUser: (user: User | null) => void
  
  // Curriculum actions
  setCurriculums: (curriculums: Curriculum[]) => void
  setCurrentCurriculum: (curriculum: Curriculum | null) => void
  addCurriculum: (curriculum: Curriculum) => void
  updateCurriculum: (id: string, updates: Partial<Curriculum>) => void
  removeCurriculum: (id: string) => void
  
  // Chat actions
  setChatHistory: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatHistory: () => void
  
  // UI state actions
  setEditMode: (mode: 'chat' | 'direct' | 'hybrid') => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  
  // Utility actions
  reset: () => void
}

const initialState: AppState = {
  user: null,
  currentCurriculum: null,
  curriculums: [],
  chatHistory: [],
  editMode: 'chat',
  isLoading: false,
  error: null,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User actions
      setUser: (user) => set({ user }),

      // Curriculum actions
      setCurriculums: (curriculums) => set({ curriculums }),
      
      setCurrentCurriculum: (curriculum) => set({ 
        currentCurriculum: curriculum,
        // 커리큘럼이 변경되면 채팅 히스토리도 초기화
        chatHistory: []
      }),
      
      addCurriculum: (curriculum) => set((state) => ({
        curriculums: [curriculum, ...state.curriculums]
      })),
      
      updateCurriculum: (id, updates) => set((state) => ({
        curriculums: state.curriculums.map(c => 
          c.id === id ? { ...c, ...updates } : c
        ),
        currentCurriculum: state.currentCurriculum?.id === id 
          ? { ...state.currentCurriculum, ...updates }
          : state.currentCurriculum
      })),
      
      removeCurriculum: (id) => set((state) => ({
        curriculums: state.curriculums.filter(c => c.id !== id),
        currentCurriculum: state.currentCurriculum?.id === id 
          ? null 
          : state.currentCurriculum
      })),

      // Chat actions
      setChatHistory: (messages) => set({ chatHistory: messages }),
      
      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),
      
      clearChatHistory: () => set({ chatHistory: [] }),

      // UI state actions
      setEditMode: (editMode) => set({ editMode }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: 'ai-curriculum-builder-store',
      // 민감한 정보는 persist하지 않음
      partialize: (state) => ({
        editMode: state.editMode,
        // user 정보는 세션에서 관리하므로 제외
        // currentCurriculum과 chatHistory는 새로고침 시 초기화되도록 제외
      }),
    }
  )
)

// 선택자 함수들 (성능 최적화)
export const useUser = () => useAppStore((state) => state.user)
export const useCurrentCurriculum = () => useAppStore((state) => state.currentCurriculum)
export const useCurriculums = () => useAppStore((state) => state.curriculums)
export const useChatHistory = () => useAppStore((state) => state.chatHistory)
export const useEditMode = () => useAppStore((state) => state.editMode)
export const useLoading = () => useAppStore((state) => state.isLoading)
export const useError = () => useAppStore((state) => state.error)

// 액션 선택자들
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  setCurriculums: state.setCurriculums,
  setCurrentCurriculum: state.setCurrentCurriculum,
  addCurriculum: state.addCurriculum,
  updateCurriculum: state.updateCurriculum,
  removeCurriculum: state.removeCurriculum,
  setChatHistory: state.setChatHistory,
  addChatMessage: state.addChatMessage,
  clearChatHistory: state.clearChatHistory,
  setEditMode: state.setEditMode,
  setLoading: state.setLoading,
  setError: state.setError,
  reset: state.reset,
}))