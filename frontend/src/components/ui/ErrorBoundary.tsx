'use client';

import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                개발자 정보 (클릭하여 펼치기)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex justify-center space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              새로고침
            </Button>
            <Button onClick={reset}>
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ErrorBoundary, type ErrorBoundaryProps, type ErrorFallbackProps };