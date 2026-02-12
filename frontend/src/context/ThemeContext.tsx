import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getUserThemeKey = (userId: number | null): string => {
  return userId ? `user_${userId}_theme` : 'theme';
};

const loadUserTheme = (userId: number | null): boolean => {
  const key = getUserThemeKey(userId);
  const saved = localStorage.getItem(key);
  return saved === 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadUserTheme(userId));

  // 사용자가 변경될 때 설정 다시 로드
  useEffect(() => {
    const theme = loadUserTheme(userId);
    setIsDarkMode(theme);
  }, [userId]);

  // 테마 변경 시 저장 및 적용
  useEffect(() => {
    const key = getUserThemeKey(userId);
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(key, 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(key, 'light');
    }
  }, [isDarkMode, userId]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
