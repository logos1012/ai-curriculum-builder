'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import { env, validateConfig, isDevelopment } from '@/lib/envConfig';

interface EnvironmentStatus {
  config: 'valid' | 'invalid' | 'checking';
  supabase: 'connected' | 'disconnected' | 'checking';
  backend: 'connected' | 'disconnected' | 'checking';
  errors: string[];
}

export function EnvironmentCheck() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    config: 'checking',
    supabase: 'checking', 
    backend: 'checking',
    errors: [],
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    const errors: string[] = [];

    // 환경 설정 검증
    const configValidation = validateConfig();
    setStatus(prev => ({
      ...prev,
      config: configValidation.valid ? 'valid' : 'invalid',
      errors: configValidation.errors,
    }));

    if (!configValidation.valid) {
      errors.push(...configValidation.errors);
    }

    // Supabase 연결 테스트
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.getSession();
      setStatus(prev => ({
        ...prev,
        supabase: error ? 'disconnected' : 'connected',
      }));
      
      if (error) {
        errors.push('Supabase 연결 실패: ' + error.message);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, supabase: 'disconnected' }));
      errors.push('Supabase 설정 오류');
    }

    // 백엔드 연결 테스트
    try {
      const response = await fetch(`${env.api.backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setStatus(prev => ({
        ...prev,
        backend: response.ok ? 'connected' : 'disconnected',
      }));
      
      if (!response.ok) {
        errors.push(`백엔드 연결 실패: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'disconnected' }));
      errors.push('백엔드 서버에 연결할 수 없습니다');
    }

    // 최종 에러 목록 업데이트
    setStatus(prev => ({ ...prev, errors }));
  };

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'valid':
      case 'connected': return 'bg-green-100 text-green-800';
      case 'invalid':
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'checking': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'valid':
      case 'connected': return '✅';
      case 'invalid':
      case 'disconnected': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const hasErrors = status.errors.length > 0 || 
    status.config === 'invalid' || 
    status.supabase === 'disconnected' || 
    status.backend === 'disconnected';

  // 개발 모드에서만 표시
  if (!isDevelopment) return null;

  return (
    <>
      {/* Status Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          hasErrors 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white`}
        title="환경 설정 상태"
      >
        {hasErrors ? '⚠️' : '🔧'}
      </button>

      {/* Status Panel */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 z-50 bg-white rounded-lg shadow-xl border p-4 min-w-[350px] max-w-[500px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">환경 설정 상태</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">환경 설정</span>
              <Badge className={getStatusColor(status.config)}>
                {getStatusIcon(status.config)} {status.config}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Supabase</span>
              <Badge className={getStatusColor(status.supabase)}>
                {getStatusIcon(status.supabase)} {status.supabase}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">백엔드 API</span>
              <Badge className={getStatusColor(status.backend)}>
                {getStatusIcon(status.backend)} {status.backend}
              </Badge>
            </div>
          </div>

          {/* 환경 정보 */}
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">환경 정보</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>환경: {env.app.environment}</div>
              <div>앱 URL: {env.app.url}</div>
              <div>백엔드: {env.api.backendUrl}</div>
              <div>Supabase: {env.api.supabaseUrl ? '설정됨' : '미설정'}</div>
            </div>
          </div>

          {/* 에러 목록 */}
          {status.errors.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h4 className="text-xs font-semibold text-red-700 mb-2">문제점</h4>
              <div className="space-y-1">
                {status.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 설정 가이드 */}
          {hasErrors && (
            <div className="mt-4 pt-3 border-t">
              <h4 className="text-xs font-semibold text-blue-700 mb-2">설정 가이드</h4>
              <div className="space-y-1 text-xs text-blue-600">
                <div>1. .env.local 파일을 확인하세요</div>
                <div>2. NEXT_PUBLIC_SUPABASE_URL을 설정하세요</div>
                <div>3. NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요</div>
                <div>4. 백엔드 서버가 실행 중인지 확인하세요</div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t">
            <button
              onClick={checkEnvironment}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 다시 확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}