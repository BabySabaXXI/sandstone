/**
 * Tests for Number Utilities
 */

import {
  formatNumber,
  formatCurrency,
  formatPercent,
  clamp,
  round,
  roundUp,
  roundDown,
  isBetween,
  isPositive,
  isNegative,
  isInteger,
  isFloat,
  isEven,
  isOdd,
  isDivisibleBy,
  gcd,
  lcm,
  sum,
  average,
  median,
  mode,
  min,
  max,
  range,
  toOrdinal,
  toRoman,
  fromRoman,
  formatBytes,
  formatCompactNumber,
  parseNumber,
  randomInt,
  randomFloat,
  randomChoice,
  shuffle,
  sample,
} from '../../../../lib/utils/number';

describe('formatNumber', () => {
  it('should format number with default options', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should format with custom decimals', () => {
    expect(formatNumber(1234.567, { decimals: 2 })).toBe('1,234.57');
  });

  it('should format with prefix', () => {
    expect(formatNumber(100, { prefix: '$' })).toBe('$100');
  });

  it('should format with suffix', () => {
    expect(formatNumber(100, { suffix: '%' })).toBe('100%');
  });

  it('should format with thousands separator', () => {
    expect(formatNumber(1000000, { thousandsSeparator: ' ' })).toBe('1 000 000');
  });

  it('should format with decimal separator', () => {
    expect(formatNumber(1234.56, { decimalSeparator: ',' })).toBe('1,234,56');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });
});

describe('formatCurrency', () => {
  it('should format USD currency', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should format EUR currency', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should format GBP currency', () => {
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
  });

  it('should format with custom locale', () => {
    expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toMatch(/1\.234,56/);
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-1234.56, 'USD')).toBe('-$1,234.56');
  });
});

describe('formatPercent', () => {
  it('should format percentage', () => {
    expect(formatPercent(0.1234)).toBe('12.34%');
  });

  it('should format with custom decimals', () => {
    expect(formatPercent(0.1234, { decimals: 1 })).toBe('12.3%');
  });

  it('should multiply by 100 by default', () => {
    expect(formatPercent(0.5)).toBe('50%');
  });

  it('should handle already-multiplied values', () => {
    expect(formatPercent(50, { multiplyBy100: false })).toBe('50%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('should handle values greater than 1', () => {
    expect(formatPercent(1.5)).toBe('150%');
  });
});

describe('clamp', () => {
  it('should return value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle equal min and max', () => {
    expect(clamp(5, 10, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-15, -10, -5)).toBe(-10);
  });
});

describe('round', () => {
  it('should round to integer by default', () => {
    expect(round(3.7)).toBe(4);
    expect(round(3.2)).toBe(3);
  });

  it('should round to specified decimals', () => {
    expect(round(3.14159, 2)).toBe(3.14);
    expect(round(3.14159, 3)).toBe(3.142);
  });

  it('should handle negative numbers', () => {
    expect(round(-3.7)).toBe(-4);
  });

  it('should handle zero', () => {
    expect(round(0)).toBe(0);
  });
});

describe('roundUp', () => {
  it('should round up to integer', () => {
    expect(roundUp(3.1)).toBe(4);
    expect(roundUp(3.9)).toBe(4);
  });

  it('should round up to specified decimals', () => {
    expect(roundUp(3.141, 2)).toBe(3.15);
  });

  it('should handle exact values', () => {
    expect(roundUp(3)).toBe(3);
  });
});

describe('roundDown', () => {
  it('should round down to integer', () => {
    expect(roundDown(3.9)).toBe(3);
    expect(roundDown(3.1)).toBe(3);
  });

  it('should round down to specified decimals', () => {
    expect(roundDown(3.149, 2)).toBe(3.14);
  });

  it('should handle exact values', () => {
    expect(roundDown(3)).toBe(3);
  });
});

describe('isBetween', () => {
  it('should return true for value in range', () => {
    expect(isBetween(5, 0, 10)).toBe(true);
  });

  it('should return false for value below range', () => {
    expect(isBetween(-5, 0, 10)).toBe(false);
  });

  it('should return false for value above range', () => {
    expect(isBetween(15, 0, 10)).toBe(false);
  });

  it('should include boundaries by default', () => {
    expect(isBetween(0, 0, 10)).toBe(true);
    expect(isBetween(10, 0, 10)).toBe(true);
  });

  it('should exclude boundaries when specified', () => {
    expect(isBetween(0, 0, 10, false)).toBe(false);
    expect(isBetween(10, 0, 10, false)).toBe(false);
  });
});

describe('isPositive', () => {
  it('should return true for positive numbers', () => {
    expect(isPositive(5)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isPositive(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isPositive(-5)).toBe(false);
  });
});

describe('isNegative', () => {
  it('should return true for negative numbers', () => {
    expect(isNegative(-5)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isNegative(0)).toBe(false);
  });

  it('should return false for positive numbers', () => {
    expect(isNegative(5)).toBe(false);
  });
});

describe('isInteger', () => {
  it('should return true for integers', () => {
    expect(isInteger(5)).toBe(true);
    expect(isInteger(-5)).toBe(true);
  });

  it('should return false for floats', () => {
    expect(isInteger(5.5)).toBe(false);
  });

  it('should return true for integer floats', () => {
    expect(isInteger(5.0)).toBe(true);
  });
});

describe('isFloat', () => {
  it('should return true for floats', () => {
    expect(isFloat(5.5)).toBe(true);
  });

  it('should return false for integers', () => {
    expect(isFloat(5)).toBe(false);
  });

  it('should return false for integer floats', () => {
    expect(isFloat(5.0)).toBe(false);
  });
});

describe('isEven', () => {
  it('should return true for even numbers', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(0)).toBe(true);
    expect(isEven(-4)).toBe(true);
  });

  it('should return false for odd numbers', () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(3)).toBe(false);
    expect(isEven(-5)).toBe(false);
  });
});

describe('isOdd', () => {
  it('should return true for odd numbers', () => {
    expect(isOdd(1)).toBe(true);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(-5)).toBe(true);
  });

  it('should return false for even numbers', () => {
    expect(isOdd(2)).toBe(false);
    expect(isOdd(0)).toBe(false);
    expect(isOdd(-4)).toBe(false);
  });
});

describe('isDivisibleBy', () => {
  it('should return true for divisible numbers', () => {
    expect(isDivisibleBy(10, 2)).toBe(true);
    expect(isDivisibleBy(15, 3)).toBe(true);
  });

  it('should return false for non-divisible numbers', () => {
    expect(isDivisibleBy(10, 3)).toBe(false);
  });

  it('should handle negative numbers', () => {
    expect(isDivisibleBy(-10, 2)).toBe(true);
  });
});

describe('gcd', () => {
  it('should calculate GCD of two numbers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(54, 24)).toBe(6);
  });

  it('should handle equal numbers', () => {
    expect(gcd(5, 5)).toBe(5);
  });

  it('should handle zero', () => {
    expect(gcd(5, 0)).toBe(5);
    expect(gcd(0, 5)).toBe(5);
  });
});

describe('lcm', () => {
  it('should calculate LCM of two numbers', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(21, 6)).toBe(42);
  });

  it('should handle equal numbers', () => {
    expect(lcm(5, 5)).toBe(5);
  });
});

describe('sum', () => {
  it('should sum array of numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
  });

  it('should handle empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('should handle single element', () => {
    expect(sum([5])).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(sum([1, -2, 3, -4])).toBe(-2);
  });
});

describe('average', () => {
  it('should calculate average of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it('should handle empty array', () => {
    expect(average([])).toBe(0);
  });

  it('should handle single element', () => {
    expect(average([5])).toBe(5);
  });
});

describe('median', () => {
  it('should calculate median of odd-length array', () => {
    expect(median([1, 3, 5])).toBe(3);
  });

  it('should calculate median of even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('should handle empty array', () => {
    expect(median([])).toBe(0);
  });

  it('should handle single element', () => {
    expect(median([5])).toBe(5);
  });
});

describe('mode', () => {
  it('should find mode of array', () => {
    expect(mode([1, 2, 2, 3, 3, 3])).toBe(3);
  });

  it('should return first mode for multiple modes', () => {
    expect(mode([1, 1, 2, 2])).toBe(1);
  });

  it('should handle empty array', () => {
    expect(mode([])).toBeUndefined();
  });
});

describe('min', () => {
  it('should find minimum value', () => {
    expect(min([3, 1, 4, 1, 5])).toBe(1);
  });

  it('should handle empty array', () => {
    expect(min([])).toBeUndefined();
  });

  it('should handle negative numbers', () => {
    expect(min([-5, -2, -10])).toBe(-10);
  });
});

describe('max', () => {
  it('should find maximum value', () => {
    expect(max([3, 1, 4, 1, 5])).toBe(5);
  });

  it('should handle empty array', () => {
    expect(max([])).toBeUndefined();
  });

  it('should handle negative numbers', () => {
    expect(max([-5, -2, -10])).toBe(-2);
  });
});

describe('range', () => {
  it('should calculate range', () => {
    expect(range([3, 1, 4, 1, 5])).toBe(4);
  });

  it('should handle empty array', () => {
    expect(range([])).toBe(0);
  });

  it('should handle single element', () => {
    expect(range([5])).toBe(0);
  });
});

describe('toOrdinal', () => {
  it('should format 1st', () => {
    expect(toOrdinal(1)).toBe('1st');
  });

  it('should format 2nd', () => {
    expect(toOrdinal(2)).toBe('2nd');
  });

  it('should format 3rd', () => {
    expect(toOrdinal(3)).toBe('3rd');
  });

  it('should format 4th', () => {
    expect(toOrdinal(4)).toBe('4th');
  });

  it('should handle 11th, 12th, 13th', () => {
    expect(toOrdinal(11)).toBe('11th');
    expect(toOrdinal(12)).toBe('12th');
    expect(toOrdinal(13)).toBe('13th');
  });

  it('should handle 21st, 22nd, 23rd', () => {
    expect(toOrdinal(21)).toBe('21st');
    expect(toOrdinal(22)).toBe('22nd');
    expect(toOrdinal(23)).toBe('23rd');
  });
});

describe('toRoman', () => {
  it('should convert to Roman numerals', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(5)).toBe('V');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(10)).toBe('X');
    expect(toRoman(49)).toBe('XLIX');
    expect(toRoman(50)).toBe('L');
    expect(toRoman(100)).toBe('C');
    expect(toRoman(500)).toBe('D');
    expect(toRoman(1000)).toBe('M');
    expect(toRoman(1994)).toBe('MCMXCIV');
  });

  it('should handle zero', () => {
    expect(toRoman(0)).toBe('');
  });
});

describe('fromRoman', () => {
  it('should convert from Roman numerals', () => {
    expect(fromRoman('I')).toBe(1);
    expect(fromRoman('IV')).toBe(4);
    expect(fromRoman('V')).toBe(5);
    expect(fromRoman('IX')).toBe(9);
    expect(fromRoman('X')).toBe(10);
    expect(fromRoman('XLIX')).toBe(49);
    expect(fromRoman('L')).toBe(50);
    expect(fromRoman('C')).toBe(100);
    expect(fromRoman('D')).toBe(500);
    expect(fromRoman('M')).toBe(1000);
    expect(fromRoman('MCMXCIV')).toBe(1994);
  });

  it('should handle lowercase', () => {
    expect(fromRoman('xiv')).toBe(14);
  });

  it('should handle empty string', () => {
    expect(fromRoman('')).toBe(0);
  });
});

describe('formatBytes', () => {
  it('should format bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should format with custom decimals', () => {
    expect(formatBytes(1536, { decimals: 2 })).toBe('1.50 KB');
  });

  it('should handle large numbers', () => {
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
  });
});

describe('formatCompactNumber', () => {
  it('should format thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('should format millions', () => {
    expect(formatCompactNumber(1000000)).toBe('1M');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });

  it('should format billions', () => {
    expect(formatCompactNumber(1000000000)).toBe('1B');
  });

  it('should handle small numbers', () => {
    expect(formatCompactNumber(999)).toBe('999');
  });
});

describe('parseNumber', () => {
  it('should parse integer string', () => {
    expect(parseNumber('42')).toBe(42);
  });

  it('should parse float string', () => {
    expect(parseNumber('3.14')).toBe(3.14);
  });

  it('should parse with custom decimal separator', () => {
    expect(parseNumber('3,14', ',')).toBe(3.14);
  });

  it('should handle number input', () => {
    expect(parseNumber(42)).toBe(42);
  });

  it('should return NaN for invalid string', () => {
    expect(parseNumber('invalid')).toBeNaN();
  });
});

describe('randomInt', () => {
  it('should generate integer within range', () => {
    const result = randomInt(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('should generate same number when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('should generate different values on multiple calls', () => {
    const values = new Set();
    for (let i = 0; i < 100; i++) {
      values.add(randomInt(1, 100));
    }
    expect(values.size).toBeGreaterThan(1);
  });
});

describe('randomFloat', () => {
  it('should generate float within range', () => {
    const result = randomFloat(0, 1);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should generate different values on multiple calls', () => {
    const values = new Set();
    for (let i = 0; i < 100; i++) {
      values.add(randomFloat(0, 1));
    }
    expect(values.size).toBeGreaterThan(1);
  });
});

describe('randomChoice', () => {
  it('should return element from array', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = randomChoice(arr);
    expect(arr).toContain(result);
  });

  it('should return undefined for empty array', () => {
    expect(randomChoice([])).toBeUndefined();
  });

  it('should return single element', () => {
    expect(randomChoice([42])).toBe(42);
  });
});

describe('shuffle', () => {
  it('should shuffle array', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle([...arr]);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should not modify original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it('should handle empty array', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('sample', () => {
  it('should sample specified number of elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sample(arr, 3);
    expect(result).toHaveLength(3);
    result.forEach((item) => {
      expect(arr).toContain(item);
    });
  });

  it('should return all elements if sample size exceeds array length', () => {
    const arr = [1, 2, 3];
    const result = sample(arr, 5);
    expect(result).toHaveLength(3);
  });

  it('should handle empty array', () => {
    expect(sample([], 3)).toEqual([]);
  });

  it('should handle sample size of 0', () => {
    expect(sample([1, 2, 3], 0)).toEqual([]);
  });
});
