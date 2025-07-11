# AI 강의 커리큘럼 작성 웹앱 - UI/UX 와이어프레임

## 📐 디자인 시스템

### 컬러 팔레트
```css
/* Primary Colors */
--primary-blue: #2563eb;
--primary-blue-dark: #1d4ed8;
--primary-blue-light: #3b82f6;

/* Secondary Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-900: #111827;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #06b6d4;
```

### 타이포그래피
```css
/* Headings */
h1: 2.25rem (36px) - font-bold
h2: 1.875rem (30px) - font-semibold
h3: 1.5rem (24px) - font-semibold
h4: 1.25rem (20px) - font-medium

/* Body Text */
body: 1rem (16px) - font-normal
small: 0.875rem (14px) - font-normal
caption: 0.75rem (12px) - font-normal
```

---

## 🏠 1. 메인 페이지 (랜딩)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] AI 강의 커리큘럼 작성 도구                      [로그인] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               AI 강의 커리큘럼 작성 도구                      │
│         프리랜서 강사를 위한 AI 기반 맞춤형 커리큘럼            │
│                                                             │
│       대화형 AI와 함께 다양한 대상에게 맞는 AI 교육            │
│           커리큘럼을 쉽고 빠르게 만들어보세요                  │
│                                                             │
│           [시작하기]  [자세히 보기]                          │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 대화형 생성   │ │ 실시간 편집   │ │ 맞춤형 특화   │           │
│  │ AI와의 질문-  │ │ 작성 과정이   │ │ AI 도구 활용법 │           │
│  │ 답변을 통해   │ │ 실시간으로    │ │ 에 특화된     │           │
│  │ 정교한 설계   │ │ 렌더링되는    │ │ 교육 콘텐츠   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 2. 대시보드 페이지 (카드 뷰)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] AI 커리큘럼 작성 도구  [알림] [프로필 ▼] [로그아웃]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  커리큘럼 대시보드                      [새 커리큘럼 만들기]     │
│                                                             │
│  [검색창........................] [필터 ▼] [정렬 ▼]            │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ 📚 주부를 위한  │ │ 🎓 학생을 위한  │ │ 💼 직장인을 위한│     │
│  │ AI 활용법      │ │ AI 학습 도구   │ │ AI 업무 자동화 │     │
│  │               │ │               │ │               │     │
│  │ 대상: 주부      │ │ 대상: 대학생    │ │ 대상: 직장인    │     │
│  │ 기간: 4주      │ │ 기간: 6주      │ │ 기간: 8주      │     │
│  │ 형식: 온라인    │ │ 형식: 혼합형    │ │ 형식: 온라인    │     │
│  │               │ │               │ │               │     │
│  │ 일상생활에서   │ │ 학습 효율을    │ │ 업무 프로세스  │     │
│  │ 활용할 수 있는 │ │ 높이는 다양한  │ │ 자동화를 통한  │     │
│  │ AI 도구들...   │ │ AI 도구들...   │ │ 생산성 향상... │     │
│  │               │ │               │ │               │     │
│  │ [편집] [복제]  │ │ [편집] [복제]  │ │ [편집] [복제]  │     │
│  │      [삭제]    │ │      [삭제]    │ │      [삭제]    │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │      +        │ │ 📖 AI 윤리    │ │ 🚀 창업자를   │     │
│  │ 새로운 커리큘럼│ │ 기초 강의     │ │ 위한 AI 도구  │     │
│  │ 을 만들어보세요│ │               │ │               │     │
│  │               │ │ 대상: 일반인    │ │ 대상: 창업자    │     │
│  │  [시작하기]    │ │ 기간: 2주      │ │ 기간: 12주     │     │
│  │               │ │ 형식: 온라인    │ │ 형식: 혼합형    │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✏️ 3. 커리큘럼 빌더 페이지 (이중 패널)

```
┌─────────────────────────────────────────────────────────────┐
│ [← 대시보드] 새 커리큘럼 작성                      [💾 저장]   │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│     💬 AI 대화 패널       │        📄 실시간 프리뷰           │
│                          │                                  │
│ ┌────────────────────────┐│ ┌──────────────────────────────┐ │
│ │ 🤖 AI: 안녕하세요!      ││ │ # 주부를 위한 AI 활용법        │ │
│ │ 어떤 대상을 위한       ││ │                              │ │
│ │ 커리큘럼을 만드시나요?  ││ │ ## 📋 강의 개요              │ │
│ │                       ││ │ - 대상: 주부                  │ │
│ │ 👤 사용자: 주부들을     ││ │ - 기간: 4주                  │ │
│ │ 위한 AI 활용법을       ││ │ - 형식: 온라인               │ │
│ │ 가르치고 싶습니다      ││ │                              │ │
│ │                       ││ │ ## 🎯 학습 목표              │ │
│ │ 🤖 AI: 좋은 주제네요!   ││ │ 1. ChatGPT 활용한 요리 레시피 │ │
│ │ 몇 주 과정으로         ││ │ 2. AI 이미지 생성으로 SNS 콘텐츠│ │
│ │ 진행하실 계획인가요?    ││ │ 3. AI 번역 도구 해외 쇼핑     │ │
│ │                       ││ │ 4. 가계부 관리 AI 도구        │ │
│ │ 👤 사용자: 4주 정도요   ││ │                              │ │
│ │                       ││ │ ## 📚 커리큘럼 구성           │ │
│ │ 🤖 AI: 4주 과정으로    ││ │                              │ │
│ │ 구성해드리겠습니다...   ││ │ ### 1주차: AI 기초 이해      │ │
│ └────────────────────────┘│ │ - AI란 무엇인가?             │ │
│                          │ │ - 일상 속 AI 사례            │ │
│ [메시지를 입력하세요...  ]│ │ - ChatGPT 첫 사용법          │ │
│                    [전송] │ │                              │ │
│                          │ │ ### 2주차: 실용 AI 도구      │ │
│ 💡 제안 질문들:           │ │ - 요리 레시피 작성           │ │
│ • 어떤 AI 도구를 주로    │ │ - 이미지 생성 도구           │ │
│   다룰 예정인가요?       │ │ - 번역 도구 활용법           │ │
│ • 온라인인가요 오프라인인가요? │ │                              │ │
│ • 실습 위주인가요 이론 위주인가요? │ │ [편집 모드] [구조 편집]        │ │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 📝 4. 편집 모드 (부분 편집)

```
┌─────────────────────────────────────────────────────────────┐
│ [← 뒤로] 주부를 위한 AI 활용법 편집               [💾 저장]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 편집 모드: [💬 채팅] [✏️ 직접편집] [🔄 혼합]              │
│                                                             │
│ ┌─ 1주차: AI 기초 이해 ─────────────────────────────────┐   │
│ │                                              [✏️ 편집] │   │
│ │ • AI란 무엇인가? (30분)                              │   │
│ │   - 인공지능의 기본 개념                              │   │
│ │   - 우리 생활 속 AI 사례들                           │   │
│ │                                                      │   │
│ │ • ChatGPT 첫 사용법 (45분)                          │   │
│ │   - 회원가입 및 기본 설정                            │   │
│ │   - 효과적인 질문 작성법                             │   │
│ │   - 실습: 간단한 요리 레시피 문의하기                 │   │
│ │                                                      │   │
│ │ • 과제: ChatGPT로 이번 주 식단 계획하기              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ 2주차: 실용 AI 도구 ─────────────────────────────────┐   │
│ │                                              [✏️ 편집] │   │
│ │ • AI 이미지 생성 도구 (60분)                         │   │
│ │   - Canva AI 기능 소개                              │   │
│ │   - 간단한 SNS 게시물 만들기                         │   │
│ │   - 실습: 가족 사진으로 생일 초대장 만들기            │   │
│ │                                                      │   │
│ │ • AI 번역 도구 활용 (45분)                          │   │
│ │   - Google 번역 고급 기능                           │   │
│ │   - 해외 쇼핑몰 제품 정보 번역                       │   │
│ │   - 실습: 아마존 제품 리뷰 번역하기                  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ [+ 새 주차 추가] [📋 구조 재배치] [🤖 AI 개선 요청]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 5. 모바일 레이아웃 (반응형)

### 5.1 모바일 대시보드
```
┌─────────────────────┐
│ ☰ [Logo] 커리큘럼    │
├─────────────────────┤
│                     │
│ [검색창..........] │
│ [필터 ▼] [정렬 ▼]   │
│                     │
│ ┌─────────────────┐ │
│ │ 📚 주부를 위한   │ │
│ │ AI 활용법       │ │
│ │                 │ │
│ │ 대상: 주부       │ │
│ │ 기간: 4주       │ │
│ │ 형식: 온라인     │ │
│ │                 │ │
│ │ 일상생활에서    │ │
│ │ 활용할 수 있는  │ │
│ │ AI 도구들...    │ │
│ │                 │ │
│ │ [편집] [복제] [삭제] │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 🎓 학생을 위한   │ │
│ │ AI 학습 도구    │ │
│ │ ...             │ │
│ └─────────────────┘ │
│                     │
│ [+ 새 커리큘럼 만들기] │
│                     │
└─────────────────────┘
```

### 5.2 모바일 커리큘럼 빌더 (탭 전환)
```
┌─────────────────────┐
│ [← 뒤로] 새 커리큘럼 │
├─────────────────────┤
│ [💬 채팅] [📄 프리뷰] │
├─────────────────────┤
│                     │
│ 💬 AI 대화          │
│                     │
│ ┌─────────────────┐ │
│ │ 🤖 AI: 안녕하세요! │ │
│ │ 어떤 대상을 위한 │ │
│ │ 커리큘럼을 만드시나요? │
│ │                 │ │
│ │ 👤 사용자: 주부들을 │ │
│ │ 위한 AI 활용법을 │ │
│ │ 가르치고 싶습니다 │ │
│ │                 │ │
│ │ 🤖 AI: 좋은 주제네요! │
│ │ 몇 주 과정으로   │ │
│ │ 진행하실 계획인가요? │
│ └─────────────────┘ │
│                     │
│ [메시지 입력........] │
│               [전송] │
│                     │
│ 💡 제안 질문:        │
│ • 어떤 AI 도구를 주로 │
│   다룰 예정인가요?   │
│ • 온라인인가요?      │
│ • 실습 위주인가요?   │
│                     │
└─────────────────────┘
```

---

## 🎨 6. 컴포넌트 라이브러리

### 6.1 버튼 컴포넌트
```css
/* Primary Button */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
}
```

### 6.2 카드 컴포넌트
```css
.curriculum-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.curriculum-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### 6.3 채팅 메시지 컴포넌트
```css
.chat-message-user {
  background: #2563eb;
  color: white;
  border-radius: 1rem 1rem 0.25rem 1rem;
  padding: 0.75rem 1rem;
  margin-left: 2rem;
  align-self: flex-end;
}

.chat-message-ai {
  background: #f3f4f6;
  color: #374151;
  border-radius: 1rem 1rem 1rem 0.25rem;
  padding: 0.75rem 1rem;
  margin-right: 2rem;
  align-self: flex-start;
}
```

---

## 📐 7. 레이아웃 가이드라인

### 7.1 그리드 시스템
- **데스크톱**: 12컬럼 그리드 (최대 1200px)
- **태블릿**: 8컬럼 그리드 (768px-1023px)
- **모바일**: 4컬럼 그리드 (320px-767px)

### 7.2 간격 시스템
```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 7.3 반응형 브레이크포인트
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## ♿ 8. 접근성 고려사항

### 8.1 키보드 네비게이션
- 모든 인터랙티브 요소는 키보드로 접근 가능
- Tab 순서는 논리적 순서를 따름
- 포커스 표시는 명확하게 구분

### 8.2 스크린 리더 지원
```html
<!-- ARIA 라벨 예시 -->
<button aria-label="새 커리큘럼 만들기">+</button>
<div role="tabpanel" aria-labelledby="chat-tab">...</div>
<input aria-describedby="search-help" placeholder="커리큘럼 검색">
```

### 8.3 색상 대비
- 텍스트와 배경의 대비율 4.5:1 이상 유지
- 색상만으로 정보를 전달하지 않음
- 다크모드 지원 고려

---

이 와이어프레임은 PRD.md의 요구사항과 TRD.md의 기술 스펙을 기반으로 설계되었으며, 사용자 경험을 최우선으로 고려했습니다.