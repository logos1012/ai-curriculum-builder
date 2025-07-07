'use client';

// 클라이언트 사이드 Rate Limiting
interface RateLimitConfig {
  windowMs: number; // 시간 윈도우 (밀리초)
  maxRequests: number; // 최대 요청 수
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ClientRateLimit {
  private limits = new Map<string, RateLimitEntry>();
  
  private readonly configs: Record<string, RateLimitConfig> = {
    // API 요청 제한
    'api-general': { windowMs: 60000, maxRequests: 100 }, // 1분에 100회
    'api-auth': { windowMs: 900000, maxRequests: 5 }, // 15분에 5회 (로그인 시도)
    'api-claude': { windowMs: 60000, maxRequests: 20 }, // 1분에 20회 (AI 요청)
    'api-search': { windowMs: 60000, maxRequests: 30 }, // 1분에 30회
    
    // 사용자 액션 제한
    'curriculum-create': { windowMs: 60000, maxRequests: 5 }, // 1분에 5회
    'curriculum-update': { windowMs: 10000, maxRequests: 10 }, // 10초에 10회
    'chat-message': { windowMs: 5000, maxRequests: 5 }, // 5초에 5회
    'share-link': { windowMs: 300000, maxRequests: 10 }, // 5분에 10회
  };

  checkLimit(action: string, identifier?: string): boolean {
    const config = this.configs[action];
    if (!config) return true; // 설정되지 않은 액션은 허용

    const key = `${action}:${identifier || 'default'}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    // 시간 윈도우가 지났으면 리셋
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // 제한에 걸렸는지 확인
    if (entry.count >= config.maxRequests) {
      return false;
    }

    // 카운트 증가
    entry.count++;
    return true;
  }

  getRemainingTime(action: string, identifier?: string): number {
    const key = `${action}:${identifier || 'default'}`;
    const entry = this.limits.get(key);
    
    if (!entry) return 0;
    
    const remaining = entry.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  getRemainingRequests(action: string, identifier?: string): number {
    const config = this.configs[action];
    if (!config) return Infinity;

    const key = `${action}:${identifier || 'default'}`;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() >= entry.resetTime) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - entry.count);
  }

  // 정리 함수 (메모리 누수 방지)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// 싱글톤 인스턴스
const rateLimiter = new ClientRateLimit();

// 주기적으로 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 300000);
}

// API 요청 래퍼 함수
export async function rateLimitedFetch(
  url: string,
  options: RequestInit = {},
  action: string = 'api-general'
): Promise<Response> {
  // Rate limit 체크
  if (!rateLimiter.checkLimit(action)) {
    const remainingTime = rateLimiter.getRemainingTime(action);
    throw new Error(
      `너무 많은 요청입니다. ${Math.ceil(remainingTime / 1000)}초 후에 다시 시도해주세요.`
    );
  }

  try {
    const response = await fetch(url, options);
    
    // 429 에러인 경우 서버 측 rate limit
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      throw new Error(
        `서버에서 요청을 제한하고 있습니다. ${Math.ceil(waitTime / 1000)}초 후에 다시 시도해주세요.`
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('네트워크 요청 중 오류가 발생했습니다.');
  }
}

// 사용자 액션 제한 함수
export function checkActionLimit(action: string, identifier?: string): boolean {
  return rateLimiter.checkLimit(action, identifier);
}

export function getActionLimitInfo(action: string, identifier?: string) {
  return {
    remainingRequests: rateLimiter.getRemainingRequests(action, identifier),
    remainingTime: rateLimiter.getRemainingTime(action, identifier),
  };
}

// 디바운스 헬퍼
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 쓰로틀 헬퍼
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export { rateLimiter };