/**
 * Tests for useDebounce and useDebouncedCallback Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useDebounce('initial', { delay: 500 }));

    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });

  it('should update debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current.debouncedValue).toBe('initial');

    rerender({ value: 'updated' });

    // Value should not update immediately
    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isPending).toBe(true);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
  });

  it('should reset timer when value changes before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'update1' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Change value again before timer completes
    rerender({ value: 'update2' });

    // Original update should not have applied
    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.debouncedValue).toBe('update2');
  });

  it('should support leading edge execution', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500, leading: true }),
      { initialProps: { value: 'initial' } }
    );

    // Initial value should be set immediately with leading edge
    expect(result.current.debouncedValue).toBe('initial');

    rerender({ value: 'updated' });

    // Leading edge should execute immediately
    expect(result.current.debouncedValue).toBe('updated');
  });

  it('should support cancel functionality', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current.isPending).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should not have updated
    expect(result.current.debouncedValue).toBe('initial');
  });

  it('should support flush functionality', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current.isPending).toBe(true);

    act(() => {
      result.current.flush();
    });

    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
  });

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe(42);
  });

  it('should work with object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: { count: 0 } } }
    );

    const newValue = { count: 5 };
    rerender({ value: newValue });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toEqual({ count: 5 });
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.debouncedValue).toBe('updated');
  });

  it('should clean up timeout on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    unmount();

    // Should not throw when advancing timers after unmount
    expect(() => {
      jest.advanceTimersByTime(500);
    }).not.toThrow();
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not call callback immediately', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback after delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback('arg1', 'arg2');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should reset timer on subsequent calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.callback();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support leading edge execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 500, leading: true })
    );

    act(() => {
      result.current.callback();
    });

    // Should be called immediately with leading edge
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not be called again
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support cancel functionality', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback();
    });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support flush functionality', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    act(() => {
      result.current.callback('test');
    });

    act(() => {
      result.current.flush();
    });

    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should track pending state', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 500 }));

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.callback();
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isPending).toBe(false);
  });

  it('should handle maxWait option', () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 1000, maxWait: 500 })
    );

    act(() => {
      result.current.callback();
    });

    // Should not be called before maxWait
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(callback).not.toHaveBeenCalled();

    // Should be called after maxWait
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update callback ref when callback changes', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, { delay: 500 }),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      result.current.callback();
    });

    // Change callback
    rerender({ cb: callback2 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // New callback should be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
