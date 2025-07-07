import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui';
import debounce from 'lodash/debounce';

interface CollaborativeUser {
  id: string;
  email: string;
  name?: string;
  isTyping?: boolean;
  lastActivity?: Date;
}

interface UseCollaborativeEditingOptions {
  curriculumId: string;
  onRemoteUpdate?: (field: string, value: any) => void;
  debounceDelay?: number;
}

export function useCollaborativeEditing({
  curriculumId,
  onRemoteUpdate,
  debounceDelay = 500,
}: UseCollaborativeEditingOptions) {
  const { webSocketService, isConnected } = useWebSocket();
  const { user } = useAuthStore();
  const { info } = useToast();
  
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [isReceivingUpdate, setIsReceivingUpdate] = useState(false);
  const updateQueueRef = useRef<Map<string, any>>(new Map());

  // 커리큘럼 룸 참가/나가기
  useEffect(() => {
    if (!isConnected || !curriculumId) return;

    webSocketService.joinCurriculumRoom(curriculumId);

    return () => {
      webSocketService.leaveCurriculumRoom(curriculumId);
    };
  }, [isConnected, curriculumId, webSocketService]);

  // 사용자 목록 업데이트 리스너
  useEffect(() => {
    if (!isConnected) return;

    const handleUsersUpdate = (users: string[]) => {
      // 사용자 정보 업데이트 (실제로는 더 상세한 정보가 필요)
      const updatedUsers = users
        .filter(userId => userId !== user?.id)
        .map(userId => ({
          id: userId,
          email: userId, // 실제로는 사용자 정보를 가져와야 함
        }));
      
      setActiveUsers(updatedUsers);
    };

    const handleUserActivity = (activity: any) => {
      if (activity.userId === user?.id) return;

      if (activity.action === 'join') {
        info(`사용자가 문서를 보고 있습니다`);
      }
    };

    webSocketService.onUsersUpdate(handleUsersUpdate);
    webSocketService.onUserActivity(handleUserActivity);

    return () => {
      webSocketService.off('users-update');
      webSocketService.off('user-activity');
    };
  }, [isConnected, user, webSocketService, info]);

  // 원격 업데이트 처리
  useEffect(() => {
    if (!isConnected) return;

    const handleRemoteUpdate = (update: any) => {
      if (update.userId === user?.id) return; // 자신의 업데이트는 무시

      setIsReceivingUpdate(true);
      
      // 원격 업데이트 적용
      onRemoteUpdate?.(update.field, update.value);

      // 업데이트 수신 상태 해제
      setTimeout(() => {
        setIsReceivingUpdate(false);
      }, 100);
    };

    webSocketService.onCurriculumUpdate(handleRemoteUpdate);

    return () => {
      webSocketService.off('curriculum-updated');
    };
  }, [isConnected, user, webSocketService, onRemoteUpdate]);

  // 타이핑 상태 처리
  useEffect(() => {
    if (!isConnected) return;

    const handleTypingStatus = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === user?.id) return;

      setActiveUsers(prev => 
        prev.map(u => 
          u.id === data.userId 
            ? { ...u, isTyping: data.isTyping }
            : u
        )
      );
    };

    webSocketService.onTypingStatus(handleTypingStatus);

    return () => {
      webSocketService.off('typing-status');
    };
  }, [isConnected, user, webSocketService]);

  // 로컬 업데이트 전송 (디바운스 적용)
  const sendUpdateDebounced = useRef(
    debounce((field: string, value: any) => {
      if (!isConnected || isReceivingUpdate) return;

      webSocketService.sendCurriculumUpdate({
        curriculumId,
        field,
        value,
        userId: user?.id || '',
        timestamp: new Date(),
      });
    }, debounceDelay)
  ).current;

  const sendUpdate = useCallback((field: string, value: any) => {
    if (isReceivingUpdate) return; // 원격 업데이트 수신 중에는 전송하지 않음
    
    // 업데이트 큐에 추가
    updateQueueRef.current.set(field, value);
    
    // 디바운스된 전송
    sendUpdateDebounced(field, value);
  }, [isReceivingUpdate, sendUpdateDebounced]);

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!isConnected) return;
    
    webSocketService.sendTypingStatus(curriculumId, isTyping);
  }, [isConnected, curriculumId, webSocketService]);

  // 타이핑 디바운스
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const handleTyping = useCallback(() => {
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);
  }, [sendTypingStatus]);

  return {
    isConnected,
    activeUsers,
    isReceivingUpdate,
    sendUpdate,
    handleTyping,
    sendTypingStatus,
  };
}