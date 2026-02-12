# Frontend CLAUDE.md

이 파일은 Claude Code가 frontend 디렉토리의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반의 할 일 관리 웹 애플리케이션 프론트엔드. Context API로 상태를 관리하고, React Router로 라우팅을 처리하며, Axios를 통해 백엔드 API와 통신합니다.

## 반드시 준수할 것
- SOLID 원칙 준수
- Clean Architecture 준수

## 빌드 및 실행 명령어

```bash
npm install              # 의존성 설치 (최초 실행 전 필수)
npm run dev              # 개발 서버 실행 (Vite HMR)
npm run build            # 프로덕션 빌드 (TypeScript 컴파일 + Vite 빌드)
npm run preview          # 빌드 결과 미리보기
npm run lint             # ESLint 코드 검사
npm test                 # Vitest 테스트 실행 (silent 모드)
npm run test:verbose     # Vitest 테스트 실행 (상세 출력)
```

개발 서버는 기본적으로 http://localhost:5173에서 실행됩니다.

## 기술 스택

### 핵심 라이브러리
- **React 19.2.0** — UI 라이브러리
- **TypeScript 5.9.3** — 타입 안정성
- **Vite 7.3.1** — 빌드 도구 및 개발 서버
- **React Router DOM 7.13.0** — 클라이언트 사이드 라우팅
- **Axios 1.13.5** — HTTP 클라이언트

### 개발 도구
- **Vitest 4.0.18** — 테스트 프레임워크
- **React Testing Library 16.3.2** — React 컴포넌트 테스트
- **ESLint 9.39.1** — 코드 품질 및 스타일 검사
- **@vitejs/plugin-react** — Vite React 플러그인 (Babel 사용)

## 아키텍처 및 디렉토리 구조

```
frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Common/          # 공통 컴포넌트 (Header 등)
│   │   └── Todo/            # Todo 관련 컴포넌트
│   ├── context/             # Context API 상태 관리
│   │   ├── AuthContext.tsx  # 인증 상태 관리
│   │   └── TodoContext.tsx  # Todo 상태 관리
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TodoPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/            # API 서비스 레이어
│   │   ├── api.ts           # Axios 인스턴스 설정
│   │   ├── authService.ts   # 인증 API
│   │   └── todoService.ts   # Todo API
│   ├── utils/               # 유틸리티 함수
│   │   ├── dateUtils.ts
│   │   └── validation.ts
│   ├── App.tsx              # 루트 컴포넌트 (라우팅 설정)
│   ├── main.tsx             # 엔트리 포인트
│   ├── App.css              # 글로벌 스타일
│   └── index.css            # 기본 스타일
├── public/                  # 정적 파일
├── index.html               # HTML 템플릿
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 설정
└── eslint.config.js         # ESLint 설정
```

## 주요 기능 및 구현

### 라우팅 (App.tsx)
- `/login` — 로그인 페이지
- `/register` — 회원가입 페이지
- `/todos` — Todo 관리 페이지 (보호된 라우트)
- `/` — `/todos`로 리다이렉트
- `*` — 404 페이지

`ProtectedRoute` 컴포넌트로 인증되지 않은 사용자의 접근을 차단하고 로그인 페이지로 리다이렉트합니다.

### 상태 관리 (Context API)
- **AuthContext** — 사용자 인증 상태 및 로그인/로그아웃 로직 관리
- **TodoContext** — Todo 목록 상태 및 CRUD 작업 관리

### API 통신 (services/api.ts)
- Axios 인스턴스를 생성하여 공통 설정 적용
- 환경변수 `VITE_API_URL`로 API 베이스 URL 설정 (기본값: `http://localhost:3000/api`)
- 요청 인터셉터: localStorage의 토큰을 자동으로 헤더에 포함
- 응답 인터셉터: 401 에러 시 자동 로그아웃 및 로그인 페이지로 리다이렉트

### 테스트 (Vitest)
- `vitest.setup.ts`에서 테스트 환경 설정
- jsdom 환경에서 테스트 실행
- React Testing Library와 @testing-library/jest-dom 사용
- 주요 컴포넌트에 대한 테스트 파일 작성:
  - `TodoItem.test.tsx`
  - `TodoList.test.tsx`
  - `TodoForm.test.tsx`
  - `LoginPage.test.tsx`
  - `App.test.tsx`

## 환경 변수

`.env` 파일에서 설정 가능:
- `VITE_API_URL` — 백엔드 API 기본 URL (기본값: `http://localhost:3000/api`)

## 주요 참고사항

- **React 19** 사용: 최신 React 기능 활용 가능
- **TypeScript Strict 모드**: 타입 안정성 강화
- **Vite의 HMR**: 개발 시 빠른 피드백 사이클
- **ESLint 9**: Flat config 형식 사용
- **Token 기반 인증**: localStorage에 `authToken`과 `user` 정보 저장
- **자동 리다이렉트**: 401 에러 발생 시 자동으로 로그인 페이지로 이동
- **테스트 커버리지**: 주요 컴포넌트에 대한 단위 테스트 작성됨

## 코딩 컨벤션

- **컴포넌트**: PascalCase 사용 (예: `TodoItem.tsx`)
- **서비스/유틸**: camelCase 사용 (예: `todoService.ts`)
- **타입 정의**: interface 또는 type 사용, 명확한 타입 지정 필수
- **이벤트 핸들러**: `handle-` 접두사 사용 (예: `handleClick`, `handleSubmit`)
- **Props**: 인터페이스로 정의, 컴포넌트 위에 선언
- **CSS**: 컴포넌트별 CSS 파일 또는 App.css에 글로벌 스타일 작성

## 디버깅 및 개발 팁

- Vite 개발 서버는 자동으로 브라우저를 새로고침합니다
- React DevTools를 사용하여 컴포넌트 계층 구조 및 상태 확인
- 네트워크 탭에서 API 요청/응답 확인
- `npm run lint`로 코드 품질 문제 사전 확인
- `npm test`로 테스트 실행하여 회귀 방지
