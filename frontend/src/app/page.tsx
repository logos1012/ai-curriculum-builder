'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (isInitialized && user) {
      router.push('/dashboard');
    }
  }, [user, isInitialized, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                AI 강의 커리큘럼 작성 도구
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                프리랜서 강사를 위한 AI 기반 맞춤형 커리큘럼 작성 웹 애플리케이션
              </p>
            </div>

            <div className="mb-12">
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                대화형 AI와 함께 다양한 대상에게 맞는 AI 교육 커리큘럼을 쉽고 빠르게 만들어보세요
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={handleGetStarted}>
                  {user ? '대시보드로 이동' : '시작하기'}
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/about')}>
                  자세히 보기
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">대화형 생성</h3>
              <p className="text-gray-600">
                AI와의 질문-답변을 통해 정교한 커리큘럼을 단계적으로 완성
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">실시간 편집</h3>
              <p className="text-gray-600">
                작성 과정이 실시간으로 렌더링되는 직관적인 편집 환경
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">맞춤형 특화</h3>
              <p className="text-gray-600">
                AI 도구 활용법에 특화된 교육 콘텐츠 자동 생성
              </p>
            </div>
          </div>

          {/* Sample Curriculums */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              다양한 대상별 커리큘럼 예시
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg hover:border-blue-300 transition-colors">
                <div className="text-2xl mb-3">👩‍🍳</div>
                <h4 className="font-semibold text-gray-900 mb-2">주부를 위한 AI 활용법</h4>
                <p className="text-sm text-gray-600 mb-3">일상생활에서 활용할 수 있는 AI 도구들</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">4주</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">온라인</span>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg hover:border-blue-300 transition-colors">
                <div className="text-2xl mb-3">🎓</div>
                <h4 className="font-semibold text-gray-900 mb-2">학생을 위한 AI 학습 도구</h4>
                <p className="text-sm text-gray-600 mb-3">학습 효율을 높이는 다양한 AI 도구들</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">6주</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">혼합형</span>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg hover:border-blue-300 transition-colors">
                <div className="text-2xl mb-3">💼</div>
                <h4 className="font-semibold text-gray-900 mb-2">직장인을 위한 AI 업무 자동화</h4>
                <p className="text-sm text-gray-600 mb-3">업무 프로세스 자동화를 통한 생산성 향상</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">8주</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">온라인</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
