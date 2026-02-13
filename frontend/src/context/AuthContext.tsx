import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService, type User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  const login = useCallback(async (username: string, password: string) => {
    const result = await authService.login(username, password);
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setToken(result.data.token);
    setUser(result.data.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};