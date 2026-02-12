export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@domain/(.*)\\.js$': '<rootDir>/src/domain/$1',
    '^@application/(.*)\\.js$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)\\.js$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)\\.js$': '<rootDir>/src/presentation/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    '!src/**/__tests__/**',
    '!src/index.js',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 70,
      statements: 70
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/'
  ]
};
