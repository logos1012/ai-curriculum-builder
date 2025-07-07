# AI 강의 커리큘럼 작성 웹앱 - 환경 변수 관리 가이드

## 📋 개요

이 문서는 AI 강의 커리큘럼 작성 웹앱의 환경 변수 설정 및 관리 방법을 안내합니다.

## 🔧 환경 변수 설정

### 1. 기본 설정

**1단계: .env 파일 생성**
```bash
cp .env.example .env
```

**2단계: 환경 변수 편집**
실제 값으로 `.env` 파일을 수정하세요.

### 2. 필수 환경 변수

#### 🔑 Supabase 설정

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://abc123.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGciOiJI...` | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase 서비스 키 | `eyJhbGciOiJI...` | ✅ |

**Supabase 키 확인 방법:**
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → Settings → API
3. Project URL과 API Keys 복사

#### 🤖 Claude API 설정

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API 키 | `sk-ant-api03-...` | ✅ |

**Claude API 키 발급 방법:**
1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys → Create Key
3. 발급받은 키 복사

#### 🌐 애플리케이션 설정

| 변수명 | 설명 | 기본값 | 필수 여부 |
|--------|------|--------|----------|
| `NODE_ENV` | 환경 모드 | `development` | ✅ |
| `FRONTEND_PORT` | 프론트엔드 포트 | `3000` | ⭕ |
| `BACKEND_PORT` | 백엔드 포트 | `4000` | ⭕ |
| `NEXT_PUBLIC_FRONTEND_URL` | 프론트엔드 URL | `http://localhost:3000` | ✅ |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:4000/api` | ✅ |

### 3. 선택적 환경 변수

#### 🔐 보안 설정

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `JWT_SECRET` | JWT 토큰 시크릿 키 | 랜덤 32자 문자열 |
| `RATE_LIMIT_WINDOW_MS` | Rate Limit 시간 윈도우 | `60000` (1분) |
| `RATE_LIMIT_MAX_REQUESTS` | Rate Limit 최대 요청 수 | `60` |

#### 📊 로깅 설정

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `LOG_LEVEL` | 로그 레벨 | `info` |
| `LOG_FORMAT` | 로그 포맷 | `combined` |

## 🚀 환경별 설정

### 개발 환경 (Development)

```bash
NODE_ENV=development
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
LOG_LEVEL=debug
```

### 스테이징 환경 (Staging)

```bash
NODE_ENV=staging
NEXT_PUBLIC_FRONTEND_URL=https://staging.your-domain.com
NEXT_PUBLIC_API_URL=https://staging-api.your-domain.com/api
LOG_LEVEL=info
```

### 프로덕션 환경 (Production)

```bash
NODE_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
LOG_LEVEL=warn
```

## 🔒 보안 고려사항

### 1. 민감한 정보 보호

**절대 Git에 커밋하지 말아야 할 정보:**
- API 키 (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_KEY`)
- JWT 시크릿 키
- 데이터베이스 비밀번호

**보안 체크리스트:**
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] API 키는 환경 변수로만 관리
- [ ] 프로덕션 환경에서는 강력한 JWT 시크릿 사용
- [ ] Rate Limiting 적절히 설정

### 2. 환경 변수 검증

**백엔드에서 환경 변수 검증:**
```typescript
// backend/src/config/env.ts
export const validateEnv = () => {
  const required = [
    'ANTHROPIC_API_KEY',
    'SUPABASE_SERVICE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
};
```

## 🐳 Docker 환경에서의 설정

### 1. Docker Compose 환경 변수

```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
  
  backend:
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - NODE_ENV=${NODE_ENV}
```

### 2. 개발/프로덕션 분리

**개발 환경:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**프로덕션 환경:**
```bash
docker-compose up
```

## 🛠️ 환경 변수 관리 도구

### 1. 로컬 개발

**dotenv 사용:**
```typescript
// 자동으로 .env 파일 로드
import 'dotenv/config';
```

### 2. Makefile 활용

```bash
# 환경 변수 복사
make env-copy

# 초기 설정
make setup
```

## 🚨 문제 해결

### 자주 발생하는 문제들

#### 1. Supabase 연결 오류
```bash
Error: Invalid Supabase URL or Key
```

**해결 방법:**
- Supabase Dashboard에서 URL과 키 재확인
- `.env` 파일에서 올바른 형식으로 설정되었는지 확인

#### 2. Claude API 인증 오류
```bash
Error: Invalid Anthropic API Key
```

**해결 방법:**
- Anthropic Console에서 API 키 상태 확인
- 키가 활성화되어 있고 크레딧이 있는지 확인

#### 3. CORS 오류
```bash
Error: CORS policy blocked
```

**해결 방법:**
- `NEXT_PUBLIC_FRONTEND_URL` 환경 변수 확인
- 백엔드 CORS 설정에서 허용된 도메인 확인

### 환경 변수 디버깅

**환경 변수 확인 명령어:**
```bash
# 모든 환경 변수 확인
printenv | grep -E "(SUPABASE|ANTHROPIC|NEXT_PUBLIC)"

# 특정 변수 확인
echo $ANTHROPIC_API_KEY
```

## 📚 추가 리소스

- [Supabase 환경 변수 가이드](https://supabase.com/docs/guides/getting-started/local-development)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Anthropic API 문서](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

---

**⚠️ 주의사항:**
- 환경 변수 변경 후에는 서버를 재시작해야 합니다
- 프론트엔드 환경 변수(`NEXT_PUBLIC_*`)는 빌드 시에 결정됩니다
- Docker 환경에서는 컨테이너를 재빌드해야 할 수 있습니다