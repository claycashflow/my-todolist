export const ko = {
  // 공통
  common: {
    email: '이메일',
    password: '비밀번호',
    username: '사용자명',
    title: '제목',
    description: '설명',
    dueDate: '마감일',
    submit: '제출',
    cancel: '취소',
    edit: '수정',
    delete: '삭제',
    save: '저장',
    loading: '로딩 중...',
    logout: '로그아웃',
    hello: '안녕하세요',
  },

  // 로그인
  login: {
    title: '로그인',
    button: '로그인',
    noAccount: '계정이 없으신가요?',
    signUp: '회원가입',
    emailPlaceholder: '이메일을 입력하세요',
    passwordPlaceholder: '비밀번호를 입력하세요',
  },

  // 회원가입
  register: {
    title: '회원가입',
    button: '가입하기',
    hasAccount: '이미 계정이 있으신가요?',
    signIn: '로그인',
    usernamePlaceholder: '4~20자, 영문/숫자만',
    passwordPlaceholder: '8자 이상',
    confirmPassword: '비밀번호 확인',
    usernameInvalid: '아이디는 4~20자의 영문과 숫자로 입력해주세요',
    passwordTooShort: '비밀번호는 8자 이상 입력해주세요',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    usernameTaken: '이미 사용 중인 아이디입니다',
    success: '회원가입이 완료되었습니다. 로그인해주세요.',
    processing: '처리 중...',
  },

  // Todo
  todo: {
    title: '할일 목록',
    addNew: '+ 새 할일 추가',
    addTitle: '새 할일 추가',
    editTitle: '할일 수정',
    done: '완료됨',
    overdue: '지연',
    empty: '할일이 없습니다',
    emptyIcon: '📝',
    titlePlaceholder: '1~100자',
    descriptionPlaceholder: '최대 1000자',
    updateButton: '수정하기',
    addButton: '추가하기',
    deleteConfirm: '정말 삭제하시겠습니까?',
    deleteMessage: '할일을 삭제하면 복구할 수 없습니다.',
    deleteButton: '삭제하기',
    upcomingSection: '예정',
    completedSection: '완료',
    emptyUpcoming: '예정된 할일이 없습니다',
    emptyCompleted: '완료된 할일이 없습니다',
  },

  // 에러 메시지
  errors: {
    titleRequired: '제목은 1자 이상 입력해주세요',
    titleTooLong: '제목은 100자 이하로 입력해주세요',
    dueDateRequired: '유효한 마감일을 입력해주세요',
    saveFailed: '할일 저장에 실패했습니다. 다시 시도해주세요.',
    loginFailed: '아이디 또는 비밀번호가 일치하지 않습니다',
    registerFailed: '회원가입에 실패했습니다',
  },
};

export type TranslationKeys = typeof ko;
