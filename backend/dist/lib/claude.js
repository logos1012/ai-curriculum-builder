"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeService = exports.ClaudeService = exports.anthropic = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const logger_1 = require("./logger");
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    logger_1.logger.error('Missing Anthropic API key');
    throw new Error('Missing Anthropic API key');
}
exports.anthropic = new sdk_1.default({
    apiKey: apiKey,
});
class ClaudeService {
    // 시스템 프롬프트 생성
    buildSystemPrompt(context) {
        return `당신은 AI 교육 전문가이자 강의 커리큘럼 설계 전문가입니다.

프리랜서 강사가 다양한 대상에게 AI 교육 커리큘럼을 작성할 수 있도록 도와주세요.

### 역할과 목표:
1. 대상자의 특성에 맞는 실용적인 AI 교육 커리큘럼 설계
2. 최신 AI 도구와 기술을 반영한 실습 중심의 콘텐츠 제공
3. 단계적이고 체계적인 학습 구조 제안

### 현재 컨텍스트:
- 대상: ${context.targetAudience || '미정'}
- 기간: ${context.duration || '미정'}
- 형식: ${context.type || '미정'}

### 응답 가이드라인:
1. 구체적이고 실행 가능한 내용 제시
2. 각 차시별 학습 목표와 실습 내용 포함
3. 대상자 수준에 맞는 용어와 예시 사용
4. 최신 AI 도구 및 트렌드 반영
5. 평가 방법 및 과제 제안

응답은 마크다운 형식으로 구조화하여 제공해주세요.`;
    }
    // 일반 채팅 응답 생성
    async generateResponse(message, context) {
        try {
            const systemPrompt = this.buildSystemPrompt(context);
            const response = await exports.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    ...context.chatHistory,
                    { role: 'user', content: message }
                ]
            });
            const content = response.content[0];
            if (content.type === 'text') {
                logger_1.logger.info('Claude response generated successfully');
                return content.text;
            }
            throw new Error('Unexpected response format from Claude');
        }
        catch (error) {
            logger_1.logger.error('Claude API error:', error);
            throw error;
        }
    }
    // 스트리밍 응답 생성
    async *generateStreamResponse(message, context) {
        try {
            const systemPrompt = this.buildSystemPrompt(context);
            const stream = await exports.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    ...context.chatHistory,
                    { role: 'user', content: message }
                ],
                stream: true
            });
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    yield chunk.delta.text;
                }
            }
            logger_1.logger.info('Claude streaming response completed');
        }
        catch (error) {
            logger_1.logger.error('Claude streaming API error:', error);
            throw error;
        }
    }
    // 커리큘럼 콘텐츠 개선
    async enhanceContent(content, context) {
        try {
            const enhancePrompt = `다음 커리큘럼 콘텐츠를 개선해주세요:

${content}

개선 요청사항:
1. 내용의 구체성과 실용성 향상
2. 학습자 참여를 높일 수 있는 요소 추가
3. 최신 AI 도구 및 트렌드 반영
4. 평가 및 피드백 방법 보완

대상: ${context.targetAudience || '일반'}
형식: ${context.type || '온라인'}

개선된 버전을 마크다운 형식으로 제공해주세요.`;
            const response = await this.generateResponse(enhancePrompt, context);
            logger_1.logger.info('Content enhancement completed');
            return response;
        }
        catch (error) {
            logger_1.logger.error('Content enhancement error:', error);
            throw error;
        }
    }
    // 구체화 질문 생성
    async generateClarifyingQuestions(context) {
        try {
            const questionPrompt = `현재 커리큘럼 작성 상황을 분석하고, 더 구체적이고 효과적인 커리큘럼을 만들기 위한 질문 3개를 생성해주세요.

현재 상황:
- 대상: ${context.targetAudience || '미정'}
- 기간: ${context.duration || '미정'}
- 형식: ${context.type || '미정'}
- 현재 내용: ${context.currentContent ? '작성 중' : '미작성'}

질문은 다음 관점에서 생성해주세요:
1. 학습자의 구체적 특성과 니즈
2. 실습 환경과 도구 접근성
3. 평가 방법과 성과 측정

각 질문은 한 줄로 작성하고, 번호를 매겨주세요.`;
            const response = await this.generateResponse(questionPrompt, {
                ...context,
                chatHistory: []
            });
            // 응답에서 질문들을 추출
            const questions = response
                .split('\n')
                .filter(line => /^\d+\./.test(line.trim()))
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(q => q.length > 0);
            logger_1.logger.info(`Generated ${questions.length} clarifying questions`);
            return questions;
        }
        catch (error) {
            logger_1.logger.error('Clarifying questions generation error:', error);
            throw error;
        }
    }
}
exports.ClaudeService = ClaudeService;
exports.claudeService = new ClaudeService();
//# sourceMappingURL=claude.js.map