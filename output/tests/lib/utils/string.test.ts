/**
 * Tests for String Utilities
 */

import {
  truncate,
  truncateMiddle,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  toTitleCase,
  toSentenceCase,
  slugify,
  generateId,
  generateUUID,
  stripHtml,
  escapeHtml,
  normalizeWhitespace,
  alphanumericOnly,
  countWords,
  countCharacters,
  estimateReadingTime,
  formatReadingTime,
  highlightText,
  extractContext,
  escapeRegExp,
  isBlank,
  isPresent,
  repeat,
  pad,
  nl2br,
  capitalize,
  decapitalize,
  interpolate,
  pluralize,
  formatList,
} from '../../../../lib/utils/string';

describe('truncate', () => {
  it('should truncate string to specified length', () => {
    expect(truncate('Hello World', { length: 5 })).toBe('He...');
  });

  it('should not truncate if string is shorter than length', () => {
    expect(truncate('Hi', { length: 10 })).toBe('Hi');
  });

  it('should use custom suffix', () => {
    expect(truncate('Hello World', { length: 5, suffix: '..' })).toBe('Hel..');
  });

  it('should respect word boundaries when specified', () => {
    expect(truncate('Hello World Test', { length: 10, wordBoundary: true })).toBe('Hello...');
  });

  it('should handle empty string', () => {
    expect(truncate('', { length: 10 })).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(truncate(null, { length: 10 })).toBe('');
    expect(truncate(undefined, { length: 10 })).toBe('');
  });
});

describe('truncateMiddle', () => {
  it('should truncate middle of string', () => {
    expect(truncateMiddle('abcdefghij', 3, 3)).toBe('abc...hij');
  });

  it('should not truncate if string is short enough', () => {
    expect(truncateMiddle('abc', 2, 2)).toBe('abc');
  });

  it('should use custom separator', () => {
    expect(truncateMiddle('abcdefghij', 3, 3, '---')).toBe('abc---hij');
  });

  it('should handle empty string', () => {
    expect(truncateMiddle('', 3, 3)).toBe('');
  });
});

describe('toCamelCase', () => {
  it('should convert space-separated to camelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
  });

  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld');
  });

  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('should handle already camelCase', () => {
    expect(toCamelCase('helloWorld')).toBe('helloWorld');
  });

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('');
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated to PascalCase', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld');
  });

  it('should convert kebab-case to PascalCase', () => {
    expect(toPascalCase('hello-world')).toBe('HelloWorld');
  });

  it('should convert snake_case to PascalCase', () => {
    expect(toPascalCase('hello_world')).toBe('HelloWorld');
  });

  it('should handle empty string', () => {
    expect(toPascalCase('')).toBe('');
  });
});

describe('toKebabCase', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
  });

  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world');
  });

  it('should convert space-separated to kebab-case', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });

  it('should convert snake_case to kebab-case', () => {
    expect(toKebabCase('hello_world')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(toKebabCase('')).toBe('');
  });
});

describe('toSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
  });

  it('should convert PascalCase to snake_case', () => {
    expect(toSnakeCase('HelloWorld')).toBe('hello_world');
  });

  it('should convert space-separated to snake_case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert kebab-case to snake_case', () => {
    expect(toSnakeCase('hello-world')).toBe('hello_world');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });
});

describe('toTitleCase', () => {
  it('should convert to Title Case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('should keep minor words lowercase except first word', () => {
    expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
  });

  it('should handle empty string', () => {
    expect(toTitleCase('')).toBe('');
  });
});

describe('toSentenceCase', () => {
  it('should convert to Sentence case', () => {
    expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
  });

  it('should handle empty string', () => {
    expect(toSentenceCase('')).toBe('');
  });
});

describe('slugify', () => {
  it('should create URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello & World!')).toBe('hello-world');
  });

  it('should handle accents', () => {
    expect(slugify('café')).toBe('cafe');
  });

  it('should use custom separator', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
  });

  it('should preserve case when lowercase is false', () => {
    expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('generateId', () => {
  it('should generate ID of specified length', () => {
    const id = generateId(10);
    expect(id).toHaveLength(10);
  });

  it('should generate different IDs on each call', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should use default length of 12', () => {
    const id = generateId();
    expect(id).toHaveLength(12);
  });

  it('should only contain alphanumeric characters', () => {
    const id = generateId(100);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('generateUUID', () => {
  it('should generate valid UUID format', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should generate different UUIDs on each call', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});

describe('stripHtml', () => {
  it('should remove HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('should decode HTML entities', () => {
    expect(stripHtml('&lt;p&gt;Hello&lt;/p&gt;')).toBe('<p>Hello</p>');
  });

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('normalizeWhitespace', () => {
  it('should collapse multiple spaces', () => {
    expect(normalizeWhitespace('hello    world')).toBe('hello world');
  });

  it('should trim whitespace', () => {
    expect(normalizeWhitespace('  hello world  ')).toBe('hello world');
  });

  it('should handle tabs and newlines', () => {
    expect(normalizeWhitespace('hello\t\t\tworld')).toBe('hello world');
  });

  it('should handle empty string', () => {
    expect(normalizeWhitespace('')).toBe('');
  });
});

describe('alphanumericOnly', () => {
  it('should remove non-alphanumeric characters', () => {
    expect(alphanumericOnly('hello@world!')).toBe('helloworld');
  });

  it('should keep numbers', () => {
    expect(alphanumericOnly('abc123')).toBe('abc123');
  });

  it('should handle empty string', () => {
    expect(alphanumericOnly('')).toBe('');
  });
});

describe('countWords', () => {
  it('should count words correctly', () => {
    expect(countWords('hello world test')).toBe(3);
  });

  it('should handle multiple spaces', () => {
    expect(countWords('hello    world')).toBe(2);
  });

  it('should handle empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('should handle whitespace only', () => {
    expect(countWords('   ')).toBe(0);
  });
});

describe('countCharacters', () => {
  it('should count characters with spaces', () => {
    expect(countCharacters('hello world', true)).toBe(11);
  });

  it('should count characters without spaces', () => {
    expect(countCharacters('hello world', false)).toBe(10);
  });

  it('should default to including spaces', () => {
    expect(countCharacters('hello world')).toBe(11);
  });

  it('should handle empty string', () => {
    expect(countCharacters('')).toBe(0);
  });
});

describe('estimateReadingTime', () => {
  it('should estimate reading time correctly', () => {
    // 200 words at 200 wpm = 1 minute
    const text = 'word '.repeat(200);
    expect(estimateReadingTime(text)).toBe(1);
  });

  it('should use custom words per minute', () => {
    // 200 words at 100 wpm = 2 minutes
    const text = 'word '.repeat(200);
    expect(estimateReadingTime(text, 100)).toBe(2);
  });

  it('should round up', () => {
    const text = 'word '.repeat(201);
    expect(estimateReadingTime(text)).toBe(2);
  });

  it('should handle empty string', () => {
    expect(estimateReadingTime('')).toBe(0);
  });
});

describe('formatReadingTime', () => {
  it('should format less than 1 minute', () => {
    expect(formatReadingTime('word')).toBe('< 1 min read');
  });

  it('should format 1 minute', () => {
    const text = 'word '.repeat(200);
    expect(formatReadingTime(text)).toBe('1 min read');
  });

  it('should format multiple minutes', () => {
    const text = 'word '.repeat(400);
    expect(formatReadingTime(text)).toBe('2 min read');
  });
});

describe('highlightText', () => {
  it('should highlight search term', () => {
    expect(highlightText('hello world', 'world')).toBe(
      'hello <mark class="highlight">world</mark>'
    );
  });

  it('should highlight multiple occurrences', () => {
    expect(highlightText('world hello world', 'world')).toBe(
      '<mark class="highlight">world</mark> hello <mark class="highlight">world</mark>'
    );
  });

  it('should be case insensitive', () => {
    expect(highlightText('Hello World', 'world')).toBe(
      'Hello <mark class="highlight">World</mark>'
    );
  });

  it('should handle empty text', () => {
    expect(highlightText('', 'test')).toBe('');
  });

  it('should handle empty search term', () => {
    expect(highlightText('hello world', '')).toBe('hello world');
  });

  it('should use custom highlight class', () => {
    expect(highlightText('hello world', 'world', 'custom-highlight')).toBe(
      'hello <mark class="custom-highlight">world</mark>'
    );
  });
});

describe('extractContext', () => {
  it('should extract context around search term', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    const contexts = extractContext(text, 'fox', 5);
    expect(contexts).toContain('...wn fox jump...');
  });

  it('should handle multiple occurrences', () => {
    const text = 'the cat and the dog';
    const contexts = extractContext(text, 'the', 3);
    expect(contexts.length).toBe(2);
  });

  it('should handle empty text', () => {
    expect(extractContext('', 'test')).toEqual([]);
  });

  it('should handle empty search term', () => {
    expect(extractContext('hello world', '')).toEqual([]);
  });
});

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe(
      '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
    );
  });

  it('should not escape normal characters', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
  });
});

describe('isBlank', () => {
  it('should return true for empty string', () => {
    expect(isBlank('')).toBe(true);
  });

  it('should return true for whitespace only', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('should return false for non-empty string', () => {
    expect(isBlank('hello')).toBe(false);
  });

  it('should return true for null', () => {
    expect(isBlank(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isBlank(undefined)).toBe(true);
  });
});

describe('isPresent', () => {
  it('should return false for empty string', () => {
    expect(isPresent('')).toBe(false);
  });

  it('should return false for whitespace only', () => {
    expect(isPresent('   ')).toBe(false);
  });

  it('should return true for non-empty string', () => {
    expect(isPresent('hello')).toBe(true);
  });

  it('should return false for null', () => {
    expect(isPresent(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPresent(undefined)).toBe(false);
  });
});

describe('repeat', () => {
  it('should repeat string n times', () => {
    expect(repeat('ab', 3)).toBe('ababab');
  });

  it('should return empty string for 0 times', () => {
    expect(repeat('ab', 0)).toBe('');
  });

  it('should return empty string for negative times', () => {
    expect(repeat('ab', -1)).toBe('');
  });
});

describe('pad', () => {
  it('should pad at end by default', () => {
    expect(pad('hello', 10)).toBe('hello     ');
  });

  it('should pad at start when specified', () => {
    expect(pad('hello', 10, ' ', 'start')).toBe('     hello');
  });

  it('should use custom padding character', () => {
    expect(pad('5', 3, '0')).toBe('500');
  });

  it('should handle numbers', () => {
    expect(pad(42, 5, '0')).toBe('42000');
  });

  it('should not pad if string is already long enough', () => {
    expect(pad('hello', 3)).toBe('hello');
  });
});

describe('nl2br', () => {
  it('should convert newlines to br tags', () => {
    expect(nl2br('line1\nline2')).toBe('line1<br>line2');
  });

  it('should handle multiple newlines', () => {
    expect(nl2br('a\n\nb')).toBe('a<br><br>b');
  });

  it('should handle empty string', () => {
    expect(nl2br('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(nl2br(null)).toBe('');
    expect(nl2br(undefined)).toBe('');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(capitalize(null)).toBe('');
    expect(capitalize(undefined)).toBe('');
  });
});

describe('decapitalize', () => {
  it('should decapitalize first letter', () => {
    expect(decapitalize('Hello')).toBe('hello');
  });

  it('should handle already lowercase', () => {
    expect(decapitalize('hello')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(decapitalize('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(decapitalize(null)).toBe('');
    expect(decapitalize(undefined)).toBe('');
  });
});

describe('interpolate', () => {
  it('should interpolate template with values', () => {
    expect(interpolate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('should handle multiple placeholders', () => {
    expect(interpolate('{{greeting}} {{name}}!', { greeting: 'Hello', name: 'World' })).toBe(
      'Hello World!'
    );
  });

  it('should keep placeholder if value not provided', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello {{name}}!');
  });

  it('should handle numeric values', () => {
    expect(interpolate('Count: {{count}}', { count: 42 })).toBe('Count: 42');
  });
});

describe('pluralize', () => {
  it('should use singular for count of 1', () => {
    expect(pluralize(1, 'item')).toBe('item');
  });

  it('should use plural for count of 0', () => {
    expect(pluralize(0, 'item')).toBe('items');
  });

  it('should use plural for count greater than 1', () => {
    expect(pluralize(5, 'item')).toBe('items');
  });

  it('should use custom plural form', () => {
    expect(pluralize(2, 'person', 'people')).toBe('people');
  });
});

describe('formatList', () => {
  it('should handle empty array', () => {
    expect(formatList([])).toBe('');
  });

  it('should handle single item', () => {
    expect(formatList(['apple'])).toBe('apple');
  });

  it('should handle two items', () => {
    expect(formatList(['apple', 'banana'])).toBe('apple and banana');
  });

  it('should handle three or more items with Oxford comma', () => {
    expect(formatList(['apple', 'banana', 'cherry'])).toBe('apple, banana, and cherry');
  });

  it('should use custom conjunction', () => {
    expect(formatList(['a', 'b', 'c'], 'or')).toBe('a, b, or c');
  });
});
