// Setup test environment to mock database connections
const mockQuery = jest.fn();
jest.mock('../config/database.js', () => {
  return {
    __esModule: true,
    default: {
      query: mockQuery,
      on: jest.fn(),
      end: jest.fn(),
    },
    checkDatabaseHealth: jest.fn(),
    closeDatabaseConnection: jest.fn(),
  };
});

// Prevent database initialization during tests
process.env.POSTGRES_CONNECTION_STRING = 'postgresql://test:test@localhost:5432/testdb';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests