import { DomainException } from './DomainException.js';

export class InvalidTitleError extends DomainException {
  constructor(message: string = '유효하지 않은 제목입니다') {
    super(message, 'INVALID_TITLE', 400);
  }
}
