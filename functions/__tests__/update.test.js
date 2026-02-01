import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

// Mock node-fetch and p-limit before importing
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn) => fn()),
}));

import {
  getCurrentYearDateRange,
  getTTO,
  getTTR,
} from '../update';

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
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-04T00:00:00Z' },
          },
        },
      },
      {
        displayName: 'TTO - Event 2',
        value: {
          main: {
            dtstart: { iso8601: '2026-02-01T00:00:00Z' },
            dtend: { iso8601: '2026-02-06T00:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result).toHaveLength(2);
    expect(result[0].days).toBe(3);
    expect(result[1].days).toBe(5);
  });

  it('should ceil fractional days', () => {
    const mockResults = [
      {
        displayName: 'TTO - Fractional',
        value: {
          main: {
            // 1.5 days
            dtstart: { iso8601: '2026-06-01T00:00:00Z' },
            dtend: { iso8601: '2026-06-02T12:00:00Z' },
          },
        },
      },
    ];

    const result = getTTO(mockResults);

    expect(result[0].days).toBe(2); // Math.ceil(1.5) = 2
  });
});

describe('getTTR', () => {
  beforeEach(() => {
    // Set a known date for testing: 2026-06-15
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should filter TTR events and return day indices', () => {
    const mockResults = [
      {
        displayName: 'TTR - Weekly',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }, { day: 'WE' }],
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // MO=0, WE=2
    expect(result).toContain(0); // Monday
    expect(result).toContain(2); // Wednesday
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
        displayName: 'TTR - Future',
        value: {
          main: {
            dtstart: { iso8601: '2026-12-01T00:00:00Z' }, // After mock date
            dtend: { iso8601: '2026-12-02T00:00:00Z' },
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

  it('should exclude events that have already ended', () => {
    const mockResults = [
      {
        displayName: 'TTR - Past',
        value: {
          main: {
            dtstart: { iso8601: '2025-01-01T00:00:00Z' },
            dtend: { iso8601: '2025-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'MO' }],
              until: { iso8601: '2025-12-31T00:00:00Z' }, // Before mock date
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
        displayName: 'TTR - No end',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' },
            dtend: { iso8601: '2026-01-02T00:00:00Z' },
            rrule: {
              byDay: [{ day: 'FR' }],
              // No until field - recurring indefinitely
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // FR=4 (Friday)
    expect(result).toContain(4);
  });

  it('should handle multi-day recurring events', () => {
    const mockResults = [
      {
        displayName: 'TTR - Multi-day',
        value: {
          main: {
            dtstart: { iso8601: '2026-01-01T00:00:00Z' }, // Thursday
            dtend: { iso8601: '2026-01-03T00:00:00Z' }, // 2 days
            rrule: {
              byDay: [{ day: 'TH' }], // Start on Thursday
              until: { iso8601: '2026-12-31T00:00:00Z' },
            },
          },
        },
      },
    ];

    const result = getTTR(mockResults);

    // TH=3, and the event lasts 2 days, so TH(3) and FR(4)
    expect(result).toContain(3); // Thursday
    expect(result).toContain(4); // Friday
  });

  it('should return sorted day indices', () => {
    const mockResults = [
      {
        displayName: 'TTR - Unsorted',
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

    // Should be sorted: MO(0), WE(2), FR(4)
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

describe('handler', () => {
  let handler;

  beforeEach(async () => {
    const updateModule = await import('../update.js');
    handler = updateModule.handler;
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
    deps.fetchJson = vi.fn()
      .mockResolvedValueOnce({
        // First call: get cache table
        results: [
          { id: 1, uid: 'existing-uid', enabled: false, tri: 'abc', tto: '[]', ttr: '[]' },
        ],
      })
      .mockResolvedValueOnce(['existing-uid', 'new-uid']) // Second call: get all UIDs
      .mockResolvedValueOnce({
        // Third call: get user complete info
        displayName: 'New User',
        value: { login: 'newuser' },
      });

    // Mock POST for creating new entry
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ id: 2 }),
    });

    await handler(deps);

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

    const result = await handler(deps);

    // Verify PATCH was called to update the record
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('1/?user_field_names=true'),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );

    expect(result.statusCode).toBe(200);
    const updates = JSON.parse(result.body);
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

    const result = await handler(deps);

    // Verify PATCH was NOT called (data unchanged)
    expect(mockFetch).not.toHaveBeenCalled();

    expect(result.statusCode).toBe(200);
    const updates = JSON.parse(result.body);
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
            tri: 'disabled',
            tto: '[]',
            ttr: '[]',
          },
          {
            id: 2,
            uid: 'enabled-uid',
            enabled: true,
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

    await handler(deps);

    // Verify calendar search was only called once (for enabled user)
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

    const result = await handler(deps);

    // Verify error was logged in the update
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('Calendar not found'),
      }),
    );

    expect(result.statusCode).toBe(200);
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
            tri: 'user1',
            tto: '[]',
            ttr: '[]',
          },
          {
            id: 2,
            uid: 'uid2',
            enabled: true,
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

    const result = await handler(deps);

    expect(result.statusCode).toBe(200);
    const updates = JSON.parse(result.body);
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

    await handler(deps);

    expect(stderrSpy).toHaveBeenCalledWith('Internal Server Error');

    stderrSpy.mockRestore();
  });
});
