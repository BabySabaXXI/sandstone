import { useState, useCallback, useRef, useEffect } from "react";

export interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
  error: Error | null;
}

export interface UseCopyToClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook to copy text to clipboard
 * Features: success state with auto-reset, error handling, fallback support
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      reset();

      if (!text) {
        const err = new Error("Cannot copy empty text");
        setError(err);
        onError?.(err);
        return false;
      }

      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error("execCommand copy failed");
          }
        }

        if (isMountedRef.current) {
          setCopied(true);
          onSuccess?.();

          if (timeout > 0) {
            timeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setCopied(false);
              }
            }, timeout);
          }
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }

        return false;
      }
    },
    [reset, timeout, onSuccess, onError]
  );

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copied,
    copy,
    reset,
    error,
  };
}

export default useCopyToClipboard;
