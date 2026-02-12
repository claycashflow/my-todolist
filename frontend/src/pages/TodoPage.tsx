import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTodo } from '../context/TodoContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import TodoList from '../components/Todo/TodoList';
import TodoForm from '../components/Todo/TodoForm';

const TodoPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { loading } = useTodo();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="todo-page">
      <header className="todo-header">
        <div className="header-content">
          <h1>{t.todo.title}</h1>
          <div className="user-info">
            <button onClick={toggleLanguage} className="language-toggle" aria-label="언어 변경">
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="테마 변경">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <span>{t.common.hello}, {user?.username}님</span>
            <button onClick={handleLogout} className="btn btn-secondary">{t.common.logout}</button>
          </div>
        </div>
      </header>

      <main className="todo-main">
        <div className="todo-actions">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? t.common.cancel : t.todo.addNew}
          </button>
        </div>

        {showAddForm && (
          <div className="add-todo-form">
            <h3>{t.todo.addTitle}</h3>
            <TodoForm
              onSubmit={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="loading">{t.common.loading}</div>
        ) : (
          <TodoList />
        )}
      </main>
    </div>
  );
};

export default TodoPage;