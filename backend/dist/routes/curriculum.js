"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CurriculumController_1 = require("../controllers/CurriculumController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const curriculumController = new CurriculumController_1.CurriculumController();
// 모든 라우트에 인증 필요
router.use(auth_1.authenticateUser);
// 커리큘럼 목록 조회 (페이지네이션, 검색, 필터링)
router.get('/', curriculumController.getCurriculums);
// 특정 커리큘럼 조회
router.get('/:id', curriculumController.getCurriculumById);
// 새 커리큘럼 생성
router.post('/', validation_1.validateCurriculum, curriculumController.createCurriculum);
// 커리큘럼 수정
router.put('/:id', validation_1.validateCurriculumUpdate, curriculumController.updateCurriculum);
// 커리큘럼 삭제
router.delete('/:id', curriculumController.deleteCurriculum);
// 커리큘럼 복제
router.post('/:id/duplicate', curriculumController.duplicateCurriculum);
// 커리큘럼 버전 관리
router.get('/:id/versions', curriculumController.getVersions);
router.post('/:id/versions/:version_number/restore', curriculumController.restoreVersion);
// 채팅 히스토리 관리
router.get('/:id/chat', curriculumController.getChatHistory);
router.post('/:id/chat', curriculumController.saveChatMessage);
router.delete('/:id/chat', curriculumController.clearChatHistory);
exports.default = router;
//# sourceMappingURL=curriculum.js.map