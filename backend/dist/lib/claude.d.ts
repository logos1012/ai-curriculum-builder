import Anthropic from '@anthropic-ai/sdk';
export declare const anthropic: Anthropic;
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface CurriculumContext {
    targetAudience?: string;
    duration?: string;
    type?: 'online' | 'offline' | 'hybrid';
    currentContent?: string;
    chatHistory: ChatMessage[];
}
export declare class ClaudeService {
    private buildSystemPrompt;
    generateResponse(message: string, context: CurriculumContext): Promise<string>;
    generateStreamResponse(message: string, context: CurriculumContext): AsyncGenerator<string, void, unknown>;
    enhanceContent(content: string, context: CurriculumContext): Promise<string>;
    generateClarifyingQuestions(context: CurriculumContext): Promise<string[]>;
}
export declare const claudeService: ClaudeService;
//# sourceMappingURL=claude.d.ts.map