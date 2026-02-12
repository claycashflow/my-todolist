import { TodoDAO } from '../dao/index.js';

class TodoService {
  /**
   * DB 객체를 API 응답 형식으로 변환 (snake_case → camelCase)
   * @param {Object} todo - DB에서 조회한 할일 객체
   * @returns {Object} 변환된 할일 객체
   */
  transformTodoResponse(todo) {
    return {
      id: todo.id,
      userId: todo.user_id,
      title: todo.title,
      description: todo.description,
      dueDate: todo.due_date,
      done: todo.done,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at
    };
  }

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
      ...this.transformTodoResponse(todo),
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
      ...this.transformTodoResponse(todo),
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
      ...this.transformTodoResponse(todo),
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

    // camelCase를 snake_case로 변환
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.done !== undefined) dbUpdates.done = updates.done;

    // 입력값 검증
    if (dbUpdates.title !== undefined) {
      if (!dbUpdates.title || dbUpdates.title.length > 100) {
        throw new Error('제목은 1~100자로 입력해주세요');
      }
    }

    if (dbUpdates.due_date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dbUpdates.due_date)) {
        throw new Error('유효한 마감일을 입력해주세요');
      }
    }

    const updated = await TodoDAO.update(todoId, dbUpdates);
    if (!updated) return null;

    return {
      ...this.transformTodoResponse(updated),
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