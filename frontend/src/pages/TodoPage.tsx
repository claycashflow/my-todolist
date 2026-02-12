import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTodo } from '../context/TodoContext';
import TodoList from '../components/Todo/TodoList';
import TodoForm from '../components/Todo/TodoForm';

const TodoPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { loading } = useTodo();
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="todo-page">
      <header className="todo-header">
        <div className="header-content">
          <h1>할일 목록</h1>
          <div className="user-info">
            <span>안녕하세요, {user?.username}님</span>
            <button onClick={handleLogout} className="btn btn-secondary">로그아웃</button>
          </div>
        </div>
      </header>

      <main className="todo-main">
        <div className="todo-actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn btn-primary"
          >
            {showAddForm ? '취소' : '+ 새 할일 추가'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-todo-form">
            <h3>새 할일 추가</h3>
            <TodoForm 
              onSubmit={() => setShowAddForm(false)} 
              onCancel={() => setShowAddForm(false)} 
            />
          </div>
        )}

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <TodoList />
        )}
      </main>
    </div>
  );
};

export default TodoPage;