import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import { useLanguage } from '../../context/LanguageContext';
import TodoForm from './TodoForm';
import { formatDate } from '../../utils/dateUtils';

interface TodoItemProps {
  todo: import('../../services/todoService').Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodoDone, deleteTodo, updateTodo } = useTodo();
  const { t } = useLanguage();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleDone = () => {
    toggleTodoDone(todo.id);
  };

  const handleDelete = async () => {
    const success = await deleteTodo(todo.id);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async (formData: { title: string; description?: string; dueDate: string }) => {
    await updateTodo(todo.id, formData);
    setShowEditForm(false);
  };

  return (
    <div className={`todo-item ${todo.isOverdue ? 'overdue' : ''} ${todo.done ? 'completed' : ''}`}>
      {!showEditForm ? (
        <>
          <div className="todo-content">
            <div className="todo-checkbox">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={handleToggleDone}
                id={`todo-${todo.id}`}
              />
              <label htmlFor={`todo-${todo.id}`} className="todo-title">
                {todo.title}
              </label>
            </div>
            
            <div className="todo-details">
              <div className="todo-meta">
                <span className="due-date">
                  {t.common.dueDate}: {formatDate(todo.dueDate)}
                  {todo.isOverdue && !todo.done && <span className="overdue-badge"> ⚠️ ({t.todo.overdue})</span>}
                </span>
                {todo.description && <p className="todo-description">{todo.description}</p>}
              </div>

              <div className="todo-actions">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="btn btn-secondary btn-small"
                >
                  {t.common.edit}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger btn-small"
                >
                  {t.common.delete}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="todo-edit-form">
          <h3>{t.todo.editTitle}</h3>
          <TodoForm
            initialData={{
              title: todo.title,
              description: todo.description || '',
              dueDate: formatDate(todo.dueDate),
              done: todo.done
            }}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t.todo.deleteConfirm}</h3>
            <p>"{todo.title}" {t.todo.deleteMessage}</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                {t.todo.deleteButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;