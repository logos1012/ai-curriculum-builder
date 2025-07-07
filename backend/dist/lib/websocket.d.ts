import { Server as HTTPServer } from 'http';
export declare class WebSocketService {
    private io;
    private authenticatedSockets;
    constructor(httpServer: HTTPServer);
    private setupEventHandlers;
    sendToUser(userId: string, event: string, data: any): void;
    sendToCurriculum(curriculumId: string, event: string, data: any): void;
    broadcast(event: string, data: any): void;
    getConnectedUsersCount(): number;
    getCurriculumUsers(curriculumId: string): string[];
    close(): void;
}
export declare const initializeWebSocket: (httpServer: HTTPServer) => WebSocketService;
export declare const getWebSocketService: () => WebSocketService | null;
//# sourceMappingURL=websocket.d.ts.map