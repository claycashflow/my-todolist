import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TodoProvider, useTodo } from '../../../context/TodoContext';
import { AuthProvider } from '../../../context/AuthContext';
import TodoItem from './TodoItem';

// Mock the context
vi.mock('../../../context/TodoContext', async () => {
  const actual = await vi.importActual('../../../context/TodoContext');
  return {
    ...actual,
    useTodo: vi.fn(),
  };
});

// Mock the TodoService
vi.mock('../../../services/todoService', () => ({
  todoService: {
    getTodos: vi.fn(),
    getTodo: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
  Todo: {}
}));

const mockTodo = {
  id: '1',
  userId: 'user1',
  title: 'Test Todo',
  description: 'Test Description',
  dueDate: '2026-12-31',
  done: false,
  isOverdue: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
};

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <TodoProvider>
      {children}
    </TodoProvider>
  </AuthProvider>
);

describe('TodoItem', () => {
  const mockToggleTodoDone = vi.fn();
  const mockDeleteTodo = vi.fn();
  const mockUpdateTodo = vi.fn();

  beforeEach(() => {
    (useTodo as vi.Mock).mockReturnValue({
      toggleTodoDone: mockToggleTodoDone,
      deleteTodo: mockDeleteTodo,
      updateTodo: mockUpdateTodo,
      todos: [mockTodo],
      loading: false,
      error: null,
      fetchTodos: vi.fn(),
      createTodo: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo title and description', () => {
    render(
      <MockWrapper>
        <TodoItem todo={mockTodo} />
      </MockWrapper>
    );
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays due date correctly', () => {
    render(
      <MockWrapper>
        <TodoItem todo={mockTodo} />
      </MockWrapper>
    );
    
    expect(screen.getByText(/마감일:/)).toBeInTheDocument();
  });

  it('calls toggleTodoDone when checkbox is clicked', async () => {
    render(
      <MockWrapper>
        <TodoItem todo={mockTodo} />
      </MockWrapper>
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(mockToggleTodoDone).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  it('shows edit form when edit button is clicked', () => {
    render(
      <MockWrapper>
        <TodoItem todo={mockTodo} />
      </MockWrapper>
    );
    
    const editButton = screen.getByText('수정');
    fireEvent.click(editButton);
    
    expect(screen.getByText('할일 수정')).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <MockWrapper>
        <TodoItem todo={mockTodo} />
      </MockWrapper>
    );
    
    const deleteButton = screen.getByText('삭제');
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });
});