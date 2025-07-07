"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumController = void 0;
const supabase_1 = require("../lib/supabase");
const logger_1 = require("../lib/logger");
class CurriculumController {
    // 커리큘럼 목록 조회 (페이지네이션, 검색, 필터링)
    async getCurriculums(req, res) {
        try {
            const userId = req.user?.id;
            const { page = 1, limit = 10, search, type, target_audience, sort = 'updated_at', order = 'desc' } = req.query;
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
            let query = supabase_1.supabase
                .from('curriculums')
                .select('*', { count: 'exact' })
                .eq('user_id', userId);
            // 검색
            if (search) {
                query = query.or(`title.ilike.%${search}%,content->>summary.ilike.%${search}%`);
            }
            // 필터링
            if (type) {
                query = query.eq('type', type);
            }
            if (target_audience) {
                query = query.eq('target_audience', target_audience);
            }
            // 정렬
            query = query.order(sort, { ascending: order === 'asc' });
            // 페이지네이션
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);
            const { data: curriculums, error, count } = await query;
            if (error) {
                logger_1.logger.error('Failed to fetch curriculums:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 목록 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            const totalPages = Math.ceil((count || 0) / limit);
            res.json({
                success: true,
                data: curriculums,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count || 0,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.getCurriculums error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 목록 조회 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 특정 커리큘럼 조회
    async getCurriculumById(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            const { data: curriculum, error } = await supabase_1.supabase
                .from('curriculums')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to fetch curriculum:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            res.json({
                success: true,
                data: curriculum,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.getCurriculumById error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 조회 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 새 커리큘럼 생성
    async createCurriculum(req, res) {
        try {
            const userId = req.user?.id;
            const curriculumData = req.body;
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
            const { data: curriculum, error } = await supabase_1.supabase
                .from('curriculums')
                .insert({
                ...curriculumData,
                user_id: userId,
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Failed to create curriculum:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 생성 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 첫 번째 버전 생성
            await supabase_1.supabase.from('curriculum_versions').insert({
                curriculum_id: curriculum.id,
                version_number: 1,
                content: curriculum.content,
            });
            logger_1.logger.info(`Curriculum created: ${curriculum.id} by user ${userId}`);
            res.status(201).json({
                success: true,
                data: curriculum,
                message: '커리큘럼이 성공적으로 생성되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.createCurriculum error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 생성 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 커리큘럼 수정
    async updateCurriculum(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const updateData = req.body;
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
            // 기존 커리큘럼 확인
            const { data: existingCurriculum, error: fetchError } = await supabase_1.supabase
                .from('curriculums')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to fetch curriculum for update:', fetchError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 커리큘럼 업데이트
            const { data: curriculum, error } = await supabase_1.supabase
                .from('curriculums')
                .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Failed to update curriculum:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 수정 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 새 버전 생성 (content가 변경된 경우)
            if (updateData.content) {
                const { data: latestVersion } = await supabase_1.supabase
                    .from('curriculum_versions')
                    .select('version_number')
                    .eq('curriculum_id', id)
                    .order('version_number', { ascending: false })
                    .limit(1)
                    .single();
                const nextVersion = (latestVersion?.version_number || 0) + 1;
                await supabase_1.supabase.from('curriculum_versions').insert({
                    curriculum_id: id,
                    version_number: nextVersion,
                    content: curriculum.content,
                });
            }
            logger_1.logger.info(`Curriculum updated: ${id} by user ${userId}`);
            res.json({
                success: true,
                data: curriculum,
                message: '커리큘럼이 성공적으로 수정되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.updateCurriculum error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 수정 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 커리큘럼 삭제
    async deleteCurriculum(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            // 커리큘럼 존재 확인
            const { data: existingCurriculum, error: fetchError } = await supabase_1.supabase
                .from('curriculums')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to fetch curriculum for deletion:', fetchError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 관련 데이터 삭제 (버전, 채팅 히스토리)
            await Promise.all([
                supabase_1.supabase.from('curriculum_versions').delete().eq('curriculum_id', id),
                supabase_1.supabase.from('chat_histories').delete().eq('curriculum_id', id),
            ]);
            // 커리큘럼 삭제
            const { error } = await supabase_1.supabase
                .from('curriculums')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Failed to delete curriculum:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 삭제 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            logger_1.logger.info(`Curriculum deleted: ${id} by user ${userId}`);
            res.json({
                success: true,
                message: '커리큘럼이 삭제되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.deleteCurriculum error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 삭제 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 커리큘럼 복제
    async duplicateCurriculum(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            // 원본 커리큘럼 조회
            const { data: originalCurriculum, error: fetchError } = await supabase_1.supabase
                .from('curriculums')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to fetch curriculum for duplication:', fetchError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 복제본 생성
            const { data: newCurriculum, error: createError } = await supabase_1.supabase
                .from('curriculums')
                .insert({
                user_id: userId,
                title: `${originalCurriculum.title} (복사본)`,
                target_audience: originalCurriculum.target_audience,
                duration: originalCurriculum.duration,
                type: originalCurriculum.type,
                content: originalCurriculum.content,
                metadata: originalCurriculum.metadata,
            })
                .select()
                .single();
            if (createError) {
                logger_1.logger.error('Failed to duplicate curriculum:', createError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 복제 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 첫 번째 버전 생성
            await supabase_1.supabase.from('curriculum_versions').insert({
                curriculum_id: newCurriculum.id,
                version_number: 1,
                content: newCurriculum.content,
            });
            logger_1.logger.info(`Curriculum duplicated: ${id} -> ${newCurriculum.id} by user ${userId}`);
            res.status(201).json({
                success: true,
                data: newCurriculum,
                message: '커리큘럼이 복제되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.duplicateCurriculum error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '커리큘럼 복제 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 버전 목록 조회
    async getVersions(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            // 커리큘럼 소유권 확인
            const { data: curriculum, error: curriculumError } = await supabase_1.supabase
                .from('curriculums')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (curriculumError) {
                if (curriculumError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to verify curriculum ownership:', curriculumError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 확인 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 버전 목록 조회
            const { data: versions, error } = await supabase_1.supabase
                .from('curriculum_versions')
                .select('*')
                .eq('curriculum_id', id)
                .order('version_number', { ascending: false });
            if (error) {
                logger_1.logger.error('Failed to fetch curriculum versions:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '버전 목록 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            res.json({
                success: true,
                data: versions,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.getVersions error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '버전 목록 조회 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 특정 버전으로 복원
    async restoreVersion(req, res) {
        try {
            const userId = req.user?.id;
            const { id, version_number } = req.params;
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
            // 커리큘럼 소유권 확인
            const { data: curriculum, error: curriculumError } = await supabase_1.supabase
                .from('curriculums')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (curriculumError) {
                if (curriculumError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to verify curriculum ownership:', curriculumError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 확인 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 특정 버전 조회
            const { data: version, error: versionError } = await supabase_1.supabase
                .from('curriculum_versions')
                .select('*')
                .eq('curriculum_id', id)
                .eq('version_number', Number(version_number))
                .single();
            if (versionError) {
                if (versionError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'VERSION_NOT_FOUND',
                            message: '해당 버전을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to fetch version:', versionError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '버전 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 최신 버전 번호 조회
            const { data: latestVersion } = await supabase_1.supabase
                .from('curriculum_versions')
                .select('version_number')
                .eq('curriculum_id', id)
                .order('version_number', { ascending: false })
                .limit(1)
                .single();
            const nextVersion = (latestVersion?.version_number || 0) + 1;
            // 커리큘럼 내용 복원
            const { data: updatedCurriculum, error: updateError } = await supabase_1.supabase
                .from('curriculums')
                .update({
                content: version.content,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                logger_1.logger.error('Failed to restore curriculum version:', updateError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '버전 복원 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 새 버전으로 저장
            await supabase_1.supabase.from('curriculum_versions').insert({
                curriculum_id: id,
                version_number: nextVersion,
                content: version.content,
            });
            logger_1.logger.info(`Curriculum restored to version ${version_number}: ${id} by user ${userId}`);
            res.json({
                success: true,
                message: `버전 ${version_number}로 복원되었습니다`,
                data: {
                    id: updatedCurriculum.id,
                    current_version: nextVersion,
                    restored_from_version: Number(version_number),
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.restoreVersion error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '버전 복원 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 채팅 히스토리 조회
    async getChatHistory(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            // 커리큘럼 소유권 확인
            const { data: curriculum, error: curriculumError } = await supabase_1.supabase
                .from('curriculums')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (curriculumError) {
                if (curriculumError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to verify curriculum ownership:', curriculumError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 확인 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 채팅 히스토리 조회
            const { data: chatHistory, error } = await supabase_1.supabase
                .from('chat_histories')
                .select('*')
                .eq('curriculum_id', id)
                .order('created_at', { ascending: true });
            if (error) {
                logger_1.logger.error('Failed to fetch chat history:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '채팅 히스토리 조회 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            res.json({
                success: true,
                data: chatHistory,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.getChatHistory error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '채팅 히스토리 조회 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 채팅 메시지 저장
    async saveChatMessage(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { role, content } = req.body;
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
            // 커리큘럼 소유권 확인
            const { data: curriculum, error: curriculumError } = await supabase_1.supabase
                .from('curriculums')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (curriculumError) {
                if (curriculumError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to verify curriculum ownership:', curriculumError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 확인 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 채팅 메시지 저장
            const { data: chatMessage, error } = await supabase_1.supabase
                .from('chat_histories')
                .insert({
                curriculum_id: id,
                role,
                content,
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Failed to save chat message:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '채팅 메시지 저장 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            res.status(201).json({
                success: true,
                data: chatMessage,
                message: '채팅 메시지가 저장되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.saveChatMessage error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '채팅 메시지 저장 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // 채팅 히스토리 삭제
    async clearChatHistory(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
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
            // 커리큘럼 소유권 확인
            const { data: curriculum, error: curriculumError } = await supabase_1.supabase
                .from('curriculums')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();
            if (curriculumError) {
                if (curriculumError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 'CURRICULUM_NOT_FOUND',
                            message: '커리큘럼을 찾을 수 없습니다',
                        },
                        timestamp: new Date().toISOString(),
                    });
                }
                logger_1.logger.error('Failed to verify curriculum ownership:', curriculumError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '커리큘럼 확인 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            // 채팅 히스토리 삭제
            const { error } = await supabase_1.supabase
                .from('chat_histories')
                .delete()
                .eq('curriculum_id', id);
            if (error) {
                logger_1.logger.error('Failed to clear chat history:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: '채팅 히스토리 삭제 중 오류가 발생했습니다',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            logger_1.logger.info(`Chat history cleared for curriculum ${id} by user ${userId}`);
            res.json({
                success: true,
                message: '채팅 히스토리가 삭제되었습니다',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('CurriculumController.clearChatHistory error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '채팅 히스토리 삭제 중 오류가 발생했습니다',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.CurriculumController = CurriculumController;
//# sourceMappingURL=CurriculumController.js.map