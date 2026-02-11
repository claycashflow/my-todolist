# 백엔드 테스트 가이드

## 개요

본 프로젝트는 Jest와 Supertest를 사용하여 백엔드 API 및 데이터베이스 연결을 테스트합니다.

## 테스트 파일 구조

```
backend/
├── src/
│   ├── __tests__/
│   │   └── index.test.js           # Express 앱 통합 테스트
│   └── config/
│       └── __tests__/
│           └── database.test.js    # 데이터베이스 연결 테스트
└── package.json
```

## 테스트 실행

### 기본 테스트 실행
```bash
npm test
```

### 커버리지 포함 테스트
```bash
npm run test:coverage
```

## 테스트 범위

### 1. 데이터베이스 설정 테스트 (database.test.js)

#### 테스트 항목
- **헬스 체크 함수**
  - `checkDatabaseHealth` 함수 export 확인
  - 연결 상태 및 타임스탬프 속성 검증
  - ISO 형식 타임스탬프 검증

- **Pool 종료 함수**
  - `closeDatabaseConnection` 함수 export 확인
  - 정상 종료 및 에러 처리 검증

- **기본 Pool Export**
  - Pool 인스턴스 및 메서드 확인
  - PostgreSQL Pool 인터페이스 검증

- **환경 변수 검증**
  - `POSTGRES_CONNECTION_STRING` 설정 확인

- **모듈 구조 검증**
  - 필수 함수 export 확인
  - 함수 타입 검증

- **에러 처리**
  - 헬스 체크 실패 시 에러 객체 반환 검증

- **비동기 처리**
  - Promise 반환 검증

### 2. Express 앱 테스트 (index.test.js)

#### 테스트 항목

**기본 라우트**
- `GET /` 요청 시 API 정보 반환
- JSON 형식 응답 검증

**헬스 체크 엔드포인트**
- `GET /health` 요청 시 서버 및 DB 상태 반환
- 타임스탬프 포함 검증
- 응답 구조 검증

**404 핸들러**
- 존재하지 않는 경로 요청 시 404 반환
- JSON 형식 에러 응답
- 여러 잘못된 경로 처리

**CORS 설정**
- CORS 헤더 올바른 설정
- OPTIONS 프리플라이트 요청 처리

**JSON 미들웨어**
- JSON 요청 본문 파싱
- 잘못된 JSON 형식 에러 처리

**URL-encoded 미들웨어**
- URL-encoded 요청 본문 파싱

**서버 응답 형식**
- 모든 응답이 JSON 형식
- 에러 응답에 `success: false` 포함

**환경 변수 설정**
- `FRONTEND_URL` 환경 변수 CORS 반영

**엔드포인트 목록 검증**
- API 정보에 모든 주요 엔드포인트 포함
- 엔드포인트 경로 형식 검증

**HTTP 메서드 지원**
- GET, POST, PUT, DELETE 메서드 처리

**서버 구조 검증**
- Express 인스턴스 확인
- 필수 메서드 포함 확인

**응답 시간**
- 기본 라우트 1초 이내 응답
- 헬스 체크 1초 이내 응답

## 테스트 결과

### 전체 통계
- **Test Suites**: 2 passed
- **Tests**: 40 passed
- **실행 시간**: ~4초

### 커버리지 현황
```
File         | % Stmts | % Branch | % Funcs | % Lines |
-------------|---------|----------|---------|---------|
database.js  |   72.72 |       50 |   42.85 |   72.72 |
```

## 테스트 설정

### package.json Jest 설정
```json
{
  "jest": {
    "testEnvironment": "node",
    "transform": {},
    "testMatch": [
      "**/__tests__/**/*.test.js"
    ],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/__tests__/**",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 50,
        "functions": 40,
        "lines": 70,
        "statements": 70
      }
    },
    "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/__tests__/"
    ]
  }
}
```

## 모킹 전략

### 데이터베이스 모킹
- `pg` 모듈의 Pool 클래스 모킹
- 쿼리, 연결 종료, 이벤트 핸들러 모킹

### Express 앱 모킹
- 데이터베이스 모듈 (`database.js`) 전체 모킹
- `checkDatabaseHealth` 및 `closeDatabaseConnection` 함수 모킹
- Pool 객체 및 메서드 모킹

## 주의사항

1. **ES 모듈 사용**
   - `node --experimental-vm-modules` 플래그 필요
   - `@jest/globals`에서 Jest 함수 import

2. **비동기 테스트**
   - 모든 비동기 함수는 `async/await` 사용
   - Promise 반환 확인

3. **환경 변수**
   - 테스트 실행 시 환경 변수 설정 필요
   - `POSTGRES_CONNECTION_STRING`, `PORT`, `FRONTEND_URL`

4. **테스트 격리**
   - 각 테스트는 독립적으로 실행
   - `beforeEach`에서 모킹 함수 초기화

## 향후 개선 사항

### 커버리지 향상
- 에러 핸들러 테스트 추가
- Pool 이벤트 핸들러 테스트 강화
- Edge case 테스트 추가

### 통합 테스트
- 실제 PostgreSQL 데이터베이스 연결 테스트
- Docker를 활용한 통합 테스트 환경 구축

### 성능 테스트
- 부하 테스트 추가
- 응답 시간 벤치마크

### E2E 테스트
- 전체 API 워크플로우 테스트
- 인증 및 권한 테스트

## 문제 해결

### Worker Process 경고
```
A worker process has failed to exit gracefully
```
- 데이터베이스 연결이 제대로 종료되지 않아 발생
- 실제 운영 환경에서는 문제 없음
- `--detectOpenHandles` 플래그로 디버깅 가능

### 모킹 실패
- Jest 모킹이 ES 모듈에서 제대로 작동하지 않을 수 있음
- `@jest/globals` 사용 확인
- 모듈 경로 정확성 확인

## 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Supertest 문서](https://github.com/visionmedia/supertest)
- [Node.js ES 모듈](https://nodejs.org/api/esm.html)
