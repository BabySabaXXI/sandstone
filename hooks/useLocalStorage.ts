import { useState, useEffect, useCallback, useRef } from "react";

export interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  syncAcrossTabs?: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoaded: boolean;
}

/**
 * Custom hook for local storage with SSR support and cross-tab synchronization
 * Features: JSON serialization, error handling, cross-tab sync, SSR safety
 */
export function useLocalStorage<T>({
  key,
  initialValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  syncAcrossTabs = true,
}: UseLocalStorageOptions<T>): UseLocalStorageReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const keyRef = useRef(key);
  const initialValueRef = useRef(initialValue);

  // Read from localStorage on mount
  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValueState(deserialize(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    
    setIsLoaded(true);
  }, [key, deserialize]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
        
        // Skip on server
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(keyRef.current, serialize(valueToStore));
            
            // Dispatch custom event for same-tab synchronization
            window.dispatchEvent(
              new StorageEvent("storage", {
                key: keyRef.current,
                newValue: serialize(valueToStore),
                oldValue: serialize(prev),
                storageArea: window.localStorage,
              })
            );
          } catch (error) {
            console.warn(`Error setting localStorage key "${keyRef.current}":`, error);
          }
        }
        
        return valueToStore;
      });
    },
    [serialize]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    setValueState(initialValueRef.current);
    
    // Skip on server
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(keyRef.current);
        
        // Dispatch custom event for same-tab synchronization
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: keyRef.current,
            newValue: null,
            oldValue: serialize(value),
            storageArea: window.localStorage,
          })
        );
      } catch (error) {
        console.warn(`Error removing localStorage key "${keyRef.current}":`, error);
      }
    }
  }, [serialize, value]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === keyRef.current && event.storageArea === window.localStorage) {
        if (event.newValue === null) {
          setValueState(initialValueRef.current);
        } else {
          try {
            setValueState(deserialize(event.newValue));
          } catch (error) {
            console.warn(`Error deserializing localStorage value for key "${keyRef.current}":`, error);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncAcrossTabs, deserialize]);

  return {
    value,
    setValue,
    removeValue,
    isLoaded,
  };
}

export default useLocalStorage;
