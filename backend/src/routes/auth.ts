import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// 로그인 상태 확인
router.get('/session', authenticateUser, authController.getSession);

// 로그아웃
router.post('/logout', authenticateUser, authController.logout);

// 사용자 프로필 조회
router.get('/profile', authenticateUser, authController.getProfile);

// 사용자 프로필 업데이트
router.put('/profile', authenticateUser, authController.updateProfile);

export default router;