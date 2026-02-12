/**
 * Validates username
 * @param username - Username to validate
 * @returns True if valid, false otherwise
 */
export const validateUsername = (username: string): boolean => {
  return username.length >= 4 && username.length <= 20 && /^[a-zA-Z0-9]+$/.test(username);
};

/**
 * Gets username validation error message
 * @param username - Username to validate
 * @returns Error message if invalid, null otherwise
 */
export const getUsernameErrorMessage = (username: string): string | null => {
  if (username.length < 4) {
    return '아이디는 4자 이상이어야 합니다';
  }
  if (username.length > 20) {
    return '아이디는 20자 이하여야 합니다';
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return '아이디는 영문과 숫자만 사용할 수 있습니다';
  }
  return null;
};

/**
 * Validates password
 * @param password - Password to validate
 * @returns True if valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Gets password validation error message
 * @param password - Password to validate
 * @returns Error message if invalid, null otherwise
 */
export const getPasswordErrorMessage = (password: string): string | null => {
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다';
  }
  return null;
};

/**
 * Validates todo title
 * @param title - Title to validate
 * @returns True if valid, false otherwise
 */
export const validateTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.trim().length <= 100;
};

/**
 * Gets title validation error message
 * @param title - Title to validate
 * @returns Error message if invalid, null otherwise
 */
export const getTitleErrorMessage = (title: string): string | null => {
  if (title.trim().length < 1) {
    return '제목은 1자 이상이어야 합니다';
  }
  if (title.trim().length > 100) {
    return '제목은 100자 이하여야 합니다';
  }
  return null;
};

/**
 * Validates todo description
 * @param description - Description to validate
 * @returns True if valid, false otherwise
 */
export const validateDescription = (description: string): boolean => {
  return description.length <= 1000;
};

/**
 * Gets description validation error message
 * @param description - Description to validate
 * @returns Error message if invalid, null otherwise
 */
export const getDescriptionErrorMessage = (description: string): string | null => {
  if (description.length > 1000) {
    return '설명은 1000자 이하여야 합니다';
  }
  return null;
};

/**
 * Validates due date
 * @param dueDate - Due date to validate
 * @returns True if valid, false otherwise
 */
export const validateDueDate = (dueDate: string): boolean => {
  const date = new Date(dueDate);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Gets due date validation error message
 * @param dueDate - Due date to validate
 * @returns Error message if invalid, null otherwise
 */
export const getDueDateErrorMessage = (dueDate: string): string | null => {
  if (!dueDate) {
    return '마감일을 입력해주세요';
  }
  const date = new Date(dueDate);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '유효한 날짜 형식이 아닙니다';
  }
  return null;
};