import { Request, Response, NextFunction } from 'express';
import { DomainException } from '@domain/exceptions/DomainException.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // DomainException 처리
  if (error instanceof DomainException) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  // 데이터베이스 에러 처리
  if ('code' in error && error.code === '23505') {
    res.status(409).json({
      success: false,
      message: '이미 사용 중인 아이디입니다',
    });
    return;
  }

  // 개발 환경에서 에러 로깅
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', error);
  }

  // 기본 에러 응답
  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number'
    ? error.statusCode
    : 500;
  const message = error.message || '서버 오류가 발생했습니다';

  res.status(statusCode).json({
    success: false,
    message,
  });
};
