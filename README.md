# YOY Wallet App

YooY Land (YOY) 코인을 위한 현대적이고 안전한 암호화폐 지갑 애플리케이션입니다.

## 🚀 주요 기능

### 👤 사용자 기능
- **다중 인증**: 이메일 로그인, PIN, 생체인증, 패턴 인증 지원
- **다국어 지원**: 8개 언어 (한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 러시아어)
- **테마 시스템**: 다크 모드 (Black + Gold), 라이트 모드 (White + Blue)
- **지갑 관리**: BIP-39 니모닉 생성/복구, HD 지갑 지원
- **코인 거래**: 실시간 시장 데이터, 거래 내역 관리
- **보안**: PIN, 생체인증, 패턴 보안 설정

### 🔧 관리자 기능
- **코인 관리**: 코인 추가/수정/삭제, 로고 자동 연동 (업비트 API)
- **사용자 관리**: 관리자 계정 추가/제거
- **시스템 모니터링**: 대시보드, 분석, 통계
- **설정 관리**: 시스템 설정, 보안 설정

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: CSS3, CSS Variables (테마 시스템)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Blockchain**: Ethers.js, BIP-39
- **APIs**: CoinGecko API, Upbit API, Infura
- **Authentication**: Local Storage, Custom Auth System
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/yooyland/YOY-Wallet-App.git
cd YOY-Wallet-App
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# env.example을 .env로 복사
cp env.example .env

# .env 파일을 편집하여 실제 값 입력
# 특히 REACT_APP_INFURA_ID는 필수
```

4. **개발 서버 실행**
```bash
npm start
```

5. **브라우저에서 확인**
```
http://localhost:8080
```

## 🔐 환경 변수 설정

### 필수 환경 변수
```env
REACT_APP_INFURA_ID=your_infura_project_id_here
```

### 선택적 환경 변수
```env
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key_here
REACT_APP_UPBIT_API_KEY=your_upbit_api_key_here
```

## 👨‍💼 관리자 계정

기본 관리자 이메일:
- `admin@yooyland.com` (슈퍼 관리자)
- `landyooy@gmail.com` (관리자)
- `jch4389@gmail.com` (관리자)

## 🏗 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── contexts/           # React Context (상태 관리)
│   ├── AuthContext.tsx
│   ├── AdminContext.tsx
│   ├── WalletContext.tsx
│   ├── SecurityContext.tsx
│   ├── ThemeContext.tsx
│   └── LanguageContext.tsx
├── pages/             # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   ├── Wallet.tsx
│   ├── Settings.tsx
│   └── ...
├── utils/             # 유틸리티 함수
│   ├── upbitApi.ts
│   ├── blockchain.ts
│   └── ...
├── types/             # TypeScript 타입 정의
├── assets/            # 정적 자산 (이미지, 로고)
└── styles/            # 전역 스타일
```

## 🎨 테마 시스템

### 다크 모드 (기본)
- 배경: Black
- 강조색: Gold (#ffd700)
- 카드: 어두운 그라데이션

### 라이트 모드
- 배경: White
- 강조색: Blue (#007bff)
- 카드: 밝은 그라데이션

### 관리자 모드
- 배경: Black
- 강조색: Purple (#6f42c1)
- 모든 테마에서 동일

## 🌐 다국어 지원

지원 언어:
- 🇰🇷 한국어 (ko)
- 🇺🇸 영어 (en) - 기본
- 🇯🇵 일본어 (ja)
- 🇨🇳 중국어 (zh)
- 🇪🇸 스페인어 (es)
- 🇫🇷 프랑스어 (fr)
- 🇩🇪 독일어 (de)
- 🇷🇺 러시아어 (ru)

## 🔒 보안 기능

- **PIN 인증**: 4-6자리 PIN 설정
- **생체인증**: 지문/얼굴인식 (시뮬레이션)
- **패턴 인증**: 9점 패턴 (준비 중)
- **세션 관리**: 자동 로그아웃
- **데이터 암호화**: 로컬 스토리지 암호화

## 📱 모바일 최적화

- 반응형 디자인
- 터치 친화적 UI
- 모바일 네비게이션
- 햄버거 메뉴
- 하단 탭 네비게이션

## 🚀 배포

### 개발 환경
```bash
npm start
```

### 프로덕션 빌드
```bash
npm run build
```

### 정적 파일 서빙
```bash
npx serve -s build
```

## 🔧 개발 가이드

### 새로운 코인 추가
1. 관리자 페이지 접속
2. "코인 관리" 탭 선택
3. "코인 추가" 버튼 클릭
4. 코인 심볼 검색 (업비트 자동 연동)
5. 로고 업로드 (선택사항)
6. 코인 정보 입력 및 저장

### 새로운 기능 추가
1. `src/components/`에 컴포넌트 생성
2. `src/contexts/`에 상태 관리 추가
3. `src/types/`에 타입 정의
4. `src/pages/`에 페이지 추가
5. 라우팅 설정

## 🐛 문제 해결

### 일반적인 문제

**포트 충돌**
```bash
# Node.js 프로세스 종료
taskkill /f /im node.exe
```

**의존성 문제**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

**환경 변수 문제**
```bash
# .env 파일 확인
cat .env
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

- **프로젝트 링크**: [https://github.com/yooyland/YOY-Wallet-App](https://github.com/yooyland/YOY-Wallet-App)
- **관리자 이메일**: admin@yooyland.com

## 🙏 감사의 말

- [Ethers.js](https://docs.ethers.io/) - 블록체인 상호작용
- [CoinGecko API](https://www.coingecko.com/en/api) - 암호화폐 데이터
- [Upbit API](https://docs.upbit.com/) - 한국 시장 데이터
- [React Icons](https://react-icons.github.io/react-icons/) - 아이콘 라이브러리

---

**YOY Wallet App** - 안전하고 편리한 암호화폐 지갑
