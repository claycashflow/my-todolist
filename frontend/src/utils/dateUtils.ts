/**
 * Formats a date string to YYYY-MM-DD format
 * @param dateString - Date string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (dateString: string): string => {
  // 이미 YYYY-MM-DD 형식이면 그대로 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // ISO 형식(YYYY-MM-DDTHH:mm:ss.sssZ)이면 날짜 부분만 추출
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  // 그 외의 경우 UTC 기준으로 파싱하여 변환
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date is overdue
 * @param dueDate - Due date string in YYYY-MM-DD format
 * @param done - Whether the task is completed
 * @returns True if the task is overdue, false otherwise
 */
export const isOverdue = (dueDate: string, done: boolean): boolean => {
  if (done) return false;

  // YYYY-MM-DD 형식으로 문자열 비교 (시간대 문제 방지)
  const today = new Date().toISOString().split('T')[0];
  const formattedDueDate = formatDate(dueDate);

  return formattedDueDate < today;
};

/**
 * Validates a date string
 * @param dateString - Date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};