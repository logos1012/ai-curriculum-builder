'use client';

import { z } from 'zod';

// 환경 설정
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 50000;
const MAX_MESSAGE_LENGTH = 2000;

// 공통 검증 스키마
export const emailSchema = z
  .string()
  .email('올바른 이메일 형식이 아닙니다')
  .max(255, '이메일이 너무 깁니다');

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(128, '비밀번호가 너무 깁니다')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대소문자와 숫자를 포함해야 합니다');

// 텍스트 입력 검증
export const titleSchema = z
  .string()
  .trim()
  .min(1, '제목을 입력해주세요')
  .max(MAX_TITLE_LENGTH, `제목은 ${MAX_TITLE_LENGTH}자를 초과할 수 없습니다`)
  .refine(
    (title) => !/[<>\"'&]/.test(title),
    '제목에 특수문자(<, >, ", \', &)는 사용할 수 없습니다'
  );

export const contentSchema = z
  .string()
  .trim()
  .max(MAX_CONTENT_LENGTH, `내용은 ${MAX_CONTENT_LENGTH}자를 초과할 수 없습니다`);

export const messageSchema = z
  .string()
  .trim()
  .min(1, '메시지를 입력해주세요')
  .max(MAX_MESSAGE_LENGTH, `메시지는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다`);

// 사용자 인증 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .trim()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름이 너무 깁니다')
    .refine(
      (name) => !/[<>\"'&]/.test(name),
      '이름에 특수문자는 사용할 수 없습니다'
    ),
});

// 커리큘럼 스키마
export const curriculumSchema = z.object({
  title: titleSchema,
  content: contentSchema.optional(),
  target_audience: z
    .string()
    .trim()
    .max(200, '대상 청중 설명이 너무 깁니다')
    .optional(),
  learning_objectives: z
    .string()
    .trim()
    .max(500, '학습 목표가 너무 깁니다')
    .optional(),
  difficulty_level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
});

export const updateCurriculumSchema = curriculumSchema.partial();

// 채팅 메시지 스키마
export const chatMessageSchema = z.object({
  message: messageSchema,
  curriculum_id: z.string().uuid('올바른 커리큘럼 ID가 아닙니다'),
});

// 공유 설정 스키마
export const shareSettingsSchema = z.object({
  access_level: z.enum(['view', 'comment', 'edit']),
  password: z
    .string()
    .max(50, '비밀번호가 너무 깁니다')
    .optional(),
  expires_at: z
    .string()
    .datetime()
    .optional(),
});

// 검색 쿼리 스키마
export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, '검색어가 너무 깁니다')
    .optional(),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
  category: z
    .string()
    .trim()
    .max(50, '카테고리명이 너무 깁니다')
    .optional(),
  page: z
    .number()
    .int()
    .min(1, '페이지 번호는 1 이상이어야 합니다')
    .max(1000, '페이지 번호가 너무 큽니다')
    .optional(),
  limit: z
    .number()
    .int()
    .min(1, '한 페이지당 항목 수는 1 이상이어야 합니다')
    .max(100, '한 페이지당 최대 100개까지만 조회할 수 있습니다')
    .optional(),
});

// HTML 태그 제거 함수
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

// XSS 방지를 위한 입력 정리
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input)
    .replace(/[<>\"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[match];
    });
}

// 파일 확장자 검증
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const allowedDocumentTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// URL 검증
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// 타입 정의
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type CurriculumData = z.infer<typeof curriculumSchema>;
export type UpdateCurriculumData = z.infer<typeof updateCurriculumSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type ShareSettingsData = z.infer<typeof shareSettingsSchema>;
export type SearchData = z.infer<typeof searchSchema>;