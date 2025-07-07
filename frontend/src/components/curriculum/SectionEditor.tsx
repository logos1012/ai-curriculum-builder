'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Textarea } from '@/components/ui';
import { MarkdownEditor } from './MarkdownEditor';

interface Section {
  id: string;
  title: string;
  content: string;
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'custom';
  level?: number; // for headings
  order: number;
}

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  onSectionEdit?: (sectionId: string, content: string) => void;
  isEditable?: boolean;
}

export function SectionEditor({ 
  sections, 
  onChange, 
  onSectionEdit,
  isEditable = true 
}: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [localSections, setLocalSections] = useState<Section[]>(sections);
  const draggedSectionRef = useRef<number | null>(null);
  const dragOverSectionRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  // 섹션 파싱 함수
  const parseContentToSections = (content: string): Section[] => {
    const lines = content.split('\n');
    const parsedSections: Section[] = [];
    let currentSection: string[] = [];
    let sectionType: Section['type'] = 'paragraph';
    let sectionLevel = 0;
    let sectionOrder = 0;

    lines.forEach((line, index) => {
      // 제목 파싱
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        // 이전 섹션 저장
        if (currentSection.length > 0) {
          parsedSections.push({
            id: `section-${sectionOrder}`,
            title: currentSection[0] || '',
            content: currentSection.join('\n'),
            type: sectionType,
            level: sectionLevel,
            order: sectionOrder++,
          });
          currentSection = [];
        }

        sectionType = 'heading';
        sectionLevel = headingMatch[1].length;
        currentSection.push(line);
      }
      // 리스트 파싱
      else if (line.match(/^[\*\-]\s+/) || line.match(/^\d+\.\s+/)) {
        if (sectionType !== 'list' && currentSection.length > 0) {
          parsedSections.push({
            id: `section-${sectionOrder}`,
            title: currentSection[0] || '',
            content: currentSection.join('\n'),
            type: sectionType,
            level: sectionLevel,
            order: sectionOrder++,
          });
          currentSection = [];
          sectionType = 'list';
        }
        currentSection.push(line);
      }
      // 코드 블록 파싱
      else if (line.startsWith('```')) {
        if (sectionType !== 'code') {
          if (currentSection.length > 0) {
            parsedSections.push({
              id: `section-${sectionOrder}`,
              title: currentSection[0] || '',
              content: currentSection.join('\n'),
              type: sectionType,
              level: sectionLevel,
              order: sectionOrder++,
            });
            currentSection = [];
          }
          sectionType = 'code';
        } else {
          currentSection.push(line);
          parsedSections.push({
            id: `section-${sectionOrder}`,
            title: 'Code Block',
            content: currentSection.join('\n'),
            type: sectionType,
            order: sectionOrder++,
          });
          currentSection = [];
          sectionType = 'paragraph';
        }
      }
      // 일반 단락
      else {
        if (line.trim() === '' && currentSection.length > 0) {
          parsedSections.push({
            id: `section-${sectionOrder}`,
            title: currentSection[0] || '',
            content: currentSection.join('\n'),
            type: sectionType,
            level: sectionLevel,
            order: sectionOrder++,
          });
          currentSection = [];
          sectionType = 'paragraph';
        } else if (line.trim() !== '') {
          currentSection.push(line);
        }
      }
    });

    // 마지막 섹션 저장
    if (currentSection.length > 0) {
      parsedSections.push({
        id: `section-${sectionOrder}`,
        title: currentSection[0] || '',
        content: currentSection.join('\n'),
        type: sectionType,
        level: sectionLevel,
        order: sectionOrder++,
      });
    }

    return parsedSections;
  };

  // 섹션을 콘텐츠로 변환
  const sectionsToContent = (sections: Section[]): string => {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => section.content)
      .join('\n\n');
  };

  // 섹션 편집 시작
  const startEditingSection = (sectionId: string) => {
    if (!isEditable) return;
    setEditingSection(sectionId);
  };

  // 섹션 편집 완료
  const finishEditingSection = (sectionId: string, newContent: string) => {
    const updatedSections = localSections.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent }
        : section
    );
    setLocalSections(updatedSections);
    onChange(updatedSections);
    onSectionEdit?.(sectionId, newContent);
    setEditingSection(null);
  };

  // 섹션 추가
  const addSection = (afterSectionId?: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: '새 섹션',
      content: '',
      type: 'paragraph',
      order: localSections.length,
    };

    if (afterSectionId) {
      const afterIndex = localSections.findIndex(s => s.id === afterSectionId);
      const updatedSections = [...localSections];
      updatedSections.splice(afterIndex + 1, 0, newSection);
      
      // 순서 재정렬
      updatedSections.forEach((section, index) => {
        section.order = index;
      });
      
      setLocalSections(updatedSections);
      onChange(updatedSections);
    } else {
      setLocalSections([...localSections, newSection]);
      onChange([...localSections, newSection]);
    }

    // 새 섹션 편집 모드로
    setTimeout(() => startEditingSection(newSection.id), 100);
  };

  // 섹션 삭제
  const deleteSection = (sectionId: string) => {
    const updatedSections = localSections.filter(s => s.id !== sectionId);
    updatedSections.forEach((section, index) => {
      section.order = index;
    });
    setLocalSections(updatedSections);
    onChange(updatedSections);
  };

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, index: number) => {
    draggedSectionRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverSectionRef.current = index;
  };

  // 드롭
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedSectionRef.current === null || dragOverSectionRef.current === null) {
      return;
    }

    const draggedIndex = draggedSectionRef.current;
    const targetIndex = dragOverSectionRef.current;

    if (draggedIndex === targetIndex) {
      return;
    }

    const updatedSections = [...localSections];
    const [draggedSection] = updatedSections.splice(draggedIndex, 1);
    updatedSections.splice(targetIndex, 0, draggedSection);

    // 순서 재정렬
    updatedSections.forEach((section, index) => {
      section.order = index;
    });

    setLocalSections(updatedSections);
    onChange(updatedSections);

    draggedSectionRef.current = null;
    dragOverSectionRef.current = null;
  };

  const getSectionIcon = (type: Section['type']) => {
    switch (type) {
      case 'heading': return '📌';
      case 'list': return '📝';
      case 'code': return '💻';
      case 'paragraph': return '📄';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-4">
      {/* 섹션 추가 버튼 (상단) */}
      {isEditable && (
        <div className="flex justify-center">
          <button
            onClick={() => addSection()}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            + 섹션 추가
          </button>
        </div>
      )}

      {/* 섹션 목록 */}
      {localSections.map((section, index) => (
        <div
          key={section.id}
          className={`group relative border rounded-lg transition-all ${
            editingSection === section.id
              ? 'border-blue-500 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          draggable={isEditable && editingSection !== section.id}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
        >
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-2">
              {isEditable && (
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  ⋮⋮
                </div>
              )}
              <span className="text-lg">{getSectionIcon(section.type)}</span>
              <h3 className="font-medium text-gray-900">
                {section.title.substring(0, 50)}
                {section.title.length > 50 && '...'}
              </h3>
              {section.type === 'heading' && section.level && (
                <span className="text-xs text-gray-500">H{section.level}</span>
              )}
            </div>

            {isEditable && (
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingSection !== section.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditingSection(section.id)}
                  >
                    편집
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteSection(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            )}
          </div>

          {/* 섹션 콘텐츠 */}
          <div className="p-4">
            {editingSection === section.id ? (
              <div className="space-y-3">
                <MarkdownEditor
                  value={section.content}
                  onChange={(content) => {
                    const updatedSections = localSections.map(s =>
                      s.id === section.id ? { ...s, content } : s
                    );
                    setLocalSections(updatedSections);
                  }}
                  placeholder="섹션 내용을 입력하세요..."
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => finishEditingSection(section.id, section.content)}
                  >
                    완료
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                onClick={() => isEditable && startEditingSection(section.id)}
                dangerouslySetInnerHTML={{
                  __html: section.content
                    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold">$1</h1>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            )}
          </div>

          {/* 섹션 추가 버튼 (중간) */}
          {isEditable && index < localSections.length - 1 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
              <button
                onClick={() => addSection(section.id)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                +
              </button>
            </div>
          )}
        </div>
      ))}

      {localSections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">섹션이 없습니다</p>
          {isEditable && (
            <Button onClick={() => addSection()}>
              첫 번째 섹션 추가
            </Button>
          )}
        </div>
      )}
    </div>
  );
}