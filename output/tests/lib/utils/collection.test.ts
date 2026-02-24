/**
 * Tests for Collection Utilities
 */

import {
  chunk,
  compact,
  flatten,
  flattenDeep,
  groupBy,
  keyBy,
  orderBy,
  partition,
  shuffle,
  sortBy,
  unique,
  uniqueBy,
  zip,
  unzip,
  difference,
  intersection,
  union,
  take,
  drop,
  first,
  last,
  sample,
  sampleSize,
  move,
  insert,
  remove,
  update,
  findIndex,
  findLastIndex,
} from '../../../../lib/utils/collection';

describe('chunk', () => {
  it('should split array into chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle empty array', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it('should handle chunk size larger than array', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('should handle exact division', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });
});

describe('compact', () => {
  it('should remove falsy values', () => {
    expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(compact([])).toEqual([]);
  });

  it('should handle all truthy values', () => {
    expect(compact([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle all falsy values', () => {
    expect(compact([0, false, '', null, undefined, NaN])).toEqual([]);
  });
});

describe('flatten', () => {
  it('should flatten one level', () => {
    expect(flatten([1, [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not flatten deeply nested arrays', () => {
    expect(flatten([1, [2, [3]]])).toEqual([1, 2, [3]]);
  });

  it('should handle empty array', () => {
    expect(flatten([])).toEqual([]);
  });
});

describe('flattenDeep', () => {
  it('should flatten deeply nested arrays', () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it('should handle already flat array', () => {
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(flattenDeep([])).toEqual([]);
  });
});

describe('groupBy', () => {
  it('should group by key', () => {
    const items = [
      { category: 'A', value: 1 },
      { category: 'B', value: 2 },
      { category: 'A', value: 3 },
    ];
    const result = groupBy(items, 'category');
    expect(result).toEqual({
      A: [
        { category: 'A', value: 1 },
        { category: 'A', value: 3 },
      ],
      B: [{ category: 'B', value: 2 }],
    });
  });

  it('should group by function', () => {
    const items = [1, 2, 3, 4, 5];
    const result = groupBy(items, (n) => (n % 2 === 0 ? 'even' : 'odd'));
    expect(result).toEqual({
      odd: [1, 3, 5],
      even: [2, 4],
    });
  });

  it('should handle empty array', () => {
    expect(groupBy([], 'key')).toEqual({});
  });
});

describe('keyBy', () => {
  it('should create object keyed by property', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ];
    const result = keyBy(items, 'id');
    expect(result).toEqual({
      a: { id: 'a', value: 1 },
      b: { id: 'b', value: 2 },
    });
  });

  it('should use last value for duplicate keys', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'a', value: 2 },
    ];
    const result = keyBy(items, 'id');
    expect(result).toEqual({
      a: { id: 'a', value: 2 },
    });
  });

  it('should handle empty array', () => {
    expect(keyBy([], 'id')).toEqual({});
  });
});

describe('orderBy', () => {
  it('should sort by single key ascending', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    expect(orderBy(items, 'value', 'asc')).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('should sort by single key descending', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    expect(orderBy(items, 'value', 'desc')).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
  });

  it('should sort by multiple keys', () => {
    const items = [
      { a: 1, b: 2 },
      { a: 2, b: 1 },
      { a: 1, b: 1 },
    ];
    expect(orderBy(items, ['a', 'b'], ['asc', 'asc'])).toEqual([
      { a: 1, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 1 },
    ]);
  });

  it('should handle empty array', () => {
    expect(orderBy([], 'value', 'asc')).toEqual([]);
  });
});

describe('partition', () => {
  it('should partition by predicate', () => {
    const items = [1, 2, 3, 4, 5];
    const [evens, odds] = partition(items, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it('should handle all matching', () => {
    const items = [2, 4, 6];
    const [evens, odds] = partition(items, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([]);
  });

  it('should handle none matching', () => {
    const items = [1, 3, 5];
    const [evens, odds] = partition(items, (n) => n % 2 === 0);
    expect(evens).toEqual([]);
    expect(odds).toEqual([1, 3, 5]);
  });
});

describe('unique', () => {
  it('should remove duplicates', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(unique([])).toEqual([]);
  });

  it('should handle no duplicates', () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should handle strings', () => {
    expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

describe('uniqueBy', () => {
  it('should remove duplicates by key', () => {
    const items = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 1, name: 'C' },
    ];
    expect(uniqueBy(items, 'id')).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]);
  });

  it('should handle empty array', () => {
    expect(uniqueBy([], 'id')).toEqual([]);
  });

  it('should use function for uniqueness', () => {
    const items = [1.1, 1.2, 2.1, 2.2];
    expect(uniqueBy(items, (n) => Math.floor(n))).toEqual([1.1, 2.1]);
  });
});

describe('zip', () => {
  it('should zip arrays together', () => {
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  it('should use shortest array length', () => {
    expect(zip([1, 2], ['a', 'b', 'c'])).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });

  it('should handle empty arrays', () => {
    expect(zip([], [])).toEqual([]);
  });
});

describe('unzip', () => {
  it('should unzip arrays', () => {
    expect(
      unzip([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    ).toEqual([[1, 2, 3], ['a', 'b', 'c']]);
  });

  it('should handle empty array', () => {
    expect(unzip([])).toEqual([]);
  });
});

describe('difference', () => {
  it('should return items in first array not in second', () => {
    expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
  });

  it('should handle no differences', () => {
    expect(difference([1, 2], [1, 2, 3])).toEqual([]);
  });

  it('should handle empty arrays', () => {
    expect(difference([], [1, 2])).toEqual([]);
    expect(difference([1, 2], [])).toEqual([1, 2]);
  });
});

describe('intersection', () => {
  it('should return common items', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  it('should handle no intersection', () => {
    expect(intersection([1, 2], [3, 4])).toEqual([]);
  });

  it('should handle empty arrays', () => {
    expect(intersection([], [1, 2])).toEqual([]);
  });
});

describe('union', () => {
  it('should return unique items from both arrays', () => {
    expect(union([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('should handle empty arrays', () => {
    expect(union([], [1, 2])).toEqual([1, 2]);
    expect(union([1, 2], [])).toEqual([1, 2]);
  });
});

describe('take', () => {
  it('should take n items from start', () => {
    expect(take([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
  });

  it('should handle n greater than length', () => {
    expect(take([1, 2], 5)).toEqual([1, 2]);
  });

  it('should handle n of 0', () => {
    expect(take([1, 2, 3], 0)).toEqual([]);
  });

  it('should handle empty array', () => {
    expect(take([], 3)).toEqual([]);
  });
});

describe('drop', () => {
  it('should drop n items from start', () => {
    expect(drop([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5]);
  });

  it('should handle n greater than length', () => {
    expect(drop([1, 2], 5)).toEqual([]);
  });

  it('should handle n of 0', () => {
    expect(drop([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });

  it('should handle empty array', () => {
    expect(drop([], 3)).toEqual([]);
  });
});

describe('first', () => {
  it('should return first item', () => {
    expect(first([1, 2, 3])).toBe(1);
  });

  it('should return undefined for empty array', () => {
    expect(first([])).toBeUndefined();
  });
});

describe('last', () => {
  it('should return last item', () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it('should return undefined for empty array', () => {
    expect(last([])).toBeUndefined();
  });
});

describe('sample', () => {
  it('should return random item', () => {
    const arr = [1, 2, 3];
    const result = sample(arr);
    expect(arr).toContain(result);
  });

  it('should return undefined for empty array', () => {
    expect(sample([])).toBeUndefined();
  });
});

describe('sampleSize', () => {
  it('should return n random items', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sampleSize(arr, 3);
    expect(result).toHaveLength(3);
    result.forEach((item) => {
      expect(arr).toContain(item);
    });
  });

  it('should handle n greater than length', () => {
    const arr = [1, 2, 3];
    expect(sampleSize(arr, 5)).toHaveLength(3);
  });

  it('should handle empty array', () => {
    expect(sampleSize([], 3)).toEqual([]);
  });
});

describe('move', () => {
  it('should move item to new index', () => {
    expect(move([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });

  it('should handle move to same index', () => {
    expect(move([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
  });

  it('should handle move to end', () => {
    expect(move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
  });
});

describe('insert', () => {
  it('should insert item at index', () => {
    expect(insert([1, 2, 3], 1, 'a')).toEqual([1, 'a', 2, 3]);
  });

  it('should insert at beginning', () => {
    expect(insert([1, 2, 3], 0, 'a')).toEqual(['a', 1, 2, 3]);
  });

  it('should insert at end', () => {
    expect(insert([1, 2, 3], 3, 'a')).toEqual([1, 2, 3, 'a']);
  });
});

describe('remove', () => {
  it('should remove item at index', () => {
    expect(remove([1, 2, 3], 1)).toEqual([1, 3]);
  });

  it('should remove first item', () => {
    expect(remove([1, 2, 3], 0)).toEqual([2, 3]);
  });

  it('should remove last item', () => {
    expect(remove([1, 2, 3], 2)).toEqual([1, 2]);
  });
});

describe('update', () => {
  it('should update item at index', () => {
    expect(update([1, 2, 3], 1, 'a')).toEqual([1, 'a', 3]);
  });

  it('should update first item', () => {
    expect(update([1, 2, 3], 0, 'a')).toEqual(['a', 2, 3]);
  });

  it('should update last item', () => {
    expect(update([1, 2, 3], 2, 'a')).toEqual([1, 2, 'a']);
  });
});

describe('findIndex', () => {
  it('should find index by predicate', () => {
    expect(findIndex([1, 2, 3], (n) => n === 2)).toBe(1);
  });

  it('should return -1 when not found', () => {
    expect(findIndex([1, 2, 3], (n) => n === 5)).toBe(-1);
  });

  it('should handle empty array', () => {
    expect(findIndex([], () => true)).toBe(-1);
  });
});

describe('findLastIndex', () => {
  it('should find last index by predicate', () => {
    expect(findLastIndex([1, 2, 3, 2], (n) => n === 2)).toBe(3);
  });

  it('should return -1 when not found', () => {
    expect(findLastIndex([1, 2, 3], (n) => n === 5)).toBe(-1);
  });

  it('should handle empty array', () => {
    expect(findLastIndex([], () => true)).toBe(-1);
  });
});
