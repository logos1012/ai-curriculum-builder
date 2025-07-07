'use client';

import { useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { useCurriculumStore } from '@/store/curriculumStore';
import { LoadingSpinner } from '@/components/ui';

// Lazy load the CurriculumBuilder for better performance
const CurriculumBuilder = lazy(() => 
  import('@/components/curriculum/CurriculumBuilder').then(module => ({
    default: module.CurriculumBuilder
  }))
);

export default function BuilderEditPage() {
  const router = useRouter();
  const params = useParams();
  const curriculumId = params.id as string;
  
  const { user, isInitialized } = useAuthStore();
  const { 
    currentCurriculum, 
    isLoading, 
    error, 
    fetchCurriculum, 
    clearError 
  } = useCurriculumStore();

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (curriculumId) {
      fetchCurriculum(curriculumId);
    }
  }, [user, isInitialized, curriculumId, router, fetchCurriculum]);

  useEffect(() => {
    if (error) {
      console.error('Error loading curriculum:', error);
      clearError();
      router.push('/dashboard');
    }
  }, [error, router, clearError]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!currentCurriculum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            커리큘럼을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            요청하신 커리큘럼이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">커리큘럼 빌더를 로딩하는 중...</p>
          </div>
        </div>
      }>
        <CurriculumBuilder curriculum={currentCurriculum} />
      </Suspense>
    </Layout>
  );
}