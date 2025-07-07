-- AI 강의 커리큘럼 작성 웹앱 - 초기 스키마
-- TRD.md에 정의된 데이터베이스 스키마를 구현

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 커리큘럼 테이블
CREATE TABLE IF NOT EXISTS curriculums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_audience VARCHAR(255),
    duration VARCHAR(100),
    type VARCHAR(50) CHECK (type IN ('online', 'offline', 'hybrid')),
    content JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅 히스토리 테이블
CREATE TABLE IF NOT EXISTS chat_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 버전 관리 테이블
CREATE TABLE IF NOT EXISTS curriculum_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(curriculum_id, version_number)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_curriculums_user_id ON curriculums(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculums_created_at ON curriculums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curriculums_type ON curriculums(type);
CREATE INDEX IF NOT EXISTS idx_curriculums_target_audience ON curriculums(target_audience);

CREATE INDEX IF NOT EXISTS idx_chat_histories_curriculum_id ON chat_histories(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_chat_histories_created_at ON chat_histories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_curriculum_versions_curriculum_id ON curriculum_versions(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_versions_version_number ON curriculum_versions(version_number DESC);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 커리큘럼 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_curriculums_updated_at
    BEFORE UPDATE ON curriculums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정

-- 커리큘럼 테이블 RLS 활성화
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 커리큘럼만 조회 가능
CREATE POLICY "Users can view own curriculums" ON curriculums
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 커리큘럼만 생성 가능
CREATE POLICY "Users can create own curriculums" ON curriculums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 커리큘럼만 수정 가능
CREATE POLICY "Users can update own curriculums" ON curriculums
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 커리큘럼만 삭제 가능
CREATE POLICY "Users can delete own curriculums" ON curriculums
    FOR DELETE USING (auth.uid() = user_id);

-- 채팅 히스토리 테이블 RLS 활성화
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 커리큘럼과 연결된 채팅 히스토리만 조회 가능
CREATE POLICY "Users can view own chat histories" ON chat_histories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM curriculums 
            WHERE curriculums.id = chat_histories.curriculum_id 
            AND curriculums.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 커리큘럼에만 채팅 히스토리 생성 가능
CREATE POLICY "Users can create chat histories for own curriculums" ON chat_histories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM curriculums 
            WHERE curriculums.id = chat_histories.curriculum_id 
            AND curriculums.user_id = auth.uid()
        )
    );

-- 버전 관리 테이블 RLS 활성화
ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 커리큘럼 버전만 조회 가능
CREATE POLICY "Users can view own curriculum versions" ON curriculum_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM curriculums 
            WHERE curriculums.id = curriculum_versions.curriculum_id 
            AND curriculums.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 커리큘럼에만 버전 생성 가능
CREATE POLICY "Users can create versions for own curriculums" ON curriculum_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM curriculums 
            WHERE curriculums.id = curriculum_versions.curriculum_id 
            AND curriculums.user_id = auth.uid()
        )
    );

-- 실시간 구독을 위한 설정
-- 커리큘럼 테이블의 변경사항을 실시간으로 구독할 수 있도록 설정
ALTER PUBLICATION supabase_realtime ADD TABLE curriculums;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_histories;