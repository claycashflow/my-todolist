import { DomainException } from './DomainException.js';

export class InvalidDueDateError extends DomainException {
  constructor(message: string = '유효하지 않은 마감일입니다') {
    super(message, 'INVALID_DUE_DATE', 400);
  }
}
