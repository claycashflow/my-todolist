import api from './api';

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
    };
  };
}

export interface User {
  id: string;
  username: string;
  createdAt?: string;
}

export const authService = {
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }) as Promise<{ success: boolean; data: User }>,

  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }) as Promise<AuthResponse>,

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};