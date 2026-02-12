import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider } from '../../../context/TodoContext';
import { AuthProvider } from '../../../context/AuthContext';
import TodoForm from './TodoForm';

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <TodoProvider>
      {children}
    </TodoProvider>
  </AuthProvider>
);

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements', () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('마감일 *')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('추가하기')).toBeInTheDocument();
  });

  it('allows input changes', () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    const titleInput = screen.getByLabelText('제목 *');
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    expect((titleInput as HTMLInputElement).value).toBe('New Todo');
    
    const descriptionTextarea = screen.getByLabelText('설명');
    fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });
    expect((descriptionTextarea as HTMLTextAreaElement).value).toBe('New Description');
    
    const dueDateInput = screen.getByLabelText('마감일 *');
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });
    expect((dueDateInput as HTMLInputElement).value).toBe('2026-12-31');
  });

  it('calls onSubmit when form is submitted with valid data', async () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    const titleInput = screen.getByLabelText('제목 *');
    const dueDateInput = screen.getByLabelText('마감일 *');
    const submitButton = screen.getByText('추가하기');
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Todo',
        description: undefined,
        dueDate: '2026-12-31',
        done: false
      });
    });
  });

  it('shows error when title is empty', async () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    const titleInput = screen.getByLabelText('제목 *');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    const submitButton = screen.getByText('추가하기');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('제목은 1자 이상 입력해주세요')).toBeInTheDocument();
    });
  });

  it('shows error when title is too long', async () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    const titleInput = screen.getByLabelText('제목 *');
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
    
    const submitButton = screen.getByText('추가하기');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('제목은 100자 이하로 입력해주세요')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <MockWrapper>
        <TodoForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </MockWrapper>
    );
    
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});