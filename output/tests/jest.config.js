/**
 * Jest Configuration for Sandstone React Component Tests
 * 
 * This configuration supports:
 * - React Testing Library for component tests
 * - Jest for unit tests
 * - TypeScript support via ts-jest
 * - Coverage reporting
 * - Module path aliases
 */

module.exports = {
  // Use jsdom environment for React component testing
  testEnvironment: 'jsdom',

  // File extensions to look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
      },
    }],
    '^.+\\.jsx?$': 'babel-jest',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx',
  ],

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@tests/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/../components/$1',
    '^@hooks/(.*)$': '<rootDir>/../hooks/$1',
    '^@lib/(.*)$': '<rootDir>/../lib/$1',
    '^@stores/(.*)$': '<rootDir>/../stores/$1',
    '^@types/(.*)$': '<rootDir>/../types/$1',
    // Mock CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Coverage configuration
  collectCoverageFrom: [
    '../hooks/**/*.{ts,tsx}',
    '../lib/utils/**/*.{ts,tsx}',
    '../components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/__mocks__/**',
    '!**/*.stories.{ts,tsx}',
    '!**/index.{ts,tsx}',
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Test timeout (10 seconds for component tests)
  testTimeout: 10000,

  // Maximum workers
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Fail on console errors/warnings in tests
  errorOnDeprecated: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports',
        outputName: 'junit.xml',
      },
    ],
  ],

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
