'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card, CardContent, LoadingSpinner, Badge } from '@/components/ui';
import { ChatInterface } from './ChatInterface';
import { CurriculumPreview } from './CurriculumPreview';
import { VersionHistory } from './VersionHistory';
import { CollaborativeUsers } from './CollaborativeUsers';
import { ShareModal } from './ShareModal';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useToast } from '@/components/ui';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import type { Curriculum } from '@/types';

interface CurriculumBuilderProps {
  curriculum: Curriculum;
}

export function CurriculumBuilder({ curriculum }: CurriculumBuilderProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const { updateCurriculum, isLoading } = useCurriculumStore();
  
  const [formData, setFormData] = useState({
    title: curriculum.title || '',
    description: curriculum.description || '',
    target_audience: curriculum.target_audience || '',
    duration: curriculum.duration || '',
    type: curriculum.type || 'online',
    content: curriculum.content || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // 실시간 협업 편집
  const {
    isConnected,
    activeUsers,
    isReceivingUpdate,
    sendUpdate,
    handleTyping,
  } = useCollaborativeEditing({
    curriculumId: curriculum.id,
    onRemoteUpdate: (field, value) => {
      // 원격 업데이트 적용
      setFormData(prev => ({ ...prev, [field]: value }));
    },
  });

  // 자동 저장 기능
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(true); // 자동 저장
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, hasUnsavedChanges]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // 실시간 동기화
    if (!isReceivingUpdate) {
      sendUpdate(field, value);
      handleTyping();
    }
  };

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      const result = await updateCurriculum(curriculum.id, formData);
      if (result.success) {
        setHasUnsavedChanges(false);
        if (!isAutoSave) {
          success('커리큘럼이 저장되었습니다');
        }
      } else {
        error(result.error || '저장 중 오류가 발생했습니다');
      }
    } catch (err) {
      error('저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentUpdate = (newContent: string) => {
    handleInputChange('content', newContent);
  };

  const handleVersionRestore = (versionNumber: number) => {
    // 버전 복원 후 현재 커리큘럼 다시 로드
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 대시보드
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {formData.title || '제목 없음'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  {hasUnsavedChanges ? '저장되지 않은 변경사항' : '모든 변경사항 저장됨'}
                </span>
                {isSaving && <LoadingSpinner size="sm" />}
                {isConnected && activeUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{activeUsers.length}명 동시 편집 중</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 협업 사용자 표시 */}
            <CollaborativeUsers users={activeUsers} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareModal(true)}
            >
              🔗 공유
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              📝 버전 히스토리
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              완료
            </Button>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <VersionHistory
              curriculumId={curriculum.id}
              currentVersion={curriculum.version_number}
              onRestoreVersion={handleVersionRestore}
              onClose={() => setShowVersionHistory(false)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          curriculumId={curriculum.id}
          curriculumTitle={formData.title}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Main Content - Dual Panel Layout */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Panel - Chat Interface */}
        <div className="w-1/2 border-r bg-white">
          <div className="h-full flex flex-col">
            {/* Settings Panel */}
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">커리큘럼 설정</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="커리큘럼 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대상
                  </label>
                  <Input
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="ex) 직장인, 학생, 주부"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기간
                  </label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="ex) 4주, 8시간"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    형태
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="online">온라인</option>
                    <option value="offline">오프라인</option>
                    <option value="hybrid">혼합형</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="커리큘럼에 대한 간단한 설명을 입력하세요"
                  rows={2}
                />
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              <ChatInterface
                curriculumId={curriculum.id}
                currentContent={formData.content}
                context={{
                  targetAudience: formData.target_audience,
                  duration: formData.duration,
                  type: formData.type as 'online' | 'offline' | 'hybrid',
                }}
                onContentUpdate={handleContentUpdate}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-white">
          <CurriculumPreview
            curriculum={{
              ...curriculum,
              ...formData,
            }}
            isEditable={true}
            onContentEdit={handleContentUpdate}
          />
        </div>
      </div>
    </div>
  );
}