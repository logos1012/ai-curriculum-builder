'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  isStreaming = false,
}) => {
  return (
    <div className={cn(
      'flex w-full mb-4',
      role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex max-w-[80%] space-x-3',
        role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700'
        )}>
          {role === 'user' ? '👤' : '🤖'}
        </div>

        {/* Message content */}
        <div className={cn(
          'rounded-2xl px-4 py-3 max-w-full',
          role === 'user'
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}>
          <div className="whitespace-pre-wrap break-words">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse" />
            )}
          </div>
          
          {timestamp && (
            <div className={cn(
              'text-xs mt-2',
              role === 'user' ? 'text-blue-100' : 'text-gray-500'
            )}>
              {new Date(timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;