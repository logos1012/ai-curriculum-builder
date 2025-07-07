# AI 강의 커리큘럼 작성 웹앱 - 로컬 개발 환경 가이드

## 📋 개요

이 문서는 AI 강의 커리큘럼 작성 웹앱의 로컬 개발 환경 설정 및 개발 워크플로우를 안내합니다.

## 🚀 빠른 시작

### 1단계: 사전 요구사항 확인

**필수 설치 항목:**
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

**선택 설치 항목:**
- [VSCode](https://code.visualstudio.com/) (권장 에디터)
- [Postman](https://www.postman.com/) (API 테스트용)

### 2단계: 프로젝트 클론 및 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd ai-curriculum-builder

# 2. 환경 변수 설정
make env-copy
# 또는 수동으로: cp .env.example .env

# 3. 환경 변수 편집 (.env 파일을 실제 값으로 수정)
# 필수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, 
#       SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY

# 4. 의존성 설치
make install
# 또는 수동으로:
# cd frontend && npm install
# cd ../backend && npm install
```

### 3단계: 개발 서버 실행

**Docker 사용 (권장):**
```bash
# 개발 환경 실행
make dev

# 백그라운드 실행
make dev-d
```

**Docker 없이 실행:**
```bash
# 터미널 1: 백엔드
cd backend && npm run dev

# 터미널 2: 프론트엔드
cd frontend && npm run dev
```

### 4단계: 접속 확인

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:4000
- **API 상태**: http://localhost:4000/health

## 🛠️ 개발 도구

### Makefile 명령어

```bash
# 도움말
make help

# 개발 환경
make dev          # 개발 서버 실행
make dev-d        # 백그라운드 실행
make down         # 서버 중지

# 로그 확인
make logs         # 전체 로그
make logs-frontend # 프론트엔드 로그
make logs-backend  # 백엔드 로그

# 개발 도구
make shell-frontend # 프론트엔드 컨테이너 접속
make shell-backend  # 백엔드 컨테이너 접속

# 코드 품질
make lint         # 린트 검사
make lint-fix     # 린트 자동 수정
make test         # 테스트 실행

# 상태 확인
make status       # 컨테이너 상태
make health       # 서비스 상태
```

### VSCode 설정 (권장)

**.vscode/settings.json**
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

**.vscode/extensions.json**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 🏗️ 프로젝트 구조

```
ai-curriculum-builder/
├── docs/                    # 📚 프로젝트 문서
│   ├── PRD.md              # 제품 요구사항
│   ├── TRD.md              # 기술 요구사항
│   ├── API_DESIGN.md       # API 설계
│   ├── WIREFRAMES.md       # UI/UX 와이어프레임
│   └── ENVIRONMENT.md      # 환경 변수 가이드
│
├── frontend/               # 🎨 Next.js 프론트엔드
│   ├── src/
│   │   ├── app/           # App Router 페이지
│   │   ├── components/    # 재사용 컴포넌트
│   │   │   ├── ui/       # 기본 UI 컴포넌트
│   │   │   ├── layout/   # 레이아웃 컴포넌트
│   │   │   └── curriculum/ # 커리큘럼 컴포넌트
│   │   ├── lib/          # 유틸리티 및 설정
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── store/        # Zustand 상태 관리
│   │   └── types/        # TypeScript 타입
│   └── package.json
│
├── backend/                # ⚙️ Express.js 백엔드
│   ├── src/
│   │   ├── controllers/   # 컨트롤러
│   │   ├── services/      # 비즈니스 로직
│   │   ├── lib/          # 유틸리티 (Supabase, Claude)
│   │   ├── middleware/    # 미들웨어
│   │   ├── routes/       # 라우트 정의
│   │   └── types/        # TypeScript 타입
│   └── package.json
│
├── supabase/              # 🗄️ Supabase 설정
│   ├── migrations/       # 데이터베이스 마이그레이션
│   └── seed.sql         # 샘플 데이터
│
├── docker-compose.yml     # 🐳 프로덕션 Docker 설정
├── docker-compose.dev.yml # 🐳 개발 Docker 설정
├── Makefile              # 🔧 개발 명령어
└── .env.example          # 🔑 환경 변수 템플릿
```

## 🔄 개발 워크플로우

### 1. 기능 개발 프로세스

```bash
# 1. 새 브랜치 생성
git checkout -b feature/새기능명

# 2. 개발 진행
# - 코드 작성
# - 테스트 작성
# - 문서 업데이트

# 3. 코드 품질 검사
make lint
make test

# 4. 커밋 및 푸시
git add .
git commit -m "feat: 새 기능 추가"
git push origin feature/새기능명
```

### 2. 디버깅

**프론트엔드 디버깅:**
```bash
# 개발 도구에서 React DevTools 사용
# VSCode에서 Next.js 디버깅 설정
```

**백엔드 디버깅:**
```bash
# Docker 환경에서 디버깅 포트 9229 노출
# VSCode에서 Node.js 디버깅 설정
```

**로그 확인:**
```bash
# 실시간 로그 모니터링
make logs

# 특정 서비스 로그
make logs-frontend
make logs-backend
```

### 3. 데이터베이스 작업

**Supabase 로컬 개발:**
```bash
# Supabase CLI 설치 (선택사항)
npm install -g supabase

# 로컬 Supabase 시작 (선택사항)
supabase start
```

**마이그레이션:**
```bash
# 마이그레이션 실행
make db-migrate

# 샘플 데이터 삽입
make db-seed
```

## 🧪 테스트

### 프론트엔드 테스트

```bash
cd frontend

# 유닛 테스트
npm test

# 테스트 watch 모드
npm run test:watch

# E2E 테스트 (향후 추가)
npm run test:e2e
```

### 백엔드 테스트

```bash
cd backend

# 유닛 테스트
npm test

# 테스트 watch 모드
npm run test:watch

# API 테스트
npm run test:api
```

## 🚨 문제 해결

### 자주 발생하는 문제들

#### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :4000

# 프로세스 종료
kill -9 <PID>
```

#### 2. Docker 문제
```bash
# 컨테이너 초기화
make clean

# 모든 Docker 리소스 정리 (주의)
make clean-all

# Docker 데몬 재시작
# macOS: Docker Desktop 재시작
# Linux: sudo systemctl restart docker
```

#### 3. 의존성 문제
```bash
# node_modules 초기화
rm -rf frontend/node_modules backend/node_modules
make install

# 캐시 정리
npm cache clean --force
```

#### 4. 환경 변수 문제
```bash
# 환경 변수 확인
printenv | grep -E "(SUPABASE|ANTHROPIC|NEXT_PUBLIC)"

# .env 파일 확인
cat .env
```

### 로그 분석

**에러 로그 위치:**
- 프론트엔드: 브라우저 콘솔
- 백엔드: `backend/logs/` 디렉토리
- Docker: `docker logs <container-name>`

**로그 레벨:**
- `error`: 심각한 오류
- `warn`: 경고
- `info`: 일반 정보
- `debug`: 디버그 정보 (개발 환경에서만)

## 📊 성능 모니터링

### 개발 환경 모니터링

```bash
# 메모리 및 CPU 사용량
docker stats

# 네트워크 요청 모니터링
# 브라우저 개발자 도구 > Network 탭

# 백엔드 성능 프로파일링
# Node.js --inspect 플래그 사용
```

### 성능 최적화 팁

1. **프론트엔드:**
   - React DevTools Profiler 사용
   - Lighthouse 성능 측정
   - Bundle Analyzer로 번들 크기 분석

2. **백엔드:**
   - API 응답 시간 모니터링
   - 데이터베이스 쿼리 최적화
   - 메모리 사용량 확인

## 🔐 보안 고려사항

### 개발 환경 보안

1. **환경 변수 관리:**
   - `.env` 파일을 Git에 커밋하지 않기
   - API 키 로테이션 주기적 실행

2. **의존성 보안:**
   ```bash
   # 보안 취약점 검사
   npm audit
   
   # 자동 수정
   npm audit fix
   ```

3. **CORS 설정:**
   - 개발 환경에서만 localhost 허용
   - 프로덕션에서는 특정 도메인만 허용

## 📚 추가 리소스

### 공식 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Express.js 문서](https://expressjs.com/)
- [Supabase 문서](https://supabase.com/docs)
- [Anthropic API 문서](https://docs.anthropic.com/)

### 개발 도구
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) (VSCode API 클라이언트)

### 커뮤니티
- [Next.js 커뮤니티](https://github.com/vercel/next.js/discussions)
- [Supabase 커뮤니티](https://github.com/supabase/supabase/discussions)

---

**💡 팁:** 개발 중 문제가 발생하면 먼저 로그를 확인하고, 이 가이드의 문제 해결 섹션을 참조하세요. 그래도 해결되지 않으면 프로젝트 Issues를 통해 문의해 주세요.