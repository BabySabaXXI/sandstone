/**
 * Sandstone Test Suite Index
 * 
 * This file exports all test utilities and provides a central location
 * for test configuration and shared testing resources.
 */

// ============================================
// TEST UTILITIES
// ============================================

export * from './utils/test-utils';

// ============================================
// TEST CONFIGURATION
// ============================================

/**
 * Default test timeout in milliseconds
 */
export const TEST_TIMEOUT = 10000;

/**
 * Default wait time for async operations
 */
export const WAIT_TIME = 100;

/**
 * Default debounce delay for testing
 */
export const DEBOUNCE_DELAY = 500;

/**
 * Default throttle limit for testing
 */
export const THROTTLE_LIMIT = 500;

// ============================================
// TEST FIXTURES
// ============================================

/**
 * Common test data fixtures
 */
export const fixtures = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  document: {
    id: 'doc-123',
    title: 'Test Document',
    content: 'Test content for the document',
    subjectId: 'economics',
    userId: 'user-123',
    folderId: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  flashcard: {
    id: 'card-123',
    front: 'What is the capital of France?',
    back: 'Paris',
    deckId: 'deck-123',
    userId: 'user-123',
    interval: 1,
    easeFactor: 2.5,
    repetitionCount: 0,
    nextReviewAt: '2024-01-16T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  quiz: {
    id: 'quiz-123',
    title: 'Test Quiz',
    description: 'A test quiz',
    subjectId: 'economics',
    userId: 'user-123',
    questions: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  folder: {
    id: 'folder-123',
    name: 'Test Folder',
    parentId: null,
    userId: 'user-123',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
};

// ============================================
// TEST HELPERS
// ============================================

/**
 * Create a mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: fixtures.user },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: jest.fn(),
  };
}

/**
 * Create a mock fetch response
 */
export function createMockResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a deferred promise
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

// ============================================
// MOCK FACTORIES
// ============================================

/**
 * Factory for creating mock events
 */
export const mockEvents = {
  changeEvent: (value: string): React.ChangeEvent<HTMLInputElement> => ({
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
  } as React.ChangeEvent<HTMLInputElement>),

  clickEvent: (): React.MouseEvent => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    nativeEvent: new MouseEvent('click'),
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),
    type: 'click',
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    screenX: 0,
    screenY: 0,
    button: 0,
    buttons: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    movementX: 0,
    movementY: 0,
    relatedTarget: null,
  } as unknown as React.MouseEvent),

  keyboardEvent: (key: string): React.KeyboardEvent => ({
    key,
    code: `Key${key.toUpperCase()}`,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    nativeEvent: new KeyboardEvent('keydown', { key }),
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),
    type: 'keydown',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    repeat: false,
  } as unknown as React.KeyboardEvent),
};

// ============================================
// ASSERTION HELPERS
// ============================================

/**
 * Assert that a value is within a range
 */
export function expectToBeWithinRange(
  value: number,
  min: number,
  max: number
): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/**
 * Assert that a date is valid
 */
export function expectValidDate(date: Date | null): void {
  expect(date).toBeInstanceOf(Date);
  expect(date?.getTime()).not.toBeNaN();
}

/**
 * Assert that a function was called with specific arguments
 */
export function expectToHaveBeenCalledWithArgs(
  mockFn: jest.Mock,
  ...args: unknown[]
): void {
  expect(mockFn).toHaveBeenCalledWith(...args);
}
