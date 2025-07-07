import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../lib/logger';

// 커리큘럼 생성 검증 스키마
const curriculumSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '제목은 필수입니다',
    'string.max': '제목은 200자를 초과할 수 없습니다',
  }),
  target_audience: Joi.string().min(1).max(100).optional().messages({
    'string.max': '대상은 100자를 초과할 수 없습니다',
  }),
  duration: Joi.string().min(1).max(50).optional().messages({
    'string.max': '기간은 50자를 초과할 수 없습니다',
  }),
  type: Joi.string().valid('online', 'offline', 'hybrid').optional().messages({
    'any.only': '강의 형식은 online, offline, hybrid 중 하나여야 합니다',
  }),
  content: Joi.object({
    summary: Joi.string().max(1000).optional(),
    objectives: Joi.array().items(Joi.string().max(200)).optional(),
    chapters: Joi.array().items(Joi.object().unknown(true)).optional(),
    resources: Joi.array().items(Joi.object().unknown(true)).optional(),
  }).required(),
  metadata: Joi.object({
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    prerequisites: Joi.array().items(Joi.string().max(100)).optional(),
    tools: Joi.array().items(Joi.string().max(50)).optional(),
    estimatedCost: Joi.number().min(0).optional(),
    language: Joi.string().max(10).optional(),
  }).optional(),
});

// 커리큘럼 업데이트 검증 스키마 (모든 필드 선택적)
const curriculumUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  target_audience: Joi.string().min(1).max(100).optional(),
  duration: Joi.string().min(1).max(50).optional(),
  type: Joi.string().valid('online', 'offline', 'hybrid').optional(),
  content: Joi.object({
    summary: Joi.string().max(1000).optional(),
    objectives: Joi.array().items(Joi.string().max(200)).optional(),
    chapters: Joi.array().items(Joi.object().unknown(true)).optional(),
    resources: Joi.array().items(Joi.object().unknown(true)).optional(),
  }).optional(),
  metadata: Joi.object({
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    prerequisites: Joi.array().items(Joi.string().max(100)).optional(),
    tools: Joi.array().items(Joi.string().max(50)).optional(),
    estimatedCost: Joi.number().min(0).optional(),
    language: Joi.string().max(10).optional(),
  }).optional(),
});

// 채팅 메시지 검증 스키마
const chatMessageSchema = Joi.object({
  role: Joi.string().valid('user', 'assistant').required(),
  content: Joi.string().min(1).max(10000).required().messages({
    'string.empty': '메시지 내용은 필수입니다',
    'string.max': '메시지는 10000자를 초과할 수 없습니다',
  }),
});

// 일반적인 검증 미들웨어 팩토리
const createValidationMiddleware = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation failed:', validationErrors);

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
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().max(100).optional(),
  type: Joi.string().valid('online', 'offline', 'hybrid').optional(),
  target_audience: Joi.string().max(100).optional(),
  sort: Joi.string().valid('created_at', 'updated_at', 'title').default('updated_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
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

// Claude API 요청 검증 스키마
const chatRequestSchema = Joi.object({
  message: Joi.string().min(1).max(10000).required().messages({
    'string.empty': '메시지는 필수입니다',
    'string.max': '메시지는 10000자를 초과할 수 없습니다',
  }),
  context: Joi.object({
    targetAudience: Joi.string().max(100).optional(),
    duration: Joi.string().max(50).optional(),
    type: Joi.string().valid('online', 'offline', 'hybrid').optional(),
    currentContent: Joi.string().max(50000).optional(),
    chatHistory: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required(),
      })
    ).max(50).optional(),
  }).required(),
});

const enhanceRequestSchema = Joi.object({
  content: Joi.string().min(1).max(50000).required().messages({
    'string.empty': '개선할 콘텐츠는 필수입니다',
    'string.max': '콘텐츠는 50000자를 초과할 수 없습니다',
  }),
  context: Joi.object({
    targetAudience: Joi.string().max(100).optional(),
    duration: Joi.string().max(50).optional(),
    type: Joi.string().valid('online', 'offline', 'hybrid').optional(),
  }).required(),
  enhanceType: Joi.string().valid('detail', 'structure', 'practical').optional(),
});

// 내보내기
export const validateCurriculum = createValidationMiddleware(curriculumSchema);
export const validateCurriculumUpdate = createValidationMiddleware(curriculumUpdateSchema);
export const validateChatMessage = createValidationMiddleware(chatMessageSchema);
export const validateChatRequest = createValidationMiddleware(chatRequestSchema);
export const validateEnhanceRequest = createValidationMiddleware(enhanceRequestSchema);