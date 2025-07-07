'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, LoadingSpinner, Badge } from '@/components/ui';
import { CurriculumCard } from '@/components/curriculum';
import { useAuthStore } from '@/store/authStore';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useToast } from '@/components/ui';

export default function Dashboard() {
  const router = useRouter();
  const { success, error } = useToast();
  const { user, isInitialized } = useAuthStore();
  const { 
    curriculums, 
    isLoading, 
    error: curriculumError,
    pagination,
    filters,
    fetchCurriculums, 
    deleteCurriculum, 
    duplicateCurriculum,
    setFilters,
    clearError
  } = useCurriculumStore();

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchCurriculums();
  }, [user, isInitialized, router, fetchCurriculums]);

  useEffect(() => {
    if (curriculumError) {
      error(curriculumError);
      clearError();
    }
  }, [curriculumError, error, clearError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    fetchCurriculums();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
    fetchCurriculums();
  };

  const handleCreateNew = () => {
    router.push('/builder');
  };

  const handleEdit = (id: string) => {
    router.push(`/builder/${id}`);
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateCurriculum(id);
    if (result.success) {
      success('커리큘럼이 복제되었습니다');
      fetchCurriculums();
    } else {
      error(result.error || '복제 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 커리큘럼을 삭제하시겠습니까?')) {
      return;
    }

    const result = await deleteCurriculum(id);
    if (result.success) {
      success('커리큘럼이 삭제되었습니다');
    } else {
      error(result.error || '삭제 중 오류가 발생했습니다');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">커리큘럼 대시보드</h1>
              <p className="text-gray-600 mt-2">
                {pagination?.total || 0}개의 커리큘럼
              </p>
            </div>
            <Button onClick={handleCreateNew} size="lg">
              새 커리큘럼 만들기
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : curriculums.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 커리큘럼이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                AI와 함께 첫 번째 커리큘럼을 만들어보세요
              </p>
              <Button onClick={handleCreateNew}>
                새 커리큘럼 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curriculums.map((curriculum) => (
                <CurriculumCard
                  key={curriculum.id}
                  curriculum={curriculum}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}