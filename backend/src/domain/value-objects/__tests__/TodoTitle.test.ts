import { describe, test, expect } from '@jest/globals';
import { TodoTitle } from '../TodoTitle.js';
import { InvalidTitleError } from '../../exceptions/InvalidTitleError.js';

describe('TodoTitle', () => {
  describe('생성 및 검증', () => {
    test('유효한 제목으로 TodoTitle을 생성할 수 있어야 함', () => {
      const title = new TodoTitle('할 일 제목');
      expect(title.getValue()).toBe('할 일 제목');
    });

    test('앞뒤 공백이 제거되어야 함', () => {
      const title = new TodoTitle('  할 일 제목  ');
      expect(title.getValue()).toBe('할 일 제목');
    });

    test('빈 문자열은 예외를 던져야 함', () => {
      expect(() => new TodoTitle('')).toThrow(InvalidTitleError);
      expect(() => new TodoTitle('')).toThrow('제목을 입력해주세요');
    });

    test('공백만 있는 문자열은 예외를 던져야 함', () => {
      expect(() => new TodoTitle('   ')).toThrow(InvalidTitleError);
    });

    test('100자를 초과하는 제목은 예외를 던져야 함', () => {
      const longTitle = 'a'.repeat(101);
      expect(() => new TodoTitle(longTitle)).toThrow(InvalidTitleError);
      expect(() => new TodoTitle(longTitle)).toThrow('최대 100자까지');
    });

    test('정확히 100자인 제목은 허용되어야 함', () => {
      const title = new TodoTitle('a'.repeat(100));
      expect(title.getValue()).toHaveLength(100);
    });
  });

  describe('equals', () => {
    test('같은 값을 가진 TodoTitle은 동등해야 함', () => {
      const title1 = new TodoTitle('할 일 제목');
      const title2 = new TodoTitle('할 일 제목');
      expect(title1.equals(title2)).toBe(true);
    });

    test('다른 값을 가진 TodoTitle은 동등하지 않아야 함', () => {
      const title1 = new TodoTitle('할 일 1');
      const title2 = new TodoTitle('할 일 2');
      expect(title1.equals(title2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('toString은 제목 문자열을 반환해야 함', () => {
      const title = new TodoTitle('할 일 제목');
      expect(title.toString()).toBe('할 일 제목');
    });
  });
});
