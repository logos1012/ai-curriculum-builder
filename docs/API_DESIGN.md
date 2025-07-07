# AI 강의 커리큘럼 작성 웹앱 - API 설계 문서

## 📋 API 개요

### Base URL
- **개발환경**: `http://localhost:4000/api`
- **프로덕션**: `https://api.curriculum-builder.com/api` (향후)

### 인증 방식
- **Supabase Auth**: JWT 토큰 기반 인증
- **Header**: `Authorization: Bearer <jwt_token>`

### 공통 응답 형식
```typescript
// 성공 응답
{
  "success": true,
  "data": T,
  "message": string,
  "timestamp": string
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "timestamp": string
}

// 페이지네이션 응답
{
  "success": true,
  "data": T[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  },
  "timestamp": string
}
```

---

## 🔐 1. 인증 API

### 1.1 로그인 상태 확인
```http
GET /api/auth/session
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "사용자 이름",
      "created_at": "2024-07-07T00:00:00Z"
    },
    "session": {
      "access_token": "jwt_token",
      "expires_at": "2024-07-07T01:00:00Z"
    }
  }
}
```

### 1.2 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

## 📚 2. 커리큘럼 API

### 2.1 커리큘럼 목록 조회
```http
GET /api/curriculum?page=1&limit=10&search=keyword&type=online&target_audience=주부&sort=created_at&order=desc
Authorization: Bearer <jwt_token>
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10, 최대: 50)
- `search`: 검색 키워드 (제목 또는 내용)
- `type`: 강의 형식 (`online`, `offline`, `hybrid`)
- `target_audience`: 대상 (주부, 학생, 직장인 등)
- `sort`: 정렬 기준 (`created_at`, `updated_at`, `title`)
- `order`: 정렬 순서 (`asc`, `desc`)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "주부를 위한 AI 활용법",
      "target_audience": "주부",
      "duration": "4주",
      "type": "online",
      "content": {
        "summary": "일상생활에서 활용할 수 있는 AI 도구들...",
        "objectives": ["ChatGPT 활용", "이미지 생성"],
        "chapters": [...]
      },
      "metadata": {
        "difficulty": "beginner",
        "tools": ["ChatGPT", "Canva"]
      },
      "created_at": "2024-07-07T00:00:00Z",
      "updated_at": "2024-07-07T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2.2 특정 커리큘럼 조회
```http
GET /api/curriculum/:id
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "주부를 위한 AI 활용법",
    "target_audience": "주부",
    "duration": "4주",
    "type": "online",
    "content": {
      "summary": "일상생활에서 활용할 수 있는 AI 도구들을 소개하고...",
      "objectives": [
        "ChatGPT를 활용한 요리 레시피 작성",
        "AI 이미지 생성 도구로 SNS 콘텐츠 제작"
      ],
      "chapters": [
        {
          "id": "ch1",
          "title": "AI 기초 이해하기",
          "description": "AI가 무엇인지, 일상에서 어떻게 활용할 수 있는지 알아봅니다.",
          "duration": "1주",
          "sections": [
            {
              "id": "s1",
              "title": "AI란 무엇인가?",
              "content": "AI의 기본 개념과 우리 생활 속 AI 사례를 살펴봅니다.",
              "type": "lecture",
              "duration": "30분"
            }
          ]
        }
      ],
      "resources": [
        {
          "id": "r1",
          "title": "ChatGPT 공식 가이드",
          "type": "link",
          "url": "https://openai.com/chatgpt",
          "description": "ChatGPT 사용법 공식 문서"
        }
      ]
    },
    "metadata": {
      "difficulty": "beginner",
      "prerequisites": ["기본적인 스마트폰 사용법"],
      "tools": ["ChatGPT", "Google Translate", "Canva"],
      "estimatedCost": 0,
      "language": "ko"
    },
    "created_at": "2024-07-07T00:00:00Z",
    "updated_at": "2024-07-07T00:00:00Z"
  }
}
```

### 2.3 새 커리큘럼 생성
```http
POST /api/curriculum
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "title": "주부를 위한 AI 활용법",
  "target_audience": "주부",
  "duration": "4주",
  "type": "online",
  "content": {
    "summary": "일상생활에서 활용할 수 있는 AI 도구들을 소개하고...",
    "objectives": ["ChatGPT 활용", "이미지 생성"],
    "chapters": []
  },
  "metadata": {
    "difficulty": "beginner",
    "prerequisites": ["기본적인 스마트폰 사용법"],
    "tools": ["ChatGPT"],
    "estimatedCost": 0,
    "language": "ko"
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "주부를 위한 AI 활용법",
    "target_audience": "주부",
    "duration": "4주",
    "type": "online",
    "content": {...},
    "metadata": {...},
    "created_at": "2024-07-07T00:00:00Z",
    "updated_at": "2024-07-07T00:00:00Z"
  },
  "message": "커리큘럼이 성공적으로 생성되었습니다."
}
```

### 2.4 커리큘럼 수정
```http
PUT /api/curriculum/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "title": "수정된 제목",
  "content": {
    "summary": "수정된 요약",
    "chapters": [...]
  }
}
```

### 2.5 커리큘럼 삭제
```http
DELETE /api/curriculum/:id
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "message": "커리큘럼이 삭제되었습니다."
}
```

### 2.6 커리큘럼 복제
```http
POST /api/curriculum/:id/duplicate
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "new_uuid",
    "title": "주부를 위한 AI 활용법 (복사본)",
    "target_audience": "주부",
    ...
  },
  "message": "커리큘럼이 복제되었습니다."
}
```

---

## 🤖 3. Claude AI API

### 3.1 일반 대화
```http
POST /api/claude/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "message": "주부들을 위한 AI 교육 커리큘럼을 만들고 싶습니다.",
  "context": {
    "targetAudience": "주부",
    "duration": "4주",
    "type": "online",
    "currentContent": "",
    "chatHistory": [
      {
        "role": "user",
        "content": "안녕하세요"
      },
      {
        "role": "assistant", 
        "content": "안녕하세요! 어떤 커리큘럼을 만들어드릴까요?"
      }
    ]
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "message": "주부분들을 위한 AI 교육 커리큘럼을 만들어드리겠습니다. 먼저 몇 가지 질문을 드려도 될까요?\n\n1. 주로 어떤 AI 도구를 다루고 싶으신가요?\n2. 실습 위주인가요, 이론 위주인가요?\n3. 온라인 강의인가요?",
    "suggestions": [
      "어떤 AI 도구를 주로 다룰 예정인가요?",
      "온라인인가요 오프라인인가요?",
      "실습 위주인가요 이론 위주인가요?"
    ]
  }
}
```

### 3.2 스트리밍 대화
```http
POST /api/claude/stream
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:** (3.1과 동일)

**응답:** (Server-Sent Events)
```
data: {"type": "start", "message": "응답을 생성 중입니다..."}

data: {"type": "chunk", "content": "주부분들을 위한 "}

data: {"type": "chunk", "content": "AI 교육 커리큘럼을 "}

data: {"type": "chunk", "content": "만들어드리겠습니다."}

data: {"type": "end", "suggestions": ["질문1", "질문2"]}
```

### 3.3 콘텐츠 개선
```http
POST /api/claude/enhance
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "content": "# 1주차: AI 기초\n- AI란 무엇인가?\n- ChatGPT 사용법",
  "context": {
    "targetAudience": "주부",
    "duration": "4주",
    "type": "online"
  },
  "enhanceType": "detail" // "detail", "structure", "practical"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "enhancedContent": "# 1주차: AI 기초 이해하기 (4시간)\n\n## 📋 학습 목표\n- AI의 기본 개념을 이해하고 일상 속 AI 사례를 찾을 수 있다\n- ChatGPT의 기본 사용법을 익히고 실생활에 활용할 수 있다\n\n## 📚 세부 내용\n\n### 1교시: AI란 무엇인가? (60분)\n- **이론** (30분): 인공지능의 정의와 역사\n  - AI vs 머신러닝 vs 딥러닝 차이점\n  - 우리 주변의 AI: 네비게이션, 추천 시스템, 번역기\n- **실습** (30분): AI 체험해보기\n  - Google 어시스턴트로 일정 관리하기\n  - 네이버 파파고로 요리 레시피 번역하기\n\n### 2교시: ChatGPT 첫 만남 (90분)\n- **이론** (30분): ChatGPT란 무엇인가?\n  - 대화형 AI의 특징\n  - 가능한 것과 한계점\n- **실습** (60분): ChatGPT 사용해보기\n  - 회원가입 및 기본 설정\n  - 효과적인 질문 작성 방법\n  - 실습 과제: 이번 주 식단 계획 세우기\n\n### 3교시: 실생활 AI 도구 탐색 (90분)\n- **그룹 활동** (45분): AI 도구 체험 부스\n  - 부스 1: 음성 인식 (시리, 빅스비)\n  - 부스 2: 이미지 검색 (Google Lens)\n  - 부스 3: 자동 번역 (Google 번역)\n- **발표 및 토론** (45분)\n  - 각 부스별 체험 결과 발표\n  - 일상에서 활용 가능한 아이디어 나누기\n\n## 📝 과제\n- ChatGPT를 이용해 다음 주 가족 식단 계획하기 (사진으로 제출)\n- 주변에서 발견한 AI 기술 3가지 찾아와서 간단히 설명하기\n\n## 📚 참고 자료\n- [ChatGPT 공식 가이드](https://openai.com/chatgpt)\n- [AI 초보자를 위한 용어 정리집](링크)\n- [주부들이 자주 묻는 AI 질문 FAQ](링크)",
    "improvements": [
      "구체적인 시간 배분 추가",
      "실습과 이론의 균형있는 구성",
      "참여형 활동 포함",
      "실용적인 과제 제시"
    ]
  }
}
```

### 3.4 구체화 질문 생성
```http
POST /api/claude/questions
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "context": {
    "targetAudience": "주부",
    "duration": "4주",
    "type": "online",
    "currentContent": "AI 기초 강의",
    "chatHistory": [...]
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "questions": [
      "주부분들이 가장 관심있어하는 AI 활용 영역은 무엇인가요? (요리, 육아, 가사관리, 부업 등)",
      "온라인 강의에서 실습할 때 어떤 기기를 주로 사용하실 예정인가요? (스마트폰, 노트북, 태블릿)",
      "AI 도구 사용에 대한 수강생들의 기본 지식 수준은 어느 정도인가요?"
    ],
    "categories": [
      {
        "name": "대상자 특성",
        "questions": ["주부분들이 가장 관심있어하는 AI 활용 영역은 무엇인가요?"]
      },
      {
        "name": "기술 환경",
        "questions": ["온라인 강의에서 실습할 때 어떤 기기를 주로 사용하실 예정인가요?"]
      },
      {
        "name": "수준 평가",
        "questions": ["AI 도구 사용에 대한 수강생들의 기본 지식 수준은 어느 정도인가요?"]
      }
    ]
  }
}
```

---

## 💬 4. 채팅 히스토리 API

### 4.1 채팅 히스토리 조회
```http
GET /api/curriculum/:curriculum_id/chat
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "curriculum_id": "uuid",
      "role": "user",
      "content": "주부들을 위한 AI 교육 커리큘럼을 만들고 싶습니다.",
      "created_at": "2024-07-07T00:00:00Z"
    },
    {
      "id": "uuid",
      "curriculum_id": "uuid", 
      "role": "assistant",
      "content": "좋은 아이디어네요! 몇 가지 질문을 드려도 될까요?",
      "created_at": "2024-07-07T00:01:00Z"
    }
  ]
}
```

### 4.2 채팅 메시지 저장
```http
POST /api/curriculum/:curriculum_id/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**요청 바디:**
```json
{
  "role": "user",
  "content": "4주 과정으로 만들고 싶습니다."
}
```

### 4.3 채팅 히스토리 삭제
```http
DELETE /api/curriculum/:curriculum_id/chat
Authorization: Bearer <jwt_token>
```

---

## 📋 5. 버전 관리 API

### 5.1 버전 목록 조회
```http
GET /api/curriculum/:curriculum_id/versions
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "curriculum_id": "uuid",
      "version_number": 3,
      "content": {...},
      "created_at": "2024-07-07T02:00:00Z"
    },
    {
      "id": "uuid",
      "curriculum_id": "uuid",
      "version_number": 2,
      "content": {...},
      "created_at": "2024-07-07T01:00:00Z"
    }
  ]
}
```

### 5.2 특정 버전으로 복원
```http
POST /api/curriculum/:curriculum_id/versions/:version_number/restore
Authorization: Bearer <jwt_token>
```

**응답:**
```json
{
  "success": true,
  "message": "버전 2로 복원되었습니다.",
  "data": {
    "id": "uuid",
    "current_version": 4,
    "restored_from_version": 2
  }
}
```

---

## 🛠️ 6. 시스템 API

### 6.1 헬스 체크
```http
GET /api/health
```

**응답:**
```json
{
  "status": "OK",
  "message": "AI Curriculum Builder Backend is running",
  "timestamp": "2024-07-07T00:00:00Z",
  "version": "1.0.0",
  "dependencies": {
    "supabase": "connected",
    "claude_api": "connected"
  }
}
```

### 6.2 API 문서
```http
GET /api/docs
```

---

## 📝 7. 에러 코드

### 7.1 인증 에러
- `AUTH_TOKEN_MISSING`: 인증 토큰이 없습니다
- `AUTH_TOKEN_INVALID`: 유효하지 않은 토큰입니다
- `AUTH_TOKEN_EXPIRED`: 토큰이 만료되었습니다
- `AUTH_INSUFFICIENT_PERMISSIONS`: 권한이 부족합니다

### 7.2 요청 에러
- `VALIDATION_ERROR`: 요청 데이터 검증 실패
- `RESOURCE_NOT_FOUND`: 리소스를 찾을 수 없습니다
- `RESOURCE_ALREADY_EXISTS`: 이미 존재하는 리소스입니다
- `RESOURCE_CONFLICT`: 리소스 충돌이 발생했습니다

### 7.3 외부 서비스 에러
- `SUPABASE_CONNECTION_ERROR`: Supabase 연결 오류
- `CLAUDE_API_ERROR`: Claude API 오류
- `CLAUDE_API_RATE_LIMIT`: Claude API 요청 한도 초과
- `CLAUDE_API_QUOTA_EXCEEDED`: Claude API 할당량 초과

### 7.4 서버 에러
- `INTERNAL_SERVER_ERROR`: 내부 서버 오류
- `SERVICE_UNAVAILABLE`: 서비스를 사용할 수 없습니다
- `DATABASE_ERROR`: 데이터베이스 오류

---

## 🔒 8. 보안 고려사항

### 8.1 Rate Limiting
```javascript
// 일반 API: 분당 60회
// Claude API: 분당 10회
// 인증 API: 분당 5회
```

### 8.2 요청 크기 제한
```javascript
// JSON 요청: 최대 10MB
// 파일 업로드: 최대 50MB
```

### 8.3 CORS 설정
```javascript
// 허용된 도메인에서만 API 접근 가능
// 개발: localhost:3000
// 프로덕션: curriculum-builder.com
```

---

## 📊 9. 모니터링 및 로깅

### 9.1 로그 형식
```json
{
  "timestamp": "2024-07-07T00:00:00Z",
  "level": "info",
  "method": "POST",
  "path": "/api/curriculum",
  "status": 201,
  "duration": 245,
  "user_id": "uuid",
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### 9.2 메트릭스
- API 응답 시간
- 에러율
- 요청 수
- Claude API 사용량
- 동시 접속자 수

이 API 설계는 TRD.md의 기술 요구사항을 기반으로 하며, RESTful 원칙을 따르고 확장 가능한 구조로 설계되었습니다.