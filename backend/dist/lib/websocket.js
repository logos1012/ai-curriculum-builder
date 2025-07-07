"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketService = exports.initializeWebSocket = exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const supabase_1 = require("./supabase");
const logger_1 = require("./logger");
class WebSocketService {
    constructor(httpServer) {
        this.authenticatedSockets = new Map();
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        this.setupEventHandlers();
        logger_1.logger.info('WebSocket service initialized');
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Socket connected: ${socket.id}`);
            // 인증 핸들러
            socket.on('authenticate', async (data) => {
                try {
                    const { data: { user }, error } = await supabase_1.supabase.auth.getUser(data.token);
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
                    logger_1.logger.info(`Socket authenticated: ${socket.id} (user: ${user.id})`);
                    // 사용자별 룸에 조인
                    socket.join(`user:${user.id}`);
                }
                catch (error) {
                    logger_1.logger.error('Socket authentication error:', error);
                    socket.emit('auth_error', { message: '인증 처리 중 오류가 발생했습니다' });
                }
            });
            // 커리큘럼 편집 시작
            socket.on('join_curriculum', (data) => {
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
                logger_1.logger.info(`User ${userSocket.userId} joined curriculum ${data.curriculumId}`);
            });
            // 커리큘럼 편집 종료
            socket.on('leave_curriculum', (data) => {
                const userSocket = this.authenticatedSockets.get(socket.id);
                if (!userSocket)
                    return;
                const roomName = `curriculum:${data.curriculumId}`;
                socket.leave(roomName);
                // 다른 사용자들에게 편집 종료 알림
                socket.to(roomName).emit('user_left', {
                    userId: userSocket.userId,
                    curriculumId: data.curriculumId,
                });
                logger_1.logger.info(`User ${userSocket.userId} left curriculum ${data.curriculumId}`);
            });
            // 실시간 편집 알림
            socket.on('curriculum_update', (data) => {
                const userSocket = this.authenticatedSockets.get(socket.id);
                if (!userSocket)
                    return;
                const roomName = `curriculum:${data.curriculumId}`;
                // 자신을 제외한 같은 커리큘럼 편집자들에게 알림
                socket.to(roomName).emit('curriculum_updated', {
                    ...data,
                    userId: userSocket.userId,
                });
                logger_1.logger.debug(`Curriculum ${data.curriculumId} updated by user ${userSocket.userId}`);
            });
            // 채팅 메시지 실시간 동기화
            socket.on('chat_message', (data) => {
                const userSocket = this.authenticatedSockets.get(socket.id);
                if (!userSocket)
                    return;
                const roomName = `curriculum:${data.curriculumId}`;
                // 같은 커리큘럼을 보고 있는 다른 사용자들에게 메시지 전송
                socket.to(roomName).emit('chat_message_received', {
                    ...data,
                    userId: userSocket.userId,
                });
                logger_1.logger.debug(`Chat message sent to curriculum ${data.curriculumId}`);
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
                    logger_1.logger.info(`Socket disconnected: ${socket.id} (user: ${userSocket.userId})`);
                }
            });
            // 에러 처리
            socket.on('error', (error) => {
                logger_1.logger.error(`Socket error (${socket.id}):`, error);
            });
        });
    }
    // 특정 사용자에게 메시지 전송
    sendToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    // 특정 커리큘럼을 편집 중인 모든 사용자에게 메시지 전송
    sendToCurriculum(curriculumId, event, data) {
        this.io.to(`curriculum:${curriculumId}`).emit(event, data);
    }
    // 모든 연결된 사용자에게 메시지 전송
    broadcast(event, data) {
        this.io.emit(event, data);
    }
    // 연결된 사용자 수 조회
    getConnectedUsersCount() {
        return this.authenticatedSockets.size;
    }
    // 특정 커리큘럼을 편집 중인 사용자 목록 조회
    getCurriculumUsers(curriculumId) {
        const users = [];
        const roomName = `curriculum:${curriculumId}`;
        this.authenticatedSockets.forEach(({ userId, socket }) => {
            if (socket.rooms.has(roomName)) {
                users.push(userId);
            }
        });
        return users;
    }
    // WebSocket 서버 종료
    close() {
        this.io.close();
        logger_1.logger.info('WebSocket service closed');
    }
}
exports.WebSocketService = WebSocketService;
let webSocketService = null;
const initializeWebSocket = (httpServer) => {
    if (!webSocketService) {
        webSocketService = new WebSocketService(httpServer);
    }
    return webSocketService;
};
exports.initializeWebSocket = initializeWebSocket;
const getWebSocketService = () => {
    return webSocketService;
};
exports.getWebSocketService = getWebSocketService;
//# sourceMappingURL=websocket.js.map