import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { todoService, Todo, CreateTodoRequest, UpdateTodoRequest } from '../services/todoService';
import { useAuth } from './AuthContext';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: CreateTodoRequest) => Promise<Todo | null>;
  updateTodo: (id: string, updates: UpdateTodoRequest) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
  toggleTodoDone: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTodos = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await todoService.getTodos();
      if (response.success) {
        setTodos(response.data);
      } else {
        setError('Failed to fetch todos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createTodo = async (todoData: CreateTodoRequest) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await todoService.createTodo(
        todoData.title,
        todoData.description,
        todoData.dueDate
      );
      
      if (response.success) {
        setTodos(prev => [...prev, response.data]);
        return response.data;
      } else {
        setError('Failed to create todo');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id: string, updates: UpdateTodoRequest) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await todoService.updateTodo(id, updates);
      
      if (response.success) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? response.data : todo
        ));
        return response.data;
      } else {
        setError('Failed to update todo');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await todoService.deleteTodo(id);
      
      if (response.success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
        return true;
      } else {
        setError('Failed to delete todo');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoDone = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await updateTodo(id, { done: !todo.done });
  };

  // Fetch todos when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [isAuthenticated, fetchTodos]);

  const value = {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoDone
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};