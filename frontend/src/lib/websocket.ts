import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

interface CurriculumUpdate {
  curriculumId: string;
  field: string;
  value: any;
  userId: string;
  timestamp: Date;
}

interface UserActivity {
  userId: string;
  curriculumId: string;
  action: 'join' | 'leave' | 'editing' | 'idle';
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No session found, cannot connect to WebSocket');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    
    this.socket = io(socketUrl, {
      auth: {
        token: session.access_token,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // 인증 에러 처리
    this.socket.on('auth-error', (error) => {
      console.error('WebSocket auth error:', error);
      this.disconnect();
    });
  }

  // 커리큘럼 룸 참가
  joinCurriculumRoom(curriculumId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('join-curriculum', curriculumId);
  }

  // 커리큘럼 룸 나가기
  leaveCurriculumRoom(curriculumId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('leave-curriculum', curriculumId);
  }

  // 커리큘럼 업데이트 전송
  sendCurriculumUpdate(update: Partial<CurriculumUpdate>): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('curriculum-update', update);
  }

  // 커리큘럼 업데이트 수신 리스너
  onCurriculumUpdate(callback: (update: CurriculumUpdate) => void): void {
    if (!this.socket) return;

    this.socket.on('curriculum-updated', callback);
  }

  // 사용자 활동 수신 리스너
  onUserActivity(callback: (activity: UserActivity) => void): void {
    if (!this.socket) return;

    this.socket.on('user-activity', callback);
  }

  // 사용자 목록 수신 리스너
  onUsersUpdate(callback: (users: string[]) => void): void {
    if (!this.socket) return;

    this.socket.on('users-update', callback);
  }

  // 채팅 메시지 전송
  sendChatMessage(curriculumId: string, message: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('chat-message', { curriculumId, message });
  }

  // 채팅 메시지 수신 리스너
  onChatMessage(callback: (data: { userId: string; message: string; timestamp: Date }) => void): void {
    if (!this.socket) return;

    this.socket.on('chat-message', callback);
  }

  // 타이핑 상태 전송
  sendTypingStatus(curriculumId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('typing-status', { curriculumId, isTyping });
  }

  // 타이핑 상태 수신 리스너
  onTypingStatus(callback: (data: { userId: string; isTyping: boolean }) => void): void {
    if (!this.socket) return;

    this.socket.on('typing-status', callback);
  }

  // 리스너 제거
  removeAllListeners(): void {
    if (!this.socket) return;

    this.socket.removeAllListeners();
  }

  // 특정 이벤트 리스너 제거
  off(event: string, handler?: Function): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler as any);
    } else {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 싱글톤 인스턴스
export const webSocketService = new WebSocketService();

// React Hook for WebSocket
import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = async () => {
      await webSocketService.connect();
      setIsConnected(webSocketService.isConnected());
    };

    connectWebSocket();

    // 연결 상태 업데이트
    const checkConnection = setInterval(() => {
      setIsConnected(webSocketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      webSocketService.removeAllListeners();
      webSocketService.disconnect();
    };
  }, []);

  return {
    webSocketService,
    isConnected,
  };
}