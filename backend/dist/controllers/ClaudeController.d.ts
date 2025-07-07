import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class ClaudeController {
    chat(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    streamChat(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    enhanceContent(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generateQuestions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private extractSuggestions;
    private analyzeImprovements;
    private categorizeQuestions;
}
//# sourceMappingURL=ClaudeController.d.ts.map