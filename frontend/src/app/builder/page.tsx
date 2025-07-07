'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { CurriculumBuilder, TemplateLibrary } from '@/components/curriculum';
import { useAuthStore } from '@/store/authStore';
import { useCurriculumStore } from '@/store/curriculumStore';

export default function BuilderPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { createCurriculum } = useCurriculumStore();
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, isInitialized, router]);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const result = await createCurriculum({
        title: '새 커리큘럼',
        content: {
          summary: '',
          objectives: [],
          chapters: [],
          resources: []
        },
        type: 'online',
        target_audience: '',
        duration: ''
      });
      
      if (result.success && result.id) {
        router.push(`/builder/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create curriculum:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTemplate = async (template: any) => {
    setIsCreating(true);
    try {
      const result = await createCurriculum({
        title: template.title,
        content: {
          summary: template.description || '',
          objectives: [],
          chapters: [],
          resources: []
        },
        type: template.type || 'online',
        target_audience: template.targetAudience || '',
        duration: template.duration || ''
      });
      
      if (result.success && result.id) {
        router.push(`/builder/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create curriculum from template:', error);
    } finally {
      setIsCreating(false);
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                새 커리큘럼 만들기
              </h1>
              <p className="text-gray-600 mb-6">
                AI와 함께 맞춤형 교육 커리큘럼을 만들어보세요
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCreating ? '생성 중...' : '빈 커리큘럼 시작하기'}
                </button>
                <button
                  onClick={() => setShowTemplateLibrary(true)}
                  disabled={isCreating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  📚 템플릿에서 시작하기
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  대시보드로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </Layout>
  );
}