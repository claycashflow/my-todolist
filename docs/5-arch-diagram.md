# 기술 아키텍처 다이어그램

**버전**: 1.0
**작성일**: 2026-02-11
**작성자**: 기술 아키텍처팀
**상태**: MVP 개발 진행 중

---

## 1. 전체 시스템 아키텍처

### 1.1 3계층 아키텍처 개요

```mermaid
graph TB
    subgraph Client["클라이언트 계층 (Client Layer)"]
        Browser["웹 브라우저"]
        Mobile["모바일 브라우저"]
    end

    subgraph Frontend["프론트엔드 계층 (Frontend Layer)"]
        direction TB
        App["React App<br/>(ES6+ / TypeScript)"]
        Components["UI Components<br/>(페이지, 컴포넌트)"]
        Services["API Services<br/>(HTTP 클라이언트)"]
        State["상태 관리<br/>(Context / Hooks)"]
    end

    subgraph API["API 계층 (API Gateway)"]
        REST["REST API<br/>(HTTP)"]
    end

    subgraph Backend["백엔드 계층 (Backend Layer)"]
        direction TB
        Express["Express.js<br/>(Node.js)"]
        Routes["라우터<br/>(Routes)"]
        Middleware["미들웨어<br/>(Auth, Validation)"]
        Controllers["컨트롤러<br/>(Business Logic)"]
        Services["서비스<br/>(Service Layer)"]
    end

    subgraph Database["데이터베이스 계층 (Data Layer)"]
        direction TB
        ORM["데이터 액세스<br/>(DAO)"]
        DB["PostgreSQL<br/>(Relational DB)"]
    end

    subgraph External["외부 서비스"]
        CORS["CORS 설정"]
        Cache["캐싱 전략"]
    end

    Client -->|HTTPS| Frontend
    Frontend -->|JSON| API
    API -->|라우팅| Backend
    Backend -->|쿼리| Database
    Backend -->|설정| External
    Database -->|데이터| ORM
    ORM -->|읽기/쓰기| DB

    style Client fill:#e3f2fd
    style Frontend fill:#f3e5f5
    style API fill:#fff3e0
    style Backend fill:#e8f5e9
    style Database fill:#fce4ec
    style External fill:#f1f8e9
```

---

## 2. 프론트엔드 아키텍처

### 2.1 프론트엔드 계층 상세 구조

```mermaid
graph TB
    subgraph Browser["브라우저 환경"]
        HTML["HTML 마크업"]
        CSS["CSS / Styling<br/>(Bootstrap)"]
        JS["JavaScript<br/>(React)"]
    end

    subgraph Pages["페이지 컴포넌트"]
        Login["LoginPage"]
        Register["RegisterPage"]
        TodoList["TodoListPage"]
        NotFound["NotFoundPage"]
    end

    subgraph Components["재사용 가능한 컴포넌트"]
        Button["Button"]
        Input["Input"]
        Modal["Modal"]
        TodoItem["TodoItem"]
        TodoForm["TodoForm"]
        Header["Header"]
    end

    subgraph Hooks["커스텀 훅"]
        UseAuth["useAuth<br/>(인증 상태)"]
        UseTodos["useTodos<br/>(할일 데이터)"]
        UseApi["useApi<br/>(API 호출)"]
    end

    subgraph Services["서비스 계층"]
        ApiClient["API Client<br/>(Axios)"]
        AuthService["AuthService<br/>(회원가입, 로그인)"]
        TodoService["TodoService<br/>(CRUD)"]
    end

    subgraph Utils["유틸리티"]
        Validators["입력 검증"]
        Formatters["데이터 포맷팅<br/>(날짜, 시간)"]
        Helpers["헬퍼 함수"]
    end

    subgraph Storage["클라이언트 스토리지"]
        LocalStorage["localStorage<br/>(JWT 토큰)"]
        SessionStorage["sessionStorage<br/>(세션 정보)"]
    end

    Browser --> Pages
    Pages -->|렌더링| Components
    Pages -->|상태 관리| Hooks
    Hooks -->|데이터 요청| Services
    Services -->|HTTP 호출| ApiClient
    Services -->|도우미 함수| Utils
    Hooks -->|저장| Storage

    style Browser fill:#e3f2fd
    style Pages fill:#f3e5f5
    style Components fill:#e1f5fe
    style Hooks fill:#f0f4c3
    style Services fill:#fff3e0
    style Utils fill:#fbe9e7
    style Storage fill:#f1f8e9
```

### 2.2 프론트엔드 데이터 흐름

```mermaid
sequenceDiagram
    participant U as 사용자
    participant UI as UI Components
    participant H as Hooks/Context
    participant S as Services
    participant API as Backend API

    U->>UI: 할일 추가 버튼 클릭
    UI->>H: useTodos.addTodo() 호출
    H->>S: TodoService.createTodo()
    S->>API: POST /todos (JSON)
    API-->>S: 201 Created + 할일 객체
    S-->>H: 상태 업데이트
    H-->>UI: 목록 재렌더링
    UI-->>U: 새 할일 표시
```

### 2.3 기술 스택 (프론트엔드)

| 계층 | 기술 | 용도 | 버전 |
|------|------|------|------|
| **런타임** | JavaScript / TypeScript | 언어 | 5.x |
| **UI 프레임워크** | React | UI 라이브러리 | 19 |
| **라우팅** | React Router | 페이지 네비게이션 | 6.x |
| **HTTP 클라이언트** | Axios | API 호출 | 1.x |
| **상태 관리** | Context API / Hooks | 전역 상태 | 내장 |
| **UI 프레임워크** | Bootstrap | CSS 프레임워크 | 5.x |
| **번들러** | Vite | 빌드 도구 | 5.x |
| **패키지 관리** | npm | 의존성 관리 | - |

---

## 3. 백엔드 아키텍처

### 3.1 백엔드 계층 상세 구조

```mermaid
graph TB
    subgraph Server["Node.js / Express 서버"]
        Express["Express 애플리케이션"]
    end

    subgraph Routes["라우터 계층"]
        AuthRoutes["인증 라우트<br/>(/auth/*)"]
        TodoRoutes["할일 라우트<br/>(/todos/*)"]
    end

    subgraph Middleware["미들웨어 계층"]
        AuthMW["인증 미들웨어<br/>(JWT 검증)"]
        ValidatorMW["검증 미들웨어<br/>(입력값 검증)"]
        ErrorMW["에러 처리 미들웨어"]
        LoggerMW["로거 미들웨어"]
    end

    subgraph Controllers["컨트롤러 계층"]
        AuthCtrl["AuthController<br/>(회원가입, 로그인)"]
        TodoCtrl["TodoController<br/>(CRUD)"]
    end

    subgraph Services["서비스 계층"]
        AuthSvc["AuthService<br/>(비즈니스 로직)"]
        TodoSvc["TodoService<br/>(할일 관리 로직)"]
    end

    subgraph Models["데이터 모델"]
        UserModel["User 모델<br/>(스키마)"]
        TodoModel["Todo 모델<br/>(스키마)"]
    end

    subgraph Database["데이터베이스 계층"]
        DAO["DAO<br/>(Data Access Object)"]
        PostgreSQL["PostgreSQL<br/>Relational DB"]
    end

    subgraph Config["설정 및 유틸리티"]
        JWTUtil["JWT 유틸<br/>(토큰 생성/검증)"]
        HashUtil["Hash 유틸<br/>(bcryptjs)"]
        ResponseUtil["응답 유틸<br/>(표준화)"]
    end

    Server --> Routes
    Routes -->|적용| Middleware
    Middleware --> Controllers
    Controllers -->|비즈니스 로직| Services
    Services -->|데이터 접근| Models
    Models -->|쿼리| DAO
    DAO -->|SQL| PostgreSQL
    Services -->|사용| Config
    Controllers -->|사용| JWTUtil
    Controllers -->|사용| HashUtil

    style Server fill:#e8f5e9
    style Routes fill:#c8e6c9
    style Middleware fill:#a5d6a7
    style Controllers fill:#81c784
    style Services fill:#66bb6a
    style Models fill:#4caf50
    style Database fill:#fce4ec
    style Config fill:#fff3e0
```

### 3.2 백엔드 요청 처리 흐름

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant R as Routes
    participant A as Auth Middleware
    participant V as Validator
    participant Ctrl as Controller
    participant S as Service
    participant DB as Database

    C->>R: POST /todos (JSON)
    R->>A: JWT 검증
    A-->>R: 인증 완료
    R->>V: 입력값 검증
    V-->>R: 검증 완료
    R->>Ctrl: 요청 처리
    Ctrl->>S: 비즈니스 로직
    S->>DB: 데이터 쿼리
    DB-->>S: 결과 반환
    S-->>Ctrl: 처리 완료
    Ctrl-->>C: 201 + 응답 JSON
```

### 3.3 기술 스택 (백엔드)

| 계층 | 기술 | 용도 | 버전 |
|------|------|------|------|
| **런타임** | Node.js | 실행 환경 | >= 22.0.0 |
| **웹 프레임워크** | Express.js | 라우팅 및 미들웨어 | 4.x |
| **데이터베이스** | PostgreSQL | 관계형 DB | 17 |
| **DB 드라이버** | pg | PostgreSQL 연결 | 8.x |
| **비밀번호 해시** | bcryptjs | 보안 | 2.x |
| **JWT 토큰** | jsonwebtoken | 인증 | 9.x |
| **환경 변수** | dotenv | 설정 관리 | 16.x |
| **트랜스파일러** | @babel/core | ES6+ 변환 | 7.x |
| **번들러** | webpack | 빌드 도구 | 5.x |
| **패키지 관리** | npm | 의존성 관리 | - |

---

## 4. 데이터베이스 아키텍처

### 4.1 데이터베이스 스키마

```mermaid
erDiagram
    USERS ||--o{ TODOS : creates

    USERS {
        uuid id PK
        string username UK "4~20자"
        string password "bcrypt 해시"
        timestamp created_at "가입 시간"
    }

    TODOS {
        uuid id PK
        uuid user_id FK "사용자 참조"
        string title "1~100자"
        string description "0~1000자"
        date due_date "마감일"
        boolean done "기본값: false"
        timestamp created_at "생성 시간"
        timestamp updated_at "수정 시간"
    }
```

### 4.2 데이터베이스 테이블 설명

#### Users 테이블
- **id**: UUID (Primary Key, 고유 식별자)
- **username**: VARCHAR(20), UNIQUE (로그인 아이디)
- **password**: VARCHAR(255) (bcrypt 해시화)
- **created_at**: TIMESTAMP (가입 일시)

**인덱스**:
- PRIMARY KEY: id
- UNIQUE INDEX: username

#### Todos 테이블
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key → users.id)
- **title**: VARCHAR(100) NOT NULL (할일 제목)
- **description**: VARCHAR(1000) (할일 설명)
- **due_date**: DATE NOT NULL (마감일)
- **done**: BOOLEAN DEFAULT FALSE (완료 여부)
- **created_at**: TIMESTAMP (생성 시간)
- **updated_at**: TIMESTAMP (수정 시간)

**인덱스**:
- PRIMARY KEY: id
- FOREIGN KEY: user_id → users.id (ON DELETE CASCADE)
- INDEX: user_id (조회 성능)

### 4.3 데이터 관계도

```mermaid
graph LR
    User["User<br/>─ id<br/>─ username<br/>─ password<br/>─ created_at"]

    Todo["Todo<br/>─ id<br/>─ user_id<br/>─ title<br/>─ description<br/>─ due_date<br/>─ done<br/>─ created_at<br/>─ updated_at"]

    User -->|1 : N| Todo

    style User fill:#fce4ec
    style Todo fill:#e1f5fe
```

---

## 5. API 통신 구조

### 5.1 API 요청/응답 흐름

```mermaid
graph TB
    subgraph Client["클라이언트"]
        FE["프론트엔드<br/>(React)"]
    end

    subgraph Network["네트워크"]
        HTTP["HTTP/HTTPS<br/>JSON 형식"]
    end

    subgraph Server["백엔드 서버"]
        Auth["인증<br/>(JWT)"]
        Routes["라우팅"]
        Logic["비즈니스 로직"]
    end

    FE -->|HTTP Request<br/>Authorization: Bearer token<br/>Content-Type: application/json| HTTP
    HTTP -->|JSON 페이로드| Server
    Auth -->|토큰 검증| Routes
    Routes -->|엔드포인트 매칭| Logic
    Logic -->|쿼리 실행| Server
    Server -->|JSON Response<br/>Status Code| HTTP
    HTTP -->|JSON 데이터| FE

    style Client fill:#e3f2fd
    style Network fill:#fff3e0
    style Server fill:#e8f5e9
```

### 5.2 인증 흐름 (JWT)

```mermaid
sequenceDiagram
    participant Browser as 브라우저
    participant FE as 프론트엔드
    participant API as API 서버
    participant DB as 데이터베이스

    rect rgb(200, 230, 201)
    Note over Browser,DB: 회원가입/로그인
    end

    Browser->>FE: 회원가입/로그인 정보 입력
    FE->>API: POST /auth/register or /auth/login
    API->>DB: 사용자 검증/생성
    DB-->>API: 결과 반환
    API-->>FE: JWT 토큰 발급 (201 or 200)
    FE->>FE: localStorage에 토큰 저장
    Browser-->>FE: 할일 목록 페이지로 이동

    rect rgb(200, 230, 201)
    Note over Browser,DB: 인증된 요청
    end

    Browser->>FE: 할일 목록 조회
    FE->>FE: localStorage에서 토큰 로드
    FE->>API: GET /todos (Authorization: Bearer token)
    API->>API: JWT 검증 (유효성, 만료 여부)
    API->>DB: 데이터 쿼리
    DB-->>API: 결과 반환
    API-->>FE: 할일 목록 (200)
    FE-->>Browser: 목록 렌더링

    rect rgb(255, 200, 200)
    Note over Browser,DB: 토큰 만료
    end

    Browser->>FE: 요청 발송
    FE->>API: 요청 (만료된 토큰)
    API-->>FE: 401 Unauthorized
    FE->>FE: localStorage 토큰 삭제
    FE-->>Browser: 로그인 페이지로 리다이렉트
```

### 5.3 API 엔드포인트 맵

```mermaid
graph TB
    API["REST API<br/>/api/v1"]

    subgraph Auth["인증 엔드포인트"]
        Register["POST /auth/register<br/>(회원가입)"]
        Login["POST /auth/login<br/>(로그인)"]
        Logout["POST /auth/logout<br/>(로그아웃)"]
    end

    subgraph Todos["할일 엔드포인트"]
        GetList["GET /todos<br/>(목록 조회)"]
        GetDetail["GET /todos/:id<br/>(상세 조회)"]
        Create["POST /todos<br/>(생성)"]
        Update["PUT /todos/:id<br/>(수정)"]
        Delete["DELETE /todos/:id<br/>(삭제)"]
    end

    API --> Auth
    API --> Todos

    style API fill:#fff3e0
    style Auth fill:#ffe0b2
    style Todos fill:#ffcc80
```

---

## 6. 배포 아키텍처

### 6.1 배포 환경 구성

```mermaid
graph TB
    subgraph Local["로컬 개발 환경"]
        DevFE["프론트엔드<br/>(npm run dev)"]
        DevBE["백엔드<br/>(npm run dev)"]
        DevDB["PostgreSQL<br/>(로컬)"]
    end

    subgraph Staging["스테이징 환경"]
        StageFE["프론트엔드<br/>(Vercel)"]
        StageBE["백엔드<br/>(Railway/Heroku)"]
        StageDB["PostgreSQL<br/>(클라우드)"]
    end

    subgraph Production["프로덕션 환경"]
        ProdFE["프론트엔드<br/>(Vercel)"]
        ProdBE["백엔드<br/>(Railway/Heroku)"]
        ProdDB["PostgreSQL<br/>(관리형 서비스)"]
    end

    DevFE -.->|Git Push| Staging
    DevBE -.->|Git Push| Staging
    Staging -->|배포 확인| Production

    style Local fill:#e3f2fd
    style Staging fill:#fff3e0
    style Production fill:#fce4ec
```

### 6.2 CI/CD 파이프라인

```mermaid
graph LR
    GH["GitHub<br/>(코드 저장소)"]
    GHA["GitHub Actions<br/>(CI)"]
    FE_Deploy["Vercel<br/>(프론트엔드 배포)"]
    BE_Deploy["Railway/Heroku<br/>(백엔드 배포)"]

    GH -->|PR/Push| GHA
    GHA -->|테스트 통과| FE_Deploy
    GHA -->|테스트 통과| BE_Deploy
    FE_Deploy -->|배포 완료| Live["라이브 서비스"]
    BE_Deploy -->|배포 완료| Live

    style GH fill:#e8f5e9
    style GHA fill:#c8e6c9
    style FE_Deploy fill:#e3f2fd
    style BE_Deploy fill:#e8f5e9
    style Live fill:#fce4ec
```

---

## 7. 보안 아키텍처

### 7.1 보안 계층

```mermaid
graph TB
    subgraph Transport["전송 보안"]
        HTTPS["HTTPS<br/>(SSL/TLS 암호화)"]
    end

    subgraph Auth["인증/인가"]
        JWT["JWT 토큰<br/>(유효기간: 24시간)"]
        Middleware["인증 미들웨어<br/>(토큰 검증)"]
    end

    subgraph Encryption["데이터 암호화"]
        Password["비밀번호<br/>(bcryptjs 해시)"]
        Sensitive["민감 정보<br/>(환경변수 관리)"]
    end

    subgraph Validation["입력 검증"]
        ClientVal["클라이언트<br/>검증"]
        ServerVal["서버<br/>검증"]
    end

    subgraph Injection["공격 방어"]
        SQL["SQL Injection<br/>(파라미터화 쿼리)"]
        XSS["XSS<br/>(자동 이스케이프)"]
    end

    HTTPS --> Auth
    Auth --> Encryption
    Encryption --> Validation
    Validation --> Injection

    style Transport fill:#ffcdd2
    style Auth fill:#f8bbd0
    style Encryption fill:#f5bde6
    style Validation fill:#ede7f6
    style Injection fill:#dcedc8
```

### 7.2 권한 검증 흐름

```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Server as 백엔드
    participant DB as 데이터베이스

    Client->>Server: 요청 (JWT 토큰 포함)
    Server->>Server: 1. JWT 서명 검증
    alt 서명 오류
        Server-->>Client: 401 Unauthorized
    end

    Server->>Server: 2. 토큰 만료 확인
    alt 토큰 만료됨
        Server-->>Client: 401 Unauthorized
    end

    Server->>Server: 3. 권한 검증 (소유권)
    Server->>DB: 데이터 소유자 확인
    DB-->>Server: 소유자 ID 반환
    alt 소유자 불일치
        Server-->>Client: 403 Forbidden
    end

    Server->>DB: 권한 있는 요청 처리
    DB-->>Server: 데이터 반환
    Server-->>Client: 200 OK + 데이터
```

---

## 8. 성능 최적화 구조

### 8.1 성능 최적화 전략

```mermaid
graph TB
    subgraph FE_Perf["프론트엔드 최적화"]
        Code["코드 분할<br/>(Code Splitting)"]
        Lazy["Lazy Loading<br/>(동적 로딩)"]
        Cache["브라우저 캐시<br/>(Cache Control)"]
        Assets["에셋 최적화<br/>(번들 최소화)"]
    end

    subgraph BE_Perf["백엔드 최적화"]
        Query["쿼리 최적화<br/>(인덱싱)"]
        Index["데이터베이스 인덱스<br/>(user_id)"]
        Connection["연결 풀<br/>(Connection Pool)"]
        Pagination["페이지네이션<br/>(Limit/Offset)"]
    end

    subgraph Infra["인프라 최적화"]
        CDN["CDN<br/>(정적 자산 배포)"]
        Compression["압축<br/>(gzip)"]
        Monitoring["모니터링<br/>(성능 추적)"]
    end

    FE_Perf -->|로드 시간| Performance
    BE_Perf -->|응답 시간| Performance
    Infra -->|배포 효율| Performance

    style FE_Perf fill:#e3f2fd
    style BE_Perf fill:#e8f5e9
    style Infra fill:#fce4ec
```

### 8.2 성능 목표

| 지표 | 목표 | 설명 |
|------|------|------|
| 초기 로드 시간 | < 2초 | 첫 페이지 렌더링 |
| API 응답 시간 | < 200ms | 평균 응답 시간 |
| 할일 목록 렌더링 | < 100ms | 50개 할일 기준 |
| TTI (Time to Interactive) | < 3초 | 사용자 상호작용 가능 시간 |

---

## 9. 시스템 상호작용 다이어그램

### 9.1 전체 데이터 흐름

```mermaid
graph LR
    subgraph User["사용자"]
        Desktop["데스크톱"]
        Mobile["모바일"]
    end

    subgraph Frontend["프론트엔드<br/>(React)"]
        Pages["페이지"]
        Hooks["상태 관리"]
        API_Call["API 호출"]
    end

    subgraph Backend["백엔드<br/>(Express)"]
        Routes["라우팅"]
        Auth["인증"]
        Logic["비즈니스 로직"]
    end

    subgraph DataLayer["데이터베이스<br/>(PostgreSQL)"]
        Users["Users 테이블"]
        Todos["Todos 테이블"]
    end

    Desktop -->|상호작용| Pages
    Mobile -->|상호작용| Pages
    Pages -->|상태 변경| Hooks
    Hooks -->|데이터 요청| API_Call
    API_Call -->|HTTP 요청| Routes
    Routes -->|라우팅| Auth
    Auth -->|인증 완료| Logic
    Logic -->|쿼리| Users
    Logic -->|쿼리| Todos
    Users -.->|참조| Todos

    style User fill:#e3f2fd
    style Frontend fill:#f3e5f5
    style Backend fill:#e8f5e9
    style DataLayer fill:#fce4ec
```

### 9.2 할일 생성 완전한 흐름

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as 프론트엔드<br/>UI
    participant React as React Hooks
    participant Service as API Service
    participant Backend as Express 서버
    participant DB as PostgreSQL

    User->>UI: 할일 입력 폼 작성
    Note over UI: 제목, 마감일 입력

    User->>UI: "추가하기" 버튼 클릭
    UI->>React: useTodos.addTodo() 호출

    React->>React: 입력값 검증 (클라이언트)
    alt 검증 실패
        React-->>UI: 에러 메시지 표시
        UI-->>User: "제목은 1~100자..."
    end

    React->>Service: TodoService.createTodo(data)
    Service->>Service: JWT 토큰 로드
    Service->>Backend: POST /todos<br/>(Authorization 헤더 포함)

    Backend->>Backend: 인증 미들웨어<br/>(JWT 검증)
    Backend->>Backend: 검증 미들웨어<br/>(입력값 검증)

    alt 검증 실패
        Backend-->>Service: 400 Bad Request
        Service-->>React: 에러 처리
        React-->>UI: 에러 메시지 표시
    end

    Backend->>Backend: TodoController<br/>(요청 처리)
    Backend->>Backend: TodoService<br/>(비즈니스 로직)
    Backend->>DB: INSERT INTO todos<br/>(user_id, title, due_date...)
    DB-->>Backend: 신규 할일 ID 반환

    Backend-->>Service: 201 Created<br/>(생성된 할일 객체)
    Service-->>React: 응답 처리
    React->>React: 상태 업데이트
    React-->>UI: 목록 재렌더링
    UI-->>User: 새 할일 표시<br/>("할일이 추가되었습니다")
```

---

## 10. 아키텍처 핵심 특징

### 10.1 3계층 분리의 장점

| 계층 | 장점 | 특징 |
|------|------|------|
| **프론트엔드** | 사용자 경험 최적화 | 반응형 UI, 빠른 인터랙션 |
| **백엔드** | 비즈니스 로직 집중 | 데이터 검증, 보안, 성능 |
| **데이터베이스** | 데이터 무결성 | ACID 특성, 일관성 보장 |

### 10.2 기술 스택 선택 근거

| 기술 | 선택 이유 | 대안 |
|------|----------|------|
| **React** | 컴포넌트 기반 UI, 큰 커뮤니티 | Vue, Angular |
| **Express** | 가볍고 유연함, Node.js 표준 | Fastify, Nest.js |
| **PostgreSQL** | 관계형 데이터, 강력함 | MySQL, MongoDB |
| **JWT** | 상태 비저장, 확장성 | 세션, OAuth |

### 10.3 확장성 고려사항

```mermaid
graph TB
    subgraph Current["현재 (MVP)"]
        FE1["프론트엔드 1개"]
        BE1["백엔드 1개"]
        DB1["데이터베이스 1개"]
    end

    subgraph Future["향후 확장"]
        FE2["프론트엔드<br/>(다중 배포)"]
        BE2["백엔드<br/>(수평 확장)"]
        DB2["데이터베이스<br/>(복제/샤딩)"]
        Cache["Redis<br/>(캐싱)"]
        Queue["메시지 큐<br/>(비동기 작업)"]
    end

    Current -->|마이그레이션| Future

    style Current fill:#e3f2fd
    style Future fill:#fff3e0
```

---

## 11. 배포 및 운영 체계

### 11.1 버전 관리 및 배포 프로세스

```mermaid
graph TB
    LocalDev["로컬 개발<br/>(feature 브랜치)"]
    GitPush["Git Push"]
    PR["Pull Request"]
    Review["코드 리뷰"]
    Test["자동 테스트"]
    Merge["Main 병합"]
    Deploy["배포<br/>(자동)"]
    Staging["스테이징 테스트"]
    Prod["프로덕션 배포"]

    LocalDev -->|커밋| GitPush
    GitPush -->|생성| PR
    PR -->|검토| Review
    Review -->|승인| Test
    Test -->|통과| Merge
    Merge -->|배포| Deploy
    Deploy -->|테스트| Staging
    Staging -->|확인| Prod

    style LocalDev fill:#e3f2fd
    style GitPush fill:#e8f5e9
    style PR fill:#fff3e0
    style Test fill:#f3e5f5
    style Prod fill:#fce4ec
```

### 11.2 환경별 설정

| 환경 | 데이터베이스 | API 엔드포인트 | 로깅 | HTTPS |
|------|-------------|---------------|------|-------|
| **로컬** | localhost | http://localhost:3000 | 콘솔 | 불필요 |
| **스테이징** | 클라우드 DB | https://api-staging.xxx | 파일 | 필수 |
| **프로덕션** | 관리형 DB | https://api.xxx | 서비스 | 필수 |

---

## 12. 아키텍처 결론

### 12.1 주요 설계 원칙

1. **단순성**: KISS 원칙으로 유지보수 용이
2. **확장성**: 향후 기능 추가 가능한 모듈식 설계
3. **보안**: 모든 계층에 보안 조치 적용
4. **성능**: API 응답 < 200ms, 페이지 로드 < 2초 목표
5. **일관성**: 전체 코드베이스의 일관된 패턴

### 12.2 향후 개선 방향

```mermaid
graph LR
    MVP["MVP<br/>(현재)"]
    Phase2["Phase 2<br/>(1-2개월)"]
    Phase3["Phase 3<br/>(3-6개월)"]

    MVP -->|카테고리<br/>검색<br/>필터링| Phase2
    Phase2 -->|알림<br/>협업<br/>다크모드| Phase3

    style MVP fill:#e8f5e9
    style Phase2 fill:#fff3e0
    style Phase3 fill:#fce4ec
```

---

**문서 버전 이력**

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-02-11 | 초기 작성 (3계층 아키텍처, 상세 다이어그램 포함) | 기술 아키텍처팀 |

---

## 참고 문서

- **1-domain-definition.md** - 비즈니스 도메인 및 요구사항
- **2-PRD.md** - 제품 요구사항 및 기술 스택
- **3-user-scenario.md** - 사용자 시나리오 및 사용 패턴
- **4-project-principle.md** - 프로젝트 구조 설계 원칙
