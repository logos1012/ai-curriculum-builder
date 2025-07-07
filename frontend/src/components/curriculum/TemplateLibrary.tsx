'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Badge, Input } from '@/components/ui';
import { useToast } from '@/components/ui';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  duration: string;
  type: 'online' | 'offline' | 'hybrid';
  content: string;
  tags: string[];
  thumbnail?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPopular?: boolean;
  createdBy?: string;
  usageCount?: number;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

export function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const { success } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // 템플릿 데이터 로드
  useEffect(() => {
    loadTemplates();
  }, []);

  // 필터링
  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory, selectedDifficulty]);

  const loadTemplates = () => {
    // 임시 템플릿 데이터
    const mockTemplates: Template[] = [
      {
        id: 'template-1',
        title: '직장인을 위한 AI 활용법',
        description: '업무 효율성을 높이는 AI 도구들을 배우는 실용적인 커리큘럼',
        category: 'business',
        targetAudience: '직장인',
        duration: '4주',
        type: 'online',
        tags: ['업무자동화', 'ChatGPT', '생산성'],
        difficulty: 'beginner',
        isPopular: true,
        usageCount: 152,
        content: `# 직장인을 위한 AI 활용법

## 1주차: AI 도구 개요
- AI가 직장에서 할 수 있는 일들
- 주요 AI 도구 소개
- 윤리적 사용법

## 2주차: 문서 작성 자동화
- ChatGPT로 이메일 작성하기
- 보고서 초안 생성
- 회의록 요약하기

## 3주차: 데이터 분석과 시각화
- AI를 활용한 데이터 분석
- 차트와 그래프 생성
- 인사이트 도출하기

## 4주차: 프레젠테이션과 창의적 작업
- 프레젠테이션 자료 생성
- 아이디어 브레인스토밍
- 마케팅 콘텐츠 제작`
      },
      {
        id: 'template-2',
        title: '학생을 위한 AI 학습 도구',
        description: '학습 효율을 극대화하는 AI 도구 활용법',
        category: 'education',
        targetAudience: '대학생',
        duration: '6주',
        type: 'hybrid',
        tags: ['학습', '연구', 'AI도구'],
        difficulty: 'intermediate',
        usageCount: 89,
        content: `# 학생을 위한 AI 학습 도구

## 1주차: AI 학습의 기초
- AI 학습 도구 소개
- 효과적인 프롬프트 작성법
- 학습 계획 수립

## 2주차: 리서치와 정보 수집
- AI를 활용한 문헌 조사
- 정보 검증과 팩트체킹
- 참고자료 정리하기

## 3주차: 에세이와 보고서 작성
- 논문 개요 작성하기
- 아이디어 발전시키기
- 인용과 참고문헌 관리

## 4주차: 프레젠테이션 준비
- 발표 자료 기획
- 시각 자료 생성
- 스피치 연습

## 5주차: 창의적 프로젝트
- 아이디어 생성과 발전
- 협업 도구 활용
- 피드백 수집과 개선

## 6주차: 종합 프로젝트
- 학습 성과물 제작
- 포트폴리오 구성
- 미래 학습 계획`
      },
      {
        id: 'template-3',
        title: '주부를 위한 일상 AI',
        description: '일상생활에서 유용한 AI 도구들',
        category: 'lifestyle',
        targetAudience: '주부',
        duration: '3주',
        type: 'online',
        tags: ['생활', '육아', '요리'],
        difficulty: 'beginner',
        isPopular: true,
        usageCount: 76,
        content: `# 주부를 위한 일상 AI

## 1주차: 집안일 효율화
- 식단 계획과 레시피 추천
- 가계부 관리
- 쇼핑 리스트 자동화

## 2주차: 육아와 교육
- 아이 학습 도우미
- 창의적 놀이 아이디어
- 육아 정보 검색

## 3주차: 취미와 자기계발
- 새로운 취미 발견
- SNS 콘텐츠 제작
- 온라인 쇼핑 도우미`
      },
      {
        id: 'template-4',
        title: 'AI 크리에이터 마스터',
        description: '창작 활동을 위한 고급 AI 도구 활용법',
        category: 'creative',
        targetAudience: '크리에이터',
        duration: '8주',
        type: 'online',
        tags: ['창작', '디자인', '콘텐츠'],
        difficulty: 'advanced',
        usageCount: 134,
        content: `# AI 크리에이터 마스터

## 1주차: AI 창작 도구 개요
- 텍스트, 이미지, 음성 AI 소개
- 각 도구의 특징과 한계
- 창작 워크플로우 설계

## 2-3주차: 텍스트 콘텐츠 제작
- 블로그 포스트 생성
- 스토리텔링 기법
- 카피라이팅 자동화

## 4-5주차: 비주얼 콘텐츠 제작
- AI 이미지 생성
- 로고와 브랜딩
- 소셜미디어 그래픽

## 6-7주차: 멀티미디어 콘텐츠
- 비디오 스크립트 작성
- 음성 생성과 편집
- 애니메이션 제작

## 8주차: 통합 프로젝트
- 브랜드 아이덴티티 구축
- 캠페인 기획과 실행
- 성과 분석과 개선`
      },
      {
        id: 'template-5',
        title: '시니어를 위한 AI 입문',
        description: '중장년층을 위한 쉬운 AI 활용법',
        category: 'senior',
        targetAudience: '시니어',
        duration: '5주',
        type: 'offline',
        tags: ['시니어', '기초', '실용'],
        difficulty: 'beginner',
        usageCount: 43,
        content: `# 시니어를 위한 AI 입문

## 1주차: AI란 무엇인가?
- AI의 기본 개념
- 우리 생활 속 AI
- 스마트폰으로 시작하기

## 2주차: 음성 비서 활용
- 시리, 구글 어시스턴트 사용법
- 음성으로 정보 검색하기
- 일정 관리와 알림 설정

## 3주차: 건강 관리
- 건강 정보 검색
- 운동 계획 세우기
- 약물 복용 관리

## 4주차: 소통과 연결
- 화상통화 설정하기
- 사진 정리와 공유
- 온라인 커뮤니티 참여

## 5주차: 취미와 여가
- 온라인 강의 수강
- 여행 계획 세우기
- 문화 활동 정보 찾기`
      }
    ];

    setTemplates(mockTemplates);
  };

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    success(`"${template.title}" 템플릿이 적용되었습니다`);
    onClose();
  };

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'business', label: '비즈니스' },
    { value: 'education', label: '교육' },
    { value: 'lifestyle', label: '라이프스타일' },
    { value: 'creative', label: '크리에이티브' },
    { value: 'senior', label: '시니어' },
  ];

  const difficulties = [
    { value: 'all', label: '전체 난이도' },
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">템플릿 라이브러리</h2>
              <p className="text-gray-600 mt-1">
                {filteredTemplates.length}개의 템플릿 중에서 선택하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <Input
                placeholder="템플릿 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600">검색 조건에 맞는 템플릿이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                          {template.title}
                        </h3>
                        {template.isPopular && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            🔥 인기
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>대상: {template.targetAudience}</span>
                        <span>기간: {template.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {getDifficultyLabel(template.difficulty)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {template.usageCount}회 사용
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <Button
                      size="sm"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white"
                      variant="outline"
                    >
                      이 템플릿 사용하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}