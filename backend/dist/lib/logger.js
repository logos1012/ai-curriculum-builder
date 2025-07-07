"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, errors, json, colorize, printf } = winston_1.default.format;
// 커스텀 로그 포맷
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});
// 로거 생성
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
    defaultMeta: { service: 'ai-curriculum-builder-backend' },
    transports: [
        // 에러 로그 파일
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(json())
        }),
        // 전체 로그 파일
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            format: combine(json())
        })
    ]
});
// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: combine(colorize(), devFormat)
    }));
}
// 프로덕션 환경에서는 간단한 콘솔 출력
if (process.env.NODE_ENV === 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: combine(json())
    }));
}
// 로그 디렉토리 생성
const fs_1 = require("fs");
try {
    (0, fs_1.mkdirSync)('logs', { recursive: true });
}
catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
}
//# sourceMappingURL=logger.js.map