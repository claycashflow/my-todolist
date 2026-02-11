import pool from '../config/database.js';

class UserDAO {
  /**
   * 사용자명으로 사용자 조회
   * @param {string} username - 사용자명
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT id, username, password, created_at FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * 사용자 ID로 사용자 조회
   * @param {string} id - 사용자 ID
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT id, username, password, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 새로운 사용자 생성
   * @param {string} username - 사용자명
   * @param {string} hashedPassword - 해시된 비밀번호
   * @returns {Promise<Object>} 생성된 사용자 객체
   * @throws {Error} 중복 사용자명인 경우
   */
  async create(username, hashedPassword) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
        [username, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // UNIQUE violation
        throw new Error('아이디가 이미 존재합니다');
      }
      throw error;
    }
  }
}

export default new UserDAO();