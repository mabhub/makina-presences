import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

// Mock p-limit before importing
vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn) => fn()),
}));

import {
  getCurrentYearDateRange,
  getTTO,
  getTTR,
  handleUpdate,
} from '../update.mjs';

describe('getCurrentYearDateRange', () => {
  it('should return date range for current year', () => {
    const result = getCurrentYearDateRange();
    const currentYear = new Date().getUTCFullYear();

    expect(result).toEqual({
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

describe('getTTO', () => {
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
    expect(result[0]).toEqual({
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

    expect(result).toEqual([]);
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

describe('getTTR', () => {
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

    expect(result).toContain(0); // Monday index
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

    expect(result).toEqual([]);
  });

  it('should exclude events that have not started yet', () => {
    const mockResults = [
      {
        displayName: 'TTR - Future event',
        value: {
          main: {
            dtstart: { iso8601: '2026-12-01T00:00:00Z' }, // In the future
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

    expect(result).toEqual([]);
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
              until: { iso8601: '2025-12-31T00:00:00Z' }, // Already ended
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    expect(result).toEqual([]);
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

    expect(result).toContain(1); // Tuesday index
  });

  it('should handle multi-day recurring events', () => {
    const mockResults = [
      {
        displayName: 'TTR - Two days',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-03T00:00:00Z' }, // 2 days
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
    expect(result).toEqual([0, 2, 4]);
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

    expect(result).toEqual([]);
  });
});

describe('handleUpdate', () => {
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
    deps.fetchJson = vi.fn()
      .mockResolvedValueOnce({
        // First call: get cache table
        results: [
          { id: 1, uid: 'existing-uid', enabled: false, tri: 'abc', tto: '[]', ttr: '[]' },
        ],
      })
      .mockResolvedValueOnce(['existing-uid', 'new-uid']) // Second call: get all UIDs
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

    deps.fetchJson = vi.fn()
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
      .mockResolvedValueOnce(['test-uid']) // All UIDs
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

    deps.fetchJson = vi.fn()
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
    expect(updates).toEqual([]);
  });

  it('should skip disabled users', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    deps.fetchJson = vi.fn()
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
      .mockResolvedValueOnce([]); // Calendar results for enabled user

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    await handleUpdate(deps);

    // Verify calendar search was only called once (for enabled user)
    expect(deps.fetchJson).toHaveBeenCalledTimes(3); // cache + allUids + 1 calendar search
  });

  it('should skip excluded users even if enabled', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    deps.fetchJson = vi.fn()
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
      .mockResolvedValueOnce([]); // Calendar results for normal user only

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    await handleUpdate(deps);

    // Verify calendar search was only called once (excluded user was skipped)
    expect(deps.fetchJson).toHaveBeenCalledTimes(3); // cache + allUids + 1 calendar search
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn();
    const deps = createMockDeps(mockFetch);

    deps.fetchJson = vi.fn()
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

    deps.fetchJson = vi.fn()
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

    deps.fetchJson = vi.fn()
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
});
