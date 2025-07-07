import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class AuthController {
    getSession(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=AuthController.d.ts.map