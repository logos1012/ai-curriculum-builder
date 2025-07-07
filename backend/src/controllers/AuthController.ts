import { Response } from 'express';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // 현재 세션 정보 조회
  async getSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_USER_NOT_FOUND',
            message: '사용자 정보를 찾을 수 없습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Supabase에서 사용자 정보 조회
      const { data: user, error } = await supabase.auth.admin.getUserById(userId);

      if (error || !user) {
        logger.error('Failed to get user session:', error);
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.user.id,
            email: user.user.email,
            name: user.user.user_metadata?.name || user.user.email?.split('@')[0],
            created_at: user.user.created_at,
          },
          session: {
            expires_at: user.user.last_sign_in_at,
          },
        },
        message: '세션 정보를 성공적으로 조회했습니다',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('AuthController.getSession error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '세션 조회 중 오류가 발생했습니다',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 로그아웃
  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: '인증 토큰이 필요합니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const token = authHeader.substring(7);
      
      // Supabase에서 토큰 무효화
      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        logger.error('Logout error:', error);
        // 로그아웃 실패해도 클라이언트에는 성공으로 응답
      }

      logger.info(`User logged out: ${req.user?.email} (${req.user?.id})`);

      res.json({
        success: true,
        message: '로그아웃되었습니다',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('AuthController.logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '로그아웃 중 오류가 발생했습니다',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 사용자 프로필 조회
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_USER_NOT_FOUND',
            message: '사용자 정보를 찾을 수 없습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const { data: user, error } = await supabase.auth.admin.getUserById(userId);

      if (error || !user) {
        logger.error('Failed to get user profile:', error);
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자 프로필을 찾을 수 없습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data: {
          id: user.user.id,
          email: user.user.email,
          name: user.user.user_metadata?.name || user.user.email?.split('@')[0],
          avatar_url: user.user.user_metadata?.avatar_url,
          created_at: user.user.created_at,
          updated_at: user.user.updated_at,
        },
        message: '프로필 정보를 성공적으로 조회했습니다',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('AuthController.getProfile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '프로필 조회 중 오류가 발생했습니다',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 사용자 프로필 업데이트
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { name, avatar_url } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_USER_NOT_FOUND',
            message: '사용자 정보를 찾을 수 없습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // 사용자 메타데이터 업데이트
      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar_url) updateData.avatar_url = avatar_url;

      const { data: user, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: updateData }
      );

      if (error) {
        logger.error('Failed to update user profile:', error);
        return res.status(400).json({
          success: false,
          error: {
            code: 'PROFILE_UPDATE_FAILED',
            message: '프로필 업데이트에 실패했습니다',
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`User profile updated: ${req.user?.email} (${userId})`);

      res.json({
        success: true,
        data: {
          id: user.user.id,
          email: user.user.email,
          name: user.user.user_metadata?.name,
          avatar_url: user.user.user_metadata?.avatar_url,
          updated_at: user.user.updated_at,
        },
        message: '프로필이 성공적으로 업데이트되었습니다',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('AuthController.updateProfile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '프로필 업데이트 중 오류가 발생했습니다',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}