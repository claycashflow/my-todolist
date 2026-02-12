import { InvalidDueDateError } from '../exceptions/InvalidDueDateError.js';

export class DueDate {
  private readonly value: string;

  constructor(dueDate: string) {
    this.validate(dueDate);
    this.value = dueDate;
  }

  private validate(dueDate: string): void {
    if (!dueDate) {
      throw new InvalidDueDateError('마감일을 입력해주세요');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      throw new InvalidDueDateError('마감일은 YYYY-MM-DD 형식이어야 합니다');
    }

    const [year, month, day] = dueDate.split('-').map(Number);

    if (month < 1 || month > 12) {
      throw new InvalidDueDateError('유효하지 않은 날짜입니다');
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      throw new InvalidDueDateError('유효하지 않은 날짜입니다');
    }
  }

  getValue(): string {
    return this.value;
  }

  isOverdue(done: boolean): boolean {
    if (done) return false;
    const today = new Date().toISOString().split('T')[0];
    return this.value < today;
  }

  equals(other: DueDate): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
