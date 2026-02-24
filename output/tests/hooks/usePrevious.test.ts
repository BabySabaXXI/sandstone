/**
 * Tests for usePrevious, useHasChanged, and usePreviousWhen Hooks
 */

import { renderHook } from '@testing-library/react';
import { usePrevious, useHasChanged, usePreviousWhen } from '../../../hooks/usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    // First render - previous is undefined
    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });

    // Second render - previous is 'first'
    expect(result.current).toBe('first');

    rerender({ value: 'third' });

    // Third render - previous is 'second'
    expect(result.current).toBe('second');
  });

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });

  it('should work with object values', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const obj3 = { a: 3 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);

    rerender({ value: obj3 });
    expect(result.current).toBe(obj2);
  });

  it('should work with array values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: arr1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: arr2 });
    expect(result.current).toBe(arr1);
  });

  it('should track null values correctly', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'not-null' });
    expect(result.current).toBeNull();

    rerender({ value: null });
    expect(result.current).toBe('not-null');
  });
});

describe('useHasChanged', () => {
  it('should return false on first render', () => {
    const { result } = renderHook(({ value }) => useHasChanged(value), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe(false);
  });

  it('should return true when value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useHasChanged(value), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBe(false);

    rerender({ value: 'second' });
    expect(result.current).toBe(true);
  });

  it('should return false when value stays the same', () => {
    const { result, rerender } = renderHook(({ value }) => useHasChanged(value), {
      initialProps: { value: 'same' },
    });

    expect(result.current).toBe(false);

    rerender({ value: 'same' });
    expect(result.current).toBe(false);
  });

  it('should detect changes in object references', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1 }; // Same content, different reference

    const { result, rerender } = renderHook(({ value }) => useHasChanged(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toBe(false);

    rerender({ value: obj2 });
    expect(result.current).toBe(true);
  });
});

describe('usePreviousWhen', () => {
  it('should return undefined when condition is never met', () => {
    const { result } = renderHook(
      ({ value, condition }) => usePreviousWhen(value, condition),
      {
        initialProps: { value: 'value', condition: false },
      }
    );

    expect(result.current).toBeUndefined();
  });

  it('should capture value when condition becomes true', () => {
    const { result, rerender } = renderHook(
      ({ value, condition }) => usePreviousWhen(value, condition),
      {
        initialProps: { value: 'first', condition: false },
      }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'second', condition: true });
    expect(result.current).toBe('second');

    rerender({ value: 'third', condition: true });
    expect(result.current).toBe('second'); // Should keep first captured value
  });

  it('should update captured value when condition is true again after being false', () => {
    const { result, rerender } = renderHook(
      ({ value, condition }) => usePreviousWhen(value, condition),
      {
        initialProps: { value: 'first', condition: false },
      }
    );

    rerender({ value: 'second', condition: true });
    expect(result.current).toBe('second');

    rerender({ value: 'third', condition: false });
    expect(result.current).toBe('second'); // Should keep previous value

    rerender({ value: 'fourth', condition: true });
    expect(result.current).toBe('fourth'); // Should update to new value
  });

  it('should work with numeric conditions', () => {
    const { result, rerender } = renderHook(
      ({ value, condition }) => usePreviousWhen(value, condition),
      {
        initialProps: { value: 0, condition: 0 },
      }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 1, condition: 1 });
    expect(result.current).toBe(1);
  });
});
