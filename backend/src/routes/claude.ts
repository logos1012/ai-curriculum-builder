import { Router } from 'express';
import { ClaudeController } from '../controllers/ClaudeController';
import { authenticateUser } from '../middleware/auth';
import { validateChatRequest, validateEnhanceRequest } from '../middleware/validation';

const router = Router();
const claudeController = new ClaudeController();

// 모든 라우트에 인증 필요
router.use(authenticateUser);

// 일반 대화
router.post('/chat', validateChatRequest, claudeController.chat);

// 스트리밍 대화
router.post('/stream', validateChatRequest, claudeController.streamChat);

// 콘텐츠 개선
router.post('/enhance', validateEnhanceRequest, claudeController.enhanceContent);

// 구체화 질문 생성
router.post('/questions', claudeController.generateQuestions);

export default router;