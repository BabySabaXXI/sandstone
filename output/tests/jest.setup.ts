/**
 * Jest Setup File for Sandstone Tests
 * 
 * This file is run before each test file to set up the test environment.
 * It configures testing-library, adds custom matchers, and sets up mocks.
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// ============================================
// TESTING LIBRARY CONFIGURATION
// ============================================

// Configure testing-library
configure({
  // Increase async timeout for slower components
  asyncUtilTimeout: 5000,
  // Throw errors for better debugging
  throwSuggestions: true,
});

// ============================================
// MOCK SETUP
// ============================================

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  takeRecords = jest.fn(() => []);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// ============================================
// CONSOLE SUPPRESSION (Optional)
// ============================================

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Suppress specific React warnings during tests
const suppressedWarnings = [
  'Warning: ReactDOM.render is no longer supported',
  'Warning: useLayoutEffect does nothing on the server',
];

console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';
  if (suppressedWarnings.some((warning) => message.includes(warning))) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';
  if (suppressedWarnings.some((warning) => message.includes(warning))) {
    return;
  }
  originalConsoleWarn(...args);
};

// ============================================
// CUSTOM MATCHERS
// ============================================

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// ============================================
// GLOBAL TEST UTILITIES
// ============================================

// Helper to wait for promises to resolve
global.flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Helper to advance timers and flush promises
global.advanceTimersAndFlush = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await global.flushPromises();
};

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  var flushPromises: () => Promise<void>;
  var advanceTimersAndFlush: (ms: number) => Promise<void>;
}

// ============================================
// CLEANUP
// ============================================

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});

// Log test environment info
console.log('🧪 Jest test environment initialized');
