"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClaudeController_1 = require("../controllers/ClaudeController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const claudeController = new ClaudeController_1.ClaudeController();
// 모든 라우트에 인증 필요
router.use(auth_1.authenticateUser);
// 일반 대화
router.post('/chat', validation_1.validateChatRequest, claudeController.chat);
// 스트리밍 대화
router.post('/stream', validation_1.validateChatRequest, claudeController.streamChat);
// 콘텐츠 개선
router.post('/enhance', validation_1.validateEnhanceRequest, claudeController.enhanceContent);
// 구체화 질문 생성
router.post('/questions', claudeController.generateQuestions);
exports.default = router;
//# sourceMappingURL=claude.js.map