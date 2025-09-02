const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

// Rate Limiting - API 호출 제한
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        windowMs
      });
    }
  });
};

// Slow Down - 점진적 속도 제한
const createSlowDown = (windowMs = 15 * 60 * 1000, delayAfter = 50, delayMs = 500) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs: 20000
  });
};

// 보안 헤더 설정
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.yooyland.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  xssFilter: true
});

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yooyland.com',
      'https://app.yooyland.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// 압축 미들웨어
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// 보안 미들웨어 적용
const applySecurityMiddleware = (app) => {
  // 기본 보안 헤더
  app.use(securityHeaders);
  
  // CORS
  app.use(cors(corsOptions));
  
  // 압축
  app.use(compressionMiddleware);
  
  // 글로벌 Rate Limiting
  app.use('/api/', createRateLimit(15 * 60 * 1000, 1000)); // 15분에 1000회
  
  // 인증 관련 Rate Limiting (더 엄격)
  app.use('/api/auth/', createRateLimit(15 * 60 * 1000, 5)); // 15분에 5회
  
  // 로그인 시도 제한
  app.use('/api/auth/login', createRateLimit(15 * 60 * 1000, 3)); // 15분에 3회
  
  // Slow Down 적용
  app.use('/api/', createSlowDown(15 * 60 * 1000, 50, 500));
  
  // 추가 보안 헤더
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
};

module.exports = {
  applySecurityMiddleware,
  createRateLimit,
  createSlowDown
};
