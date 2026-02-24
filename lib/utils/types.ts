/**
 * Utility Types
 * 
 * Shared TypeScript types and interfaces used across utility functions.
 */

// ============================================================================
// General Utility Types
// ============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties of T readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract the element type from an array
 */
export type ElementType<T> = T extends (infer E)[] ? E : never;

/**
 * Extract the return type of a function
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = 
  T extends (...args: unknown[]) => infer R ? R : never;

/**
 * Extract the parameters of a function
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = 
  T extends (...args: infer P) => unknown ? P : never;

/**
 * Make specific keys of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Create a type with only the specified keys from T
 */
export type PickBy<T, K extends keyof T> = Pick<T, K>;

/**
 * Create a type without the specified keys from T
 */
export type OmitBy<T, K extends keyof T> = Omit<T, K>;

// ============================================================================
// Nullable Types
// ============================================================================

/**
 * Make a type nullable
 */
export type Nullable<T> = T | null;

/**
 * Make a type optional (can be undefined)
 */
export type Optional<T> = T | undefined;

/**
 * Make a type both nullable and optional
 */
export type Maybe<T> = T | null | undefined;

/**
 * Non-nullable version of a type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

// ============================================================================
// Object Types
// ============================================================================

/**
 * Flatten a nested object type
 */
export type Flatten<T> = T extends object ? { [K in keyof T]: T[K] } : T;

/**
 * Get all keys of a nested object as dot notation
 */
export type DeepKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? `${Prefix}${K}` | DeepKeys<T[K], `${Prefix}${K}.`>
        : never;
    }[keyof T]
  : never;

/**
 * Get the value type at a deep path
 */
export type DeepValue<T, Path extends string> = Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? DeepValue<T[K], R>
    : never
  : Path extends keyof T
  ? T[Path]
  : never;

/**
 * Merge two object types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Require at least one of the specified keys
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> }[Keys];

/**
 * Require exactly one of the specified keys
 */
export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>> }[Keys];

// ============================================================================
// Function Types
// ============================================================================

/**
 * A function that takes any arguments and returns void
 */
export type Callback = (...args: unknown[]) => void;

/**
 * A function that takes any arguments and returns a value
 */
export type AnyFunction = (...args: unknown[]) => unknown;

/**
 * An async function
 */
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * A predicate function
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * A comparator function
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * A mapper function
 */
export type Mapper<T, U> = (value: T, index: number) => U;

/**
 * A reducer function
 */
export type Reducer<T, U> = (accumulator: U, current: T, index: number) => U;

// ============================================================================
// Collection Types
// ============================================================================

/**
 * A key-value pair
 */
export type KeyValuePair<K extends string | number | symbol, V> = [K, V];

/**
 * A record with string keys
 */
export type StringRecord<T = unknown> = Record<string, T>;

/**
 * A record with number keys
 */
export type NumberRecord<T = unknown> = Record<number, T>;

/**
 * A dictionary type
 */
export type Dictionary<T> = Record<string, T>;

/**
 * A lookup type for enum-like objects
 */
export type Lookup<T extends string> = { [K in T]: K };

// ============================================================================
// Async Types
// ============================================================================

/**
 * Unwrap a Promise type
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * Unwrap an array type
 */
export type UnwrapArray<T> = T extends (infer U)[] ? U : T;

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard for non-null values
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for arrays
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for plain objects
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Type guard for functions
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard for strings
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for numbers
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard for booleans
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for Dates
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============================================================================
// Brand Types (for nominal typing)
// ============================================================================

/**
 * Create a branded type for nominal typing
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Create a branded string type
 */
export type BrandedString<B> = Brand<string, B>;

/**
 * Create a branded number type
 */
export type BrandedNumber<B> = Brand<number, B>;

// Example usage:
// type UserId = BrandedString<'UserId'>;
// type PostId = BrandedString<'PostId'>;
// const userId = '123' as UserId;
// const postId = '456' as PostId;
// userId = postId; // Error: Type 'PostId' is not assignable to type 'UserId'

// ============================================================================
// Event Types
// ============================================================================

/**
 * Generic event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Generic change handler type
 */
export type ChangeHandler<T> = (value: T) => void;

/**
 * Generic submit handler type
 */
export type SubmitHandler<T> = (data: T) => void | Promise<void>;

// ============================================================================
// Component Types
// ============================================================================

/**
 * Props with className
 */
export type WithClassName<T = object> = T & { className?: string };

/**
 * Props with children
 */
export type WithChildren<T = object> = T & { children?: React.ReactNode };

/**
 * Props with both className and children
 */
export type WithClassNameAndChildren<T = object> = WithClassName<WithChildren<T>>;

/**
 * Polymorphic component props
 */
export type PolymorphicProps<
  T extends React.ElementType = React.ElementType,
  Props = object
> = Props & {
  as?: T;
} & Omit<React.ComponentPropsWithRef<T>, keyof Props | 'as'>;
