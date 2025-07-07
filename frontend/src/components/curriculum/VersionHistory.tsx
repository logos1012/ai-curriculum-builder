'use client';

import { useState, useEffect } from 'react';
import { Button, LoadingSpinner, Card, CardContent } from '@/components/ui';
import { curriculumApi } from '@/lib/api';
import { useToast } from '@/components/ui';

interface Version {
  id: string;
  version_number: number;
  title: string;
  description?: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface VersionHistoryProps {
  curriculumId: string;
  currentVersion?: number;
  onRestoreVersion?: (versionNumber: number) => void;
  onClose?: () => void;
}

export function VersionHistory({ 
  curriculumId, 
  currentVersion, 
  onRestoreVersion,
  onClose 
}: VersionHistoryProps) {
  const { success, error } = useToast();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [curriculumId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await curriculumApi.getVersions(curriculumId);
      if (response.success && response.data) {
        setVersions(response.data);
      }
    } catch (err) {
      error('버전 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!window.confirm(`버전 ${versionNumber}으로 복원하시겠습니까? 현재 내용이 덮어쓰여집니다.`)) {
      return;
    }

    try {
      setIsRestoring(true);
      const response = await curriculumApi.restoreVersion(curriculumId, versionNumber);
      if (response.success) {
        success(`버전 ${versionNumber}으로 복원되었습니다`);
        onRestoreVersion?.(versionNumber);
        onClose?.();
      } else {
        error(response.error?.message || '복원 중 오류가 발생했습니다');
      }
    } catch (err) {
      error('복원 중 오류가 발생했습니다');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContentPreview = (content: string, maxLength = 100) => {
    if (!content) return '내용 없음';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">버전 히스토리</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          총 {versions.length}개의 버전이 있습니다
        </p>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600">저장된 버전이 없습니다</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {versions.map((version) => (
              <Card 
                key={version.id}
                className={`cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id 
                    ? 'ring-2 ring-blue-500' 
                    : 'hover:bg-gray-50'
                } ${
                  version.version_number === currentVersion 
                    ? 'border-blue-300 bg-blue-50' 
                    : ''
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          버전 {version.version_number}
                        </span>
                        {version.version_number === currentVersion && (
                          <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                            현재
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {version.title}
                      </h4>
                      
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {version.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(version.created_at)}
                      </p>
                      
                      <p className="text-sm text-gray-700">
                        {getContentPreview(version.content)}
                      </p>
                    </div>
                    
                    {version.version_number !== currentVersion && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreVersion(version.version_number);
                        }}
                        disabled={isRestoring}
                        className="ml-4"
                      >
                        {isRestoring ? <LoadingSpinner size="sm" /> : '복원'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Version Details */}
      {selectedVersion && (
        <div className="border-t bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            버전 {selectedVersion.version_number} 상세
          </h4>
          <div className="bg-white p-3 rounded border text-sm">
            <pre className="whitespace-pre-wrap text-gray-700">
              {selectedVersion.content || '내용 없음'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}