import { DomainException } from './DomainException.js';

export class TodoNotFoundError extends DomainException {
  constructor(message: string = '할 일을 찾을 수 없습니다') {
    super(message, 'TODO_NOT_FOUND', 404);
  }
}
