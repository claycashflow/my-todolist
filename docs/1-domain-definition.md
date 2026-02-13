# 도메인 정의서

**버전**: 2.0
**최종 수정일**: 2026-02-13
**작성자**: 비즈니스 분석팀
**데이터베이스**: PostgreSQL 17
**아키텍처**: Clean Architecture (DDD)

## 1. 프로젝트 개요

### 1.1 프로젝트 배경
개인 일정을 효율적으로 관리할 수 있는 도구의 부재로 인한 생산성 저하 문제를 해결하기 위한 웹 기반 일정관리 애플리케이션 개발

### 1.2 목표
- 인증된 사용자에게 개인 할 일 관리 기능 제공
- 마감일 기반의 효율적인 일정 관리 지원
- 브라우저 환경에서 언제 어디서나 접근 가능한 서비스 제공

### 1.3 범위
- 회원 가입 및 인증 기능
- 개인 할 일(Todo) CRUD 기능
- 마감일 관리 및 시각적 알림
- 완료 상태 관리

---

## 2. 비즈니스 도메인 정의

### 2.1 핵심 도메인
**일정관리 (Todo Management)**
- 사용자가 자신의 할 일을 생성하고 관리하는 핵심 업무 영역
- 마감일 기반으로 우선순위를 파악하고 작업을 완료 처리하는 프로세스

### 2.2 지원 도메인
**사용자 인증 (User Authentication)**
- 회원 가입 및 로그인을 통한 사용자 식별
- 개인 데이터 보호 및 접근 제어

---

## 3. 핵심 엔티티 및 속성

**아키텍처 패턴**: Clean Architecture (DDD) 적용
- **엔티티 (Entity)**: 비즈니스 로직과 상태를 캡슐화
- **값 객체 (Value Object)**: 불변 객체로 도메인 개념 표현 및 검증
- **도메인 예외 (Domain Exception)**: 비즈니스 규칙 위반 시 명확한 에러 처리

### 3.1 사용자 (User)
| 속성 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|------|------|---------|
| id | String | O | 사용자 고유 식별자 | UUID v4 |
| username | String | O | 로그인 아이디 (unique) | 4~20자, 영문/숫자 조합 |
| password | String | O | 암호화된 비밀번호 | 최소 8자 이상 (해시 저장) |
| createdAt | DateTime | O | 가입 일시 | ISO 8601 형식 |

### 3.2 할일 (Todo) - 엔티티
| 속성 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|------|------|---------|
| id | String | O | 할 일 고유 식별자 | UUID v4 |
| userId | String | O | 소유자 (User 참조) | User.id 외래키 |
| title | TodoTitle (VO) | O | 할 일 제목 | 1~100자 (Value Object로 캡슐화) |
| description | String | X | 할 일 상세 설명 | 최대 1000자 |
| dueDate | DueDate (VO) | O | 마감 날짜 | YYYY-MM-DD 형식 (Value Object로 캡슐화) |
| done | Boolean | O | 완료 여부 (기본값: false) | true/false |
| createdAt | DateTime | O | 생성 일시 | ISO 8601 형식 |
| updatedAt | DateTime | O | 수정 일시 | ISO 8601 형식 |

**비즈니스 메서드**:
- `markAsDone()`: 할 일 완료 처리
- `markAsUndone()`: 할 일 미완료로 변경
- `updateTitle(newTitle: TodoTitle)`: 제목 수정
- `updateDescription(newDesc: string)`: 설명 수정
- `updateDueDate(newDate: DueDate)`: 마감일 수정
- `isOverdue(currentDate: Date): boolean`: 지연 여부 계산

### 3.3 값 객체 (Value Objects)

#### 3.3.1 TodoTitle (할 일 제목)
| 속성 | 타입 | 설명 | 검증 규칙 |
|------|------|------|----------|
| value | string | 제목 텍스트 | 1~100자, 공백 제거 후 검증 |

**검증 로직**:
- 빈 문자열 또는 null/undefined 거부 → `InvalidTitleError`
- 공백만 있는 문자열 거부 → `InvalidTitleError`
- 100자 초과 거부 → `InvalidTitleError`
- 불변 객체 (immutable)

#### 3.3.2 DueDate (마감일)
| 속성 | 타입 | 설명 | 검증 규칙 |
|------|------|------|----------|
| value | Date | 마감 날짜 | 유효한 날짜 형식 |

**검증 로직**:
- 유효하지 않은 날짜 거부 → `InvalidDueDateError`
- 날짜 형식 YYYY-MM-DD 강제
- 불변 객체 (immutable)

**비즈니스 메서드**:
- `isOverdue(currentDate: Date): boolean`: 현재 날짜 기준 지연 여부 계산
- `isSameDay(other: DueDate): boolean`: 두 날짜가 같은 날인지 비교
- `format(): string`: YYYY-MM-DD 형식으로 포맷팅

### 3.4 도메인 예외 (Domain Exceptions)

| 예외 클래스 | 발생 조건 | HTTP 상태 |
|------------|----------|-----------|
| `DomainException` | 도메인 예외 베이스 클래스 | - |
| `TodoNotFoundError` | 존재하지 않는 할 일 ID 조회 시 | 404 |
| `InvalidTitleError` | 제목 검증 실패 (빈 문자열, 100자 초과) | 400 |
| `InvalidDueDateError` | 마감일 검증 실패 (유효하지 않은 날짜) | 400 |
| `UnauthorizedAccessError` | 권한 없는 사용자의 할 일 접근 시도 | 403 |

**예외 처리 흐름**:
1. **도메인 계층**: Value Object 또는 Entity에서 비즈니스 규칙 위반 시 예외 발생
2. **애플리케이션 계층**: Use Case에서 예외 포착 및 전파
3. **프레젠테이션 계층**: Error Handler에서 HTTP 응답으로 변환

---

## 4. 주요 비즈니스 규칙

**구현 계층**:
- **도메인 계층**: Value Object 및 Entity 수준의 검증
- **애플리케이션 계층**: Use Case를 통한 비즈니스 로직 실행
- **프레젠테이션 계층**: HTTP 요청/응답 처리 및 DTO 변환
- **인프라스트럭처 계층**: 데이터 영속성 및 외부 시스템 연동

### 4.1 인증 및 권한
- **BR-001**: 회원 가입은 누구나 할 수 있으며, username은 중복될 수 없다
  - 검증: username 4~20자, 영문/숫자만 허용, DB에 동일 username 존재 시 409 에러
  - 검증: password 최소 8자 이상, 저장 시 bcrypt 해시화
  - 구현: `POST /auth/register`

- **BR-002**: 로그인 시 username과 password가 일치해야 세션이 생성된다
  - 검증: DB에서 username 조회 후 password 해시 비교
  - 성공: JWT 토큰 발급 (유효기간 24시간)
  - 실패: 401 Unauthorized, "아이디 또는 비밀번호가 일치하지 않습니다"
  - 구현: `POST /auth/login`

- **BR-003**: 할 일 생성, 조회, 수정, 삭제는 인증된 사용자만 가능하다
  - 검증: Authorization 헤더의 JWT 토큰 유효성 확인
  - 실패: 401 Unauthorized, "로그인이 필요합니다"
  - 구현: `authMiddleware` (모든 /todos/* 경로에 적용)

- **BR-004**: 사용자는 자신이 생성한 할 일만 조회 및 수정할 수 있다
  - 검증: Todo.userId === JWT payload.userId
  - 실패: 403 Forbidden, "권한이 없습니다"
  - 구현: `ownershipMiddleware`

### 4.2 할일 관리
- **BR-005**: 할 일 생성 시 제목(title)과 마감일(dueDate)은 필수 입력값이다
  - **도메인 계층 검증** (Value Object):
    - `TodoTitle`: title이 null, undefined, 빈 문자열("") 또는 공백만 있으면 `InvalidTitleError` 발생
    - `TodoTitle`: title 길이가 1~100자 범위를 벗어나면 `InvalidTitleError` 발생
    - `DueDate`: dueDate가 유효한 날짜 형식(YYYY-MM-DD)이 아니면 `InvalidDueDateError` 발생
  - **애플리케이션 계층**: `CreateTodoUseCase`에서 검증된 Value Object를 사용하여 Todo Entity 생성
  - **프레젠테이션 계층**: `TodoController`에서 DTO를 받아 Use Case 호출
  - 에러 메시지: "제목은 1~100자로 입력해주세요", "유효한 마감일을 입력해주세요"
  - 구현: `POST /api/todos` → `TodoController.createTodo()` → `CreateTodoUseCase.execute()`

- **BR-006**: 마감일이 현재 날짜보다 이전인 할 일은 "지연됨" 상태로 표시한다
  - **도메인 계층**: `DueDate.isOverdue(currentDate)` 메서드로 지연 여부 계산
  - **엔티티 메서드**: `Todo.isOverdue(currentDate)` → `this.dueDate.isOverdue(currentDate) && !this.done`
  - 계산식: `isOverdue = (dueDate < today) && (done === false)`
  - 날짜 비교: 시간 제외, 날짜만 비교 (00:00:00 기준)
  - 마감일이 오늘인 경우: 지연되지 않은 것으로 간주
  - **애플리케이션 계층**: `TodoMapper`에서 DTO 변환 시 `isOverdue` 필드 추가
  - UI 표시: isOverdue=true인 할일은 빨간색 배경(#ffebee), 경고 아이콘 표시
  - 구현: `GET /api/todos` → `GetUserTodosUseCase.execute()` → `TodoMapper.toResponseDTO()` (isOverdue 포함)

- **BR-007**: 완료 처리된 할 일(done=true)은 지연 여부와 관계없이 완료 상태로 표시한다
  - UI 표시: 취소선, 회색 텍스트, 체크 아이콘
  - 완료된 할일은 BR-006의 지연 스타일 적용 안 함
  - 구현: 프론트엔드 스타일 조건부 적용

- **BR-008**: 할 일 수정 시 제목, 설명, 마감일, 완료 여부를 변경할 수 있다
  - **도메인 계층**:
    - `Todo.updateTitle(newTitle: TodoTitle)`: 제목 수정 (Value Object 검증)
    - `Todo.updateDueDate(newDate: DueDate)`: 마감일 수정 (Value Object 검증)
    - `Todo.updateDescription(newDesc: string)`: 설명 수정
    - `Todo.markAsDone()` / `Todo.markAsUndone()`: 완료 상태 변경
  - **애플리케이션 계층**: `UpdateTodoUseCase`에서 Entity 메서드 호출
  - 검증: 수정하는 필드에 대해 BR-005와 동일한 Value Object 검증 적용
  - 부분 수정 허용: 변경할 필드만 전송 가능 (DTO에서 선택적 필드로 정의)
  - 구현: `PUT /api/todos/:id` → `TodoController.updateTodo()` → `UpdateTodoUseCase.execute()`

- **BR-009**: 할 일 삭제 시 복구할 수 없으며 영구 삭제된다
  - **애플리케이션 계층**: `DeleteTodoUseCase`에서 삭제 로직 실행
  - **인프라스트럭처 계층**: `TodoRepositoryPostgres.delete(id)` → PostgreSQL에서 영구 삭제
  - UI 확인: 삭제 전 "정말 삭제하시겠습니까?" 확인 대화상자 표시 (프론트엔드)
  - 성공: 204 No Content (응답 본문 없음)
  - 구현: `DELETE /api/todos/:id` → `TodoController.deleteTodo()` → `DeleteTodoUseCase.execute()`

### 4.3 데이터 무결성
- **BR-010**: 사용자 삭제 기능은 제공하지 않는다
  - 사용자 계정 관리는 향후 관리자 기능으로 별도 구현 예정
  - 대안: 계정 비활성화 기능 고려

- **BR-011**: 할 일은 반드시 하나의 사용자에게 귀속되어야 한다
  - 검증: Todo 생성 시 userId는 필수이며, 존재하는 User.id여야 함
  - 외래키 제약: DB 레벨에서 참조 무결성 보장
  - 구현: 데이터베이스 스키마 설계 시 반영

---

## 5. 사용자 시나리오

### 5.1 회원 가입 및 로그인
```
Given: 서비스 접속
When: 회원 가입 페이지에서 username "newuser", password "password123" 입력 후 가입
Then:
  - HTTP 201 Created 응답
  - 계정이 DB에 생성됨 (password는 해시화되어 저장)
  - 로그인 페이지로 리다이렉트
  - 검증 규칙: BR-001

Given: 가입된 계정 정보
When: 로그인 페이지에서 username과 password 입력
Then:
  - HTTP 200 OK 응답
  - JWT 토큰 발급 (응답 본문 또는 쿠키)
  - 할 일 목록 페이지로 이동
  - 검증 규칙: BR-002
```

### 5.2 할일 등록
```
Given: 로그인된 사용자 (JWT 토큰 보유)
When: 할 일 추가 버튼 클릭 후 제목 "보고서 작성", 설명 "분기 실적 보고서", 마감일 "2026-02-15" 입력
Then:
  - HTTP 201 Created 응답
  - 응답 본문에 생성된 할일 객체 포함 (id, userId, title, description, dueDate, done=false)
  - 할일 목록 페이지에 새 항목이 즉시 표시됨
  - 검증 규칙: BR-003, BR-005
```

### 5.3 할일 조회 및 상태 확인
```
Given: 등록된 할 일이 존재
When: 할 일 목록 페이지 접속
Then:
  - HTTP 200 OK 응답
  - 본인의 할 일 목록이 배열로 반환됨 (각 항목에 isOverdue 필드 포함)
  - UI 표시:
    * 마감일 지난 미완료 할일: 빨간색 배경(#ffebee) + 경고 아이콘
    * 완료된 할일: 취소선 + 회색 텍스트 + 체크 아이콘
    * 일반 할일: 기본 스타일
  - 검증 규칙: BR-003, BR-006, BR-007
```

### 5.4 할일 완료 처리
```
Given: 미완료 상태(done=false)의 할 일
When: 할 일 항목의 완료 체크박스 클릭
Then:
  - HTTP 200 OK 응답
  - done 필드가 true로 변경됨
  - UI에서 취소선 + 회색 텍스트 + 체크 아이콘 표시
  - 지연 상태였어도 지연 스타일 제거됨
  - 검증 규칙: BR-003, BR-004, BR-007
```

### 5.5 할일 수정
```
Given: 기존 할 일 선택 (본인 소유)
When: 수정 버튼 클릭 후 제목을 "보고서 완성"으로, 마감일을 "2026-02-20"으로 변경
Then:
  - HTTP 200 OK 응답
  - 응답 본문에 수정된 할일 객체 포함
  - 목록에서 즉시 변경사항 반영
  - updatedAt 타임스탬프 갱신
  - 검증 규칙: BR-003, BR-004, BR-008
```

### 5.6 할일 삭제
```
Given: 기존 할 일 선택 (본인 소유)
When: 삭제 버튼 클릭 후 "정말 삭제하시겠습니까?" 확인
Then:
  - HTTP 204 No Content 응답
  - DB에서 영구 삭제 (복구 불가)
  - 목록에서 즉시 제거됨
  - 검증 규칙: BR-003, BR-004, BR-009
```

### 5.7 마감일 지연 알림
```
Given: 마감일이 2026-02-09인 미완료 할 일 (done=false)
When: 현재 날짜가 2026-02-10 이후
Then:
  - GET /todos 응답에서 해당 할일의 isOverdue=true
  - UI에서 빨간색 배경(#ffebee) + 경고 아이콘으로 표시
  - 완료 처리하면 즉시 일반 스타일로 변경
  - 검증 규칙: BR-006
```

### 5.8 예외: 중복 사용자 가입
```
Given: 이미 존재하는 username "testuser"
When: 동일한 username "testuser"로 회원 가입 시도
Then:
  - HTTP 409 Conflict 응답
  - 에러 메시지: "이미 사용 중인 아이디입니다"
  - 가입 폼 유지 (다른 username 입력 가능)
  - 검증 규칙: BR-001
```

### 5.9 예외: 잘못된 로그인 정보
```
Given: 존재하지 않는 username 또는 잘못된 password
When: 로그인 페이지에서 username "wronguser", password "wrongpass" 입력
Then:
  - HTTP 401 Unauthorized 응답
  - 에러 메시지: "아이디 또는 비밀번호가 일치하지 않습니다"
  - 로그인 폼 유지
  - 검증 규칙: BR-002
```

### 5.10 예외: 필수 입력값 누락
```
Given: 로그인된 사용자
When: 제목(title) 없이 할일 생성 시도 (빈 문자열 또는 공백만)
Then:
  - HTTP 400 Bad Request 응답
  - 에러 메시지: "제목은 1~100자로 입력해주세요"
  - 입력 폼 유지 (다시 입력 가능)
  - 검증 규칙: BR-005
```

### 5.11 예외: 권한 없는 할일 접근
```
Given: 사용자 A로 로그인
When: 사용자 B가 작성한 할일을 수정 또는 삭제 시도
Then:
  - HTTP 403 Forbidden 응답
  - 에러 메시지: "권한이 없습니다"
  - 목록 페이지로 리다이렉트
  - 검증 규칙: BR-004
```

---

## 6. Clean Architecture 구현 세부사항

### 6.1 계층별 책임

#### 6.1.1 도메인 계층 (Domain Layer)
**위치**: `backend/src/domain/`
**책임**: 핵심 비즈니스 로직 및 규칙 캡슐화
**의존성**: 없음 (외부 의존성 금지)

**구성 요소**:
- **엔티티 (Entities)**: 비즈니스 객체 및 상태 관리
  - `Todo.ts`: 할 일 엔티티
  - 메서드: `markAsDone()`, `updateTitle()`, `isOverdue()` 등
- **값 객체 (Value Objects)**: 불변 도메인 개념
  - `TodoTitle.ts`: 제목 검증 및 캡슐화
  - `DueDate.ts`: 마감일 검증 및 비교 로직
- **저장소 인터페이스 (Repository Interfaces)**: 데이터 접근 추상화
  - `ITodoRepository.ts`: CRUD 메서드 정의
- **도메인 예외 (Domain Exceptions)**: 비즈니스 규칙 위반 표현
  - `DomainException.ts`, `TodoNotFoundError.ts`, `InvalidTitleError.ts` 등

#### 6.1.2 애플리케이션 계층 (Application Layer)
**위치**: `backend/src/application/`
**책임**: 애플리케이션 로직 조율 (Use Case 실행)
**의존성**: 도메인 계층만 의존

**구성 요소**:
- **Use Cases**: 단일 비즈니스 작업 실행
  - `CreateTodoUseCase.ts`: 할 일 생성 로직
  - `GetUserTodosUseCase.ts`: 사용자 할 일 목록 조회
  - `UpdateTodoUseCase.ts`: 할 일 수정
  - `DeleteTodoUseCase.ts`: 할 일 삭제
- **DTOs (Data Transfer Objects)**: 계층 간 데이터 전송
  - `CreateTodoDTO.ts`: 생성 요청 데이터
  - `UpdateTodoDTO.ts`: 수정 요청 데이터
  - `TodoResponseDTO.ts`: 응답 데이터 (isOverdue 포함)
- **Mappers**: Entity ↔ DTO 변환
  - `TodoMapper.ts`: `toEntity()`, `toResponseDTO()` 메서드

#### 6.1.3 인프라스트럭처 계층 (Infrastructure Layer)
**위치**: `backend/src/infrastructure/`
**책임**: 외부 시스템 연동 및 기술적 구현
**의존성**: 도메인 인터페이스 구현

**구성 요소**:
- **저장소 구현 (Repository Implementation)**:
  - `TodoRepositoryPostgres.ts`: PostgreSQL 기반 Repository 구현
  - `ITodoRepository` 인터페이스 구현
  - pg 라이브러리를 사용한 SQL 쿼리 실행
- **보안 (Security)**:
  - `PasswordHasher.ts`: bcryptjs를 사용한 비밀번호 해싱
  - `JwtTokenProvider.ts`: JWT 토큰 생성 및 검증
- **DI Container**:
  - `Container.ts`: Singleton 패턴, Use Case 및 Repository 인스턴스 관리

#### 6.1.4 프레젠테이션 계층 (Presentation Layer)
**위치**: `backend/src/presentation/`
**책임**: HTTP 요청/응답 처리
**의존성**: 애플리케이션 계층 (Use Cases)

**구성 요소**:
- **컨트롤러 (Controllers)**:
  - `TodoController.ts`: HTTP 요청을 Use Case 호출로 변환
  - DTO 생성 및 응답 포맷팅
- **라우트 (Routes)**:
  - `todoRoutes.ts`: Express 라우트 정의
  - 미들웨어 적용 (인증, 검증)
- **미들웨어 (Middleware)**:
  - `errorHandler.ts`: 도메인 예외를 HTTP 응답으로 변환

### 6.2 의존성 주입 (Dependency Injection)

**DI Container 구조**:
```typescript
class Container {
  private static instance: Container;

  // Repositories
  public todoRepository: ITodoRepository;

  // Use Cases
  public createTodoUseCase: CreateTodoUseCase;
  public getUserTodosUseCase: GetUserTodosUseCase;
  public getTodoUseCase: GetTodoUseCase;
  public updateTodoUseCase: UpdateTodoUseCase;
  public deleteTodoUseCase: DeleteTodoUseCase;

  private constructor() {
    // Repository 인스턴스 생성
    this.todoRepository = new TodoRepositoryPostgres(pool);

    // Use Case에 Repository 주입
    this.createTodoUseCase = new CreateTodoUseCase(this.todoRepository);
    // ... 나머지 Use Cases
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}
```

**이점**:
- 테스트 시 Mock Repository 주입 가능
- Repository 구현체 변경 용이 (PostgreSQL → MongoDB 등)
- Use Case 재사용성 증가

### 6.3 데이터 흐름 예시 (할 일 생성)

```
1. [프론트엔드] POST /api/todos { title, description, dueDate }
2. [Controller] TodoController.createTodo(req, res)
   - req.body에서 DTO 생성: CreateTodoDTO
   - req.user에서 userId 추출 (authMiddleware에서 설정)
3. [Use Case] CreateTodoUseCase.execute(dto)
   - TodoTitle Value Object 생성 → 검증 (1~100자)
   - DueDate Value Object 생성 → 검증 (유효한 날짜)
   - Todo Entity 생성: new Todo(...)
4. [Repository] todoRepository.save(todo)
   - PostgreSQL INSERT 쿼리 실행
   - 생성된 UUID 반환
5. [Mapper] TodoMapper.toResponseDTO(todo)
   - Entity → DTO 변환
   - isOverdue 필드 계산 추가
6. [Controller] HTTP 201 Created 응답
   - JSON 형식으로 TodoResponseDTO 반환
```

### 6.4 테스트 전략

#### 6.4.1 도메인 계층 테스트
- **단위 테스트**: Value Object 및 Entity 검증 로직
- 프레임워크: Jest
- 예시: `TodoTitle.test.ts`, `DueDate.test.ts`, `Todo.test.ts`

#### 6.4.2 애플리케이션 계층 테스트
- **단위 테스트**: Use Case 로직 (Mock Repository 사용)
- 프레임워크: Jest
- 예시: `CreateTodoUseCase.test.ts`, `UpdateTodoUseCase.test.ts`

#### 6.4.3 통합 테스트
- **E2E 테스트**: 실제 데이터베이스 또는 테스트 DB 사용
- Controller → Use Case → Repository → PostgreSQL
- 프레임워크: Jest + Supertest

---

## 부록 A: 용어 정의

| 용어 | 정의 |
|------|------|
| 할일 (Todo) | 사용자가 완료해야 하는 작업 항목 |
| 마감일 (Due Date) | 할 일을 완료해야 하는 기한 |
| 완료 여부 (Done) | 할 일의 완료 상태를 나타내는 불린 값 |
| 지연됨 (Overdue) | 마감일이 지났으나 완료되지 않은 상태 |
| 인증 (Authentication) | 사용자 신원을 확인하는 프로세스 |
| JWT (JSON Web Token) | 사용자 인증 정보를 담은 토큰 |
| **Clean Architecture** | 계층을 분리하여 의존성을 관리하는 아키텍처 패턴 |
| **DDD (Domain-Driven Design)** | 도메인 중심 설계 방법론 |
| **엔티티 (Entity)** | 고유 식별자를 가지고 생명주기 동안 변경 가능한 비즈니스 객체 |
| **값 객체 (Value Object)** | 속성으로만 식별되는 불변 객체 (예: TodoTitle, DueDate) |
| **Use Case** | 단일 비즈니스 작업을 수행하는 애플리케이션 로직 단위 |
| **Repository** | 데이터 저장소 접근을 추상화한 인터페이스 |
| **DTO (Data Transfer Object)** | 계층 간 데이터 전송을 위한 객체 |
| **도메인 예외 (Domain Exception)** | 비즈니스 규칙 위반을 나타내는 예외 클래스 |
| **DI (Dependency Injection)** | 의존성을 외부에서 주입하는 디자인 패턴 |
| **Mapper** | 객체 간 변환을 담당하는 유틸리티 (Entity ↔ DTO) |

---

## 부록 B: 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-02-10 | 최초 작성 (프로젝트 개요, 엔티티, 비즈니스 규칙, 시나리오) | 비즈니스 분석팀 |
| 1.1 | 2026-02-10 | 품질 평가 결과 반영: 검증 기준 구체화, 예외 시나리오 추가(5.8~5.11), 구현 위치 태그 추가, 엔티티 제약조건 명시 | 비즈니스 분석팀 |
| 2.0 | 2026-02-13 | 실제 구현 반영: Clean Architecture 적용, 도메인 계층/애플리케이션 계층/인프라스트럭처 계층 분리, Use Case 패턴 적용, Repository 패턴 적용, Value Object 패턴 추가 (TodoTitle, DueDate), DI Container 추가, 엔티티 모델 업데이트 | 비즈니스 분석팀 |

---

## 부록 C: 다음 단계

이 도메인 정의서를 바탕으로 다음 문서를 작성할 예정:
- `2-api-specification.md` - REST API 엔드포인트 상세 명세
- `3-database-schema.md` - 데이터베이스 스키마 설계
- `4-ui-wireframe.md` - 화면 설계 및 와이어프레임
