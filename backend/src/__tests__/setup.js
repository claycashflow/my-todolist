// Setup test environment to mock database connections
jest.mock('./src/config/database.js', () => {
  const mockQuery = jest.fn();
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