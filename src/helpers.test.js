import { describe, it, expect } from 'vitest';
import {
  nrmlStr,
  sameLowC,
  cleanTri,
  deduplicate,
  findDuplicates,
  snap,
  displayCard,
} from './helpers';

describe('nrmlStr', () => {
  it('should lowercase and trim the string', () => {
    expect(nrmlStr('  Hello World  ')).toBe('hello world');
  });
  it('should handle empty string', () => {
    expect(nrmlStr('')).toBe('');
  });
  it('should handle undefined', () => {
    expect(nrmlStr()).toBe('');
  });
});

describe('sameLowC', () => {
  it('should return true for equal strings (case-insensitive, trimmed)', () => {
    expect(sameLowC('Test', ' test ')).toBe(true);
  });
  it('should return false for different strings', () => {
    expect(sameLowC('foo', 'bar')).toBe(false);
  });
  it('should handle empty strings', () => {
    expect(sameLowC('', '')).toBe(true);
  });
});

describe('cleanTri', () => {
  it('should normalize if trimmed length <= 3', () => {
    expect(cleanTri('  AbC ')).toBe('abc');
    expect(cleanTri('  X  ')).toBe('x');
  });
  it('should trim only if trimmed length > 3', () => {
    expect(cleanTri('  AbCdEf ')).toBe('AbCdEf');
    expect(cleanTri('   test   ')).toBe('test');
  });
  it('should handle empty string', () => {
    expect(cleanTri('')).toBe('');
  });
});

describe('deduplicate', () => {
  it('should remove duplicates based on key', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'a' },
    ];
    const result = deduplicate(arr, 'id');
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ]);
  });
  it('should use custom sort function if provided', () => {
    const arr = [
      { id: 2, name: 'b' },
      { id: 1, name: 'a' },
    ];
    const result = deduplicate(arr, 'id', (a, b) => a.id - b.id);
    expect(result[0].id).toBe(1);
  });
  it('should return empty array for empty input', () => {
    expect(deduplicate([], 'id')).toEqual([]);
  });
  it('should handle array with one element', () => {
    expect(deduplicate([{ id: 1 }], 'id')).toEqual([{ id: 1 }]);
  });
});

describe('findDuplicates', () => {
  it('should find duplicate values', () => {
    expect(findDuplicates([1, 2, 2, 3, 3, 3, 4])).toEqual([2, 3, 3]);
  });
  it('should return empty array if no duplicates', () => {
    expect(findDuplicates([1, 2, 3])).toEqual([]);
  });
  it('should handle empty array', () => {
    expect(findDuplicates([])).toEqual([]);
  });
  it('should handle array with one element', () => {
    expect(findDuplicates([1])).toEqual([]);
  });
  it('should handle array with all duplicates', () => {
    expect(findDuplicates([1, 1, 1, 1])).toEqual([1, 1, 1]);
  });
});

describe('snap', () => {
  it('should snap value to nearest multiple (default 5)', () => {
    expect(snap(12)).toBe(10);
    expect(snap(13)).toBe(15);
  });
  it('should snap value to custom multiple', () => {
    expect(snap(22, 10)).toBe(20);
    expect(snap(27, 10)).toBe(30);
  });
  it('should handle zero', () => {
    expect(snap(0)).toBe(0);
  });
  it('should handle negative values', () => {
    expect(snap(-12)).toBe(-10);
    expect(snap(-13)).toBe(-15);
  });
});

describe('displayCard', () => {
  it('should return true if isoDate equals selectedDay', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-01',
      showPastDays: false,
    })).toBe(true);
  });
  it('should return true if isHoliday', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: true,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: false,
    })).toBe(true);
  });
  it('should return true if dayIsFavorite and not isPast', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: true,
      selectedDay: '2024-06-02',
      showPastDays: false,
    })).toBe(true);
  });
  it('should return true if dayIsFavorite and showPastDays', () => {
    expect(displayCard({
      isPast: true,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: true,
      selectedDay: '2024-06-02',
      showPastDays: true,
    })).toBe(true);
  });
  it('should return true if not dayIsFavorite, showPastDays, and isPast', () => {
    expect(displayCard({
      isPast: true,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: true,
    })).toBe(true);
  });
  it('should return false otherwise', () => {
    expect(displayCard({
      isPast: true,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: false,
    })).toBe(false);
  });
  it('should return false when isPast is false, isHoliday is false, dayIsFavorite is false, showPastDays is false, isoDate !== selectedDay', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: false,
    })).toBe(false);
  });
  it('should return true when not dayIsFavorite, showPastDays is undefined, isPast is true', () => {
    expect(displayCard({
      isPast: true,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: undefined,
    })).toBe(true);
  });
  it('should return false when not dayIsFavorite, showPastDays is undefined, isPast is false', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: undefined,
    })).toBe(false);
  });
  it('should return false when not dayIsFavorite, showPastDays is false, isPast is false', () => {
    expect(displayCard({
      isPast: false,
      isHoliday: false,
      isoDate: '2024-06-01',
      dayIsFavorite: false,
      selectedDay: '2024-06-02',
      showPastDays: false,
    })).toBe(false);
  });
});
