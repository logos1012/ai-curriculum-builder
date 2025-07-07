import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: '인증 토큰이 필요합니다',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Authentication failed:', error?.message);
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: '유효하지 않은 토큰입니다',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 사용자 정보를 요청 객체에 추가
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    logger.info(`User authenticated: ${user.email} (${user.id})`);
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '인증 처리 중 오류가 발생했습니다',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 인증이 선택적인 경우, 토큰이 없어도 계속 진행
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email || '',
      };
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    // 선택적 인증에서는 에러가 발생해도 계속 진행
    next();
  }
};