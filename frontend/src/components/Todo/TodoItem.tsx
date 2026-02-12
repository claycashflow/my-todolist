import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import TodoForm from './TodoForm';
import { formatDate } from '../../utils/dateUtils';

interface TodoItemProps {
  todo: import('../../services/todoService').Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodoDone, deleteTodo, updateTodo } = useTodo();
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
                  마감일: {formatDate(todo.dueDate)}
                  {todo.isOverdue && !todo.done && <span className="overdue-badge"> ⚠️ (지연)</span>}
                </span>
                {todo.description && <p className="todo-description">{todo.description}</p>}
              </div>
              
              <div className="todo-actions">
                <button 
                  onClick={() => setShowEditForm(true)} 
                  className="btn btn-secondary btn-small"
                >
                  수정
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="btn btn-danger btn-small"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="todo-edit-form">
          <h3>할일 수정</h3>
          <TodoForm 
            initialData={{
              title: todo.title,
              description: todo.description || '',
              dueDate: todo.dueDate,
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
            <h3>정말 삭제하시겠습니까?</h3>
            <p>"{todo.title}" 할일을 삭제하면 볡구할 수 없습니다.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="btn btn-secondary"
              >
                취소
              </button>
              <button 
                onClick={handleDelete} 
                className="btn btn-danger"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;