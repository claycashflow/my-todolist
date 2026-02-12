import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import { CreateTodoRequest, UpdateTodoRequest } from '../../services/todoService';

interface TodoFormProps {
  initialData?: {
    title: string;
    description?: string;
    dueDate: string;
    done: boolean;
  };
  onSubmit: (formData: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { createTodo } = useTodo();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [done, setDone] = useState(initialData?.done || false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('제목은 1자 이상 입력해주세요');
      return;
    }

    if (title.length > 100) {
      setError('제목은 100자 이하로 입력해주세요');
      return;
    }

    if (!dueDate) {
      setError('유효한 마감일을 입력해주세요');
      return;
    }

    const formData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      done
    };

    try {
      if (initialData) {
        // This is an update form
        onSubmit(formData as UpdateTodoRequest);
      } else {
        // This is a create form
        await createTodo(formData as CreateTodoRequest);
        onSubmit(formData as CreateTodoRequest);
      }
    } catch (err) {
      setError('할일 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">제목 *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          placeholder="1~100자"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder="최대 1000자"
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="dueDate">마감일 *</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
          />
          완료됨
        </label>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          취소
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? '수정하기' : '추가하기'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;