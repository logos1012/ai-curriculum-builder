import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { errorHandler } from '@/middleware/error.middleware'
import { logger } from '@/lib/logger'
import authRoutes from '@/routes/auth.routes'
import curriculumRoutes from '@/routes/curriculum.routes'
import claudeRoutes from '@/routes/claude.routes'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// 보안 미들웨어
app.use(helmet())

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분당 최대 100개 요청
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Curriculum Builder Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/curriculum', curriculumRoutes)
app.use('/api/claude', claudeRoutes)

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// 에러 핸들러 (마지막에 배치)
app.use(errorHandler)

// 서버 시작
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`)
  logger.info(`📖 Health check: http://localhost:${PORT}/health`)
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

export default app