import pool from '../config/database.js';

class TodoDAO {
  /**
   * 사용자 ID로 할일 목록 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Array>} 할일 객체 배열
   */
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE user_id = $1 
       ORDER BY due_date ASC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * 할일 ID로 할일 조회
   * @param {string} todoId - 할일 ID
   * @returns {Promise<Object|null>} 할일 객체 또는 null
   */
  async findById(todoId) {
    const result = await pool.query(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE id = $1`,
      [todoId]
    );
    return result.rows[0] || null;
  }

  /**
   * 할일 ID와 사용자 ID로 할일 조회 (소유권 검증용)
   * @param {string} todoId - 할일 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object|null>} 할일 객체 또는 null
   */
  async findByIdAndUserId(todoId, userId) {
    const result = await pool.query(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE id = $1 AND user_id = $2`,
      [todoId, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * 새로운 할일 생성
   * @param {string} userId - 사용자 ID
   * @param {string} title - 할일 제목
   * @param {string} description - 할일 설명
   * @param {string} dueDate - 마감일 (YYYY-MM-DD)
   * @returns {Promise<Object>} 생성된 할일 객체
   */
  async create(userId, title, description, dueDate) {
    const result = await pool.query(
      `INSERT INTO todos (user_id, title, description, due_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
      [userId, title, description, dueDate]
    );
    return result.rows[0];
  }

  /**
   * 할일 업데이트
   * @param {string} todoId - 할일 ID
   * @param {Object} updates - 업데이트할 필드들
   * @returns {Promise<Object|null>} 업데이트된 할일 객체 또는 null
   */
  async update(todoId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.due_date !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(updates.due_date);
    }
    if (updates.done !== undefined) {
      fields.push(`done = $${paramCount++}`);
      values.push(updates.done);
    }

    if (fields.length === 0) return null;

    values.push(todoId);
    const query = `UPDATE todos SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 할일 삭제
   * @param {string} todoId - 할일 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(todoId) {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [todoId]
    );
    return result.rowCount > 0;
  }
}

export default new TodoDAO();