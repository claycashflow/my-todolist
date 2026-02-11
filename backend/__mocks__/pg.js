// Mock for pg module to prevent actual database connections
const mockQuery = jest.fn();

const mockPool = {
  query: mockQuery,
  on: jest.fn(),
  end: jest.fn(),
};

module.exports = {
  Pool: jest.fn(() => mockPool),
  Client: jest.fn(() => ({
    connect: jest.fn(),
    query: mockQuery,
    end: jest.fn(),
  })),
  mockQuery,
};