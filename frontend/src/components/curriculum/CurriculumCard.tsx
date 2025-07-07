'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from '@/components/ui';
import { Curriculum } from '@/types';

interface CurriculumCardProps {
  curriculum: Curriculum;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CurriculumCard: React.FC<CurriculumCardProps> = ({
  curriculum,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const router = useRouter();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(curriculum.id);
    } else {
      router.push(`/builder/${curriculum.id}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online':
        return 'info';
      case 'offline':
        return 'warning';
      case 'hybrid':
        return 'success';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card hover className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {curriculum.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={getTypeColor(curriculum.type)} size="sm">
                {curriculum.type === 'online' ? '온라인' : 
                 curriculum.type === 'offline' ? '오프라인' : '혼합형'}
              </Badge>
              <Badge variant={getDifficultyColor(curriculum.metadata?.difficulty || 'beginner')} size="sm">
                {curriculum.metadata?.difficulty === 'beginner' ? '초급' :
                 curriculum.metadata?.difficulty === 'intermediate' ? '중급' : '고급'}
              </Badge>
            </div>
          </div>
          <div className="text-xl">
            {curriculum.type === 'online' ? '💻' : 
             curriculum.type === 'offline' ? '🏫' : '🔄'}
          </div>
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div>대상: {curriculum.target_audience}</div>
          <div>기간: {curriculum.duration}</div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription className="line-clamp-3">
          {curriculum.content?.summary || '커리큘럼 요약이 없습니다.'}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {new Date(curriculum.updated_at).toLocaleDateString('ko-KR')}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            편집
          </Button>
          {onDuplicate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDuplicate(curriculum.id)}
            >
              복제
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(curriculum.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              삭제
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CurriculumCard;