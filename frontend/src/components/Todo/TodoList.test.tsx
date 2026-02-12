import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider, useTodo } from '../../../context/TodoContext';
import { AuthProvider } from '../../../context/AuthContext';
import TodoList from './TodoList';

// Mock the context
vi.mock('../../../context/TodoContext', async () => {
  const actual = await vi.importActual('../../../context/TodoContext');
  return {
    ...actual,
    useTodo: vi.fn(),
  };
});

const mockTodos = [
  {
    id: '1',
    userId: 'user1',
    title: 'Test Todo 1',
    description: 'Test Description 1',
    dueDate: '2026-12-31',
    done: false,
    isOverdue: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Test Todo 2',
    description: 'Test Description 2',
    dueDate: '2026-12-30',
    done: true,
    isOverdue: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <TodoProvider>
      {children}
    </TodoProvider>
  </AuthProvider>
);

describe('TodoList', () => {
  beforeEach(() => {
    (useTodo as vi.Mock).mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      fetchTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      toggleTodoDone: vi.fn(),
    });
  });

  it('renders all todos', () => {
    render(
      <MockWrapper>
        <TodoList />
      </MockWrapper>
    );
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  it('renders empty state when no todos', () => {
    (useTodo as vi.Mock).mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      fetchTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      toggleTodoDone: vi.fn(),
    });
    
    render(
      <MockWrapper>
        <TodoList />
      </MockWrapper>
    );
    
    expect(screen.getByText('할일이 없습니다')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    (useTodo as vi.Mock).mockReturnValue({
      todos: [],
      loading: true,
      error: null,
      fetchTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      toggleTodoDone: vi.fn(),
    });
    
    render(
      <MockWrapper>
        <TodoList />
      </MockWrapper>
    );
    
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
});