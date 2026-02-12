import { DomainException } from './DomainException.js';

export class UnauthorizedAccessError extends DomainException {
  constructor(message: string = '접근 권한이 없습니다') {
    super(message, 'UNAUTHORIZED_ACCESS', 403);
  }
}
