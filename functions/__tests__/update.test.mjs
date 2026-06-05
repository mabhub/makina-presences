import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  getCurrentYearDateRange,
  getTTO,
  getTTR,
  handleUpdate,
  createFetchJson,
  toDateKey,
  expandTtoSeries,
} from '../update.mjs';

// Mock p-limit before importing
vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn) => fn()),
}));

describe(getCurrentYearDateRange, () => {
  it('should return date range for current year', () => {
    const result = getCurrentYearDateRange();
    const currentYear = new Date().getUTCFullYear();

    expect(result).toStrictEqual({
      dateMin: { precision: 'Date', iso8601: `${currentYear}-01-01` },
      dateMax: { precision: 'Date', iso8601: `${currentYear}-12-31` },
    });
  });

  it('should use UTC year to avoid timezone issues', () => {
    // Mock a date at the very end of the year in a timezone that might be different
    const mockDate = new Date('2025-12-31T23:59:59Z');
    vi.setSystemTime(mockDate);

    const result = getCurrentYearDateRange();

    expect(result.dateMin.iso8601).toBe('2025-01-01');
    expect(result.dateMax.iso8601).toBe('2025-12-31');

    vi.useRealTimers();
  });

  it('should return proper format with precision field', () => {
    const result = getCurrentYearDateRange();

    expect(result.dateMin.precision).toBe('Date');
    expect(result.dateMax.precision).toBe('Date');
  });

  it('should return ISO 8601 formatted dates', () => {
    const result = getCurrentYearDateRange();

    // Check format: YYYY-MM-DD
    expect(result.dateMin.iso8601).toMatch(/^\d{4}-01-01$/);
    expect(result.dateMax.iso8601).toMatch(/^\d{4}-12-31$/);
  });
});

describe(toDateKey, () => {
  it('should extract YYYY-MM-DD from a DateTime precision BmDateTime', () => {
    expect(toDateKey({ iso8601: '2026-09-04T00:00:00Z', precision: 'DateTime' })).toBe('2026-09-04');
  });

  it('should pass through a Date precision BmDateTime unchanged', () => {
    expect(toDateKey({ iso8601: '2026-09-04', precision: 'Date' })).toBe('2026-09-04');
  });

  it('should return empty string for null or undefined input', () => {
    expect(toDateKey(null)).toBe('');
    expect(toDateKey(undefined)).toBe('');
    expect(toDateKey({})).toBe('');
  });
});

describe(expandTtoSeries, () => {
  // Fixed reference: 2026-06-15 is a Monday, mid-year (clear past/future split).
  const YEAR_END = Date.UTC(2026, 11, 31, 23, 59, 59, 999);

  /**
   * Build a minimal VEventSeries fixture.
   * @param {Object} main - The main VEvent (dtstart/dtend/rrule/exdate)
   * @param {Array} [occurrences] - Exception occurrences
   * @param {string} [displayName] - Series display name
   * @returns {Object} A VEventSeries-shaped object
   */
  const series = (main, occurrences = [], displayName = 'TTO - Télétravail') =>
    ({ displayName, value: { main, occurrences } });

  const expand = (s, warnings = []) => expandTtoSeries(s, { yearEnd: YEAR_END, warnings });

  it('should return a single entry for a non-recurring event', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-03-02T00:00:00Z' },
      dtend: { iso8601: '2026-03-03T00:00:00Z' },
    }));

    expect(result).toStrictEqual([{ from: '2026-03-02T00:00:00Z', days: 1 }]);
  });

  it('should expand a WEEKLY event with a single byDay until end of year', () => {
    // Start Monday 2026-01-05, every Monday, until 2026-12-31.
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
        until: { iso8601: '2026-12-31T00:00:00Z' },
      },
    }));

    // All entries are Mondays of 1 day each, sorted ascending.
    expect(result.length).toBeGreaterThan(50);
    expect(result.every(({ days }) => days === 1)).toBe(true);
    expect(result[0].from.startsWith('2026-01-05')).toBe(true);
    const froms = result.map(({ from }) => from);
    expect(froms).toStrictEqual([...froms].sort((a, b) => a.localeCompare(b)));
    // Every occurrence falls on a Monday (UTC day 1).
    expect(result.every(({ from }) => new Date(from).getUTCDay() === 1)).toBe(true);
  });

  it('should expand a WEEKLY event with multiple byDay, sorted', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'WE' }, { day: 'MO' }],
        until: { iso8601: '2026-01-31T00:00:00Z' },
      },
    }));

    // January 2026: Mondays 5,12,19,26 and Wednesdays 7,14,21,28 = 8 occurrences.
    expect(result).toHaveLength(8);
    const froms = result.map(({ from }) => from);
    expect(froms).toStrictEqual([...froms].sort((a, b) => a.localeCompare(b)));
    expect(result.every(({ from }) => [1, 3].includes(new Date(from).getUTCDay()))).toBe(true);
  });

  it('should honour interval (every other week)', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        interval: 2,
        byDay: [{ day: 'MO' }],
        until: { iso8601: '2026-02-28T00:00:00Z' },
      },
    }));

    // Mondays every 2 weeks from Jan 5: 5, 19, Feb 2, 16 → 4 occurrences.
    expect(result.map(({ from }) => from.slice(0, 10)))
      .toStrictEqual(['2026-01-05', '2026-01-19', '2026-02-02', '2026-02-16']);
  });

  it('should expand a DAILY event with interval', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-01T00:00:00Z' },
      dtend: { iso8601: '2026-01-02T00:00:00Z' },
      rrule: {
        frequency: 'DAILY',
        interval: 2,
        count: 3,
      },
    }));

    expect(result.map(({ from }) => from.slice(0, 10)))
      .toStrictEqual(['2026-01-01', '2026-01-03', '2026-01-05']);
  });

  it('should carry per-occurrence days for multi-day recurring events', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      // 2-day occurrence
      dtend: { iso8601: '2026-01-07T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
        count: 3,
      },
    }));

    expect(result).toHaveLength(3);
    expect(result.every(({ days }) => days === 2)).toBe(true);
  });

  it('should subtract exdate (Date precision) from occurrences', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
        count: 3,
      },
      // Exclude the second Monday, Date precision (no time component).
      exdate: [{ iso8601: '2026-01-12', precision: 'Date' }],
    }));

    // count=3 means 3 actually-posted days; exdate does NOT consume the count.
    const dates = result.map(({ from }) => from.slice(0, 10));
    expect(dates).not.toContain('2026-01-12');
    expect(dates).toStrictEqual(['2026-01-05', '2026-01-19', '2026-01-26']);
  });

  it('should apply a moved exception (recurid -> new dtstart)', () => {
    const result = expand(series(
      {
        dtstart: { iso8601: '2026-01-05T00:00:00Z' },
        dtend: { iso8601: '2026-01-06T00:00:00Z' },
        rrule: {
          frequency: 'WEEKLY',
          byDay: [{ day: 'MO' }],
          count: 2,
        },
      },
      [{
        recurid: { iso8601: '2026-01-12', precision: 'Date' },
        dtstart: { iso8601: '2026-01-13T00:00:00Z' },
        dtend: { iso8601: '2026-01-14T00:00:00Z' },
      }],
    ));

    const dates = result.map(({ from }) => from.slice(0, 10));
    expect(dates).toContain('2026-01-13');
    expect(dates).not.toContain('2026-01-12');
  });

  it('should apply a shortened exception (reduced days)', () => {
    const result = expand(series(
      {
        dtstart: { iso8601: '2026-01-05T00:00:00Z' },
        // base occurrence is 2 days
        dtend: { iso8601: '2026-01-07T00:00:00Z' },
        rrule: {
          frequency: 'WEEKLY',
          byDay: [{ day: 'MO' }],
          count: 2,
        },
      },
      [{
        recurid: { iso8601: '2026-01-12', precision: 'Date' },
        dtstart: { iso8601: '2026-01-12T00:00:00Z' },
        // shortened to 1 day
        dtend: { iso8601: '2026-01-13T00:00:00Z' },
      }],
    ));

    const jan12 = result.find(({ from }) => from.slice(0, 10) === '2026-01-12');
    expect(jan12.days).toBe(1);
  });

  it('should drop a cancelled exception without consuming the count', () => {
    const result = expand(series(
      {
        dtstart: { iso8601: '2026-01-05T00:00:00Z' },
        dtend: { iso8601: '2026-01-06T00:00:00Z' },
        rrule: {
          frequency: 'WEEKLY',
          byDay: [{ day: 'MO' }],
          count: 3,
        },
      },
      [{
        recurid: { iso8601: '2026-01-12', precision: 'Date' },
        // BlueMind enum is PascalCase: 'Cancelled', not 'CANCELLED'
        status: 'Cancelled',
      }],
    ));

    const dates = result.map(({ from }) => from.slice(0, 10));
    expect(dates).not.toContain('2026-01-12');
    expect(dates).toStrictEqual(['2026-01-05', '2026-01-19', '2026-01-26']);
  });

  it('should count actually-posted days when count and exdate coexist', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
        count: 2,
      },
      exdate: [{ iso8601: '2026-01-12', precision: 'Date' }],
    }));

    // 2 posted days: the excluded Monday does not consume the count.
    expect(result).toHaveLength(2);
    expect(result.map(({ from }) => from.slice(0, 10)))
      .toStrictEqual(['2026-01-05', '2026-01-19']);
  });

  it('should stop at until even if the year continues', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
        until: { iso8601: '2026-06-30T00:00:00Z' },
      },
    }));

    expect(result.every(({ from }) => from <= '2026-06-30')).toBe(true);
    expect(result.some(({ from }) => from.slice(0, 10) === '2026-06-29')).toBe(true);
  });

  it('should bound to end of calendar year when there is no until nor count', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        byDay: [{ day: 'MO' }],
      },
    }));

    expect(result.every(({ from }) => from.slice(0, 10) <= '2026-12-31')).toBe(true);
    // Should not run away: a year of Mondays is ~52 occurrences.
    expect(result.length).toBeLessThan(54);
  });

  it('should count an unhandled frequency as a single master occurrence and warn', () => {
    const warnings = [];
    const result = expandTtoSeries(
      series({
        dtstart: { iso8601: '2026-01-05T00:00:00Z' },
        dtend: { iso8601: '2026-01-06T00:00:00Z' },
        rrule: { frequency: 'MONTHLY', byMonthDay: [5] },
      }, [], 'TTO - Mensuel'),
      { yearEnd: YEAR_END, warnings },
    );

    expect(result).toStrictEqual([{ from: '2026-01-05T00:00:00Z', days: 1 }]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/MONTHLY/);
    expect(warnings[0]).toMatch(/TTO - Mensuel/);
  });

  it('should handle WEEKLY without byDay (same weekday as dtstart)', () => {
    const result = expand(series({
      // Monday
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'WEEKLY',
        count: 3,
      },
    }));

    expect(result.map(({ from }) => from.slice(0, 10)))
      .toStrictEqual(['2026-01-05', '2026-01-12', '2026-01-19']);
  });

  it('should not run away for an unbounded WEEKLY recurrence', () => {
    const result = expand(series({
      dtstart: { iso8601: '2026-01-05T00:00:00Z' },
      dtend: { iso8601: '2026-01-06T00:00:00Z' },
      rrule: {
        frequency: 'DAILY',
      },
    }));

    // Bounded by year end, never the MAX_ITER guard.
    expect(result.length).toBeLessThanOrEqual(366);
    expect(result.length).toBeGreaterThan(300);
  });
});

describe(getTTO, () => {
  it('should filter and transform TTO events', () => {
    const mockResults = [
      {
        displayName: 'TTO - Congés payés',
        value: {
          main: {
            dtstart: { iso8601: '2026-02-01T00:00:00Z' },
            dtend: { iso8601: '2026-02-06T00:00:00Z' },
          },
        },
      },
      {
        displayName: 'TTR - Récurrent',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual({
      from: '2026-02-01T00:00:00Z',
      days: 5,
    });
  });

  it('should handle case-insensitive TTO matching', () => {
    const mockResults = [
      {
        displayName: 'tto - lowercase',
        value: {
          main: {
            dtstart: { iso8601: '2026-03-01T00:00:00Z' },
            dtend: { iso8601: '2026-03-04T00:00:00Z' },
          },
        },
      },
      {
        displayName: 'TTO - UPPERCASE',
        value: {
          main: {
            dtstart: { iso8601: '2026-04-01T00:00:00Z' },
            dtend: { iso8601: '2026-04-03T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result).toHaveLength(2);
  });

  it('should calculate days correctly for single day event', () => {
    const mockResults = [
      {
        displayName: 'TTO - Single day',
        value: {
          main: {
            dtstart: { iso8601: '2026-05-01T00:00:00Z' },
            dtend: { iso8601: '2026-05-02T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result[0].days).toBe(1);
  });

  it('should return empty array when no TTO events', () => {
    const mockResults = [
      {
        displayName: 'TTR - Récurrent',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result).toStrictEqual([]);
  });

  it('should handle multiple TTO events', () => {
    const mockResults = [
      {
        displayName: 'TTO - Event 1',
        value: {
          main: {
            dtstart: { iso8601: '2026-02-01T00:00:00Z' },
            dtend: { iso8601: '2026-02-03T00:00:00Z' },
          },
        },
      },
      {
        displayName: 'TTO - Event 2',
        value: {
          main: {
            dtstart: { iso8601: '2026-03-01T00:00:00Z' },
            dtend: { iso8601: '2026-03-06T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result).toHaveLength(2);
    expect(result[0].days).toBe(2);
    expect(result[1].days).toBe(5);
  });

  it('should ceil fractional days', () => {
    const mockResults = [
      {
        displayName: 'TTO - Fractional',
        value: {
          main: {
            // 1.5 days difference
            dtstart: { iso8601: '2026-02-01T00:00:00Z' },
            dtend: { iso8601: '2026-02-02T12:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    // Should ceil to 2 days
    expect(result[0].days).toBe(2);
  });
});

describe(getTTR, () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should filter TTR events and return day indices', () => {
    const mockResults = [
      {
        displayName: 'TTR - Work from home',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // Monday index
    expect(result).toContain(0);
  });

  it('should exclude events without rrule', () => {
    const mockResults = [
      {
        displayName: 'TTR - No rrule',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    expect(result).toStrictEqual([]);
  });

  it('should exclude events that have not started yet', () => {
    const mockResults = [
      {
        displayName: 'TTR - Future event',
        value: {
          main: {
            // In the future
            dtstart: { iso8601: '2026-12-01T00:00:00Z' },
            dtend: { iso8601: '2026-12-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              until: { iso8601: '2027-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    expect(result).toStrictEqual([]);
  });

  it('should exclude events that have already ended', () => {
    const mockResults = [
      {
        displayName: 'TTR - Past event',
        value: {
          main: {
            dtstart: { iso8601: '2025-01-01T00:00:00Z' },
            dtend: { iso8601: '2025-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              // Already ended
              until: { iso8601: '2025-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    expect(result).toStrictEqual([]);
  });

  it('should handle recurring events without end date', () => {
    const mockResults = [
      {
        displayName: 'TTR - No end date',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'TU' }],
              // No until property
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // Tuesday index
    expect(result).toContain(1);
  });

  it('should handle multi-day recurring events', () => {
    const mockResults = [
      {
        displayName: 'TTR - Two days',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            // 2 days
            dtend: { iso8601: '2026-01-03T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // Should include Monday (0) and Tuesday (1)
    expect(result).toContain(0);
    expect(result).toContain(1);
  });

  it('should return sorted day indices', () => {
    const mockResults = [
      {
        displayName: 'TTR - Multiple days',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'FR' }, { day: 'MO' }, { day: 'WE' }],
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // Should be sorted: [0 (MO), 2 (WE), 4 (FR)]
    expect(result).toStrictEqual([0, 2, 4]);
  });

  it('should ignore non-TTR events', () => {
    const mockResults = [
      {
        displayName: 'TTO - Not recurring',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    expect(result).toStrictEqual([]);
  });
});

describe(createFetchJson, () => {
  it('should throw an error with HTTP status when response is not ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });

    const fetchJson = createFetchJson(mockFetch);
    await expect(fetchJson('https://example.com')).rejects.toThrow('HTTP 401');
  });

  it('should abort fetch when timeout is exceeded', async () => {
    const mockFetch = vi.fn().mockImplementation(
      (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
    );

    vi.useFakeTimers();
    const fetchJson = createFetchJson(mockFetch, 1000);
    const fetchPromise = fetchJson('https://example.com');
    vi.advanceTimersByTime(1001);

    await expect(fetchPromise).rejects.toThrow('aborted');
    vi.useRealTimers();
  });

  it('should return parsed JSON when response is ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve({ data: 'ok' }),
    });

    const fetchJson = createFetchJson(mockFetch);
    const result = await fetchJson('https://example.com');
    expect(result).toStrictEqual({ data: 'ok' });
  });
});

describe(handleUpdate, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockDeps = (mockFetch) => ({
    fetch: mockFetch,
    fetchJson: vi.fn(async (...args) => {
      const response = await mockFetch(...args);
      return response.json();
    }),
    baserowTablePath: 'https://api.baserow.io/table/123',
    baserowHeaders: {
      Authorization: 'Token test-token',
      'Content-Type': 'application/json',
    },
    bmApiPath: 'https://bm.example.com/api/',
    bmDomain: 'test-domain',
    bmHeaders: {
      'X-BM-ApiKey': 'test-api-key',
    },
  });

  it('should create new user entries for UIDs not in cache', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    // Override fetchJson with custom implementation
    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        // First call: get cache table
        results: [
          { id: 1, uid: 'existing-uid', enabled: false, tri: 'abc', tto: '[]', ttr: '[]' },
        ],
      })
      // Second call: get all UIDs
      .mockResolvedValueOnce(['existing-uid', 'new-uid'])
      .mockResolvedValueOnce({
        // Third call: get user light info (displayName + login only)
        displayName: 'New User',
        value: { login: 'newuser' },
      });

    // Mock POST for creating new entry
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ id: 2 }),
    });

    await handleUpdate(deps);

    // Verify POST was called to create new user
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.baserow.io/table/123?user_field_names=true',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          tri: 'newuser',
          name: 'New User',
          uid: 'new-uid',
        }),
      }),
    );
  });

  it('should update records when TTO/TTR data changes', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        // Cache table
        results: [
          {
            id: 1,
            uid: 'test-uid',
            enabled: true,
            tri: 'abc',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      // All UIDs
      .mockResolvedValueOnce(['test-uid'])
      .mockResolvedValueOnce([
        // Calendar search results
        {
          displayName: 'TTO - Leave',
          value: {
            main: {
              dtstart: { iso8601: '2026-02-01T00:00:00Z' },
              dtend: { iso8601: '2026-02-06T00:00:00Z' },
            },
          },
        },
      ]);

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    const response = await handleUpdate(deps);

    // Verify PATCH was called to update the record
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('1/?user_field_names=true'),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );

    expect(response.status).toBe(200);
    const updates = JSON.parse(await response.text());
    expect(updates).toContain('abc');
  });

  it('should not update records when data has not changed', async () => {
    const existingTTO = [{ from: '2026-02-01T00:00:00Z', days: 5 }];
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'test-uid',
            enabled: true,
            exclude: false,
            tri: 'abc',
            tto: JSON.stringify(existingTTO, null, 2),
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['test-uid'])
      .mockResolvedValueOnce([
        {
          displayName: 'TTO - Leave',
          value: {
            main: {
              dtstart: { iso8601: '2026-02-01T00:00:00Z' },
              dtend: { iso8601: '2026-02-06T00:00:00Z' },
            },
          },
        },
      ]);

    const response = await handleUpdate(deps);

    // Verify PATCH was NOT called (data unchanged)
    expect(mockFetch).not.toHaveBeenCalled();

    expect(response.status).toBe(200);
    const updates = JSON.parse(await response.text());
    expect(updates).toStrictEqual([]);
  });

  it('should skip disabled users', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'disabled-uid',
            enabled: false,
            exclude: false,
            tri: 'disabled',
            tto: '[]',
            ttr: '[]',
          },
          {
            id: 2,
            uid: 'enabled-uid',
            enabled: true,
            exclude: false,
            tri: 'enabled',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['disabled-uid', 'enabled-uid'])
      // Calendar results for enabled user
      .mockResolvedValueOnce([]);

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    await handleUpdate(deps);

    // Verify calendar search was only called once (for enabled user)
    // cache + allUids + 1 calendar search
    expect(deps.fetchJson).toHaveBeenCalledTimes(3);
  });

  it('should skip excluded users even if enabled', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'excluded-uid',
            enabled: true,
            exclude: true,
            tri: 'gitlab',
            tto: '[]',
            ttr: '[]',
          },
          {
            id: 2,
            uid: 'normal-uid',
            enabled: true,
            exclude: false,
            tri: 'user',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['excluded-uid', 'normal-uid'])
      // Calendar results for normal user only
      .mockResolvedValueOnce([]);

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    await handleUpdate(deps);

    // Verify calendar search was only called once (excluded user was skipped)
    // cache + allUids + 1 calendar search
    expect(deps.fetchJson).toHaveBeenCalledTimes(3);
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'test-uid',
            enabled: true,
            exclude: false,
            tri: 'abc',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['test-uid'])
      .mockResolvedValueOnce({
        errorCode: 'CALENDAR_ERROR',
        message: 'Calendar not found',
      });

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    const response = await handleUpdate(deps);

    // Verify error was logged in the update
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('Calendar not found'),
      }),
    );

    expect(response.status).toBe(200);
  });

  it('should return list of updated user tris', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'uid1',
            enabled: true,
            exclude: false,
            tri: 'user1',
            tto: '[]',
            ttr: '[]',
          },
          {
            id: 2,
            uid: 'uid2',
            enabled: true,
            exclude: false,
            tri: 'user2',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['uid1', 'uid2'])
      .mockResolvedValueOnce([
        {
          displayName: 'TTO - Leave 1',
          value: {
            main: {
              dtstart: { iso8601: '2026-02-01T00:00:00Z' },
              dtend: { iso8601: '2026-02-03T00:00:00Z' },
            },
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          displayName: 'TTO - Leave 2',
          value: {
            main: {
              dtstart: { iso8601: '2026-03-01T00:00:00Z' },
              dtend: { iso8601: '2026-03-04T00:00:00Z' },
            },
          },
        },
      ]);

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    const response = await handleUpdate(deps);

    expect(response.status).toBe(200);
    const updates = JSON.parse(await response.text());
    expect(updates).toContain('user1');
    expect(updates).toContain('user2');
    expect(updates).toHaveLength(2);
  });

  it('should handle PATCH errors by logging to stderr', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => {});

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        results: [
          {
            id: 1,
            uid: 'test-uid',
            enabled: true,
            exclude: false,
            tri: 'abc',
            tto: '[]',
            ttr: '[]',
          },
        ],
      })
      .mockResolvedValueOnce(['test-uid'])
      .mockResolvedValueOnce([
        {
          displayName: 'TTO - Leave',
          value: {
            main: {
              dtstart: { iso8601: '2026-02-01T00:00:00Z' },
              dtend: { iso8601: '2026-02-03T00:00:00Z' },
            },
          },
        },
      ]);

    mockFetch.mockResolvedValue({
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await handleUpdate(deps);

    expect(stderrSpy).toHaveBeenCalledWith('Internal Server Error');

    stderrSpy.mockRestore();
  });

  it('should throw an HTTP error when a dependency fetch returns non-ok response', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    // fetchJson should reject with HTTP error when response is not ok
    vi.spyOn(deps, 'fetchJson').mockResolvedValueOnce({
      results: [{ id: 1, uid: 'uid', enabled: true, tri: 'abc', tto: '[]', ttr: '[]' }],
    })
      .mockResolvedValueOnce(['uid'])
      .mockRejectedValueOnce(new Error('HTTP 503'));

    await expect(handleUpdate(deps)).rejects.toThrow('HTTP 503');
  });

  it('should return 403 when BlueMind API returns PERMISSION_DENIED on _alluids', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    vi.spyOn(deps, 'fetchJson')
      .mockResolvedValueOnce({
        // First call: Baserow cache (ok)
        results: [{ id: 1, uid: 'some-uid', enabled: true, tri: 'abc', tto: '[]', ttr: '[]' }],
      })
      .mockResolvedValueOnce({
        // Second call: _alluids → BM auth error
        errorCode: 'PERMISSION_DENIED',
        errorType: 'ServerFault',
        message: 'anonymous@null Doesnt have role domainManager,manageUser on domain test-domain',
      });

    const response = await handleUpdate(deps);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('PERMISSION_DENIED');
    expect(body.message).toMatch(/domainManager/);
  });
});
