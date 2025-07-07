# AI 강의 커리큘럼 작성 웹앱

프리랜서 강사가 다양한 대상에게 AI 교육 커리큘럼을 맞춤형으로 작성할 수 있도록 도와주는 대화형 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- Docker & Docker Compose
- Supabase 계정
- Anthropic API 키

### 설치 및 실행

#### 🚀 빠른 시작 (Docker 권장)

1. **저장소 클론**
```bash
git clone <repository-url>
cd ai-curriculum-builder
```

2. **초기 설정**
```bash
make setup
# 또는 수동으로:
# cp .env.example .env
# cd frontend && npm install
# cd ../backend && npm install
```

3. **환경 변수 설정**
`.env` 파일을 편집하여 실제 값으로 수정:
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Claude API 설정
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. **개발 환경 실행**
```bash
make dev
# 또는
docker-compose -f docker-compose.dev.yml up --build
```

5. **애플리케이션 접속**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health Check: http://localhost:4000/health

#### 🛠️ 로컬 개발 (Docker 없이)

```bash
# 프론트엔드
cd frontend && npm run dev

# 백엔드 (별도 터미널)
cd backend && npm run dev
```

## 🔧 개발 명령어

프로젝트는 Makefile을 통해 편리한 개발 명령어를 제공합니다:

```bash
# 도움말
make help

# 개발 환경
make dev          # 개발 환경 실행 (핫 리로딩)
make dev-d        # 백그라운드 실행

# 컨테이너 관리
make up           # 프로덕션 환경 실행
make down         # 컨테이너 중지 및 제거
make restart      # 재시작

# 로그 확인
make logs         # 전체 로그
make logs-frontend # 프론트엔드 로그
make logs-backend  # 백엔드 로그

# 개발 도구
make shell-frontend # 프론트엔드 컨테이너 접속
make shell-backend  # 백엔드 컨테이너 접속

# 테스트 및 코드 품질
make test         # 전체 테스트
make lint         # 코드 린트 검사
make lint-fix     # 린트 자동 수정

# 상태 확인
make status       # 컨테이너 상태
make health       # 서비스 헬스 체크
```

## 📁 프로젝트 구조

```
ai-curriculum-builder/
├── docs/                    # 프로젝트 문서
├── frontend/                # Next.js 프론트엔드
├── backend/                 # Node.js/Express 백엔드
├── supabase/               # Supabase 설정
├── docker-compose.yml      # Docker 구성
└── README.md               # 이 파일
```

## 🛠️ 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- Supabase (인증 & 실시간)

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (데이터베이스)
- Claude API (AI)

### Infrastructure
- Docker & Docker Compose
- Supabase (PostgreSQL + Real-time + Auth)

## 📖 문서

프로젝트 관련 상세 문서는 `docs/` 디렉토리에서 확인할 수 있습니다:

- [PRD.md](./docs/PRD.md) - 제품 요구사항 정의서
- [TRD.md](./docs/TRD.md) - 기술 요구사항 문서
- [TODOS.md](./docs/TODOS.md) - 개발 체크리스트
- [RULES.md](./docs/RULES.md) - 프로젝트 관리 규칙
- [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - 프로젝트 구조

## 🔧 개발

### 로컬 개발 (Docker 없이)

**프론트엔드:**
```bash
cd frontend
npm install
npm run dev
```

**백엔드:**
```bash
cd backend
npm install
npm run dev
```

### Docker 개발

```bash
# 전체 스택 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up frontend
docker-compose up backend

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down
```

## 🤝 기여

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](../../issues)를 통해 문의해 주세요.