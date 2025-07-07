-- AI 강의 커리큘럼 작성 웹앱 - 초기 데이터
-- 개발 및 테스트용 샘플 데이터

-- 테스트용 사용자 생성 (실제로는 Supabase Auth에서 관리됨)
-- 이 섹션은 로컬 개발환경에서만 사용됩니다.

-- 샘플 커리큘럼 데이터
-- 실제 사용자 ID는 auth.users 테이블에서 가져와야 합니다.

-- 예시 커리큘럼 1: 주부를 위한 AI 활용법
INSERT INTO curriculums (
    id,
    user_id,
    title,
    target_audience,
    duration,
    type,
    content,
    metadata
) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001'::uuid, -- 테스트용 사용자 ID
    '주부를 위한 AI 활용법',
    '주부',
    '4주',
    'online',
    '{
        "summary": "일상생활에서 활용할 수 있는 AI 도구들을 소개하고, 실습을 통해 직접 사용해보는 실용적인 강의입니다.",
        "objectives": [
            "ChatGPT를 활용한 요리 레시피 작성",
            "AI 이미지 생성 도구로 SNS 콘텐츠 제작",
            "AI 번역 도구를 활용한 해외 쇼핑",
            "가계부 관리를 위한 AI 도구 활용"
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
        ]
    }',
    '{
        "difficulty": "beginner",
        "prerequisites": ["기본적인 스마트폰 사용법"],
        "tools": ["ChatGPT", "Google Translate", "Canva"],
        "estimatedCost": 0,
        "language": "ko"
    }'
) ON CONFLICT DO NOTHING;

-- 예시 커리큘럼 2: 학생을 위한 AI 학습 도구
INSERT INTO curriculums (
    id,
    user_id,
    title,
    target_audience,
    duration,
    type,
    content,
    metadata
) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001'::uuid,
    '학생을 위한 AI 학습 도구 마스터하기',
    '대학생',
    '6주',
    'hybrid',
    '{
        "summary": "학습 효율을 높이는 다양한 AI 도구들을 배우고 실제 학습에 적용해보는 과정입니다.",
        "objectives": [
            "AI를 활용한 효과적인 노트 정리 방법",
            "AI 기반 요약 도구로 독서 효율 향상",
            "AI 도구를 활용한 프레젠테이션 제작",
            "AI를 이용한 어학 학습 최적화"
        ],
        "chapters": [
            {
                "id": "ch1",
                "title": "AI 학습 도구 개요",
                "description": "학습에 도움이 되는 AI 도구들을 소개합니다.",
                "duration": "1주",
                "sections": []
            }
        ]
    }',
    '{
        "difficulty": "intermediate",
        "prerequisites": ["기본 컴퓨터 활용 능력"],
        "tools": ["Notion AI", "Grammarly", "Quillbot"],
        "estimatedCost": 15000,
        "language": "ko"
    }'
) ON CONFLICT DO NOTHING;

-- 샘플 채팅 히스토리 (첫 번째 커리큘럼과 연결)
WITH sample_curriculum AS (
    SELECT id FROM curriculums WHERE title = '주부를 위한 AI 활용법' LIMIT 1
)
INSERT INTO chat_histories (curriculum_id, role, content) 
SELECT 
    sample_curriculum.id,
    'user',
    '주부들이 일상에서 쉽게 사용할 수 있는 AI 도구들을 알려주세요.'
FROM sample_curriculum;

WITH sample_curriculum AS (
    SELECT id FROM curriculums WHERE title = '주부를 위한 AI 활용법' LIMIT 1
)
INSERT INTO chat_histories (curriculum_id, role, content) 
SELECT 
    sample_curriculum.id,
    'assistant',
    '주부분들께 특히 유용한 AI 도구들을 소개해드리겠습니다:\n\n1. **ChatGPT**: 요리 레시피 추천, 육아 고민 상담\n2. **Canva AI**: 아이 생일파티 초대장, 가족 사진 편집\n3. **Google 번역**: 해외 온라인 쇼핑시 제품 정보 번역\n4. **Grammarly**: 아이 영어 숙제 도움\n\n각 도구별로 실습해보는 시간을 가져보실까요?'
FROM sample_curriculum;

-- 버전 관리 샘플 데이터
WITH sample_curriculum AS (
    SELECT id, content FROM curriculums WHERE title = '주부를 위한 AI 활용법' LIMIT 1
)
INSERT INTO curriculum_versions (curriculum_id, version_number, content)
SELECT 
    sample_curriculum.id,
    1,
    sample_curriculum.content
FROM sample_curriculum;