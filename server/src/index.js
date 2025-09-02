const express = require('express');
const dotenv = require('dotenv');
const { applySecurityMiddleware } = require('./middleware/security');
const logger = require('./utils/logger');
let database;
try {
  database = require('./database/config/database');
} catch (e) {
  // DB 설정이 없는 경우도 서버 기동 가능하도록 옵셔널 처리
  console.warn('Database config not found. Skipping DB connection.');
  database = { authenticate: async () => {}, sync: async () => {}, close: async () => {} };
}

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어 적용
applySecurityMiddleware(app);

// JSON 파싱 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/admin-coins', require('./routes/adminCoins'));

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// 글로벌 에러 핸들러
app.use((error, req, res, next) => {
  logger.error('Global error handler:', error);
  
  // Sequelize 검증 에러 처리
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
    });
  }
  
  // Sequelize 고유 제약 조건 위반
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      field: error.errors[0].path,
      message: `${error.errors[0].path} already exists`
    });
  }
  
  // JWT 에러 처리
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }
  
  // 기본 에러 응답
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결
    await database.authenticate();
    logger.info('Database connection established successfully.');
    
    // 데이터베이스 동기화 (개발 환경에서만)
    if (database && process.env.NODE_ENV === 'development' && database.sync) {
      await database.sync({ alter: true });
      logger.info('Database synchronized successfully.');
    }
    
    // 서버 시작
    app.listen(PORT, () => {
      logger.info(`🚀 YOY Wallet Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔒 Security: Enhanced with rate limiting, encryption, and CORS`);
      logger.info(`💾 Database: ${process.env.DB_NAME || 'yoy_wallet'} on ${process.env.DB_HOST || 'localhost'}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await database.close();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await database.close();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// 예상치 못한 에러 처리
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 서버 시작
startServer();
