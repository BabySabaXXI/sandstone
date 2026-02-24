/**
 * Test Utilities for Sandstone Components
 * 
 * This file provides custom render functions and testing utilities
 * specifically designed for the Sandstone application.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// CUSTOM RENDER OPTIONS
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
  initialState?: Record<string, unknown>;
  router?: {
    pathname?: string;
    query?: Record<string, string>;
    push?: jest.Mock;
  };
}

// ============================================
// TEST WRAPPERS
// ============================================

/**
 * All-providers wrapper for components that need context
 */
function AllProviders({ children }: { children: ReactNode }): ReactElement {
  return (
    <>
      {children}
    </>
  );
}

// ============================================
// CUSTOM RENDER FUNCTION
// ============================================

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { initialState, router, ...renderOptions } = options;

  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
}

// ============================================
 * RE-EXPORTS FROM TESTING LIBRARY
// ============================================

export * from '@testing-library/react';
export { customRender as render };
export { userEvent };

// ============================================
// CUSTOM TEST UTILITIES
// ============================================

/**
 * Create a mock event object
 */
export function createMockEvent<T extends Event>(overrides: Partial<T> = {}): T {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {},
    currentTarget: {},
    ...overrides,
  } as T;
}

/**
 * Create a mock change event for inputs
 */
export function createMockChangeEvent(value: string): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { value } as HTMLInputElement,
    currentTarget: { value } as HTMLInputElement,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    persist: jest.fn(),
    nativeEvent: new Event('change'),
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),
    type: 'change',
  } as React.ChangeEvent<HTMLInputElement>;
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a deferred promise for async testing
 */
export function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Mock console methods and return the mock functions
 */
export function mockConsole(): {
  log: jest.SpyInstance;
  error: jest.SpyInstance;
  warn: jest.SpyInstance;
  info: jest.SpyInstance;
} {
  return {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
  };
}

/**
 * Restore console mocks
 */
export function restoreConsole(mocks: ReturnType<typeof mockConsole>): void {
  Object.values(mocks).forEach((mock) => mock.mockRestore());
}

// ============================================
// TEST DATA FACTORIES
// ============================================

/**
 * Factory for creating test users
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Factory for creating test documents
 */
export function createTestDocument(overrides: Partial<TestDocument> = {}): TestDocument {
  return {
    id: 'doc-123',
    title: 'Test Document',
    content: 'Test content',
    subjectId: 'economics',
    userId: 'user-123',
    folderId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

interface TestDocument {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  userId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Factory for creating test flashcards
 */
export function createTestFlashcard(overrides: Partial<TestFlashcard> = {}): TestFlashcard {
  return {
    id: 'card-123',
    front: 'Test question?',
    back: 'Test answer',
    deckId: 'deck-123',
    userId: 'user-123',
    interval: 1,
    easeFactor: 2.5,
    repetitionCount: 0,
    nextReviewAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

interface TestFlashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  userId: string;
  interval: number;
  easeFactor: number;
  repetitionCount: number;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ASYNC TEST UTILITIES
// ============================================

/**
 * Wait for an element to be removed from the DOM
 */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (!element || !document.contains(element)) {
      return;
    }
    await wait(50);
  }
  throw new Error('Element was not removed within timeout');
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await wait(interval);
  }
  throw new Error('Condition was not met within timeout');
}

// ============================================
// HOOK TESTING UTILITIES
// ============================================

/**
 * Test wrapper for hooks that need context
 */
export function createHookWrapper(): React.FC<{ children: ReactNode }> {
  return function HookWrapper({ children }: { children: ReactNode }): ReactElement {
    return <AllProviders>{children}</AllProviders>;
  };
}
