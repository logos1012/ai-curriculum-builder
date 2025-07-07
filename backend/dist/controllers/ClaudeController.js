"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeController = void 0;
const claude_1 = require("../lib/claude");
const logger_1 = require("../lib/logger");
class ClaudeController {
    // 일반 채팅 응답
    async chat(req, res) {
        try {
            const { message, context } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTH_USER_NOT_FOUND',
                        message: '사용자 정보를 찾을 수 없습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 채팅 히스토리 전처리 (너무 길면 자르기)
            const chatHistory = (context.chatHistory || []).slice(-20); // 최근 20개 메시지만 유지
            const curriculumContext = {
                targetAudience: context.targetAudience,
                duration: context.duration,
                type: context.type,
                currentContent: context.currentContent,
                chatHistory,
            };
            const response = await claude_1.claudeService.generateResponse(message, curriculumContext);
            // 응답에서 제안 질문들을 추출 (선택적)
            const suggestions = await this.extractSuggestions(response, curriculumContext);
            logger_1.logger.info(`Claude chat response generated for user ${userId}`);
            res.json({
                success: true,
                data: {
                    message: response,
                    suggestions,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('ClaudeController.chat error:', error);
            // Claude API 특정 에러 처리
            if (error instanceof Error) {
                if (error.message.includes('rate_limit')) {
                    return res.status(429).json({
                        success: false,
                        error: {
                            code: 'CLAUDE_API_RATE_LIMIT',
                            message: 'Claude API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                if (error.message.includes('quota')) {
                    return res.status(402).json({
                        success: false,
                        error: {
                            code: 'CLAUDE_API_QUOTA_EXCEEDED',
                            message: 'Claude API 할당량을 초과했습니다.',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            res.status(500).json({
                success: false,
                error: {
                    code: 'CLAUDE_API_ERROR',
                    message: 'AI 응답 생성 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 스트리밍 채팅 응답
    async streamChat(req, res) {
        try {
            const { message, context } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTH_USER_NOT_FOUND',
                        message: '사용자 정보를 찾을 수 없습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // SSE 헤더 설정
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control',
            });
            // 채팅 히스토리 전처리
            const chatHistory = (context.chatHistory || []).slice(-20);
            const curriculumContext = {
                targetAudience: context.targetAudience,
                duration: context.duration,
                type: context.type,
                currentContent: context.currentContent,
                chatHistory,
            };
            // 스트리밍 시작 신호
            res.write(`data: ${JSON.stringify({ type: 'start', message: '응답을 생성 중입니다...' })}\n\n`);
            let fullResponse = '';
            try {
                // Claude API 스트리밍 호출
                for await (const chunk of claude_1.claudeService.generateStreamResponse(message, curriculumContext)) {
                    fullResponse += chunk;
                    res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
                }
                // 응답 완료 후 제안 질문 생성
                const suggestions = await this.extractSuggestions(fullResponse, curriculumContext);
                // 스트리밍 완료 신호
                res.write(`data: ${JSON.stringify({
                    type: 'end',
                    suggestions,
                    fullMessage: fullResponse
                })}\n\n`);
                logger_1.logger.info(`Claude streaming response completed for user ${userId}`);
            }
            catch (streamError) {
                logger_1.logger.error('Claude streaming error:', streamError);
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'AI 응답 생성 중 오류가 발생했습니다'
                })}\n\n`);
            }
            res.end();
        }
        catch (error) {
            logger_1.logger.error('ClaudeController.streamChat error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'CLAUDE_STREAMING_ERROR',
                        message: 'AI 스트리밍 응답 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }
    // 콘텐츠 개선
    async enhanceContent(req, res) {
        try {
            const { content, context, enhanceType = 'detail' } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTH_USER_NOT_FOUND',
                        message: '사용자 정보를 찾을 수 없습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            const curriculumContext = {
                targetAudience: context.targetAudience,
                duration: context.duration,
                type: context.type,
                chatHistory: [],
            };
            const enhancedContent = await claude_1.claudeService.enhanceContent(content, curriculumContext);
            // 개선 사항 요약 생성
            const improvements = this.analyzeImprovements(content, enhancedContent);
            logger_1.logger.info(`Content enhancement completed for user ${userId}`);
            res.json({
                success: true,
                data: {
                    enhancedContent,
                    improvements,
                    originalLength: content.length,
                    enhancedLength: enhancedContent.length,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('ClaudeController.enhanceContent error:', error);
            // Claude API 에러 처리
            if (error instanceof Error && error.message.includes('rate_limit')) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'CLAUDE_API_RATE_LIMIT',
                        message: 'Claude API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    code: 'CLAUDE_API_ERROR',
                    message: '콘텐츠 개선 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 구체화 질문 생성
    async generateQuestions(req, res) {
        try {
            const { context } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'AUTH_USER_NOT_FOUND',
                        message: '사용자 정보를 찾을 수 없습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            const curriculumContext = {
                targetAudience: context?.targetAudience,
                duration: context?.duration,
                type: context?.type,
                currentContent: context?.currentContent,
                chatHistory: context?.chatHistory || [],
            };
            const questions = await claude_1.claudeService.generateClarifyingQuestions(curriculumContext);
            // 질문을 카테고리별로 분류
            const categorizedQuestions = this.categorizeQuestions(questions);
            logger_1.logger.info(`Clarifying questions generated for user ${userId}`);
            res.json({
                success: true,
                data: {
                    questions,
                    categories: categorizedQuestions,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('ClaudeController.generateQuestions error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CLAUDE_API_ERROR',
                    message: '구체화 질문 생성 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 응답에서 제안 질문 추출 (private helper)
    async extractSuggestions(response, context) {
        try {
            // 응답이 너무 짧으면 제안 질문 생성하지 않음
            if (response.length < 100) {
                return [];
            }
            // 간단한 제안 질문들 반환
            const defaultSuggestions = [
                '더 구체적인 실습 예시를 알려주세요',
                '난이도를 조정하고 싶어요',
                '평가 방법을 추가해주세요',
            ];
            // 컨텍스트에 따른 맞춤 제안
            const contextualSuggestions = [];
            if (!context.targetAudience) {
                contextualSuggestions.push('대상 학습자를 더 구체적으로 정의해주세요');
            }
            if (!context.duration) {
                contextualSuggestions.push('적절한 교육 기간을 제안해주세요');
            }
            if (context.type === 'online') {
                contextualSuggestions.push('온라인 환경에 맞는 상호작용 방법을 알려주세요');
            }
            return [...contextualSuggestions, ...defaultSuggestions].slice(0, 3);
        }
        catch (error) {
            logger_1.logger.error('Error extracting suggestions:', error);
            return [];
        }
    }
    // 개선 사항 분석 (private helper)
    analyzeImprovements(original, enhanced) {
        const improvements = [];
        // 길이 비교
        if (enhanced.length > original.length * 1.2) {
            improvements.push('내용의 구체성과 상세도 향상');
        }
        // 마크다운 구조 분석
        const originalHeaders = (original.match(/^#+\s/gm) || []).length;
        const enhancedHeaders = (enhanced.match(/^#+\s/gm) || []).length;
        if (enhancedHeaders > originalHeaders) {
            improvements.push('구조화 및 가독성 개선');
        }
        // 리스트 분석
        const originalLists = (original.match(/^[-*]\s/gm) || []).length;
        const enhancedLists = (enhanced.match(/^[-*]\s/gm) || []).length;
        if (enhancedLists > originalLists) {
            improvements.push('항목 정리 및 체계화');
        }
        // 기본 개선 사항
        if (improvements.length === 0) {
            improvements.push('내용 품질 향상', '학습자 중심 구성');
        }
        return improvements;
    }
    // 질문 카테고리화 (private helper)
    categorizeQuestions(questions) {
        const categories = [
            { name: '대상자 특성', keywords: ['대상', '학습자', '수준', '배경'] },
            { name: '교육 환경', keywords: ['환경', '도구', '기기', '플랫폼'] },
            { name: '내용 구성', keywords: ['내용', '구성', '순서', '단계'] },
            { name: '평가 방법', keywords: ['평가', '측정', '과제', '피드백'] },
        ];
        const categorized = categories.map(category => ({
            name: category.name,
            questions: questions.filter(question => category.keywords.some(keyword => question.includes(keyword))),
        }));
        // 카테고리에 속하지 않는 질문들은 '기타'로 분류
        const categorizedQuestions = categorized.flatMap(c => c.questions);
        const uncategorized = questions.filter(q => !categorizedQuestions.includes(q));
        if (uncategorized.length > 0) {
            categorized.push({ name: '기타', questions: uncategorized });
        }
        return categorized.filter(c => c.questions.length > 0);
    }
}
exports.ClaudeController = ClaudeController;
//# sourceMappingURL=ClaudeController.js.map