import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/index.js';

class AuthService {
  /**
   * 사용자 등록
   * @param {string} username - 사용자명
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 생성된 사용자 정보
   * @throws {Error} 입력값 검증 실패 또는 중복 사용자명
   */
  async register(username, password) {
    // 입력값 검증
    if (!username || username.length < 4 || username.length > 20) {
      throw new Error('아이디는 4~20자로 입력해주세요');
    }
    if (!password || password.length < 8) {
      throw new Error('비밀번호는 8자 이상으로 입력해주세요');
    }

    // 영문/숫자만 허용
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      throw new Error('아이디는 영문과 숫자만 입력해주세요');
    }

    // bcrypt 해시화
    const hashedPassword = await bcryptjs.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // 사용자 생성
    const user = await UserDAO.create(username, hashedPassword);
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    };
  }

  /**
   * 사용자 로그인
   * @param {string} username - 사용자명
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 로그인 결과 (토큰, 사용자 정보)
   * @throws {Error} 사용자 없음 또는 비밀번호 불일치
   */
  async login(username, password) {
    // 사용자 조회
    const user = await UserDAO.findByUsername(username);
    if (!user) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다');
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    };
  }
}

export default new AuthService();