'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { curriculumApi } from '@/lib/api';
import { useToast } from '@/components/ui';

interface ShareModalProps {
  curriculumId: string;
  curriculumTitle: string;
  onClose: () => void;
}

interface ShareSettings {
  isPublic: boolean;
  shareLink: string;
  accessLevel: 'view' | 'comment' | 'edit';
  expiresAt?: string;
  password?: string;
}

export function ShareModal({ curriculumId, curriculumTitle, onClose }: ShareModalProps) {
  const { success, error, info } = useToast();
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    shareLink: '',
    accessLevel: 'view',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // 기존 공유 설정 로드
    loadShareSettings();
  }, [curriculumId]);

  const loadShareSettings = async () => {
    try {
      // API 호출로 기존 공유 설정 가져오기
      // const response = await curriculumApi.getShareSettings(curriculumId);
      // if (response.success) {
      //   setShareSettings(response.data);
      // }
    } catch (err) {
      console.error('Failed to load share settings:', err);
    }
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // 실제로는 백엔드 API를 호출하여 공유 링크 생성
      const baseUrl = window.location.origin;
      const shareId = btoa(curriculumId).replace(/=/g, '');
      const shareLink = `${baseUrl}/shared/${shareId}`;
      
      setShareSettings(prev => ({
        ...prev,
        isPublic: true,
        shareLink,
      }));

      success('공유 링크가 생성되었습니다');
    } catch (err) {
      error('공유 링크 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareSettings.shareLink);
      success('링크가 클립보드에 복사되었습니다');
    } catch (err) {
      error('복사에 실패했습니다');
    }
  };

  const updateShareSettings = async (newSettings: Partial<ShareSettings>) => {
    try {
      const updatedSettings = { ...shareSettings, ...newSettings };
      setShareSettings(updatedSettings);
      
      // 백엔드 API 호출
      // await curriculumApi.updateShareSettings(curriculumId, updatedSettings);
      
      info('공유 설정이 업데이트되었습니다');
    } catch (err) {
      error('설정 업데이트에 실패했습니다');
    }
  };

  const revokeShare = async () => {
    if (!window.confirm('공유를 취소하시겠습니까? 기존 공유 링크는 더 이상 작동하지 않습니다.')) {
      return;
    }

    try {
      setShareSettings({
        isPublic: false,
        shareLink: '',
        accessLevel: 'view',
      });
      
      // 백엔드 API 호출
      // await curriculumApi.revokeShare(curriculumId);
      
      success('공유가 취소되었습니다');
    } catch (err) {
      error('공유 취소에 실패했습니다');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">커리큘럼 공유</h2>
              <p className="text-sm text-gray-600 mt-1">{curriculumTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {!shareSettings.isPublic ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🔒</div>
                <p className="text-gray-600 mb-6">
                  이 커리큘럼은 현재 공유되지 않았습니다
                </p>
                <Button
                  onClick={generateShareLink}
                  disabled={isGenerating}
                >
                  {isGenerating ? '생성 중...' : '공유 링크 생성'}
                </Button>
              </div>
            ) : (
              <>
                {/* Share Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공유 링크
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={shareSettings.shareLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={copyShareLink}
                    >
                      복사
                    </Button>
                  </div>
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    접근 권한
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="view"
                        checked={shareSettings.accessLevel === 'view'}
                        onChange={(e) => updateShareSettings({ accessLevel: 'view' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">보기 전용</div>
                        <div className="text-sm text-gray-600">
                          커리큘럼을 볼 수만 있습니다
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="comment"
                        checked={shareSettings.accessLevel === 'comment'}
                        onChange={(e) => updateShareSettings({ accessLevel: 'comment' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">댓글 가능</div>
                        <div className="text-sm text-gray-600">
                          커리큘럼을 보고 댓글을 남길 수 있습니다
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="edit"
                        checked={shareSettings.accessLevel === 'edit'}
                        onChange={(e) => updateShareSettings({ accessLevel: 'edit' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">편집 가능</div>
                        <div className="text-sm text-gray-600">
                          커리큘럼을 보고 편집할 수 있습니다
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showAdvanced ? '고급 설정 숨기기' : '고급 설정 표시'} ▼
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      {/* Expiration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          만료일
                        </label>
                        <Input
                          type="datetime-local"
                          value={shareSettings.expiresAt || ''}
                          onChange={(e) => updateShareSettings({ expiresAt: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          설정하지 않으면 링크가 영구적으로 유지됩니다
                        </p>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          비밀번호 보호
                        </label>
                        <Input
                          type="password"
                          placeholder="비밀번호 (선택사항)"
                          value={shareSettings.password || ''}
                          onChange={(e) => updateShareSettings({ password: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          비밀번호를 설정하면 링크 접근 시 비밀번호가 필요합니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Revoke Share */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={revokeShare}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    공유 취소
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Share Stats */}
          {shareSettings.isPublic && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">공유 통계</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">0</div>
                  <div className="text-xs text-gray-600">조회수</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">0</div>
                  <div className="text-xs text-gray-600">다운로드</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">0</div>
                  <div className="text-xs text-gray-600">댓글</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}