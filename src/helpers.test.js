import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import {
  nrmlStr,
  sameLowC,
  cleanTri,
  deduplicate,
  findDuplicates,
  snap,
  displayCard,
  getTimespan,
  isCumulativeSpot,
  createSpot,
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

describe('getTimespan', () => {
  it('should return 7 for pref 1', () => {
    expect(getTimespan(1)).toBe(7);
    expect(getTimespan('1')).toBe(7);
  });
  it('should return 14 for pref 2', () => {
    expect(getTimespan(2)).toBe(14);
    expect(getTimespan('2')).toBe(14);
  });
  it('should return 21 for pref 3', () => {
    expect(getTimespan(3)).toBe(21);
    expect(getTimespan('3')).toBe(21);
  });
  it('should return 14 for any other value', () => {
    expect(getTimespan('foo')).toBe(14);
    expect(getTimespan(undefined)).toBe(14);
    expect(getTimespan(null)).toBe(14);
    expect(getTimespan(0)).toBe(14);
    expect(getTimespan(4)).toBe(14);
  });
});

describe('isCumulativeSpot', () => {
  // Test: should return true if spot is cumulative
  it('should return true if spot is cumulative', () => {
    const spots = [
      { Identifiant: 'A1', Cumul: true },
      { Identifiant: 'B2', Cumul: false },
    ];
    expect(isCumulativeSpot('A1', spots)).toBe(true);
  });

  // Test: should return false if spot is not cumulative
  it('should return false if spot is not cumulative', () => {
    const spots = [
      { Identifiant: 'A1', Cumul: true },
      { Identifiant: 'B2', Cumul: false },
    ];
    expect(isCumulativeSpot('B2', spots)).toBe(false);
  });

  // Test: should return false if spot is not found
  it('should return false if spot is not found', () => {
    const spots = [
      { Identifiant: 'A1', Cumul: true },
      { Identifiant: 'B2', Cumul: false },
    ];
    expect(isCumulativeSpot('C3', spots)).toBe(false);
  });

  // Test: should return false for empty spots array
  it('should return false for empty spots array', () => {
    expect(isCumulativeSpot('A1', [])).toBe(false);
  });
});

describe('createSpot', () => {
  // Mock fetch and MouseEvent for API call
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test: should call fetch with correct parameters and resolve
  it('should call fetch and resolve when API returns ok', async () => {
    // Mock event and bounding rect
    const mockRect = { left: 10, top: 20 };
    const mockEvent = {
      clientX: 35,
      clientY: 45,
      target: {
        getBoundingClientRect: () => mockRect,
      },
    };
    const options = { spotsTableId: '123', token: 'abc' };
    await expect(createSpot(mockEvent, options)).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Check that fetch is called with correct URL and body
    const fetchCall = global.fetch.mock.calls[0];
    expect(fetchCall[0]).toContain('/table/123/');
    const body = JSON.parse(fetchCall[1].body);
    expect(body.x).toBe(25); // (35-10)/5*5 = 25
    expect(body.y).toBe(25); // (45-20)/5*5 = 25
    expect(body.Identifiant).toBe('PX');
  });

  // Test: should throw error if response is not ok
  it('should throw error if response is not ok', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }));
    const mockRect = { left: 0, top: 0 };
    const mockEvent = {
      clientX: 10,
      clientY: 10,
      target: {
        getBoundingClientRect: () => mockRect,
      },
    };
    const options = { spotsTableId: '123', token: 'abc' };
    await expect(createSpot(mockEvent, options)).rejects.toThrow('Failed to create spot: 500');
  });

  // Test: should throw and log error if fetch throws
  it('should throw and log error if fetch throws', async () => {
    const error = new Error('Network error');
    global.fetch = vi.fn(() => Promise.reject(error));
    const mockRect = { left: 0, top: 0 };
    const mockEvent = {
      clientX: 10,
      clientY: 10,
      target: {
        getBoundingClientRect: () => mockRect,
      },
    };
    const options = { spotsTableId: '123', token: 'abc' };
    // Mock console.error to suppress output in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(createSpot(mockEvent, options)).rejects.toThrow('Network error');
    expect(consoleSpy).toHaveBeenCalledWith('createSpot error:', error);
    consoleSpy.mockRestore();
  });
});
