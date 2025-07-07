import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class CurriculumController {
    getCurriculums(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCurriculumById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCurriculum(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCurriculum(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCurriculum(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    duplicateCurriculum(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVersions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    restoreVersion(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getChatHistory(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    saveChatMessage(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    clearChatHistory(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=CurriculumController.d.ts.map