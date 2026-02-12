import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import { useLanguage } from '../../context/LanguageContext';
import type { CreateTodoRequest, UpdateTodoRequest } from '../../services/todoService';

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
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [done, setDone] = useState(initialData?.done || false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t.errors.titleRequired);
      return;
    }

    if (title.length > 100) {
      setError(t.errors.titleTooLong);
      return;
    }

    if (!dueDate) {
      setError(t.errors.dueDateRequired);
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
      setError(t.errors.saveFailed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">{t.common.title} *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          placeholder={t.todo.titlePlaceholder}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">{t.common.description}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder={t.todo.descriptionPlaceholder}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">{t.common.dueDate} *</label>
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
          {t.todo.done}
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t.common.cancel}
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? t.todo.updateButton : t.todo.addButton}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;