'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { ChatMessage } from './ChatMessage';
import { claudeApi, curriculumApi } from '@/lib/api';
import { useToast } from '@/components/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  curriculumId: string;
  currentContent: string;
  context: {
    targetAudience?: string;
    duration?: string;
    type?: 'online' | 'offline' | 'hybrid';
  };
  onContentUpdate: (content: string) => void;
}

export function ChatInterface({ 
  curriculumId, 
  currentContent, 
  context, 
  onContentUpdate 
}: ChatInterfaceProps) {
  const { error } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 채팅 히스토리 로드
  useEffect(() => {
    loadChatHistory();
  }, [curriculumId]);

  // 메시지가 추가될 때마다 스크롤 하단으로
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const loadChatHistory = async () => {
    try {
      const response = await curriculumApi.getChatHistory(curriculumId);
      if (response.success && response.data) {
        const history = response.data.map((msg: any) => ({
          id: msg.id || Math.random().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
        }));
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveChatMessage = async (role: string, content: string) => {
    try {
      await curriculumApi.saveChatMessage(curriculumId, { role, content });
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    setStreamingMessage('');

    // 사용자 메시지 저장
    await saveChatMessage('user', userMessage.content);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 스트리밍 채팅 요청
      await claudeApi.streamChat(
        {
          message: userMessage.content,
          context: {
            ...context,
            currentContent,
            chatHistory,
          },
        },
        // onChunk
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk);
        },
        // onComplete
        async (fullMessage: string, suggestions?: string[]) => {
          const assistantMessage: ChatMessage = {
            id: Math.random().toString(),
            role: 'assistant',
            content: fullMessage,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage('');
          setIsStreaming(false);

          // AI 응답 저장
          await saveChatMessage('assistant', fullMessage);

          // 콘텐츠 업데이트 제안이 있으면 적용
          if (fullMessage.includes('```curriculum') || fullMessage.includes('**커리큘럼 업데이트**')) {
            // 커리큘럼 콘텐츠 추출 및 업데이트 로직
            const updatedContent = extractCurriculumContent(fullMessage);
            if (updatedContent) {
              onContentUpdate(updatedContent);
            }
          }
        },
        // onError
        (errorMessage: string) => {
          error(`AI 응답 중 오류가 발생했습니다: ${errorMessage}`);
          setIsStreaming(false);
          setStreamingMessage('');
        }
      );
    } catch (err) {
      error('메시지 전송 중 오류가 발생했습니다');
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const extractCurriculumContent = (message: string): string | null => {
    // 마크다운 코드 블록에서 커리큘럼 콘텐츠 추출
    const codeBlockMatch = message.match(/```curriculum\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }

    // **커리큘럼 업데이트** 섹션에서 콘텐츠 추출
    const updateMatch = message.match(/\*\*커리큘럼 업데이트\*\*\n([\s\S]*?)(?=\n\n|\n\*\*|$)/);
    if (updateMatch) {
      return updateMatch[1];
    }

    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  // 추천 질문들
  const quickPrompts = [
    "이 커리큘럼을 더 구체적으로 만들어주세요",
    "실습 과제를 추가해주세요", 
    "학습 목표를 명확하게 해주세요",
    "평가 방법을 제안해주세요",
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">AI 커리큘럼 어시스턴트</h3>
        <p className="text-sm text-gray-600 mt-1">
          AI와 대화하며 커리큘럼을 개선해보세요
        </p>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-600 mb-4">
              AI와 대화를 시작해보세요
            </p>
            <div className="space-y-2">
              {quickPrompts.slice(0, 2).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="block w-full p-2 text-sm text-left text-blue-600 hover:bg-blue-50 rounded"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}

        {/* Streaming Message */}
        {isStreaming && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              AI
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-gray-800">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length > 0 && !isStreaming && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI에게 메시지를 보내세요..."
            disabled={isLoading || isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isStreaming}
          >
            {isLoading || isStreaming ? <LoadingSpinner size="sm" /> : '전송'}
          </Button>
        </div>
      </div>
    </div>
  );
}