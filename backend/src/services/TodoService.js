import { TodoDAO } from '../dao/index.js';

class TodoService {
  /**
   * 마감일 지연 여부 계산
   * @param {string} dueDate - 마감일 (YYYY-MM-DD)
   * @param {boolean} done - 완료 여부
   * @returns {boolean} 마감일 지연 여부
   */
  calculateIsOverdue(dueDate, done) {
    if (done) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  /**
   * 사용자의 모든 할일 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Array>} 할일 목록 (isOverdue 포함)
   */
  async getUserTodos(userId) {
    const todos = await TodoDAO.findByUserId(userId);
    return todos.map(todo => ({
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    }));
  }

  /**
   * 특정 할일 조회
   * @param {string} todoId - 할일 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 할일 정보 (isOverdue 포함)
   * @throws {Error} 할일 없음 또는 권한 없음
   */
  async getTodo(todoId, userId) {
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('할일을 찾을 수 없습니다');
    }
    return {
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    };
  }

  /**
   * 새로운 할일 생성
   * @param {string} userId - 사용자 ID
   * @param {string} title - 할일 제목
   * @param {string} description - 할일 설명
   * @param {string} dueDate - 마감일
   * @returns {Promise<Object>} 생성된 할일 정보 (isOverdue 포함)
   * @throws {Error} 입력값 검증 실패
   */
  async createTodo(userId, title, description, dueDate) {
    // 입력값 검증
    if (!title || title.trim().length === 0 || title.length > 100) {
      throw new Error('제목은 1~100자로 입력해주세요');
    }
    if (!dueDate) {
      throw new Error('유효한 마감일을 입력해주세요');
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      throw new Error('유효한 마감일을 입력해주세요');
    }

    const todo = await TodoDAO.create(userId, title, description, dueDate);
    return {
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    };
  }

  /**
   * 할일 수정
   * @param {string} todoId - 할일 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} updates - 업데이트할 필드들
   * @returns {Promise<Object>} 수정된 할일 정보 (isOverdue 포함)
   * @throws {Error} 권한 없음 또는 입력값 검증 실패
   */
  async updateTodo(todoId, userId, updates) {
    // 소유권 검증
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('권한이 없습니다');
    }

    // 입력값 검증
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.length > 100) {
        throw new Error('제목은 1~100자로 입력해주세요');
      }
    }

    if (updates.due_date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updates.due_date)) {
        throw new Error('유효한 마감일을 입력해주세요');
      }
    }

    const updated = await TodoDAO.update(todoId, updates);
    if (!updated) return null;

    return {
      ...updated,
      isOverdue: this.calculateIsOverdue(updated.due_date, updated.done)
    };
  }

  /**
   * 할일 삭제
   * @param {string} todoId - 할일 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   * @throws {Error} 권한 없음
   */
  async deleteTodo(todoId, userId) {
    // 소유권 검증
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('권한이 없습니다');
    }

    return await TodoDAO.delete(todoId);
  }
}

export default new TodoService();