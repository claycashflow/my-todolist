export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || '서버 오류가 발생했습니다';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', error);
  }

  // 데이터베이스 에러 처리
  if (error.code === '23505') { // UNIQUE violation
    return res.status(409).json({
      success: false,
      message: '이미 사용 중인 아이디입니다'
    });
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
};