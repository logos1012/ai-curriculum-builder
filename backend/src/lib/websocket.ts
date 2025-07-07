import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { supabase } from './supabase';
import { logger } from './logger';

export class WebSocketService {
  private io: SocketIOServer;
  private authenticatedSockets = new Map<string, { userId: string; socket: Socket }>();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // 인증 핸들러
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(data.token);

          if (error || !user) {
            socket.emit('auth_error', { message: '인증에 실패했습니다' });
            return;
          }

          // 인증된 소켓 등록
          this.authenticatedSockets.set(socket.id, {
            userId: user.id,
            socket,
          });

          socket.emit('authenticated', { userId: user.id });
          logger.info(`Socket authenticated: ${socket.id} (user: ${user.id})`);

          // 사용자별 룸에 조인
          socket.join(`user:${user.id}`);
        } catch (error) {
          logger.error('Socket authentication error:', error);
          socket.emit('auth_error', { message: '인증 처리 중 오류가 발생했습니다' });
        }
      });

      // 커리큘럼 편집 시작
      socket.on('join_curriculum', (data: { curriculumId: string }) => {
        const userSocket = this.authenticatedSockets.get(socket.id);
        if (!userSocket) {
          socket.emit('error', { message: '인증이 필요합니다' });
          return;
        }

        const roomName = `curriculum:${data.curriculumId}`;
        socket.join(roomName);
        
        // 다른 사용자들에게 편집 시작 알림
        socket.to(roomName).emit('user_joined', {
          userId: userSocket.userId,
          curriculumId: data.curriculumId,
        });

        logger.info(`User ${userSocket.userId} joined curriculum ${data.curriculumId}`);
      });

      // 커리큘럼 편집 종료
      socket.on('leave_curriculum', (data: { curriculumId: string }) => {
        const userSocket = this.authenticatedSockets.get(socket.id);
        if (!userSocket) return;

        const roomName = `curriculum:${data.curriculumId}`;
        socket.leave(roomName);
        
        // 다른 사용자들에게 편집 종료 알림
        socket.to(roomName).emit('user_left', {
          userId: userSocket.userId,
          curriculumId: data.curriculumId,
        });

        logger.info(`User ${userSocket.userId} left curriculum ${data.curriculumId}`);
      });

      // 실시간 편집 알림
      socket.on('curriculum_update', (data: { 
        curriculumId: string; 
        section: string; 
        content: any;
        timestamp: string;
      }) => {
        const userSocket = this.authenticatedSockets.get(socket.id);
        if (!userSocket) return;

        const roomName = `curriculum:${data.curriculumId}`;
        
        // 자신을 제외한 같은 커리큘럼 편집자들에게 알림
        socket.to(roomName).emit('curriculum_updated', {
          ...data,
          userId: userSocket.userId,
        });

        logger.debug(`Curriculum ${data.curriculumId} updated by user ${userSocket.userId}`);
      });

      // 채팅 메시지 실시간 동기화
      socket.on('chat_message', (data: {
        curriculumId: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
      }) => {
        const userSocket = this.authenticatedSockets.get(socket.id);
        if (!userSocket) return;

        const roomName = `curriculum:${data.curriculumId}`;
        
        // 같은 커리큘럼을 보고 있는 다른 사용자들에게 메시지 전송
        socket.to(roomName).emit('chat_message_received', {
          ...data,
          userId: userSocket.userId,
        });

        logger.debug(`Chat message sent to curriculum ${data.curriculumId}`);
      });

      // 연결 해제 처리
      socket.on('disconnect', () => {
        const userSocket = this.authenticatedSockets.get(socket.id);
        if (userSocket) {
          // 모든 룸에서 사용자 퇴장 알림
          socket.rooms.forEach(room => {
            if (room.startsWith('curriculum:')) {
              socket.to(room).emit('user_disconnected', {
                userId: userSocket.userId,
              });
            }
          });

          this.authenticatedSockets.delete(socket.id);
          logger.info(`Socket disconnected: ${socket.id} (user: ${userSocket.userId})`);
        }
      });

      // 에러 처리
      socket.on('error', (error) => {
        logger.error(`Socket error (${socket.id}):`, error);
      });
    });
  }

  // 특정 사용자에게 메시지 전송
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // 특정 커리큘럼을 편집 중인 모든 사용자에게 메시지 전송
  public sendToCurriculum(curriculumId: string, event: string, data: any) {
    this.io.to(`curriculum:${curriculumId}`).emit(event, data);
  }

  // 모든 연결된 사용자에게 메시지 전송
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // 연결된 사용자 수 조회
  public getConnectedUsersCount(): number {
    return this.authenticatedSockets.size;
  }

  // 특정 커리큘럼을 편집 중인 사용자 목록 조회
  public getCurriculumUsers(curriculumId: string): string[] {
    const users: string[] = [];
    const roomName = `curriculum:${curriculumId}`;
    
    this.authenticatedSockets.forEach(({ userId, socket }) => {
      if (socket.rooms.has(roomName)) {
        users.push(userId);
      }
    });

    return users;
  }

  // WebSocket 서버 종료
  public close() {
    this.io.close();
    logger.info('WebSocket service closed');
  }
}

let webSocketService: WebSocketService | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService(httpServer);
  }
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return webSocketService;
};