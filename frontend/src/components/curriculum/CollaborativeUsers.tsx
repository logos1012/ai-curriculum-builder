'use client';

import { useEffect, useState } from 'react';

interface CollaborativeUser {
  id: string;
  email: string;
  name?: string;
  isTyping?: boolean;
  color?: string;
}

interface CollaborativeUsersProps {
  users: CollaborativeUser[];
}

// 사용자별 색상 생성
const getUserColor = (userId: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
};

export function CollaborativeUsers({ users }: CollaborativeUsersProps) {
  const [visibleUsers, setVisibleUsers] = useState<CollaborativeUser[]>([]);

  useEffect(() => {
    // 최대 5명까지만 표시
    setVisibleUsers(users.slice(0, 5));
  }, [users]);

  if (visibleUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 사용자 아바타 */}
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <div
            key={user.id}
            className="relative group"
          >
            <div
              className={`w-8 h-8 rounded-full ${
                getUserColor(user.id)
              } flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
              title={user.name || user.email}
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            
            {/* 타이핑 인디케이터 */}
            {user.isTyping && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
            )}

            {/* 사용자 정보 툴팁 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {user.name || user.email}
              {user.isTyping && ' (입력 중...)'}
            </div>
          </div>
        ))}
      </div>

      {/* 추가 사용자 수 표시 */}
      {users.length > 5 && (
        <div className="text-xs text-gray-500">
          +{users.length - 5}명
        </div>
      )}
    </div>
  );
}