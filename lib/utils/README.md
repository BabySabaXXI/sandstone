# Sandstone Utilities

A comprehensive collection of utility functions for the Sandstone application.

## Structure

```
lib/utils/
├── index.ts       # Main barrel export
├── types.ts       # Shared TypeScript types
├── date.ts        # Date formatting and manipulation
├── string.ts      # String manipulation and formatting
├── number.ts      # Number and currency formatting
├── collection.ts  # Array and object helpers
├── validation.ts  # Validation helpers and schemas
└── color.ts       # Color manipulation and palettes
```

## Usage

### Importing Utilities

```typescript
// Import specific utilities
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { truncate, slugify } from '@/lib/utils/string';

// Import from main barrel (recommended)
import { 
  formatDate, 
  truncate, 
  clamp,
  cn 
} from '@/lib/utils';

// Import the main utils.ts for cn and Tailwind helpers
import { cn, responsive, variants } from '@/lib/utils';
```

## Module Overview

### Date Utilities (`date.ts`)

```typescript
import { 
  formatDate,           // Format dates with presets
  formatRelativeTime,   // "2 hours ago", "yesterday"
  formatDateRange,      // "Jan 1 - Jan 5, 2024"
  formatDuration,       // Format milliseconds
  formatMinutes,        // Format minutes as "1h 30m"
  getDateLabel,         // "Today", "Yesterday", etc.
  groupByDateLabel,     // Group items by date labels
  daysUntil,            // Calculate days until a date
  isOverdue,            // Check if date is overdue
  calculateNextReview,  // Spaced repetition calculation
  parseDate,            // Safe date parsing
  DATE_FORMATS          // Format constants
} from '@/lib/utils/date';

// Examples
formatDate(new Date(), { preset: 'short' });           // "Jan 1, 2024"
formatDate(new Date(), { preset: 'datetime' });        // "Jan 1, 2024 at 2:30 PM"
formatRelativeTime(new Date(Date.now() - 3600000));    // "1 hour ago"
formatDateRange(startDate, endDate);                   // "Jan 1 - Jan 5, 2024"
```

### String Utilities (`string.ts`)

```typescript
import {
  truncate,             // Truncate with ellipsis
  truncateMiddle,       // "abc...xyz" for IDs
  toCamelCase,          // "hello world" → "helloWorld"
  toPascalCase,         // "hello world" → "HelloWorld"
  toKebabCase,          // "hello world" → "hello-world"
  toSnakeCase,          // "hello world" → "hello_world"
  toTitleCase,          // "hello world" → "Hello World"
  slugify,              // Create URL-friendly slugs
  generateId,           // Generate random ID
  generateUUID,         // Generate UUID v4
  stripHtml,            // Remove HTML tags
  escapeHtml,           // Escape HTML entities
  normalizeWhitespace,  // Remove extra spaces
  countWords,           // Word count
  countCharacters,      // Character count
  estimateReadingTime,  // Reading time estimation
  formatReadingTime,    // "3 min read"
  highlightText,        // Highlight search terms
  extractContext,       // Extract context around matches
  isBlank,              // Check if empty/whitespace
  isPresent,            // Check if not empty
  pad,                  // Pad strings
  nl2br,                // Newlines to <br>
  capitalize,           // Capitalize first letter
  pluralize,            // "1 item", "2 items"
  formatList            // "a, b, and c"
} from '@/lib/utils/string';

// Examples
truncate('Long text here', { length: 10 });           // "Long te..."
toKebabCase('Hello World');                          // "hello-world"
slugify('Hello World!');                             // "hello-world"
formatReadingTime(essayContent);                     // "3 min read"
pluralize(5, 'item');                                // "items"
```

### Number Utilities (`number.ts`)

```typescript
import {
  formatNumber,         // Format with separators
  formatCurrency,       // Currency formatting
  formatPercent,        // Percentage formatting
  formatCompact,        // "1.2K", "3.5M"
  formatOrdinal,        // "1st", "2nd", "3rd"
  formatFileSize,       // "1.5 MB"
  formatDuration,       // "1:30:45"
  clamp,                // Clamp to range
  round,                // Round to decimals
  roundUp,              // Round up to multiple
  roundDown,            // Round down to multiple
  nearest,              // Find nearest value
  average,              // Calculate average
  sum,                  // Calculate sum
  median,               // Calculate median
  min,                  // Find minimum
  max,                  // Find maximum
  standardDeviation,    // Calculate std dev
  formatGrade,          // Grade with color info
  formatBand,           // A-Level band
  bandToRange,          // Band to score range
  isValidNumber,        // Type guard
  isNumericString,      // Check numeric string
  safeParseNumber       // Safe number parsing
} from '@/lib/utils/number';

// Examples
formatNumber(1234567.89, { decimals: 2 });           // "1,234,567.89"
formatCurrency(99.99, { currency: 'USD' });          // "$99.99"
formatPercent(0.856, { decimals: 1 });               // "85.6%"
formatCompact(1500000);                              // "1.5M"
formatGrade(85);                                     // { letter: 'A', color: 'green', percentage: '85%' }
clamp(value, 0, 100);                                // Clamp to 0-100
```

### Collection Utilities (`collection.ts`)

```typescript
import {
  unique,               // Remove duplicates
  uniqueBy,             // Remove duplicates by key
  groupBy,              // Group by key/function
  sortBy,               // Sort by key
  sortByMultiple,       // Sort by multiple criteria
  partition,            // Split by predicate
  chunk,                // Split into chunks
  flatten,              // Flatten nested arrays
  flattenDepth,         // Flatten to depth
  intersection,         // Common elements
  difference,           // Different elements
  union,                // Combined unique
  rotate,               // Rotate array
  shuffle,              // Random shuffle
  sample,               // Random sample
  randomElement,        // Random element
  moveElement,          // Move element
  insertAt,             // Insert at index
  removeAt,             // Remove at index
  toggleItem,           // Toggle item presence
  findLastIndex,        // Last matching index
  pick,                 // Pick keys from object
  omit,                 // Omit keys from object
  deepClone,            // Deep clone
  deepMerge,            // Deep merge
  getByPath,            // Get nested value
  setByPath,            // Set nested value
  hasKeys,              // Check has all keys
  filterKeys,           // Filter by predicate
  mapValues,            // Map object values
  mapKeys,              // Map object keys
  invert,               // Swap keys/values
  isEqual,              // Deep equality
  fromEntries,          // From entries array
  toEntries,            // To entries array
  asyncMap,             // Async map
  asyncFilter,          // Async filter
  asyncMapSequential,   // Sequential async map
  asyncPool             // Concurrent async pool
} from '@/lib/utils/collection';

// Examples
unique([1, 2, 2, 3]);                                // [1, 2, 3]
groupBy(users, 'role');                              // { admin: [...], user: [...] }
sortBy(items, { key: 'name', direction: 'asc' });
chunk(array, 3);                                     // [[1,2,3], [4,5,6]]
pick(obj, ['id', 'name']);                           // { id, name }
omit(obj, ['password']);                             // Without password
deepMerge(obj1, obj2);                               // Deep merge
getByPath(obj, 'user.profile.name');                 // Get nested value
```

### Validation Utilities (`validation.ts`)

```typescript
import {
  // Basic validators
  isValidEmail,
  isValidUrl,
  isStrongPassword,
  getPasswordStrength,
  isValidUUID,
  isValidHexColor,
  isInRange,
  isInteger,
  isPositive,
  isNonNegative,
  isNotEmpty,
  areAllUnique,
  isPlainObject,
  isValidDate,
  isNil,
  isDefined,
  
  // Zod schemas
  emailSchema,
  passwordSchema,
  urlSchema,
  uuidSchema,
  hexColorSchema,
  subjectSchema,
  paginationSchema,
  sortingSchema,
  essaySchema,
  flashcardSchema,
  documentSchema,
  
  // Validation helpers
  safeParse,
  createValidator,
  composeValidators,
  required,
  minLength,
  maxLength,
  email,
  url,
  matches,
  validateEssay,
  formatZodErrors,
  getFirstError
} from '@/lib/utils/validation';

// Examples
isValidEmail('test@example.com');                    // true
getPasswordStrength(password);                       // { score, label, requirements }
safeParse(emailSchema, 'test@example.com');          // { success: true, data: ... }
validateEssay(content, { minWords: 100 });           // { valid, errors }
```

### Color Utilities (`color.ts`)

```typescript
import {
  // Conversion
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  parseRgb,
  parseHsl,
  normalizeHex,
  isValidHex,
  
  // Manipulation
  lighten,
  darken,
  saturate,
  desaturate,
  rotateHue,
  invert,
  grayscale,
  mix,
  complement,
  analogous,
  triadic,
  
  // Contrast & Accessibility
  getLuminance,
  getContrastRatio,
  getContrastText,
  meetsWCAGAA,
  meetsWCAGAAA,
  
  // Palettes
  generatePalette,
  generateGradient,
  randomColor,
  randomPastelColor,
  
  // Sandstone specific
  SUBJECT_COLORS,
  getSubjectColors,
  GRADE_COLORS,
  getGradeColor,
  getScoreColor,
  getScoreColorClass,
  getScoreBgClass
} from '@/lib/utils/color';

// Examples
lighten('#3B82F6', 20);                              // Lighter blue
darken('#3B82F6', 20);                               // Darker blue
getContrastText('#000000');                          // "#FFFFFF"
getContrastRatio('#000000', '#FFFFFF');              // 21
meetsWCAGAA('#000000', '#FFFFFF');                   // true
generatePalette('#3B82F6');                          // Full palette
getGradeColor('A');                                  // Grade color
getScoreColor(85);                                   // Score-based color
```

### Type Utilities (`types.ts`)

```typescript
import type {
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  ElementType,
  ReturnType,
  Parameters,
  PartialBy,
  RequiredBy,
  Nullable,
  Optional,
  Maybe,
  Result,
  AsyncResult,
  Brand,
  WithClassName,
  WithChildren,
  PolymorphicProps
} from '@/lib/utils/types';

// Type guards
import {
  isNonNull,
  isArray,
  isPlainObject,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isDate
} from '@/lib/utils/types';
```

### Main Utilities (`utils.ts`)

```typescript
import {
  cn,                   // Tailwind class merging
  responsive,           // Responsive class helper
  states,               // State class helper
  variants,             // Variant class helper
  
  // Re-exports from all modules
  formatDate,
  truncate,
  formatNumber,
  // ... and more
} from '@/lib/utils';

// Examples
cn('px-4', 'py-2', condition && 'bg-blue-500');
responsive({ base: 'text-sm', md: 'text-base', lg: 'text-lg' });
states({ base: 'bg-blue-500', hover: 'bg-blue-600' });
```

## Best Practices

1. **Import from the barrel** (`@/lib/utils`) for common utilities
2. **Import from specific modules** for tree-shaking optimization
3. **Use TypeScript types** for better IDE support
4. **Prefer immutable functions** that return new values
5. **Handle null/undefined** gracefully in all utilities

## Adding New Utilities

1. Add the function to the appropriate module
2. Export it from the module
3. Update this README with examples
4. Consider adding tests
