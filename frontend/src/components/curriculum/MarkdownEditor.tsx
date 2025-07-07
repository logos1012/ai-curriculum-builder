'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Textarea } from '@/components/ui';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "커리큘럼 내용을 작성하세요...",
  disabled = false 
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 마크다운 렌더링 함수
  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1 list-disc list-inside">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 list-disc list-inside">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal list-inside">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  // 텍스트 삽입 헬퍼 함수
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)');
          break;
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Mode Toggle */}
          <div className="flex bg-white rounded border">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 text-sm rounded-l ${
                mode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              편집
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 text-sm rounded-r ${
                mode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              미리보기
            </button>
          </div>

          {/* Formatting Buttons */}
          {mode === 'edit' && (
            <div className="flex items-center space-x-1 border-l pl-2 ml-2">
              <button
                onClick={() => insertText('**', '**')}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="굵게 (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => insertText('*', '*')}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded italic"
                title="기울임꼴 (Ctrl+I)"
              >
                I
              </button>
              <button
                onClick={() => insertText('# ', '')}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="제목"
              >
                H1
              </button>
              <button
                onClick={() => insertText('## ', '')}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="부제목"
              >
                H2
              </button>
              <button
                onClick={() => insertText('- ', '')}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="목록"
              >
                •
              </button>
              <button
                onClick={() => insertText('`', '`')}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-mono"
                title="코드"
              >
                &lt;/&gt;
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500">
          {mode === 'edit' && 'Ctrl+B: 굵게, Ctrl+I: 기울임, Tab: 들여쓰기'}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {mode === 'edit' ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[300px] border-none resize-none focus:ring-0 focus:border-transparent font-mono text-sm"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
        ) : (
          <div className="p-4 min-h-[300px] prose prose-gray max-w-none">
            {value ? (
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-4">${renderMarkdown(value)}</p>`
                }}
              />
            ) : (
              <div className="text-gray-500 italic">
                내용을 입력하면 여기에 미리보기가 표시됩니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}