import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// Simple smoke test to ensure the app renders without crashing
describe('App', () => {
  it('renders without crashing', () => {
    // Mock localStorage to prevent errors in tests
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {}),
        removeItem: vi.fn(() => {}),
      },
      writable: true,
    });
    
    render(<App />);
    // The app should render without throwing an error
    expect(true).toBe(true);
  });
});