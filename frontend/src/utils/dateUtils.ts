/**
 * Formats a date string to YYYY-MM-DD format
 * @param dateString - Date string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to start of day for comparison
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0); // Set time to start of day for comparison
  
  return due < today;
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