'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';

export default function BuilderPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                커리큘럼 빌더 개발 중
              </h1>
              <p className="text-gray-600 mb-6">
                AI와 함께하는 커리큘럼 작성 기능을 곧 만나보실 수 있습니다.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}