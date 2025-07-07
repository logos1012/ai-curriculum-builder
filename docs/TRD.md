# Technical Requirements Document (TRD)
## AI 강의 커리큘럼 작성 웹앱

### 1. 시스템 아키텍처

#### 1.1 전체 아키텍처
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   클라이언트     │────▶│    API 서버      │────▶│    Supabase     │
│  (React/Next)   │     │ (Node/Express)  │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                         
         │                       ▼                         
         │              ┌─────────────────┐               
         └─────────────▶│  Claude API     │               
                        │ (Sonnet 4.0)    │               
                        └─────────────────┘               

              모든 서비스는 Docker Container로 실행
```

#### 1.2 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL + 실시간 기능 + 인증)
- **AI**: Anthropic Claude API (Sonnet 4.0)
- **Container**: Docker & Docker Compose
- **Development**: 로컬 Docker 환경

### 2. 프론트엔드 상세 설계

#### 2.1 컴포넌트 구조
```typescript
// 주요 컴포넌트 계층 구조
App/
├── Layout/
│   ├── Header
│   ├── Sidebar (모바일 햄버거 메뉴)
│   └── MainContent
├── Pages/
│   ├── Dashboard (카드 뷰)
│   ├── CurriculumBuilder
│   │   ├── ChatPanel
│   │   ├── PreviewPanel
│   │   └── ActionBar
│   └── CurriculumDetail
└── Components/
    ├── CurriculumCard
    ├── ChatMessage
    ├── Editor
    └── Modal
```

#### 2.2 상태 관리 (Zustand)
```typescript
interface CurriculumStore {
  // 현재 편집 중인 커리큘럼
  currentCurriculum: Curriculum | null;
  
  // 채팅 히스토리
  chatHistory: ChatMessage[];
  
  // 편집 모드
  editMode: 'chat' | 'direct' | 'hybrid';
  
  // 액션
  updateCurriculum: (data: Partial<Curriculum>) => void;
  addChatMessage: (message: ChatMessage) => void;
  saveCurriculum: () => Promise<void>;
}
```

#### 2.3 실시간 렌더링 구현
```typescript
// 스트리밍 응답 처리
const streamResponse = async (prompt: string) => {
  const response = await fetch('/api/claude/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // 실시간 UI 업데이트
    updatePreview(chunk);
  }
};
```

### 3. 백엔드 상세 설계

#### 3.1 API 엔드포인트
```typescript
// 커리큘럼 관련
POST   /api/curriculum          // 새 커리큘럼 생성
GET    /api/curriculum          // 커리큘럼 목록 조회
GET    /api/curriculum/:id      // 특정 커리큘럼 조회
PUT    /api/curriculum/:id      // 커리큘럼 수정
DELETE /api/curriculum/:id      // 커리큘럼 삭제

// AI 대화 관련
POST   /api/claude/chat         // 일반 대화
POST   /api/claude/stream       // 스트리밍 대화
POST   /api/claude/enhance      // 콘텐츠 개선

// 사용자 세션
POST   /api/auth/login          // 로그인
POST   /api/auth/logout         // 로그아웃
GET    /api/auth/session        // 세션 확인
```

#### 3.2 Supabase 데이터베이스 스키마
```sql
-- Supabase Auth 사용 (기본 제공)
-- auth.users 테이블 활용

-- 커리큘럼 테이블
CREATE TABLE curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  target_audience VARCHAR(255),
  duration VARCHAR(100),
  type VARCHAR(50), -- 'online' or 'offline'
  content JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) 정책
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own curriculums" ON curriculums
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own curriculums" ON curriculums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own curriculums" ON curriculums
  FOR UPDATE USING (auth.uid() = user_id);

-- 채팅 히스토리 테이블
CREATE TABLE chat_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
  role VARCHAR(50), -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 버전 관리 테이블
CREATE TABLE curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 실시간 구독을 위한 설정
ALTER PUBLICATION supabase_realtime ADD TABLE curriculums;
```

#### 3.3 Claude API 통합
```typescript
class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateCurriculum(context: CurriculumContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const response = await this.client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: context.chatHistory,
    });

    return response.content[0].text;
  }

  async askClarifyingQuestion(context: CurriculumContext): Promise<string> {
    // 맥락에 따른 구체적인 질문 생성
    const prompt = `
      현재 커리큘럼 상태를 보고, 더 구체화하기 위한 
      비판적이고 도전적인 질문을 3개 생성해주세요.
      
      현재 상태: ${JSON.stringify(context.currentState)}
    `;

    return this.generateResponse(prompt);
  }
}
```

### 4. 핵심 기능 구현

#### 4.1 실시간 편집 동기화
```typescript
// WebSocket을 통한 실시간 동기화
class RealtimeSync {
  private ws: WebSocket;
  private debounceTimer: NodeJS.Timeout;

  constructor(curriculumId: string) {
    this.ws = new WebSocket(`ws://localhost:3001/sync/${curriculumId}`);
    this.setupListeners();
  }

  onContentChange(content: string) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.ws.send(JSON.stringify({
        type: 'content_update',
        content,
        timestamp: Date.now()
      }));
    }, 500); // 500ms 디바운스
  }
}
```

#### 4.2 부분 편집 기능
```typescript
interface EditableSection {
  id: string;
  type: 'chapter' | 'section' | 'paragraph';
  content: string;
  isEditing: boolean;
}

const handleSectionEdit = async (sectionId: string, newContent: string) => {
  // 1. 해당 섹션만 AI에게 개선 요청
  const enhancedContent = await enhanceSection(sectionId, newContent);
  
  // 2. 전체 구조 유지하며 부분만 업데이트
  updateCurriculumSection(sectionId, enhancedContent);
  
  // 3. 변경사항 저장
  await saveCurriculum();
};
```

#### 4.3 카드형 UI 구현
```tsx
const CurriculumCard: React.FC<{ curriculum: Curriculum }> = ({ curriculum }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{curriculum.title}</h3>
        <span className="text-sm text-gray-500">
          {formatDate(curriculum.updatedAt)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>대상:</strong> {curriculum.targetAudience}</p>
        <p><strong>기간:</strong> {curriculum.duration}</p>
        <p><strong>형식:</strong> {curriculum.type === 'online' ? '온라인' : '오프라인'}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm line-clamp-3">{curriculum.summary}</p>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          편집
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          복제
        </button>
      </div>
    </div>
  );
};
```

### 5. 성능 최적화

#### 5.1 프론트엔드 최적화
- **코드 스플리팅**: Next.js dynamic imports 활용
- **이미지 최적화**: Next/Image 컴포넌트 사용
- **메모이제이션**: React.memo, useMemo, useCallback 적절히 활용
- **가상 스크롤**: 긴 커리큘럼 목록에 react-window 적용

#### 5.2 백엔드 최적화
- **Supabase 캐싱 활용**:
  ```typescript
  // Supabase의 내장 캐싱 및 연결 풀링 활용
  import { createClient } from '@supabase/supabase-js';
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    }
  );
  ```

- **API 응답 압축**: compression 미들웨어 사용
- **Supabase 인덱싱**: 자주 조회되는 필드에 인덱스 추가

### 6. 보안 고려사항

#### 6.1 인증 및 권한
- JWT 토큰 기반 인증
- Rate limiting (express-rate-limit)
- CORS 설정

#### 6.2 데이터 보안
- 입력 값 검증 (Joi/Zod)
- SQL Injection 방지 (Prisma ORM)
- XSS 방지 (DOMPurify)

### 7. 모바일 대응

#### 7.1 반응형 디자인
```css
/* 모바일 브레이크포인트 */
@media (max-width: 768px) {
  .curriculum-builder {
    flex-direction: column;
  }
  
  .chat-panel, .preview-panel {
    width: 100%;
    height: 50vh;
  }
}
```

#### 7.2 터치 인터페이스
- 스와이프 제스처로 패널 전환
- 롱프레스로 컨텍스트 메뉴
- 피치 줌으로 프리뷰 확대/축소

### 8. Docker 로컬 배포

#### 8.1 Docker 구성
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./backend:/app
      - /app/node_modules

networks:
  default:
    name: curriculum-network
```

#### 8.2 개발 환경 모니터링
- **로그 관리**: Docker logs
- **성능 모니터링**: Docker stats
- **디버깅**: Node.js inspect 모드

### 9. 개발 일정

#### Phase 1 (MVP) - 8주
- Week 1-2: 프로젝트 설정 및 Docker 환경 구축
- Week 3-4: Supabase 연동 및 Claude API 통합
- Week 5-6: 실시간 렌더링 및 편집 기능
- Week 7-8: Docker 환경 최적화 및 기본 UI 완성

#### Phase 2 - 4주
- Week 9-10: 고급 편집 기능 및 부분 수정
- Week 11-12: 카드형 UI 및 모바일 최적화

#### Phase 3 - 4주
- Week 13-14: 성능 최적화 및 버그 수정
- Week 15-16: 로컬 배포 환경 안정화 및 문서화