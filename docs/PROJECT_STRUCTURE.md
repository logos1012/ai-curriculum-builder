# AI 강의 커리큘럼 작성 웹앱 - 프로젝트 구조

## 📁 전체 프로젝트 구조

```
ai-curriculum-builder/
├── docs/                           # 프로젝트 문서
│   ├── PRD.md                      # 제품 요구사항 정의서
│   ├── TRD.md                      # 기술 요구사항 문서
│   ├── TODOS.md                    # 개발 체크리스트
│   ├── RULES.md                    # 프로젝트 관리 규칙
│   └── PROJECT_STRUCTURE.md        # 이 파일
├── frontend/                       # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/                    # App Router (Next.js 14)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── curriculum/
│   │   │   └── auth/
│   │   ├── components/             # 재사용 가능한 컴포넌트
│   │   │   ├── ui/                 # 기본 UI 컴포넌트
│   │   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── curriculum/         # 커리큘럼 관련 컴포넌트
│   │   │   └── chat/               # 채팅 관련 컴포넌트
│   │   ├── lib/                    # 유틸리티 및 설정
│   │   │   ├── supabase.ts         # Supabase 클라이언트
│   │   │   ├── claude.ts           # Claude API 클라이언트
│   │   │   └── utils.ts            # 공통 유틸리티
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── store/                  # Zustand 상태 관리
│   │   └── types/                  # TypeScript 타입 정의
│   ├── public/                     # 정적 파일
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── backend/                        # Node.js/Express 백엔드
│   ├── src/
│   │   ├── controllers/            # API 컨트롤러
│   │   │   ├── auth.controller.ts
│   │   │   ├── curriculum.controller.ts
│   │   │   └── claude.controller.ts
│   │   ├── services/               # 비즈니스 로직
│   │   │   ├── auth.service.ts
│   │   │   ├── curriculum.service.ts
│   │   │   └── claude.service.ts
│   │   ├── middleware/             # 미들웨어
│   │   │   ├── auth.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/                 # API 라우트
│   │   │   ├── auth.routes.ts
│   │   │   ├── curriculum.routes.ts
│   │   │   └── claude.routes.ts
│   │   ├── lib/                    # 라이브러리 및 설정
│   │   │   ├── supabase.ts
│   │   │   └── claude.ts
│   │   ├── types/                  # 타입 정의
│   │   └── app.ts                  # Express 앱 설정
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── supabase/                       # Supabase 설정
│   ├── migrations/                 # 데이터베이스 마이그레이션
│   ├── seed.sql                    # 초기 데이터
│   └── config.toml                 # Supabase 설정
├── docker-compose.yml              # Docker Compose 설정
├── .env.example                    # 환경 변수 예시
├── .gitignore
└── README.md                       # 프로젝트 설치 및 실행 가이드
```

## 🛠️ 기술 스택 (TRD.md 기준)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Fetch API / Axios
- **Real-time**: Supabase Realtime

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI API**: Anthropic Claude API (Sonnet 4.0)

### Infrastructure
- **Database**: Supabase (PostgreSQL + Real-time + Auth)
- **Container**: Docker & Docker Compose
- **Development**: 로컬 Docker 환경

## 📦 주요 패키지 및 의존성

### Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@anthropic-ai/sdk": "^0.6.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@anthropic-ai/sdk": "^0.6.0",
    "cors": "^2.8.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "joi": "^17.0.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0"
  }
}
```

## 🗂️ 디렉토리 세부 설명

### Frontend 구조
- **`src/app/`**: Next.js 14 App Router 기반 페이지 및 레이아웃
- **`src/components/`**: 재사용 가능한 React 컴포넌트
- **`src/lib/`**: Supabase, Claude API 클라이언트 설정
- **`src/hooks/`**: 커스텀 React 훅
- **`src/store/`**: Zustand 전역 상태 관리
- **`src/types/`**: TypeScript 인터페이스 및 타입 정의

### Backend 구조
- **`src/controllers/`**: HTTP 요청 처리 로직
- **`src/services/`**: 비즈니스 로직 및 외부 API 연동
- **`src/middleware/`**: Express 미들웨어 (인증, CORS, 에러 처리)
- **`src/routes/`**: API 라우트 정의
- **`src/lib/`**: 외부 라이브러리 설정 및 초기화

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- Docker & Docker Compose
- Supabase 계정
- Anthropic API 키

### 환경 변수
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

## 🚀 실행 명령어

### 개발 환경 (Docker)
```bash
# 전체 스택 실행
docker-compose up -d

# 프론트엔드만 실행
docker-compose up frontend

# 백엔드만 실행
docker-compose up backend

# 로그 확인
docker-compose logs -f
```

### 로컬 개발
```bash
# 프론트엔드
cd frontend && npm run dev

# 백엔드
cd backend && npm run dev
```

---

**참고**: 이 구조는 PRD.md와 TRD.md에 정의된 요구사항을 기반으로 설계되었습니다.