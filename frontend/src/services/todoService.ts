import api from './api';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  done: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  done?: boolean;
}

export const todoService = {
  getTodos: () => api.get('/todos') as Promise<{ success: boolean; data: Todo[] }>,
  
  getTodo: (id: string) => api.get(`/todos/${id}`) as Promise<{ success: boolean; data: Todo }>,
  
  createTodo: (title: string, description: string | undefined, dueDate: string) =>
    api.post('/todos', { title, description, dueDate }) as Promise<{ success: boolean; data: Todo }>,
  
  updateTodo: (id: string, updates: UpdateTodoRequest) =>
    api.put(`/todos/${id}`, updates) as Promise<{ success: boolean; data: Todo }>,
  
  deleteTodo: (id: string) =>
    api.delete(`/todos/${id}`) as Promise<{ success: boolean }>
};