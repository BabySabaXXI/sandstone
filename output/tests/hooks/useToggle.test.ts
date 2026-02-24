/**
 * Tests for useToggle Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../../hooks/useToggle';

describe('useToggle', () => {
  it('should initialize with false by default', () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current.value).toBe(false);
  });

  it('should initialize with the provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current.value).toBe(true);
  });

  it('should toggle the value when toggle is called', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(false);
  });

  it('should set value to true when setTrue is called', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.setTrue();
    });

    expect(result.current.value).toBe(true);

    // Calling setTrue again should keep it true
    act(() => {
      result.current.setTrue();
    });

    expect(result.current.value).toBe(true);
  });

  it('should set value to false when setFalse is called', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      result.current.setFalse();
    });

    expect(result.current.value).toBe(false);

    // Calling setFalse again should keep it false
    act(() => {
      result.current.setFalse();
    });

    expect(result.current.value).toBe(false);
  });

  it('should set value directly when setValue is called', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.setValue(true);
    });

    expect(result.current.value).toBe(true);

    act(() => {
      result.current.setValue(false);
    });

    expect(result.current.value).toBe(false);
  });

  it('should maintain stable references for callback functions', () => {
    const { result, rerender } = renderHook(() => useToggle(false));

    const initialToggle = result.current.toggle;
    const initialSetTrue = result.current.setTrue;
    const initialSetFalse = result.current.setFalse;
    const initialSetValue = result.current.setValue;

    rerender();

    expect(result.current.toggle).toBe(initialToggle);
    expect(result.current.setTrue).toBe(initialSetTrue);
    expect(result.current.setFalse).toBe(initialSetFalse);
    expect(result.current.setValue).toBe(initialSetValue);
  });

  it('should handle multiple rapid toggles correctly', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);
  });

  it('should work with complex scenarios', () => {
    const { result } = renderHook(() => useToggle(false));

    // Toggle on
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);

    // Set false explicitly
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);

    // Set true explicitly
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);

    // Direct set
    act(() => result.current.setValue(false));
    expect(result.current.value).toBe(false);
  });
});
