import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { DueDate } from '../DueDate.js';
import { InvalidDueDateError } from '../../exceptions/InvalidDueDateError.js';

describe('DueDate', () => {
  describe('생성 및 검증', () => {
    test('유효한 날짜로 DueDate를 생성할 수 있어야 함', () => {
      const dueDate = new DueDate('2024-12-31');
      expect(dueDate.getValue()).toBe('2024-12-31');
    });

    test('빈 문자열은 예외를 던져야 함', () => {
      expect(() => new DueDate('')).toThrow(InvalidDueDateError);
      expect(() => new DueDate('')).toThrow('마감일을 입력해주세요');
    });

    test('잘못된 형식은 예외를 던져야 함', () => {
      expect(() => new DueDate('2024/12/31')).toThrow(InvalidDueDateError);
      expect(() => new DueDate('31-12-2024')).toThrow(InvalidDueDateError);
      expect(() => new DueDate('2024-13-01')).toThrow(InvalidDueDateError);
    });

    test('유효하지 않은 날짜는 예외를 던져야 함', () => {
      expect(() => new DueDate('2024-02-30')).toThrow(InvalidDueDateError);
      expect(() => new DueDate('2024-13-01')).toThrow(InvalidDueDateError);
    });

    test('유효한 날짜 형식은 허용되어야 함', () => {
      expect(() => new DueDate('2024-01-01')).not.toThrow();
      expect(() => new DueDate('2024-12-31')).not.toThrow();
      expect(() => new DueDate('2024-02-29')).not.toThrow(); // 윤년
    });
  });

  describe('isOverdue', () => {
    let mockToday: string;

    beforeEach(() => {
      const today = new Date('2024-06-15');
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(today.toISOString());
      mockToday = '2024-06-15';
    });

    test('완료된 할일은 기한이 지나도 overdue가 아니어야 함', () => {
      const dueDate = new DueDate('2024-06-01');
      expect(dueDate.isOverdue(true)).toBe(false);
    });

    test('미완료 할일이 기한이 지났으면 overdue여야 함', () => {
      const dueDate = new DueDate('2024-06-14'); // 어제
      expect(dueDate.isOverdue(false)).toBe(true);
    });

    test('미완료 할일이 기한이 오늘이면 overdue가 아니어야 함', () => {
      const dueDate = new DueDate('2024-06-15'); // 오늘
      expect(dueDate.isOverdue(false)).toBe(false);
    });

    test('미완료 할일이 기한이 미래이면 overdue가 아니어야 함', () => {
      const dueDate = new DueDate('2024-06-16'); // 내일
      expect(dueDate.isOverdue(false)).toBe(false);
    });
  });

  describe('equals', () => {
    test('같은 날짜를 가진 DueDate는 동등해야 함', () => {
      const date1 = new DueDate('2024-12-31');
      const date2 = new DueDate('2024-12-31');
      expect(date1.equals(date2)).toBe(true);
    });

    test('다른 날짜를 가진 DueDate는 동등하지 않아야 함', () => {
      const date1 = new DueDate('2024-12-31');
      const date2 = new DueDate('2024-12-30');
      expect(date1.equals(date2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('toString은 날짜 문자열을 반환해야 함', () => {
      const dueDate = new DueDate('2024-12-31');
      expect(dueDate.toString()).toBe('2024-12-31');
    });
  });
});
