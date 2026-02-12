import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import LoginPage from './LoginPage';

// Mock the context
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock the authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
  User: {}
}));

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      token: null,
      isAuthenticated: false
    });
    
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  it('renders login form elements', () => {
    render(
      <MockWrapper>
        <LoginPage />
      </MockWrapper>
    );
    
    expect(screen.getByLabelText('아이디')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByText('로그인 하기')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('allows input changes', () => {
    render(
      <MockWrapper>
        <LoginPage />
      </MockWrapper>
    );
    
    const usernameInput = screen.getByLabelText('아이디');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect((usernameInput as HTMLInputElement).value).toBe('testuser');
    
    const passwordInput = screen.getByLabelText('비밀번호');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect((passwordInput as HTMLInputElement).value).toBe('password123');
  });

  it('calls login when form is submitted', async () => {
    (authService.login as vi.Mock).mockResolvedValue({
      success: true,
      data: {
        token: 'fake-token',
        user: { id: '1', username: 'testuser', createdAt: '2026-01-01' }
      }
    });
    
    render(
      <MockWrapper>
        <LoginPage />
      </MockWrapper>
    );
    
    const usernameInput = screen.getByLabelText('아이디');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByText('로그인 하기');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
});