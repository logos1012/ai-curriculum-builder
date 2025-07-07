import { create } from 'zustand';
import { curriculumApi } from '@/lib/api';
import type { Curriculum } from '@/types';

interface CurriculumState {
  // Data
  curriculums: Curriculum[];
  currentCurriculum: Curriculum | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Filters
  filters: {
    search: string;
    type: string;
    target_audience: string;
    sort: string;
    order: string;
  };

  // Actions
  fetchCurriculums: (params?: any) => Promise<void>;
  fetchCurriculum: (id: string) => Promise<void>;
  createCurriculum: (data: any) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateCurriculum: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  deleteCurriculum: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicateCurriculum: (id: string) => Promise<{ success: boolean; error?: string; id?: string }>;
  
  // Filters
  setFilters: (filters: Partial<CurriculumState['filters']>) => void;
  resetFilters: () => void;
  
  // UI State
  setCurrentCurriculum: (curriculum: Curriculum | null) => void;
  clearError: () => void;
}

const initialFilters = {
  search: '',
  type: '',
  target_audience: '',
  sort: 'updated_at',
  order: 'desc',
};

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  // Initial state
  curriculums: [],
  currentCurriculum: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: initialFilters,

  fetchCurriculums: async (params?: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const { filters } = get();
      const queryParams = {
        ...filters,
        ...params,
      };

      // 빈 값 제거
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });

      const response = await curriculumApi.getCurriculums(queryParams);
      
      if (response.success) {
        set({
          curriculums: response.data || [],
          pagination: response.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          error: response.error?.message || '커리큘럼 목록을 불러오는 중 오류가 발생했습니다',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '커리큘럼 목록을 불러오는 중 오류가 발생했습니다',
        isLoading: false,
      });
    }
  },

  fetchCurriculum: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await curriculumApi.getCurriculum(id);
      
      if (response.success) {
        set({
          currentCurriculum: response.data || null,
          isLoading: false,
        });
      } else {
        set({
          error: response.error?.message || '커리큘럼을 불러오는 중 오류가 발생했습니다',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '커리큘럼을 불러오는 중 오류가 발생했습니다',
        isLoading: false,
      });
    }
  },

  createCurriculum: async (data: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await curriculumApi.createCurriculum(data);
      
      if (response.success) {
        // 목록에 새 커리큘럼 추가
        const newCurriculum = response.data;
        set(state => ({
          curriculums: [newCurriculum, ...state.curriculums],
          currentCurriculum: newCurriculum,
          isLoading: false,
        }));
        
        return { success: true, id: newCurriculum.id };
      } else {
        set({ 
          error: response.error?.message || '커리큘럼 생성 중 오류가 발생했습니다',
          isLoading: false 
        });
        return { success: false, error: response.error?.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커리큘럼 생성 중 오류가 발생했습니다';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateCurriculum: async (id: string, data: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await curriculumApi.updateCurriculum(id, data);
      
      if (response.success) {
        const updatedCurriculum = response.data;
        
        set(state => ({
          curriculums: state.curriculums.map(c => 
            c.id === id ? updatedCurriculum : c
          ),
          currentCurriculum: state.currentCurriculum?.id === id ? updatedCurriculum : state.currentCurriculum,
          isLoading: false,
        }));
        
        return { success: true };
      } else {
        set({ 
          error: response.error?.message || '커리큘럼 수정 중 오류가 발생했습니다',
          isLoading: false 
        });
        return { success: false, error: response.error?.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커리큘럼 수정 중 오류가 발생했습니다';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteCurriculum: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await curriculumApi.deleteCurriculum(id);
      
      if (response.success) {
        set(state => ({
          curriculums: state.curriculums.filter(c => c.id !== id),
          currentCurriculum: state.currentCurriculum?.id === id ? null : state.currentCurriculum,
          isLoading: false,
        }));
        
        return { success: true };
      } else {
        set({ 
          error: response.error?.message || '커리큘럼 삭제 중 오류가 발생했습니다',
          isLoading: false 
        });
        return { success: false, error: response.error?.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커리큘럼 삭제 중 오류가 발생했습니다';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  duplicateCurriculum: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await curriculumApi.duplicateCurriculum(id);
      
      if (response.success) {
        const duplicatedCurriculum = response.data;
        
        set(state => ({
          curriculums: [duplicatedCurriculum, ...state.curriculums],
          isLoading: false,
        }));
        
        return { success: true, id: duplicatedCurriculum.id };
      } else {
        set({ 
          error: response.error?.message || '커리큘럼 복제 중 오류가 발생했습니다',
          isLoading: false 
        });
        return { success: false, error: response.error?.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커리큘럼 복제 중 오류가 발생했습니다';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  setFilters: (newFilters: Partial<CurriculumState['filters']>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  setCurrentCurriculum: (curriculum: Curriculum | null) => {
    set({ currentCurriculum: curriculum });
  },

  clearError: () => {
    set({ error: null });
  },
}));