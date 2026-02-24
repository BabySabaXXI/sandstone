import { useState, useEffect, useCallback, useRef } from "react";

export type KeyTarget = string | string[];

export interface UseKeyPressOptions {
  target?: KeyTarget;
  event?: "keydown" | "keyup" | "keypress";
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
}

export interface UseKeyPressReturn {
  pressed: boolean;
  key: string | null;
}

/**
 * Custom hook to detect when a specific key is pressed
 * Features: multiple keys support, key combination support, event type selection
 */
export function useKeyPress(
  targetKey: KeyTarget,
  options: UseKeyPressOptions = {}
): UseKeyPressReturn {
  const {
    event = "keydown",
    preventDefault = false,
    stopPropagation = false,
    enabled = true,
  } = options;

  const [pressed, setPressed] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  
  const targetKeysRef = useRef<string[]>(
    Array.isArray(targetKey) ? targetKey : [targetKey]
  );

  const handleKeyEvent = useCallback(
    (eventObj: KeyboardEvent) => {
      if (!enabled) return;

      const isTargetKey = targetKeysRef.current.some((target) => {
        // Handle key combinations (e.g., "ctrl+s", "cmd+k")
        if (target.includes("+")) {
          const keys = target.split("+").map((k) => k.trim().toLowerCase());
          const ctrlPressed = keys.includes("ctrl") && eventObj.ctrlKey;
          const altPressed = keys.includes("alt") && eventObj.altKey;
          const shiftPressed = keys.includes("shift") && eventObj.shiftKey;
          const metaPressed = keys.includes("meta") || keys.includes("cmd")
            ? eventObj.metaKey
            : !keys.includes("meta") && !keys.includes("cmd");
          
          const mainKey = keys.find(
            (k) => !["ctrl", "alt", "shift", "meta", "cmd"].includes(k)
          );
          const mainKeyMatch = mainKey
            ? eventObj.key.toLowerCase() === mainKey.toLowerCase()
            : true;

          return ctrlPressed && altPressed && shiftPressed && metaPressed && mainKeyMatch;
        }

        // Simple key match
        return (
          eventObj.key.toLowerCase() === target.toLowerCase() ||
          eventObj.code.toLowerCase() === target.toLowerCase()
        );
      });

      if (isTargetKey) {
        if (preventDefault) {
          eventObj.preventDefault();
        }
        if (stopPropagation) {
          eventObj.stopPropagation();
        }

        if (event === "keydown" || event === "keypress") {
          setPressed(true);
          setKey(eventObj.key);
        } else {
          setPressed(false);
          setKey(null);
        }
      }
    },
    [event, preventDefault, stopPropagation, enabled]
  );

  const handleKeyUp = useCallback(
    (eventObj: KeyboardEvent) => {
      if (!enabled) return;

      const isTargetKey = targetKeysRef.current.some(
        (target) =>
          eventObj.key.toLowerCase() === target.toLowerCase() ||
          eventObj.code.toLowerCase() === target.toLowerCase()
      );

      if (isTargetKey) {
        setPressed(false);
        setKey(null);
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener(event, handleKeyEvent);
    if (event === "keydown") {
      window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      window.removeEventListener(event, handleKeyEvent);
      if (event === "keydown") {
        window.removeEventListener("keyup", handleKeyUp);
      }
    };
  }, [event, handleKeyEvent, handleKeyUp, enabled]);

  return { pressed, key };
}

export interface UseKeyComboOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
}

/**
 * Custom hook to detect key combinations
 */
export function useKeyCombo(
  combo: string,
  callback: () => void,
  options: UseKeyComboOptions = {}
): void {
  const { preventDefault = true, stopPropagation = true, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const keys = combo.split("+").map((k) => k.trim().toLowerCase());
      
      const ctrlRequired = keys.includes("ctrl");
      const altRequired = keys.includes("alt");
      const shiftRequired = keys.includes("shift");
      const metaRequired = keys.includes("meta") || keys.includes("cmd");
      
      const mainKey = keys.find(
        (k) => !["ctrl", "alt", "shift", "meta", "cmd"].includes(k)
      );

      const modifiersMatch =
        ctrlRequired === event.ctrlKey &&
        altRequired === event.altKey &&
        shiftRequired === event.shiftKey &&
        metaRequired === event.metaKey;

      const mainKeyMatch = mainKey
        ? event.key.toLowerCase() === mainKey.toLowerCase()
        : true;

      if (modifiersMatch && mainKeyMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback();
      }
    },
    [combo, callback, preventDefault, stopPropagation, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

export default useKeyPress;
