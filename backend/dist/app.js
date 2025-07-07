"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const logger_1 = require("./lib/logger");
const supabase_1 = require("./lib/supabase");
const websocket_1 = require("./lib/websocket");
const auth_1 = __importDefault(require("./routes/auth"));
const curriculum_1 = __importDefault(require("./routes/curriculum"));
const claude_1 = __importDefault(require("./routes/claude"));
// 환경 변수 로드
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// 보안 미들웨어
app.use((0, helmet_1.default)());
// CORS 설정
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 15분당 최대 100개 요청
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Body parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
// Health check
app.get('/health', async (req, res) => {
    const dbConnected = await (0, supabase_1.testConnection)();
    res.status(200).json({
        status: 'OK',
        message: 'AI Curriculum Builder Backend is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        dependencies: {
            supabase: dbConnected ? 'connected' : 'disconnected',
            claude_api: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured'
        }
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/curriculum', curriculum_1.default);
app.use('/api/claude', claude_1.default);
// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ENDPOINT_NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`
        },
        timestamp: new Date().toISOString()
    });
});
// 에러 핸들러
app.use((error, req, res, next) => {
    logger_1.logger.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error occurred'
        },
        timestamp: new Date().toISOString()
    });
});
// HTTP 서버 및 WebSocket 설정
const httpServer = (0, http_1.createServer)(app);
const webSocketService = (0, websocket_1.initializeWebSocket)(httpServer);
// 서버 시작
async function startServer() {
    try {
        // 의존성 연결 테스트
        logger_1.logger.info('Testing dependencies...');
        const dbConnected = await (0, supabase_1.testConnection)();
        if (!dbConnected) {
            logger_1.logger.warn('Supabase connection failed - some features may not work');
        }
        if (!process.env.ANTHROPIC_API_KEY) {
            logger_1.logger.warn('Claude API key not configured - AI features will not work');
        }
        // 서버 시작
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server is running on port ${PORT}`);
            logger_1.logger.info(`📖 Health check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`🔌 WebSocket enabled`);
            // 연결된 서비스 상태 로그
            if (dbConnected) {
                logger_1.logger.info('✅ Supabase connected');
            }
            if (process.env.ANTHROPIC_API_KEY) {
                logger_1.logger.info('✅ Claude API configured');
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=app.js.map