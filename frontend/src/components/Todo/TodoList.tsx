import React from 'react';
import { useTodo } from '../context/TodoContext';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const { todos, loading, error } = useTodo();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">에러: {error}</div>;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>할일이 없습니다</h3>
        <p>새로운 할일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;