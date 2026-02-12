import React from 'react';
import { useTodo } from '../../context/TodoContext';
import { useLanguage } from '../../context/LanguageContext';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const { todos, loading, error } = useTodo();
  const { t } = useLanguage();

  if (loading) {
    return <div className="loading">{t.common.loading}</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{t.todo.emptyIcon}</div>
        <h3>{t.todo.empty}</h3>
      </div>
    );
  }

  const upcomingTodos = todos.filter((todo) => !todo.done);
  const completedTodos = todos.filter((todo) => todo.done);

  return (
    <div className="todo-sections">
      {/* 예정 섹션 */}
      <section className="todo-section">
        <h2 className="section-title">{t.todo.upcomingSection}</h2>
        {upcomingTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{t.todo.emptyIcon}</div>
            <p>{t.todo.emptyUpcoming}</p>
          </div>
        ) : (
          <div className="todo-list">
            {upcomingTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </section>

      {/* 완료 섹션 */}
      <section className="todo-section">
        <h2 className="section-title">{t.todo.completedSection}</h2>
        {completedTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>{t.todo.emptyCompleted}</p>
          </div>
        ) : (
          <div className="todo-list">
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TodoList;