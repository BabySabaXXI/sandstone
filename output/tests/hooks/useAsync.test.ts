/**
 * Tests for useAsync and useAsyncEffect Hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync, useAsyncEffect } from '../../../hooks/useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have idle status initially', () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn));

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should execute async function', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toBe('result');
    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle async function rejection', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
  });

  it('should pass arguments to async function', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute('arg1', 'arg2');
    });

    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  it('should reset state', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should execute immediately when immediate option is true', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: true }));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple executions', async () => {
    let callCount = 0;
    const asyncFn = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(`result${callCount}`);
    });

    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('result1');
    });

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('result2');
    });

    expect(callCount).toBe(2);
  });

  it('should handle concurrent executions', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current.execute();
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(asyncFn).toHaveBeenCalledTimes(2);
  });
});

describe('useAsyncEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should execute effect on mount', async () => {
    const effect = jest.fn().mockResolvedValue('result');
    renderHook(() => useAsyncEffect(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should execute effect when dependencies change', async () => {
    const effect = jest.fn().mockResolvedValue('result');
    const { rerender } = renderHook(
      ({ dep }) => useAsyncEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(2);

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = jest.fn();
    const effect = jest.fn().mockResolvedValue('result');

    renderHook(() =>
      useAsyncEffect(effect, [], { onSuccess })
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('result');
    });
  });

  it('should call onError callback', async () => {
    const onError = jest.fn();
    const error = new Error('Test error');
    const effect = jest.fn().mockRejectedValue(error);

    renderHook(() =>
      useAsyncEffect(effect, [], { onError })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should run cleanup on unmount', async () => {
    const cleanup = jest.fn();
    const effect = jest.fn().mockResolvedValue('result');

    const { unmount } = renderHook(() =>
      useAsyncEffect(effect, [], { onCleanup: cleanup })
    );

    unmount();
    expect(cleanup).toHaveBeenCalled();
  });

  it('should handle effect that returns cleanup function', async () => {
    const cleanup = jest.fn();
    const effect = jest.fn().mockReturnValue(cleanup);

    const { unmount } = renderHook(() => useAsyncEffect(effect, []));

    unmount();
    expect(cleanup).toHaveBeenCalled();
  });

  it('should not call onSuccess if unmounted before completion', async () => {
    const onSuccess = jest.fn();
    let resolveEffect: (value: string) => void;
    const effect = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveEffect = resolve;
      });
    });

    const { unmount } = renderHook(() =>
      useAsyncEffect(effect, [], { onSuccess })
    );

    unmount();

    // Resolve after unmount
    resolveEffect!('result');

    // Wait a bit to ensure any async operations complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
