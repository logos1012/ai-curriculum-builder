'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { MarkdownEditor } from './MarkdownEditor';
import { SectionEditor } from './SectionEditor';
import type { Curriculum } from '@/types';

interface CurriculumPreviewProps {
  curriculum: Curriculum;
  onContentEdit?: (content: string) => void;
  isEditable?: boolean;
}

export function CurriculumPreview({ 
  curriculum, 
  onContentEdit,
  isEditable = false 
}: CurriculumPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'edit' | 'section' | 'raw'>('preview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState<any[]>([]);

  // 섹션 파싱
  useEffect(() => {
    if (viewMode === 'section' && curriculum.content) {
      const parsedSections = parseContentToSections(curriculum.content);
      setSections(parsedSections);
    }
  }, [viewMode, curriculum.content]);

  const parseContentToSections = (content: string): any[] => {
    const lines = content.split('\n');
    const parsedSections: any[] = [];
    let currentSection: string[] = [];
    let sectionType = 'paragraph';
    let sectionOrder = 0;

    lines.forEach((line) => {
      if (line.match(/^#{1,6}\s+/)) {
        if (currentSection.length > 0) {
          parsedSections.push({
            id: `section-${sectionOrder}`,
            title: currentSection[0] || '',
            content: currentSection.join('\n'),
            type: sectionType,
            order: sectionOrder++,
          });
          currentSection = [];
        }
        sectionType = 'heading';
        currentSection.push(line);
      } else if (line.trim() === '' && currentSection.length > 0) {
        parsedSections.push({
          id: `section-${sectionOrder}`,
          title: currentSection[0] || '',
          content: currentSection.join('\n'),
          type: sectionType,
          order: sectionOrder++,
        });
        currentSection = [];
        sectionType = 'paragraph';
      } else if (line.trim() !== '') {
        currentSection.push(line);
      }
    });

    if (currentSection.length > 0) {
      parsedSections.push({
        id: `section-${sectionOrder}`,
        title: currentSection[0] || '',
        content: currentSection.join('\n'),
        type: sectionType,
        order: sectionOrder++,
      });
    }

    return parsedSections;
  };

  const handleSectionsChange = (newSections: any[]) => {
    setSections(newSections);
    const newContent = newSections
      .sort((a, b) => a.order - b.order)
      .map(section => section.content)
      .join('\n\n');
    onContentEdit?.(newContent);
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    
    // 간단한 마크다운 렌더링
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  const downloadAsMarkdown = () => {
    const markdown = `# ${curriculum.title}

## 커리큘럼 정보
- **대상**: ${curriculum.target_audience || '미설정'}
- **기간**: ${curriculum.duration || '미설정'}
- **형태**: ${curriculum.type || 'online'}
- **설명**: ${curriculum.description || '설명 없음'}

## 커리큘럼 내용

${curriculum.content || '내용이 아직 작성되지 않았습니다.'}

---
*AI 커리큘럼 빌더로 생성됨*
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(curriculum.content || '');
      // 성공 피드백은 상위 컴포넌트에서 처리
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">커리큘럼 미리보기</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              미리보기
            </button>
            {isEditable && (
              <>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'edit'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  편집
                </button>
                <button
                  onClick={() => setViewMode('section')}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === 'section'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  섹션
                </button>
              </>
            )}
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'raw'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              원본
            </button>
          </div>
        </div>

        {/* Curriculum Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">대상:</span>
            <span className="ml-2 text-gray-900">
              {curriculum.target_audience || '미설정'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">기간:</span>
            <span className="ml-2 text-gray-900">
              {curriculum.duration || '미설정'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">형태:</span>
            <span className="ml-2 text-gray-900">
              {curriculum.type === 'online' ? '온라인' : 
               curriculum.type === 'offline' ? '오프라인' : '혼합형'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">업데이트:</span>
            <span className="ml-2 text-gray-900">
              {new Date(curriculum.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
          >
            복사
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAsMarkdown}
          >
            다운로드
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {curriculum.content ? (
          <>
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {curriculum.title}
              </h1>
              {curriculum.description && (
                <p className="text-gray-600">
                  {curriculum.description}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-gray max-w-none">
              {viewMode === 'preview' ? (
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(curriculum.content)
                  }}
                />
              ) : viewMode === 'edit' ? (
                <MarkdownEditor
                  value={curriculum.content || ''}
                  onChange={(content) => onContentEdit?.(content)}
                  placeholder="커리큘럼 내용을 작성하세요..."
                />
              ) : viewMode === 'section' ? (
                <SectionEditor
                  sections={sections}
                  onChange={handleSectionsChange}
                  isEditable={true}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {curriculum.content}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                콘텐츠가 없습니다
              </h3>
              <p className="text-gray-600">
                AI와 대화하여 커리큘럼 콘텐츠를 생성해보세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}