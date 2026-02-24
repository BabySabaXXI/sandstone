/**
 * Tests for useLocalStorage Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    jest.clearAllMocks();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    expect(result.current.value).toBe('default');
    expect(result.current.isLoaded).toBe(true);
  });

  it('should initialize with localStorage value when available', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result.current.value).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    act(() => {
      result.current.setValue('new-value');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
    expect(result.current.value).toBe('new-value');
  });

  it('should support function updates', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 0 })
    );

    act(() => {
      result.current.setValue((prev) => prev + 1);
    });

    expect(result.current.value).toBe(1);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(1)
    );
  });

  it('should remove value from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    act(() => {
      result.current.removeValue();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(result.current.value).toBe('default');
  });

  it('should work with object values', () => {
    const initialObject = { name: 'John', age: 30 };
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: initialObject })
    );

    expect(result.current.value).toEqual(initialObject);

    const newObject = { name: 'Jane', age: 25 };
    act(() => {
      result.current.setValue(newObject);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(newObject)
    );
  });

  it('should work with array values', () => {
    const initialArray = [1, 2, 3];
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: initialArray })
    );

    expect(result.current.value).toEqual([1, 2, 3]);

    act(() => {
      result.current.setValue([4, 5, 6]);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify([4, 5, 6])
    );
  });

  it('should use custom serialize function', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const customSerialize = (value: number) => `custom:${value}`;
    const customDeserialize = (value: string) => parseInt(value.replace('custom:', ''));

    const { result } = renderHook(() =>
      useLocalStorage({
        key: 'test-key',
        initialValue: 42,
        serialize: customSerialize,
        deserialize: customDeserialize,
      })
    );

    act(() => {
      result.current.setValue(100);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'custom:100');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    // Should fall back to initial value
    expect(result.current.value).toBe('default');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle setItem errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    act(() => {
      result.current.setValue('new-value');
    });

    // Value should still update in state
    expect(result.current.value).toBe('new-value');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should sync across tabs when syncAcrossTabs is true', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default', syncAcrossTabs: true })
    );

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: JSON.stringify('synced-value'),
      oldValue: JSON.stringify('default'),
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current.value).toBe('synced-value');
  });

  it('should not sync across tabs when syncAcrossTabs is false', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default', syncAcrossTabs: false })
    );

    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: JSON.stringify('synced-value'),
      oldValue: JSON.stringify('default'),
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    // Value should not change
    expect(result.current.value).toBe('default');
  });

  it('should ignore storage events for different keys', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default', syncAcrossTabs: true })
    );

    const storageEvent = new StorageEvent('storage', {
      key: 'different-key',
      newValue: JSON.stringify('other-value'),
      oldValue: null,
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current.value).toBe('default');
  });

  it('should handle null values in storage events', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default', syncAcrossTabs: true })
    );

    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: null,
      oldValue: JSON.stringify('stored-value'),
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    // Should reset to initial value
    expect(result.current.value).toBe('default');
  });

  it('should dispatch custom storage event for same-tab sync', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    act(() => {
      result.current.setValue('new-value');
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'storage',
        key: 'test-key',
      })
    );

    dispatchEventSpy.mockRestore();
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default' })
    );

    // Should fall back to initial value
    expect(result.current.value).toBe('default');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should clean up event listener on unmount', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useLocalStorage({ key: 'test-key', initialValue: 'default', syncAcrossTabs: true })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
