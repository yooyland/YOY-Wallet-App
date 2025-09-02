# 🔐 YOY Wallet - 엔터프라이즈급 보안 Web3 지갑

[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-brightgreen.svg)](https://github.com/your-repo/yoy-wallet)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://reactjs.org/)

## 🚀 프로젝트 개요

**YOY Wallet**은 YooY Land 생태계를 위한 엔터프라이즈급 보안 Web3 지갑 애플리케이션입니다. VP/Valp 거버넌스 시스템과 함께 블록체인 자산을 안전하게 관리할 수 있습니다.

### ✨ 주요 기능

- 🔐 **엔터프라이즈급 보안**: AES-256-GCM 암호화, 다중 인증, 세션 관리
- 🏛️ **VP/Valp 거버넌스**: 자동화된 의사결정과 수동 검증 시스템
- 💰 **멀티 체인 지원**: Ethereum, BSC, Polygon 등
- 📱 **크로스 플랫폼**: 웹, 모바일 앱 지원
- 🛡️ **블랙리스트/화이트리스트**: 보안 강화된 주소 관리
- 📊 **실시간 모니터링**: 거래 내역 및 자산 추적

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React App)   │◄──►│   (Rate Limit)  │◄──►│   (JWT, 2FA)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Service   │    │  Wallet Service │    │  Analytics      │
│  (Profile Mgmt) │    │  (Asset Mgmt)   │    │  (Trading)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────┐
                    │   Database      │
                    │   (Encrypted)   │
                    └─────────────────┘
```

## 🔒 보안 기능

### 암호화 계층
- **AES-256-GCM**: 최고 수준의 대칭키 암호화
- **사용자별 키**: 각 사용자마다 고유한 암호화 키
- **PBKDF2**: 100,000회 반복 키 스트레칭
- **솔트 생성**: 64바이트 랜덤 솔트

### 인증 및 권한
- **JWT 토큰**: 액세스 토큰 + 리프레시 토큰
- **2FA 지원**: TOTP 기반 2단계 인증
- **세션 관리**: Redis 기반 세션 저장소
- **권한 제어**: 역할 기반 접근 제어 (RBAC)

### 네트워크 보안
- **Rate Limiting**: API 호출 제한 및 점진적 속도 제한
- **CORS 정책**: 엄격한 출처 제한
- **보안 헤더**: HSTS, CSP, XSS 방어
- **HTTPS 강제**: 모든 통신 암호화

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **Sequelize** - ORM
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 세션 및 캐시

### 보안
- **bcryptjs** - 비밀번호 해싱
- **jsonwebtoken** - JWT 토큰
- **helmet** - 보안 헤더
- **express-rate-limit** - 요청 제한
- **crypto** - 암호화

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/yoy-wallet.git
cd yoy-wallet
```

### 2. 백엔드 설정
```bash
cd server
npm install
cp env.example .env
# .env 파일 편집하여 환경 변수 설정
npm run dev
```

### 3. 프론트엔드 설정
```bash
cd ../
npm install
npm start
```

### 4. 데이터베이스 설정
```bash
# PostgreSQL 설치 및 데이터베이스 생성
createdb yoy_wallet
cd server
npm run migrate
npm run seed
```

## 🔧 환경 변수

### 필수 환경 변수
```bash
# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yoy_wallet
DB_USER=yoy_wallet_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# 암호화
ENCRYPTION_MASTER_KEY=your_master_encryption_key_here_64_characters_minimum

# 보안
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
```

## 🚀 배포

### 개발 환경
```bash
npm run dev
```

### 프로덕션 환경
```bash
npm run build
npm start
```

### Docker 배포
```bash
docker-compose up -d
```

## 📱 앱스토어 출시 준비

### 보안 체크리스트
- [x] **데이터 암호화**: 모든 민감 데이터 암호화
- [x] **인증 시스템**: JWT + 2FA 구현
- [x] **네트워크 보안**: HTTPS + CORS 정책
- [x] **세션 관리**: 안전한 세션 처리
- [x] **에러 처리**: 민감 정보 노출 방지
- [x] **로깅**: 보안 이벤트 추적

### 개인정보보호 준수
- [x] **GDPR 준수**: EU 사용자 데이터 보호
- [x] **CCPA 준수**: 캘리포니아 개인정보보호법
- [x] **데이터 최소화**: 필요한 데이터만 수집
- [x] **사용자 동의**: 명시적 동의 시스템
- [x] **데이터 삭제**: 사용자 요청 시 즉시 삭제

## 🧪 테스트

### 보안 테스트
```bash
# 취약점 스캔
npm run security:scan

# 침투 테스트
npm run security:pentest

# 암호화 테스트
npm run test:encryption
```

### 기능 테스트
```bash
npm run test
npm run test:coverage
```

## 📊 모니터링

### 보안 모니터링
- **로그 분석**: 보안 이벤트 실시간 추적
- **성능 모니터링**: API 응답 시간 및 오류율
- **사용자 활동**: 의심스러운 패턴 감지
- **시스템 상태**: 서버 및 데이터베이스 상태

### 알림 시스템
- **보안 경고**: 즉시 알림
- **성능 경고**: 임계값 초과 시 알림
- **오류 알림**: 시스템 오류 발생 시 알림

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- **문서**: [Wiki](https://github.com/your-repo/yoy-wallet/wiki)
- **이슈**: [GitHub Issues](https://github.com/your-repo/yoy-wallet/issues)
- **토론**: [GitHub Discussions](https://github.com/your-repo/yoy-wallet/discussions)
- **이메일**: support@yooyland.com

## 🙏 감사의 말

- **YooY Land** 팀
- **보안 연구원**들
- **오픈소스 커뮤니티**

---

**⚠️ 보안 경고**: 이 프로젝트는 프로덕션 환경에서 사용하기 전에 철저한 보안 감사를 받아야 합니다. 모든 암호화 키와 비밀번호는 안전하게 관리하세요.

**🔒 보안 취약점 보고**: 보안 문제를 발견하셨다면 [security@yooyland.com](mailto:security@yooyland.com)으로 즉시 보고해주세요.
