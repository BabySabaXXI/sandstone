/**
 * Tests for useCopyToClipboard Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
  const mockWriteText = jest.fn();
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.copy).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should copy text successfully', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyToClipboard());

    let copyResult: boolean | undefined;
    await act(async () => {
      copyResult = await result.current.copy('test text');
    });

    expect(copyResult).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle copy failure', async () => {
    const error = new Error('Copy failed');
    mockWriteText.mockRejectedValue(error);
    const { result } = renderHook(() => useCopyToClipboard());

    let copyResult: boolean | undefined;
    await act(async () => {
      copyResult = await result.current.copy('test text');
    });

    expect(copyResult).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(error);
  });

  it('should reset state', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should auto-reset after specified timeout', async () => {
    jest.useFakeTimers();
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 2000 }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);

    jest.useRealTimers();
  });

  it('should use default timeout of 2000ms', async () => {
    jest.useFakeTimers();
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1999);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);

    jest.useRealTimers();
  });

  it('should call onSuccess callback', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onSuccess }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(onSuccess).toHaveBeenCalledWith('test text');
  });

  it('should call onError callback', async () => {
    const error = new Error('Copy failed');
    mockWriteText.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onError }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should handle empty string', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('');
    });

    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('should handle null clipboard API', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: null,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    let copyResult: boolean | undefined;
    await act(async () => {
      copyResult = await result.current.copy('test text');
    });

    expect(copyResult).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should handle multiple consecutive copies', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('text1');
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      await result.current.copy('text2');
    });
    expect(result.current.copied).toBe(true);
    expect(mockWriteText).toHaveBeenCalledTimes(2);
  });
});
