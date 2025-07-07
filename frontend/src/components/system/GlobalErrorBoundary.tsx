'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅 (실제 환경에서는 Sentry 등 사용)
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    // 에러 리포팅 서비스에 전송
    if (typeof window !== 'undefined') {
      // 에러 정보를 로컬 스토리지에 저장 (디버깅용)
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      try {
        const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        existingLogs.push(errorLog);
        // 최근 10개 에러만 보관
        const recentLogs = existingLogs.slice(-10);
        localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
      } catch (storageError) {
        console.warn('Failed to save error log to localStorage:', storageError);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportBug = () => {
    const subject = encodeURIComponent('AI 커리큘럼 빌더 오류 신고');
    const body = encodeURIComponent(`
오류가 발생했습니다:

에러: ${this.state.error?.name}
메시지: ${this.state.error?.message}
시간: ${new Date().toISOString()}
URL: ${window.location.href}
브라우저: ${navigator.userAgent}

스택 트레이스:
${this.state.error?.stack}

추가 정보:
${JSON.stringify(this.state.errorInfo, null, 2)}
    `);

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              앗, 문제가 발생했습니다!
            </h1>
            <p className="text-gray-600 mb-6">
              예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
            </p>

            {/* 에러 세부사항 (개발 환경에서만) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">개발자 정보:</h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">
                      스택 트레이스 보기
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
              >
                다시 시도
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                페이지 새로고침
              </Button>

              <Button
                onClick={this.handleReportBug}
                variant="outline"
                className="w-full text-sm"
              >
                🐛 버그 신고하기
              </Button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                홈으로 돌아가기
              </button>
            </div>

            {/* 도움말 */}
            <div className="mt-6 pt-4 border-t text-xs text-gray-500">
              <p>문제가 계속 발생하면:</p>
              <ul className="mt-1 space-y-1">
                <li>• 브라우저 새로고침 (Ctrl+F5)</li>
                <li>• 브라우저 캐시 삭제</li>
                <li>• 다른 브라우저에서 시도</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}