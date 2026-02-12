import { InvalidTitleError } from '../exceptions/InvalidTitleError.js';

export class TodoTitle {
  private readonly value: string;

  constructor(title: string) {
    this.validate(title);
    this.value = title.trim();
  }

  private validate(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new InvalidTitleError('제목을 입력해주세요');
    }
    if (title.length > 100) {
      throw new InvalidTitleError('제목은 최대 100자까지 입력 가능합니다');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TodoTitle): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
