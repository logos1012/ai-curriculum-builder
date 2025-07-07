import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }

      set({ 
        user: session?.user || null, 
        isLoading: false, 
        isInitialized: true 
      });

      // 인증 상태 변화 리스너 설정
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          set({ user: session?.user || null });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      set({ user: data.user, isLoading: false });
      return {};
    } catch (error) {
      set({ isLoading: false });
      return { error: '로그인 중 오류가 발생했습니다' };
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      // 회원가입 성공 시 이메일 확인 메시지
      set({ isLoading: false });
      
      if (!data.user?.email_confirmed_at) {
        return { error: '이메일을 확인해주세요' };
      }

      set({ user: data.user });
      return {};
    } catch (error) {
      set({ isLoading: false });
      return { error: '회원가입 중 오류가 발생했습니다' };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      
      // 백엔드에 로그아웃 요청
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
      
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: { name?: string; avatar_url?: string }) => {
    try {
      set({ isLoading: true });
      
      // Supabase 메타데이터 업데이트
      const { data: userData, error: supabaseError } = await supabase.auth.updateUser({
        data,
      });

      if (supabaseError) {
        set({ isLoading: false });
        return { error: supabaseError.message };
      }

      // 백엔드에도 프로필 업데이트
      try {
        await authApi.updateProfile(data);
      } catch (apiError) {
        console.warn('Backend profile update failed:', apiError);
      }

      set({ user: userData.user, isLoading: false });
      return {};
    } catch (error) {
      set({ isLoading: false });
      return { error: '프로필 업데이트 중 오류가 발생했습니다' };
    }
  },
}));

// 초기화 함수 (앱 시작 시 호출)
export const initializeAuth = () => {
  const { initialize } = useAuthStore.getState();
  return initialize();
};