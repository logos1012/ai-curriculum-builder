'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Input, LoadingSpinner, Card, CardContent } from '@/components/ui';
import { CurriculumPreview } from '@/components/curriculum';
import { curriculumApi } from '@/lib/api';
import { useToast } from '@/components/ui';

export default function SharedCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;
  const { error } = useToast();
  
  const [curriculum, setCurriculum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');

  useEffect(() => {
    loadSharedCurriculum();
  }, [shareId]);

  const loadSharedCurriculum = async (password?: string) => {
    try {
      setIsLoading(true);
      
      // 실제로는 공유 API 엔드포인트 호출
      // const response = await curriculumApi.getSharedCurriculum(shareId, password);
      
      // 임시 데이터
      const mockCurriculum = {
        id: 'shared-1',
        title: '공유된 AI 교육 커리큘럼',
        description: 'AI 도구 활용법을 배우는 8주 과정',
        content: `# AI 교육 커리큘럼

## 1주차: AI의 이해
- AI의 기본 개념
- AI의 활용 사례
- AI 도구 소개

## 2주차: ChatGPT 활용법
- ChatGPT 기본 사용법
- 프롬프트 작성 기법
- 실습 과제

## 3주차: 이미지 생성 AI
- DALL-E, Midjourney 소개
- 이미지 생성 실습
- 활용 사례 분석`,
        target_audience: '직장인',
        duration: '8주',
        type: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          name: '김교수',
          email: 'professor@example.com',
        },
      };

      setCurriculum(mockCurriculum);
      setAccessLevel('view'); // 공유 설정에 따라 변경
      
    } catch (err: any) {
      if (err.response?.status === 401) {
        setNeedsPassword(true);
      } else {
        error('커리큘럼을 불러올 수 없습니다');
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadSharedCurriculum(password);
  };

  const handleDownload = () => {
    if (!curriculum) return;

    const markdown = `# ${curriculum.title}

## 커리큘럼 정보
- **대상**: ${curriculum.target_audience || '미설정'}
- **기간**: ${curriculum.duration || '미설정'}
- **형태**: ${curriculum.type || 'online'}
- **작성자**: ${curriculum.author?.name || '익명'}
- **설명**: ${curriculum.description || '설명 없음'}

## 커리큘럼 내용

${curriculum.content || '내용이 없습니다.'}

---
*공유 링크: ${window.location.href}*
*생성일: ${new Date().toLocaleDateString()}*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${curriculum.title || '커리큘럼'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (needsPassword) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🔐</div>
                <h2 className="text-xl font-semibold text-gray-900">
                  비밀번호가 필요합니다
                </h2>
                <p className="text-gray-600 mt-2">
                  이 커리큘럼은 비밀번호로 보호되어 있습니다
                </p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  확인
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!curriculum) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">😕</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              커리큘럼을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-4">
              공유 링크가 잘못되었거나 만료되었습니다
            </p>
            <Button onClick={() => router.push('/')}>
              홈으로 이동
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {curriculum.title}
                  </h1>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    공유됨
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  작성자: {curriculum.author?.name || '익명'} · 
                  {new Date(curriculum.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  📥 다운로드
                </Button>
                {accessLevel === 'edit' && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/builder/${curriculum.id}`)}
                  >
                    편집하기
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <CurriculumPreview
              curriculum={curriculum}
              isEditable={accessLevel === 'edit'}
            />

            {/* Comments Section (if access level allows) */}
            {(accessLevel === 'comment' || accessLevel === 'edit') && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">댓글</h3>
                  <div className="text-center py-8 text-gray-500">
                    댓글 기능은 준비 중입니다
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}