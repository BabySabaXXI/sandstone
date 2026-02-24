/**
 * Tests for Validation Utilities
 */

import {
  isEmail,
  isUrl,
  isUuid,
  isHexColor,
  isRgbColor,
  isHslColor,
  isCreditCard,
  isPostalCode,
  isPhoneNumber,
  isStrongPassword,
  isJson,
  isBase64,
  isEmpty,
  isNotEmpty,
  isEqual,
  isDeepEqual,
  isInRange,
  isLength,
  matches,
  contains,
  startsWith,
  endsWith,
  oneOf,
  allOf,
  noneOf,
  required,
  minLength,
  maxLength,
  pattern,
  email,
  url,
  number,
  integer,
  positive,
  negative,
  min,
  max,
  range,
  date,
  before,
  after,
  createValidator,
  combineValidators,
} from '../../../../lib/utils/validation';

describe('isEmail', () => {
  it('should validate correct emails', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('user.name@domain.co.uk')).toBe(true);
    expect(isEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isEmail('invalid')).toBe(false);
    expect(isEmail('@example.com')).toBe(false);
    expect(isEmail('test@')).toBe(false);
    expect(isEmail('test@.com')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});

describe('isUrl', () => {
  it('should validate correct URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://example.com')).toBe(true);
    expect(isUrl('https://example.com/path')).toBe(true);
    expect(isUrl('https://example.com:8080')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isUrl('not-a-url')).toBe(false);
    expect(isUrl('ftp://example.com')).toBe(false);
    expect(isUrl('')).toBe(false);
  });
});

describe('isUuid', () => {
  it('should validate correct UUIDs', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUuid('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isUuid('')).toBe(false);
  });
});

describe('isHexColor', () => {
  it('should validate 3-digit hex colors', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#000')).toBe(true);
    expect(isHexColor('#abc')).toBe(true);
  });

  it('should validate 6-digit hex colors', () => {
    expect(isHexColor('#ffffff')).toBe(true);
    expect(isHexColor('#000000')).toBe(true);
    expect(isHexColor('#aabbcc')).toBe(true);
  });

  it('should validate 8-digit hex colors (with alpha)', () => {
    expect(isHexColor('#ffffffff')).toBe(true);
    expect(isHexColor('#00000000')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(isHexColor('fff')).toBe(false); // Missing #
    expect(isHexColor('#ggg')).toBe(false); // Invalid characters
    expect(isHexColor('#ff')).toBe(false); // Too short
    expect(isHexColor('')).toBe(false);
  });
});

describe('isRgbColor', () => {
  it('should validate rgb format', () => {
    expect(isRgbColor('rgb(255, 0, 0)')).toBe(true);
    expect(isRgbColor('rgb(0, 0, 0)')).toBe(true);
    expect(isRgbColor('rgb(128, 128, 128)')).toBe(true);
  });

  it('should validate rgba format', () => {
    expect(isRgbColor('rgba(255, 0, 0, 0.5)')).toBe(true);
    expect(isRgbColor('rgba(0, 0, 0, 1)')).toBe(true);
  });

  it('should reject invalid rgb colors', () => {
    expect(isRgbColor('rgb(256, 0, 0)')).toBe(false); // Value too high
    expect(isRgbColor('rgb(-1, 0, 0)')).toBe(false); // Negative value
    expect(isRgbColor('rgb(255, 0)')).toBe(false); // Missing value
    expect(isRgbColor('')).toBe(false);
  });
});

describe('isHslColor', () => {
  it('should validate hsl format', () => {
    expect(isHslColor('hsl(0, 100%, 50%)')).toBe(true);
    expect(isHslColor('hsl(120, 50%, 50%)')).toBe(true);
  });

  it('should validate hsla format', () => {
    expect(isHslColor('hsla(0, 100%, 50%, 0.5)')).toBe(true);
    expect(isHslColor('hsla(0, 100%, 50%, 1)')).toBe(true);
  });

  it('should reject invalid hsl colors', () => {
    expect(isHslColor('hsl(361, 100%, 50%)')).toBe(false); // Hue too high
    expect(isHslColor('hsl(0, 101%, 50%)')).toBe(false); // Saturation too high
    expect(isHslColor('')).toBe(false);
  });
});

describe('isCreditCard', () => {
  it('should validate Visa', () => {
    expect(isCreditCard('4111111111111111')).toBe(true);
    expect(isCreditCard('4012888888881881')).toBe(true);
  });

  it('should validate Mastercard', () => {
    expect(isCreditCard('5555555555554444')).toBe(true);
    expect(isCreditCard('5105105105105100')).toBe(true);
  });

  it('should validate Amex', () => {
    expect(isCreditCard('378282246310005')).toBe(true);
    expect(isCreditCard('371449635398431')).toBe(true);
  });

  it('should reject invalid cards', () => {
    expect(isCreditCard('1234567890123456')).toBe(false);
    expect(isCreditCard('4111')).toBe(false); // Too short
    expect(isCreditCard('')).toBe(false);
  });
});

describe('isPostalCode', () => {
  it('should validate US ZIP codes', () => {
    expect(isPostalCode('12345', 'US')).toBe(true);
    expect(isPostalCode('12345-6789', 'US')).toBe(true);
  });

  it('should validate UK postcodes', () => {
    expect(isPostalCode('SW1A 1AA', 'GB')).toBe(true);
    expect(isPostalCode('M1 1AA', 'GB')).toBe(true);
  });

  it('should validate Canadian postal codes', () => {
    expect(isPostalCode('K1A 0B1', 'CA')).toBe(true);
  });

  it('should reject invalid postal codes', () => {
    expect(isPostalCode('1234', 'US')).toBe(false); // Too short
    expect(isPostalCode('invalid', 'US')).toBe(false);
    expect(isPostalCode('')).toBe(false);
  });
});

describe('isPhoneNumber', () => {
  it('should validate US phone numbers', () => {
    expect(isPhoneNumber('(555) 123-4567', 'US')).toBe(true);
    expect(isPhoneNumber('555-123-4567', 'US')).toBe(true);
    expect(isPhoneNumber('5551234567', 'US')).toBe(true);
  });

  it('should validate UK phone numbers', () => {
    expect(isPhoneNumber('+44 20 7946 0958', 'GB')).toBe(true);
    expect(isPhoneNumber('020 7946 0958', 'GB')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isPhoneNumber('123', 'US')).toBe(false); // Too short
    expect(isPhoneNumber('invalid', 'US')).toBe(false);
    expect(isPhoneNumber('')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  it('should validate strong passwords', () => {
    expect(isStrongPassword('Password123!')).toBe(true);
    expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
  });

  it('should reject weak passwords', () => {
    expect(isStrongPassword('password')).toBe(false); // No uppercase, number, or special
    expect(isStrongPassword('PASSWORD')).toBe(false); // No lowercase, number, or special
    expect(isStrongPassword('12345678')).toBe(false); // No letters
    expect(isStrongPassword('short1!')).toBe(false); // Too short
    expect(isStrongPassword('')).toBe(false);
  });

  it('should respect custom options', () => {
    expect(isStrongPassword('pass', { minLength: 4, requireUppercase: false })).toBe(true);
    expect(isStrongPassword('password', { requireNumbers: false, requireSpecial: false })).toBe(true);
  });
});

describe('isJson', () => {
  it('should validate JSON strings', () => {
    expect(isJson('{}')).toBe(true);
    expect(isJson('[]')).toBe(true);
    expect(isJson('{"key": "value"}')).toBe(true);
    expect(isJson('[1, 2, 3]')).toBe(true);
    expect(isJson('"string"')).toBe(true);
    expect(isJson('123')).toBe(true);
    expect(isJson('true')).toBe(true);
    expect(isJson('null')).toBe(true);
  });

  it('should reject invalid JSON', () => {
    expect(isJson('{invalid}')).toBe(false);
    expect(isJson('undefined')).toBe(false);
    expect(isJson('')).toBe(false);
  });
});

describe('isBase64', () => {
  it('should validate base64 strings', () => {
    expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true);
    expect(isBase64('YWJj')).toBe(true); // 'abc'
    expect(isBase64('')).toBe(true); // Empty is valid base64
  });

  it('should reject invalid base64', () => {
    expect(isBase64('Hello World!')).toBe(false); // Invalid characters
    expect(isBase64('SGVsbG8gV29ybGQ')).toBe(false); // Missing padding
  });
});

describe('isEmpty', () => {
  it('should return true for empty values', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty({ key: 'value' })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('should return true for non-empty values', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty([1, 2, 3])).toBe(true);
    expect(isNotEmpty({ key: 'value' })).toBe(true);
  });

  it('should return false for empty values', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty([])).toBe(false);
    expect(isNotEmpty({})).toBe(false);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

describe('isEqual', () => {
  it('should compare primitives', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
  });

  it('should compare dates', () => {
    expect(isEqual(new Date('2024-01-15'), new Date('2024-01-15'))).toBe(true);
    expect(isEqual(new Date('2024-01-15'), new Date('2024-01-16'))).toBe(false);
  });

  it('should compare arrays shallowly', () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });
});

describe('isDeepEqual', () => {
  it('should deeply compare objects', () => {
    expect(isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
  });

  it('should deeply compare arrays', () => {
    expect(isDeepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(isDeepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
  });

  it('should handle nested structures', () => {
    const obj1 = { a: { b: { c: [1, 2, { d: 3 }] } } };
    const obj2 = { a: { b: { c: [1, 2, { d: 3 }] } } };
    expect(isDeepEqual(obj1, obj2)).toBe(true);
  });
});

describe('isInRange', () => {
  it('should check if value is in range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(0, 0, 10)).toBe(true);
    expect(isInRange(10, 0, 10)).toBe(true);
    expect(isInRange(-1, 0, 10)).toBe(false);
    expect(isInRange(11, 0, 10)).toBe(false);
  });

  it('should handle exclusive bounds', () => {
    expect(isInRange(5, 0, 10, false)).toBe(true);
    expect(isInRange(0, 0, 10, false)).toBe(false);
    expect(isInRange(10, 0, 10, false)).toBe(false);
  });
});

describe('isLength', () => {
  it('should check string length', () => {
    expect(isLength('hello', 5)).toBe(true);
    expect(isLength('hello', 3, 10)).toBe(true);
    expect(isLength('hi', 5)).toBe(false);
    expect(isLength('hello world', 3, 5)).toBe(false);
  });

  it('should check array length', () => {
    expect(isLength([1, 2, 3], 3)).toBe(true);
    expect(isLength([1, 2], 1, 5)).toBe(true);
  });
});

describe('matches', () => {
  it('should match regex pattern', () => {
    expect(matches('hello', /^hello$/)).toBe(true);
    expect(matches('hello123', /^hello/)).toBe(true);
    expect(matches('world', /^hello/)).toBe(false);
  });

  it('should work with string patterns', () => {
    expect(matches('hello', 'hello')).toBe(true);
    expect(matches('hello world', 'hello')).toBe(true);
  });
});

describe('contains', () => {
  it('should check if string contains substring', () => {
    expect(contains('hello world', 'world')).toBe(true);
    expect(contains('hello world', 'foo')).toBe(false);
  });

  it('should check if array contains value', () => {
    expect(contains([1, 2, 3], 2)).toBe(true);
    expect(contains([1, 2, 3], 4)).toBe(false);
  });
});

describe('startsWith', () => {
  it('should check if string starts with prefix', () => {
    expect(startsWith('hello world', 'hello')).toBe(true);
    expect(startsWith('hello world', 'world')).toBe(false);
  });

  it('should check if array starts with value', () => {
    expect(startsWith([1, 2, 3], 1)).toBe(true);
    expect(startsWith([1, 2, 3], 2)).toBe(false);
  });
});

describe('endsWith', () => {
  it('should check if string ends with suffix', () => {
    expect(endsWith('hello world', 'world')).toBe(true);
    expect(endsWith('hello world', 'hello')).toBe(false);
  });

  it('should check if array ends with value', () => {
    expect(endsWith([1, 2, 3], 3)).toBe(true);
    expect(endsWith([1, 2, 3], 2)).toBe(false);
  });
});

describe('oneOf', () => {
  it('should check if value is one of options', () => {
    expect(oneOf('a', ['a', 'b', 'c'])).toBe(true);
    expect(oneOf('d', ['a', 'b', 'c'])).toBe(false);
  });

  it('should work with numbers', () => {
    expect(oneOf(2, [1, 2, 3])).toBe(true);
    expect(oneOf(4, [1, 2, 3])).toBe(false);
  });
});

describe('allOf', () => {
  it('should check if all values pass predicate', () => {
    expect(allOf([2, 4, 6], (n) => n % 2 === 0)).toBe(true);
    expect(allOf([2, 3, 4], (n) => n % 2 === 0)).toBe(false);
  });

  it('should return true for empty array', () => {
    expect(allOf([], () => false)).toBe(true);
  });
});

describe('noneOf', () => {
  it('should check if no values pass predicate', () => {
    expect(noneOf([1, 3, 5], (n) => n % 2 === 0)).toBe(true);
    expect(noneOf([1, 2, 3], (n) => n % 2 === 0)).toBe(false);
  });

  it('should return true for empty array', () => {
    expect(noneOf([], () => true)).toBe(true);
  });
});

describe('Validator builders', () => {
  describe('required', () => {
    it('should validate required field', () => {
      expect(required()('value')).toEqual({ valid: true });
      expect(required()('')).toEqual({ valid: false, message: 'This field is required' });
      expect(required()(null)).toEqual({ valid: false, message: 'This field is required' });
    });

    it('should use custom message', () => {
      expect(required('Custom message')('')).toEqual({ valid: false, message: 'Custom message' });
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(minLength(5)('hello')).toEqual({ valid: true });
      expect(minLength(5)('hi')).toEqual({ valid: false, message: 'Must be at least 5 characters' });
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(maxLength(5)('hello')).toEqual({ valid: true });
      expect(maxLength(5)('hello world')).toEqual({ valid: false, message: 'Must be at most 5 characters' });
    });
  });

  describe('pattern', () => {
    it('should validate against pattern', () => {
      expect(pattern(/^\d+$/)('123')).toEqual({ valid: true });
      expect(pattern(/^\d+$/)('abc')).toEqual({ valid: false, message: 'Invalid format' });
    });
  });

  describe('email', () => {
    it('should validate email', () => {
      expect(email()('test@example.com')).toEqual({ valid: true });
      expect(email()('invalid')).toEqual({ valid: false, message: 'Invalid email address' });
    });
  });

  describe('url', () => {
    it('should validate URL', () => {
      expect(url()('https://example.com')).toEqual({ valid: true });
      expect(url()('invalid')).toEqual({ valid: false, message: 'Invalid URL' });
    });
  });

  describe('number', () => {
    it('should validate number', () => {
      expect(number()('123')).toEqual({ valid: true });
      expect(number()('abc')).toEqual({ valid: false, message: 'Must be a number' });
    });
  });

  describe('integer', () => {
    it('should validate integer', () => {
      expect(integer()('123')).toEqual({ valid: true });
      expect(integer()('123.45')).toEqual({ valid: false, message: 'Must be an integer' });
    });
  });

  describe('positive', () => {
    it('should validate positive number', () => {
      expect(positive()(5)).toEqual({ valid: true });
      expect(positive()(-5)).toEqual({ valid: false, message: 'Must be positive' });
      expect(positive()(0)).toEqual({ valid: false, message: 'Must be positive' });
    });
  });

  describe('negative', () => {
    it('should validate negative number', () => {
      expect(negative()(-5)).toEqual({ valid: true });
      expect(negative()(5)).toEqual({ valid: false, message: 'Must be negative' });
      expect(negative()(0)).toEqual({ valid: false, message: 'Must be negative' });
    });
  });

  describe('min', () => {
    it('should validate minimum value', () => {
      expect(min(5)(10)).toEqual({ valid: true });
      expect(min(5)(3)).toEqual({ valid: false, message: 'Must be at least 5' });
    });
  });

  describe('max', () => {
    it('should validate maximum value', () => {
      expect(max(10)(5)).toEqual({ valid: true });
      expect(max(10)(15)).toEqual({ valid: false, message: 'Must be at most 10' });
    });
  });

  describe('range', () => {
    it('should validate range', () => {
      expect(range(0, 100)(50)).toEqual({ valid: true });
      expect(range(0, 100)(150)).toEqual({ valid: false, message: 'Must be between 0 and 100' });
    });
  });

  describe('date', () => {
    it('should validate date', () => {
      expect(date()('2024-01-15')).toEqual({ valid: true });
      expect(date()('invalid')).toEqual({ valid: false, message: 'Invalid date' });
    });
  });

  describe('before', () => {
    it('should validate date is before', () => {
      expect(before('2024-12-31')('2024-01-15')).toEqual({ valid: true });
      expect(before('2024-01-01')('2024-06-01')).toEqual({ valid: false, message: 'Must be before 2024-01-01' });
    });
  });

  describe('after', () => {
    it('should validate date is after', () => {
      expect(after('2024-01-01')('2024-06-01')).toEqual({ valid: true });
      expect(after('2024-12-31')('2024-01-15')).toEqual({ valid: false, message: 'Must be after 2024-12-31' });
    });
  });
});

describe('createValidator', () => {
  it('should create custom validator', () => {
    const isEven = createValidator(
      (n: number) => n % 2 === 0,
      'Must be even'
    );

    expect(isEven(4)).toEqual({ valid: true });
    expect(isEven(3)).toEqual({ valid: false, message: 'Must be even' });
  });
});

describe('combineValidators', () => {
  it('should combine multiple validators', () => {
    const validator = combineValidators(
      required(),
      minLength(5),
      maxLength(10)
    );

    expect(validator('hello')).toEqual({ valid: true });
    expect(validator('')).toEqual({ valid: false, message: 'This field is required' });
    expect(validator('hi')).toEqual({ valid: false, message: 'Must be at least 5 characters' });
    expect(validator('hello world!')).toEqual({ valid: false, message: 'Must be at most 10 characters' });
  });

  it('should stop at first failure', () => {
    const validator = combineValidators(
      required(),
      minLength(5)
    );

    // Empty string fails required, not minLength
    expect(validator('')).toEqual({ valid: false, message: 'This field is required' });
  });
});
