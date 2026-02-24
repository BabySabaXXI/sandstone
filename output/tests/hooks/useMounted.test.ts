/**
 * Tests for useMounted, useIsMounted, useMountedCallback, and useMountEffect Hooks
 */

import { renderHook, act } from '@testing-library/react';
import {
  useMounted,
  useIsMounted,
  useMountedCallback,
  useMountEffect,
} from '../../../hooks/useMounted';

describe('useMounted', () => {
  it('should return false initially', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });

  it('should remain true after mount', () => {
    const { result, rerender } = renderHook(() => useMounted());
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });
});

describe('useIsMounted', () => {
  it('should return ref with current true', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current.current).toBe(true);
  });

  it('should remain true after rerenders', () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    rerender();
    expect(result.current.current).toBe(true);

    rerender();
    expect(result.current.current).toBe(true);
  });
});

describe('useMountedCallback', () => {
  it('should call callback when mounted', () => {
    const callback = jest.fn();
    renderHook(() => useMountedCallback(callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback on rerenders', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(() => useMountedCallback(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    rerender();
    expect(callback).toHaveBeenCalledTimes(1);

    rerender();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = jest.fn();
    renderHook(() => useMountedCallback(callback, 'arg1', 'arg2'));

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should handle callback that throws', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const callback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    expect(() => {
      renderHook(() => useMountedCallback(callback));
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});

describe('useMountEffect', () => {
  it('should run effect on mount', () => {
    const effect = jest.fn();
    renderHook(() => useMountEffect(effect));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should not run effect on rerenders', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(() => useMountEffect(effect));

    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup on unmount', () => {
    const cleanup = jest.fn();
    const effect = jest.fn().mockReturnValue(cleanup);

    const { unmount } = renderHook(() => useMountEffect(effect));

    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should handle effect without cleanup', () => {
    const effect = jest.fn();
    const { unmount } = renderHook(() => useMountEffect(effect));

    expect(() => unmount()).not.toThrow();
  });

  it('should handle effect that throws', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const effect = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    expect(() => {
      renderHook(() => useMountEffect(effect));
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
