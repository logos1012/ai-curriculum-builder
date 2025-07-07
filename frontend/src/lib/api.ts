import { supabase } from './supabase';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// HTTP 클라이언트 클래스
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 인증 토큰 가져오기
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  // 기본 fetch 래퍼
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}/api${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API request failed:', {
          url: `${this.baseURL}/api${endpoint}`,
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error?.message || `API request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  // POST 요청
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT 요청
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }

  // 페이지네이션된 GET 요청
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.fetch<T[]>(url, { method: 'GET' }) as Promise<PaginatedResponse<T>>;
  }
}

// API 클라이언트 인스턴스
export const apiClient = new ApiClient(API_BASE_URL);

// 인증 API
export const authApi = {
  getSession: () => apiClient.get('/auth/session'),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: { name?: string; avatar_url?: string }) =>
    apiClient.put('/auth/profile', data),
};

// 커리큘럼 API
export const curriculumApi = {
  // 목록 조회
  getCurriculums: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    target_audience?: string;
    sort?: string;
    order?: string;
  }) => apiClient.getPaginated('/curriculum', params),

  // 상세 조회
  getCurriculum: (id: string) => apiClient.get(`/curriculum/${id}`),

  // 생성
  createCurriculum: (data: any) => apiClient.post('/curriculum', data),

  // 수정
  updateCurriculum: (id: string, data: any) => apiClient.put(`/curriculum/${id}`, data),

  // 삭제
  deleteCurriculum: (id: string) => apiClient.delete(`/curriculum/${id}`),

  // 복제
  duplicateCurriculum: (id: string) => apiClient.post(`/curriculum/${id}/duplicate`),

  // 버전 관리
  getVersions: (id: string) => apiClient.get(`/curriculum/${id}/versions`),
  restoreVersion: (id: string, versionNumber: number) =>
    apiClient.post(`/curriculum/${id}/versions/${versionNumber}/restore`),

  // 채팅 히스토리
  getChatHistory: (id: string) => apiClient.get(`/curriculum/${id}/chat`),
  saveChatMessage: (id: string, data: { role: string; content: string }) =>
    apiClient.post(`/curriculum/${id}/chat`, data),
  clearChatHistory: (id: string) => apiClient.delete(`/curriculum/${id}/chat`),
};

// Claude AI API
export const claudeApi = {
  // 일반 채팅
  chat: (data: {
    message: string;
    context: {
      targetAudience?: string;
      duration?: string;
      type?: 'online' | 'offline' | 'hybrid';
      currentContent?: string;
      chatHistory?: Array<{ role: string; content: string }>;
    };
  }) => apiClient.post('/claude/chat', data),

  // 콘텐츠 개선
  enhance: (data: {
    content: string;
    context: {
      targetAudience?: string;
      duration?: string;
      type?: 'online' | 'offline' | 'hybrid';
    };
    enhanceType?: 'detail' | 'structure' | 'practical';
  }) => apiClient.post('/claude/enhance', data),

  // 구체화 질문 생성
  generateQuestions: (data: {
    context?: {
      targetAudience?: string;
      duration?: string;
      type?: 'online' | 'offline' | 'hybrid';
      currentContent?: string;
      chatHistory?: Array<{ role: string; content: string }>;
    };
  }) => apiClient.post('/claude/questions', data),

  // 스트리밍 채팅 (EventSource 사용)
  streamChat: async (
    data: {
      message: string;
      context: {
        targetAudience?: string;
        duration?: string;
        type?: 'online' | 'offline' | 'hybrid';
        currentContent?: string;
        chatHistory?: Array<{ role: string; content: string }>;
      };
    },
    onChunk: (chunk: string) => void,
    onComplete: (fullMessage: string, suggestions?: string[]) => void,
    onError: (error: string) => void
  ) => {
    const token = await new ApiClient(API_BASE_URL).getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/claude/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream reader not available');
      }

      const decoder = new TextDecoder();
      let fullMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              
              if (eventData.type === 'chunk') {
                fullMessage += eventData.content;
                onChunk(eventData.content);
              } else if (eventData.type === 'end') {
                onComplete(fullMessage, eventData.suggestions);
                return;
              } else if (eventData.type === 'error') {
                onError(eventData.message);
                return;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream chat error:', error);
      onError(error instanceof Error ? error.message : 'Stream failed');
    }
  },
};

export type { ApiResponse, PaginatedResponse };