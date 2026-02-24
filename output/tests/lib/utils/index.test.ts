/**
 * Tests for Main Utils Index
 */

import {
  formatValue,
  createSummary,
  safeGet,
  allTruthy,
  anyTruthy,
  countTruthy,
  debounce,
  throttle,
  retry,
  memoize,
  range,
  sleep,
  waitFor,
  parseQueryString,
  buildQueryString,
} from '../../../../lib/utils/index';

describe('formatValue', () => {
  it('should format date type', () => {
    const result = formatValue('2024-01-15', 'date');
    expect(result).toContain('Jan');
  });

  it('should format number type', () => {
    expect(formatValue(1234.56, 'number')).toBe('1,235');
  });

  it('should format currency type', () => {
    expect(formatValue(1234.56, 'currency')).toBe('$1,234.56');
  });

  it('should format percent type', () => {
    expect(formatValue(0.25, 'percent')).toBe('25%');
  });

  it('should format string type', () => {
    expect(formatValue('hello', 'string')).toBe('hello');
  });

  it('should return dash for null', () => {
    expect(formatValue(null, 'string')).toBe('-');
  });

  it('should return dash for undefined', () => {
    expect(formatValue(undefined, 'string')).toBe('-');
  });

  it('should default to string type', () => {
    expect(formatValue('hello')).toBe('hello');
  });
});

describe('createSummary', () => {
  it('should create summary from items', () => {
    const items = [
      { label: 'Name', value: 'John' },
      { label: 'Age', value: 30, type: 'number' as const },
    ];
    expect(createSummary(items)).toBe('Name: John | Age: 30');
  });

  it('should handle single item', () => {
    const items = [{ label: 'Status', value: 'Active' }];
    expect(createSummary(items)).toBe('Status: Active');
  });

  it('should handle empty array', () => {
    expect(createSummary([])).toBe('');
  });

  it('should format different types', () => {
    const items = [
      { label: 'Date', value: '2024-01-15', type: 'date' as const },
      { label: 'Amount', value: 100, type: 'currency' as const },
      { label: 'Rate', value: 0.5, type: 'percent' as const },
    ];
    const result = createSummary(items);
    expect(result).toContain('Date:');
    expect(result).toContain('Amount:');
    expect(result).toContain('Rate:');
  });
});

describe('safeGet', () => {
  it('should get nested property', () => {
    const obj = { a: { b: { c: 'value' } } };
    expect(safeGet(obj, 'a.b.c')).toBe('value');
  });

  it('should return default value for missing path', () => {
    const obj = { a: {} };
    expect(safeGet(obj, 'a.b.c', 'default')).toBe('default');
  });

  it('should return undefined for missing path without default', () => {
    const obj = { a: {} };
    expect(safeGet(obj, 'a.b.c')).toBeUndefined();
  });

  it('should handle null object', () => {
    expect(safeGet(null, 'a.b', 'default')).toBe('default');
  });

  it('should handle undefined object', () => {
    expect(safeGet(undefined, 'a.b', 'default')).toBe('default');
  });

  it('should get shallow property', () => {
    const obj = { name: 'John' };
    expect(safeGet(obj, 'name')).toBe('John');
  });
});

describe('allTruthy', () => {
  it('should return true when all values are truthy', () => {
    expect(allTruthy({ a: true, b: 1, c: 'hello' })).toBe(true);
  });

  it('should return false when any value is falsy', () => {
    expect(allTruthy({ a: true, b: false, c: 'hello' })).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(allTruthy({})).toBe(true);
  });

  it('should handle null values', () => {
    expect(allTruthy({ a: true, b: null })).toBe(false);
  });

  it('should handle undefined values', () => {
    expect(allTruthy({ a: true, b: undefined })).toBe(false);
  });

  it('should handle zero', () => {
    expect(allTruthy({ a: true, b: 0 })).toBe(false);
  });

  it('should handle empty string', () => {
    expect(allTruthy({ a: true, b: '' })).toBe(false);
  });
});

describe('anyTruthy', () => {
  it('should return true when any value is truthy', () => {
    expect(anyTruthy({ a: false, b: 1, c: '' })).toBe(true);
  });

  it('should return false when all values are falsy', () => {
    expect(anyTruthy({ a: false, b: 0, c: '' })).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(anyTruthy({})).toBe(false);
  });

  it('should handle single truthy value', () => {
    expect(anyTruthy({ a: true })).toBe(true);
  });
});

describe('countTruthy', () => {
  it('should count truthy values', () => {
    expect(countTruthy({ a: true, b: false, c: 1, d: '' })).toBe(2);
  });

  it('should return 0 for empty object', () => {
    expect(countTruthy({})).toBe(0);
  });

  it('should return 0 when all values are falsy', () => {
    expect(countTruthy({ a: false, b: 0, c: '' })).toBe(0);
  });

  it('should return count when all values are truthy', () => {
    expect(countTruthy({ a: true, b: 1, c: 'hello' })).toBe(3);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on multiple calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn();
    jest.advanceTimersByTime(300);
    debouncedFn();
    jest.advanceTimersByTime(300);

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to function', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should limit function execution', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 500);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to function', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 500);

    throttledFn('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('retry', () => {
  it('should return result on success', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retry(fn, { maxAttempts: 3, delay: 100 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    await retry(fn, { maxAttempts: 3, delay: 100, backoff: 2 });
    const elapsed = Date.now() - startTime;

    // Should wait at least 100 + 200 = 300ms
    expect(elapsed).toBeGreaterThanOrEqual(300);
  });
});

describe('memoize', () => {
  it('should cache function results', () => {
    const fn = jest.fn((x: number) => x * 2);
    const memoizedFn = memoize(fn);

    expect(memoizedFn(5)).toBe(10);
    expect(memoizedFn(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call function for different arguments', () => {
    const fn = jest.fn((x: number) => x * 2);
    const memoizedFn = memoize(fn);

    memoizedFn(5);
    memoizedFn(10);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use custom key generator', () => {
    const fn = jest.fn((obj: { id: number }) => obj.id * 2);
    const memoizedFn = memoize(fn, (obj) => String(obj.id));

    memoizedFn({ id: 5 });
    memoizedFn({ id: 5, name: 'different' });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('range', () => {
  it('should generate range of numbers', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('should use custom step', () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
  });

  it('should handle negative step', () => {
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
  });

  it('should return empty array for invalid range', () => {
    expect(range(5, 0)).toEqual([]);
  });

  it('should handle single element', () => {
    expect(range(0, 1)).toEqual([0]);
  });
});

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const promise = sleep(500);
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should not resolve before specified time', async () => {
    const promise = sleep(500);
    jest.advanceTimersByTime(400);

    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
  });
});

describe('waitFor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve when condition is met', async () => {
    let condition = false;
    setTimeout(() => {
      condition = true;
    }, 500);

    const promise = waitFor(() => condition, { interval: 100 });
    jest.advanceTimersByTime(500);

    await expect(promise).resolves.toBeUndefined();
  });

  it('should reject on timeout', async () => {
    const promise = waitFor(() => false, { interval: 100, timeout: 500 });
    jest.advanceTimersByTime(500);

    await expect(promise).rejects.toThrow('Timeout waiting for condition');
  });

  it('should check condition at specified interval', async () => {
    const condition = jest.fn().mockReturnValue(false);
    const promise = waitFor(condition, { interval: 100, timeout: 500 });

    jest.advanceTimersByTime(300);
    expect(condition).toHaveBeenCalledTimes(4); // Initial + 3 intervals
  });
});

describe('parseQueryString', () => {
  it('should parse query string', () => {
    expect(parseQueryString('?a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('should parse without leading question mark', () => {
    expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('should handle empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });

  it('should decode URL-encoded values', () => {
    expect(parseQueryString('name=John%20Doe')).toEqual({ name: 'John Doe' });
  });

  it('should handle multiple values for same key (last wins)', () => {
    expect(parseQueryString('a=1&a=2')).toEqual({ a: '2' });
  });
});

describe('buildQueryString', () => {
  it('should build query string', () => {
    expect(buildQueryString({ a: '1', b: '2' })).toBe('?a=1&b=2');
  });

  it('should skip undefined values', () => {
    expect(buildQueryString({ a: '1', b: undefined })).toBe('?a=1');
  });

  it('should skip null values', () => {
    expect(buildQueryString({ a: '1', b: null })).toBe('?a=1');
  });

  it('should skip empty string values', () => {
    expect(buildQueryString({ a: '1', b: '' })).toBe('?a=1');
  });

  it('should handle empty object', () => {
    expect(buildQueryString({})).toBe('');
  });

  it('should encode special characters', () => {
    expect(buildQueryString({ name: 'John Doe' })).toBe('?name=John%20Doe');
  });

  it('should handle numbers and booleans', () => {
    expect(buildQueryString({ count: 42, active: true })).toBe('?count=42&active=true');
  });
});
