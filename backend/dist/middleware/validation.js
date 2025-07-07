"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnhanceRequest = exports.validateChatRequest = exports.validateChatMessage = exports.validateCurriculumUpdate = exports.validateCurriculum = exports.validatePagination = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../lib/logger");
// 커리큘럼 생성 검증 스키마
const curriculumSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).required().messages({
        'string.empty': '제목은 필수입니다',
        'string.max': '제목은 200자를 초과할 수 없습니다',
    }),
    target_audience: joi_1.default.string().min(1).max(100).optional().messages({
        'string.max': '대상은 100자를 초과할 수 없습니다',
    }),
    duration: joi_1.default.string().min(1).max(50).optional().messages({
        'string.max': '기간은 50자를 초과할 수 없습니다',
    }),
    type: joi_1.default.string().valid('online', 'offline', 'hybrid').optional().messages({
        'any.only': '강의 형식은 online, offline, hybrid 중 하나여야 합니다',
    }),
    content: joi_1.default.object({
        summary: joi_1.default.string().max(1000).optional(),
        objectives: joi_1.default.array().items(joi_1.default.string().max(200)).optional(),
        chapters: joi_1.default.array().items(joi_1.default.object().unknown(true)).optional(),
        resources: joi_1.default.array().items(joi_1.default.object().unknown(true)).optional(),
    }).required(),
    metadata: joi_1.default.object({
        difficulty: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').optional(),
        prerequisites: joi_1.default.array().items(joi_1.default.string().max(100)).optional(),
        tools: joi_1.default.array().items(joi_1.default.string().max(50)).optional(),
        estimatedCost: joi_1.default.number().min(0).optional(),
        language: joi_1.default.string().max(10).optional(),
    }).optional(),
});
// 커리큘럼 업데이트 검증 스키마 (모든 필드 선택적)
const curriculumUpdateSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).optional(),
    target_audience: joi_1.default.string().min(1).max(100).optional(),
    duration: joi_1.default.string().min(1).max(50).optional(),
    type: joi_1.default.string().valid('online', 'offline', 'hybrid').optional(),
    content: joi_1.default.object({
        summary: joi_1.default.string().max(1000).optional(),
        objectives: joi_1.default.array().items(joi_1.default.string().max(200)).optional(),
        chapters: joi_1.default.array().items(joi_1.default.object().unknown(true)).optional(),
        resources: joi_1.default.array().items(joi_1.default.object().unknown(true)).optional(),
    }).optional(),
    metadata: joi_1.default.object({
        difficulty: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').optional(),
        prerequisites: joi_1.default.array().items(joi_1.default.string().max(100)).optional(),
        tools: joi_1.default.array().items(joi_1.default.string().max(50)).optional(),
        estimatedCost: joi_1.default.number().min(0).optional(),
        language: joi_1.default.string().max(10).optional(),
    }).optional(),
});
// 채팅 메시지 검증 스키마
const chatMessageSchema = joi_1.default.object({
    role: joi_1.default.string().valid('user', 'assistant').required(),
    content: joi_1.default.string().min(1).max(10000).required().messages({
        'string.empty': '메시지 내용은 필수입니다',
        'string.max': '메시지는 10000자를 초과할 수 없습니다',
    }),
});
// 일반적인 검증 미들웨어 팩토리
const createValidationMiddleware = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            logger_1.logger.warn('Validation failed:', validationErrors);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: '입력 데이터가 유효하지 않습니다',
                    details: validationErrors,
                },
                timestamp: new Date().toISOString(),
            });
        }
        // 검증된 데이터로 req.body 교체
        req.body = value;
        next();
    };
};
// 쿼리 파라미터 검증
const paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(50).default(10),
    search: joi_1.default.string().max(100).optional(),
    type: joi_1.default.string().valid('online', 'offline', 'hybrid').optional(),
    target_audience: joi_1.default.string().max(100).optional(),
    sort: joi_1.default.string().valid('created_at', 'updated_at', 'title').default('updated_at'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
const validatePagination = (req, res, next) => {
    const { error, value } = paginationSchema.validate(req.query, {
        stripUnknown: true,
    });
    if (error) {
        const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
        }));
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '쿼리 파라미터가 유효하지 않습니다',
                details: validationErrors,
            },
            timestamp: new Date().toISOString(),
        });
    }
    req.query = value;
    next();
};
exports.validatePagination = validatePagination;
// Claude API 요청 검증 스키마
const chatRequestSchema = joi_1.default.object({
    message: joi_1.default.string().min(1).max(10000).required().messages({
        'string.empty': '메시지는 필수입니다',
        'string.max': '메시지는 10000자를 초과할 수 없습니다',
    }),
    context: joi_1.default.object({
        targetAudience: joi_1.default.string().max(100).optional(),
        duration: joi_1.default.string().max(50).optional(),
        type: joi_1.default.string().valid('online', 'offline', 'hybrid').optional(),
        currentContent: joi_1.default.string().max(50000).optional(),
        chatHistory: joi_1.default.array().items(joi_1.default.object({
            role: joi_1.default.string().valid('user', 'assistant').required(),
            content: joi_1.default.string().required(),
        })).max(50).optional(),
    }).required(),
});
const enhanceRequestSchema = joi_1.default.object({
    content: joi_1.default.string().min(1).max(50000).required().messages({
        'string.empty': '개선할 콘텐츠는 필수입니다',
        'string.max': '콘텐츠는 50000자를 초과할 수 없습니다',
    }),
    context: joi_1.default.object({
        targetAudience: joi_1.default.string().max(100).optional(),
        duration: joi_1.default.string().max(50).optional(),
        type: joi_1.default.string().valid('online', 'offline', 'hybrid').optional(),
    }).required(),
    enhanceType: joi_1.default.string().valid('detail', 'structure', 'practical').optional(),
});
// 내보내기
exports.validateCurriculum = createValidationMiddleware(curriculumSchema);
exports.validateCurriculumUpdate = createValidationMiddleware(curriculumUpdateSchema);
exports.validateChatMessage = createValidationMiddleware(chatMessageSchema);
exports.validateChatRequest = createValidationMiddleware(chatRequestSchema);
exports.validateEnhanceRequest = createValidationMiddleware(enhanceRequestSchema);
//# sourceMappingURL=validation.js.map