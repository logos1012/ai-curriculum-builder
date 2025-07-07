# 🔧 환경 설정 가이드

## 개요
AI 커리큘럼 빌더 프로젝트의 로컬 개발 환경을 설정하는 가이드입니다.

## 1. 필수 환경 변수 설정

### 프론트엔드 환경 변수 (.env.local)
프론트엔드 루트 디렉토리에 `.env.local` 파일을 생성하세요:

```bash
cp frontend/.env.example frontend/.env.local
```

다음 값들을 실제 값으로 변경하세요:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic Claude API (필수)
ANTHROPIC_API_KEY=sk-ant-api03-...

# 기타 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 백엔드 환경 변수 (.env)
백엔드 루트 디렉토리에 `.env` 파일을 생성하세요:

```env
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-...

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# 서버 설정
PORT=8000
NODE_ENV=development
```

## 2. Supabase 프로젝트 설정

### 2.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 API 키 복사

### 2.2 데이터베이스 스키마 생성
Supabase SQL 에디터에서 다음 SQL을 실행하세요:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Curriculums 테이블
CREATE TABLE IF NOT EXISTS curriculums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  target_audience TEXT,
  learning_objectives TEXT,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  template_category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat Histories 테이블
CREATE TABLE IF NOT EXISTS chat_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'enhance', 'question')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Curriculum Versions 테이블
CREATE TABLE IF NOT EXISTS curriculum_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(curriculum_id, version_number)
);

-- Share Links 테이블
CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
  password_hash VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 정책 설정
-- Curriculums 정책
CREATE POLICY "Users can view their own curriculums" ON curriculums
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own curriculums" ON curriculums
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own curriculums" ON curriculums
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own curriculums" ON curriculums
  FOR DELETE USING (user_id = auth.uid());

-- Chat Histories 정책
CREATE POLICY "Users can view their own chat histories" ON chat_histories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat histories" ON chat_histories
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Curriculum Versions 정책
CREATE POLICY "Users can view versions of their curriculums" ON curriculum_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM curriculums 
      WHERE id = curriculum_versions.curriculum_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their curriculums" ON curriculum_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM curriculums 
      WHERE id = curriculum_versions.curriculum_id 
      AND user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Share Links 정책
CREATE POLICY "Users can manage share links for their curriculums" ON share_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM curriculums 
      WHERE id = share_links.curriculum_id 
      AND user_id = auth.uid()
    )
  );

-- Enable RLS
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX idx_curriculums_user_id ON curriculums(user_id);
CREATE INDEX idx_curriculums_is_public ON curriculums(is_public);
CREATE INDEX idx_curriculums_is_template ON curriculums(is_template);
CREATE INDEX idx_chat_histories_curriculum_id ON chat_histories(curriculum_id);
CREATE INDEX idx_curriculum_versions_curriculum_id ON curriculum_versions(curriculum_id);
CREATE INDEX idx_share_links_curriculum_id ON share_links(curriculum_id);
```

### 2.3 실시간 기능 활성화
Supabase 대시보드에서 Database > Replication으로 이동하여 다음 테이블의 실시간 기능을 활성화하세요:
- `curriculums`
- `chat_histories` 
- `curriculum_versions`

## 3. Claude API 설정

### 3.1 API 키 발급
1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 환경 변수에 설정

### 3.2 사용량 모니터링
- 콘솔에서 사용량과 한도를 정기적으로 확인
- 필요시 사용량 알림 설정

## 4. 개발 서버 실행

### 방법 1: Docker 사용 (권장)
```bash
# 프로젝트 루트에서
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose logs -f
```

### 방법 2: 개별 실행
```bash
# 백엔드 실행 (터미널 1)
cd backend
npm install
npm run dev

# 프론트엔드 실행 (터미널 2)
cd frontend
npm install
npm run dev
```

## 5. 연결 확인

### 5.1 자동 확인
- 프론트엔드 접속: http://localhost:3000
- 좌측 하단의 환경 설정 상태 버튼(🔧) 클릭
- 모든 항목이 ✅ 상태인지 확인

### 5.2 수동 확인
```bash
# 백엔드 헬스 체크
curl http://localhost:8000/api/health

# Supabase 연결 확인
curl http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer your-jwt-token"
```

## 6. 문제 해결

### 6.1 Supabase 연결 오류
- URL과 API 키가 정확한지 확인
- 네트워크 연결 상태 확인
- Supabase 프로젝트가 활성 상태인지 확인

### 6.2 Claude API 오류
- API 키 형식 확인 (sk-ant-api03-로 시작)
- 사용량 한도 확인
- 네트워크 연결 상태 확인

### 6.3 CORS 오류
- 백엔드 CORS 설정 확인
- 프론트엔드 API URL 설정 확인

### 6.4 포트 충돌
```bash
# 포트 사용 중인 프로세스 찾기
lsof -ti:3000  # 프론트엔드
lsof -ti:8000  # 백엔드

# 프로세스 종료
kill -9 <PID>
```

## 7. 보안 주의사항

### 7.1 API 키 보안
- `.env` 파일을 Git에 커밋하지 않기
- API 키를 코드에 직접 입력하지 않기
- 정기적으로 키 교체하기

### 7.2 데이터베이스 보안
- RLS 정책이 올바르게 설정되어 있는지 확인
- 운영 환경에서는 강력한 비밀번호 사용
- 정기적인 백업 수행

## 8. 개발 팁

### 8.1 환경 변수 확인
개발 모드에서는 브라우저 콘솔에서 환경 설정 정보를 확인할 수 있습니다.

### 8.2 실시간 디버깅
- 좌측 하단 환경 설정 버튼으로 실시간 연결 상태 확인
- 우측 하단 연결 상태 버튼으로 시스템 전체 상태 확인

### 8.3 로그 확인
```bash
# Docker 로그
docker-compose logs backend
docker-compose logs frontend

# 개별 실행 시 로그는 터미널에서 확인
```

이 가이드를 따라 설정하면 로컬 개발 환경이 완성됩니다. 문제가 발생하면 각 단계를 다시 확인해보세요.