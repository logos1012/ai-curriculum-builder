"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// 로그인 상태 확인
router.get('/session', auth_1.authenticateUser, authController.getSession);
// 로그아웃
router.post('/logout', auth_1.authenticateUser, authController.logout);
// 사용자 프로필 조회
router.get('/profile', auth_1.authenticateUser, authController.getProfile);
// 사용자 프로필 업데이트
router.put('/profile', auth_1.authenticateUser, authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map