/**
 * Array & Object Helper Utilities
 * 
 * Helper functions for manipulating arrays and objects,
 * including grouping, sorting, filtering, and transformations.
 */

// ============================================================================
// Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortOptions<T> {
  key: keyof T | ((item: T) => unknown);
  direction?: SortDirection;
}

export interface GroupByResult<T> {
  [key: string]: T[];
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Array Operations
// ============================================================================

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates by a specific key
 */
export function uniqueBy<T>(array: T[], key: keyof T | ((item: T) => unknown)): T[] {
  const seen = new Set<unknown>();
  return array.filter((item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Group array items by a key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): GroupByResult<T> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as GroupByResult<T>);
}

/**
 * Sort an array by a key or compare function
 */
export function sortBy<T>(array: T[], options: SortOptions<T>): T[] {
  const { key, direction = 'asc' } = options;
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return multiplier * aVal.localeCompare(bVal);
    }

    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
}

/**
 * Sort by multiple criteria
 */
export function sortByMultiple<T>(array: T[], ...options: SortOptions<T>[]): T[] {
  return [...array].sort((a, b) => {
    for (const option of options) {
      const { key, direction = 'asc' } = option;
      const multiplier = direction === 'desc' ? -1 : 1;

      const aVal = typeof key === 'function' ? key(a) : a[key];
      const bVal = typeof key === 'function' ? key(b) : b[key];

      if (aVal === null || aVal === undefined) continue;
      if (bVal === null || bVal === undefined) continue;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        if (comparison !== 0) return comparison * multiplier;
      } else {
        if (aVal < bVal) return -1 * multiplier;
        if (aVal > bVal) return 1 * multiplier;
      }
    }
    return 0;
  });
}

/**
 * Partition an array into two arrays based on a predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((item) => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
}

/**
 * Split an array into chunks of a specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten a nested array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val) : val);
  }, []);
}

/**
 * Flatten an array to a specific depth
 */
export function flattenDepth<T>(array: (T | T[])[], depth: number): T[] {
  if (depth <= 0) return array as T[];
  
  return array.reduce<T[]>((acc, val) => {
    return acc.concat(
      Array.isArray(val) ? flattenDepth(val, depth - 1) : val
    );
  }, []);
}

/**
 * Get the intersection of two arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter((item) => set2.has(item));
}

/**
 * Get the difference between two arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter((item) => !set2.has(item));
}

/**
 * Get the union of two arrays
 */
export function union<T>(array1: T[], array2: T[]): T[] {
  return [...new Set([...array1, ...array2])];
}

/**
 * Rotate an array (move elements from end to beginning or vice versa)
 */
export function rotate<T>(array: T[], positions: number): T[] {
  if (array.length === 0) return array;
  
  const normalizedPositions = ((positions % array.length) + array.length) % array.length;
  return [...array.slice(-normalizedPositions), ...array.slice(0, -normalizedPositions)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Take a random sample from an array
 */
export function sample<T>(array: T[], count: number): T[] {
  if (count >= array.length) return shuffle(array);
  return shuffle(array).slice(0, count);
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Move an element from one index to another
 */
export function moveElement<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Insert an element at a specific index
 */
export function insertAt<T>(array: T[], index: number, ...elements: T[]): T[] {
  const result = [...array];
  result.splice(index, 0, ...elements);
  return result;
}

/**
 * Remove an element at a specific index
 */
export function removeAt<T>(array: T[], index: number): T[] {
  const result = [...array];
  result.splice(index, 1);
  return result;
}

/**
 * Toggle an item in an array (add if not present, remove if present)
 */
export function toggleItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  }
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Find the index of the last item matching a predicate
 */
export function findLastIndex<T>(
  array: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

// ============================================================================
// Object Operations
// ============================================================================

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete (result as Record<string, unknown>)[key as string];
  });
  return result;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result = { ...target } as T & U;
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = (target as Record<string, unknown>)[key as string];
      
      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key as string] = deepMerge(
          targetValue as object,
          sourceValue as object
        );
      } else {
        (result as Record<string, unknown>)[key as string] = sourceValue as unknown;
      }
    }
  }
  
  return result;
}

/**
 * Get a nested value from an object using a path string
 */
export function getByPath<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = (result as Record<string, unknown>)[key];
  }
  
  return (result as T) ?? defaultValue;
}

/**
 * Set a nested value in an object using a path string
 */
export function setByPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.');
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Check if an object has all specified keys
 */
export function hasKeys<T extends object>(
  obj: T,
  keys: (keyof T)[]
): boolean {
  return keys.every((key) => key in obj);
}

/**
 * Filter object keys by a predicate
 */
export function filterKeys<T extends object>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (predicate(key, value)) {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Map object values
 */
export function mapValues<T extends object, U>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key);
    }
  }
  
  return result;
}

/**
 * Map object keys
 */
export function mapKeys<T extends object>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = mapper(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Invert an object (swap keys and values)
 */
export function invert<T extends Record<string, string>>(
  obj: T
): Record<T[keyof T], keyof T> {
  const result = {} as Record<T[keyof T], keyof T>;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[obj[key]] = key;
    }
  }
  
  return result;
}

/**
 * Check if two objects are deeply equal
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  
  if (aKeys.length !== bKeys.length) return false;
  
  return aKeys.every((key) => {
    if (!bKeys.includes(key)) return false;
    return isEqual(aObj[key], bObj[key]);
  });
}

/**
 * Create an object from entries
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Get entries of an object as typed array
 */
export function toEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// ============================================================================
// Async Array Operations
// ============================================================================

/**
 * Map with async function
 */
export async function asyncMap<T, U>(
  array: T[],
  mapper: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(mapper));
}

/**
 * Filter with async predicate
 */
export async function asyncFilter<T>(
  array: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(array.map(predicate));
  return array.filter((_, index) => results[index]);
}

/**
 * Sequential async map (process items one at a time)
 */
export async function asyncMapSequential<T, U>(
  array: T[],
  mapper: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  const results: U[] = [];
  for (let i = 0; i < array.length; i++) {
    results.push(await mapper(array[i], i));
  }
  return results;
}

/**
 * Run async operations with concurrency limit
 */
export async function asyncPool<T, U>(
  concurrency: number,
  array: T[],
  mapper: (item: T) => Promise<U>
): Promise<U[]> {
  const results: U[] = [];
  const executing: Promise<void>[] = [];

  for (const item of array) {
    const promise = mapper(item).then((result) => {
      results.push(result);
    });
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}
