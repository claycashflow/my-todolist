import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="logo">
        <h1>my-todolist</h1>
      </div>
      <button onClick={toggleTheme} className="theme-toggle" aria-label="테마 변경">
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
};

export default Header;