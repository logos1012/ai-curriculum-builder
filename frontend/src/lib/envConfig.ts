'use client';

// 환경 변수 타입 정의
interface EnvConfig {
  // 앱 기본 설정
  app: {
    name: string;
    url: string;
    environment: 'development' | 'production' | 'test';
    debugMode: boolean;
  };
  
  // API 설정
  api: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    backendUrl: string;
    anthropicApiKey?: string; // 클라이언트에서는 노출되지 않음
  };
  
  // 기능 설정
  features: {
    maxFileSize: number;
    allowedFileTypes: string[];
    enableAnalytics: boolean;
    enableConsoleLog: boolean;
  };
  
  // 보안 설정
  security: {
    encryptionKey?: string;
    rateLimitEnabled: boolean;
  };
}

// 환경 변수 검증 및 변환 함수
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`환경 변수 ${key}가 설정되지 않았습니다.`);
    return '';
  }
  return value;
}

function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// 환경 변수 설정 검증
function validateRequiredEnvVars(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('필수 환경 변수가 설정되지 않았습니다:', missing);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`필수 환경 변수가 없습니다: ${missing.join(', ')}`);
    }
  }
}

// 환경 설정 객체 생성
function createEnvConfig(): EnvConfig {
  // 개발 모드에서 환경 변수 검증
  if (typeof window === 'undefined') {
    validateRequiredEnvVars();
  }
  
  return {
    app: {
      name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'AI 커리큘럼 빌더'),
      url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      environment: (getEnvVar('NODE_ENV', 'development') as any) || 'development',
      debugMode: getBooleanEnv('NEXT_PUBLIC_DEBUG_MODE', true),
    },
    
    api: {
      supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', ''),
      supabaseAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
      backendUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8000'),
      // 서버 사이드에서만 접근 가능
      anthropicApiKey: typeof window === 'undefined' ? getEnvVar('ANTHROPIC_API_KEY') : undefined,
    },
    
    features: {
      maxFileSize: getNumberEnv('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
      allowedFileTypes: getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,application/pdf').split(','),
      enableAnalytics: getBooleanEnv('ENABLE_ANALYTICS', false),
      enableConsoleLog: getBooleanEnv('ENABLE_CONSOLE_LOGS', true),
    },
    
    security: {
      encryptionKey: getEnvVar('NEXT_PUBLIC_ENCRYPTION_KEY'),
      rateLimitEnabled: getBooleanEnv('ENABLE_RATE_LIMIT', true),
    },
  };
}

// 환경 설정 객체 내보내기
export const env = createEnvConfig();

// 개발 도구
export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isTest = env.app.environment === 'test';

// 디버그 로그 함수
export function debugLog(...args: any[]): void {
  if (env.app.debugMode && env.features.enableConsoleLog) {
    console.log('[DEBUG]', ...args);
  }
}

// 환경 설정 검증 함수
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Supabase 설정 검증
  if (!env.api.supabaseUrl) {
    errors.push('Supabase URL이 설정되지 않았습니다');
  } else if (!env.api.supabaseUrl.startsWith('https://')) {
    errors.push('Supabase URL이 올바르지 않습니다');
  }
  
  if (!env.api.supabaseAnonKey) {
    errors.push('Supabase Anonymous Key가 설정되지 않았습니다');
  }
  
  // 백엔드 URL 검증
  if (!env.api.backendUrl) {
    errors.push('백엔드 API URL이 설정되지 않았습니다');
  }
  
  // 운영 환경 추가 검증
  if (isProduction) {
    if (!env.security.encryptionKey || env.security.encryptionKey.length < 32) {
      errors.push('운영 환경에서는 32자 이상의 암호화 키가 필요합니다');
    }
    
    if (env.app.debugMode) {
      errors.push('운영 환경에서는 디버그 모드를 비활성화해야 합니다');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// 설정 정보 출력 (개발용)
export function printConfigInfo(): void {
  if (!isDevelopment) return;
  
  console.log('🔧 환경 설정 정보:');
  console.log('- 환경:', env.app.environment);
  console.log('- 앱 이름:', env.app.name);
  console.log('- 앱 URL:', env.app.url);
  console.log('- 백엔드 URL:', env.api.backendUrl);
  console.log('- Supabase URL:', env.api.supabaseUrl ? '✅ 설정됨' : '❌ 미설정');
  console.log('- 디버그 모드:', env.app.debugMode ? '✅' : '❌');
  console.log('- Rate Limit:', env.security.rateLimitEnabled ? '✅' : '❌');
  
  const validation = validateConfig();
  if (!validation.valid) {
    console.warn('⚠️ 설정 문제:', validation.errors);
  } else {
    console.log('✅ 환경 설정이 올바릅니다');
  }
}

// 앱 시작시 설정 검증
if (typeof window !== 'undefined' && isDevelopment) {
  printConfigInfo();
}