import winston from 'winston'

const { combine, timestamp, errors, json, colorize, printf } = winston.format

// 커스텀 로그 포맷
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`
})

// 로거 생성
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  defaultMeta: { service: 'ai-curriculum-builder-backend' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(json())
    }),
    // 전체 로그 파일
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(json())
    })
  ]
})

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      devFormat
    )
  }))
}

// 프로덕션 환경에서는 간단한 콘솔 출력
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: combine(json())
  }))
}

// 로그 디렉토리 생성
import { mkdirSync } from 'fs'
try {
  mkdirSync('logs', { recursive: true })
} catch (error) {
  // 디렉토리가 이미 존재하는 경우 무시
}