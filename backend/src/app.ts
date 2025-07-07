import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'

import { logger } from './lib/logger'
import { testConnection } from './lib/supabase'
import { initializeWebSocket } from './lib/websocket'
import authRoutes from './routes/auth'
import curriculumRoutes from './routes/curriculum'
import claudeRoutes from './routes/claude'

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
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection()
  
  res.status(200).json({
    status: 'OK',
    message: 'AI Curriculum Builder Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {
      supabase: dbConnected ? 'connected' : 'disconnected',
      claude_api: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured'
    }
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/curriculum', curriculumRoutes)
app.use('/api/claude', claudeRoutes)

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    },
    timestamp: new Date().toISOString()
  })
})

// 에러 핸들러
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error)
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error occurred'
    },
    timestamp: new Date().toISOString()
  })
})

// HTTP 서버 및 WebSocket 설정
const httpServer = createServer(app)
const webSocketService = initializeWebSocket(httpServer)

// 서버 시작
async function startServer() {
  try {
    // 의존성 연결 테스트
    logger.info('Testing dependencies...')
    
    const dbConnected = await testConnection()
    if (!dbConnected) {
      logger.warn('Supabase connection failed - some features may not work')
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.warn('Claude API key not configured - AI features will not work')
    }
    
    // 서버 시작
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`)
      logger.info(`📖 Health check: http://localhost:${PORT}/health`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔌 WebSocket enabled`)
      
      // 연결된 서비스 상태 로그
      if (dbConnected) {
        logger.info('✅ Supabase connected')
      }
      
      if (process.env.ANTHROPIC_API_KEY) {
        logger.info('✅ Claude API configured')
      }
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

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