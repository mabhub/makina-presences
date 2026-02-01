import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

// Mock node-fetch before importing the handler
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

describe('list.js handler', () => {
  let handler;
  let mockFetch;

  beforeEach(async () => {
    // Set up environment variables
    process.env.TT_BASEROW_TABLE = 'https://api.baserow.io/api/database/rows/table/123';
    process.env.TT_BASEROW_TOKEN = 'test-token-123';

    // Get the mocked fetch
    const nodeFetch = await import('node-fetch');
    mockFetch = nodeFetch.default;

    // Import handler after mocking
    const listModule = await import('../list.js');
    handler = listModule.handler;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.TT_BASEROW_TABLE;
    delete process.env.TT_BASEROW_TOKEN;
  });

  it('should return filtered and transformed records', async () => {
    const mockResponse = {
      results: [
        {
          tri: 'abc',
          total: 10,
          enabled: true,
          tto: '[{"from":"2026-01-01","days":5}]',
          ttr: '[0,2,4]',
        },
        {
          tri: 'def',
          total: 5,
          enabled: false, // This should be filtered out
          tto: '[]',
          ttr: '[]',
        },
        {
          tri: 'ghi',
          total: 8,
          enabled: true,
          tto: '[{"from":"2026-02-01","days":3}]',
          ttr: '[1,3]',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body).toHaveLength(2); // Only enabled records

    expect(body[0]).toEqual({
      tri: 'abc',
      total: 10,
      tto: [{ from: '2026-01-01', days: 5 }],
      ttr: [0, 2, 4],
    });

    expect(body[1]).toEqual({
      tri: 'ghi',
      total: 8,
      tto: [{ from: '2026-02-01', days: 3 }],
      ttr: [1, 3],
    });
  });

  it('should call Baserow API with correct parameters', async () => {
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    await handler();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.baserow.io/api/database/rows/table/123?&user_field_names=true&include=tri,total,enabled,tto,ttr&size=200',
      {
        headers: {
          Authorization: 'Token test-token-123',
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('should parse JSON fields correctly', async () => {
    const mockResponse = {
      results: [
        {
          tri: 'test',
          total: 15,
          enabled: true,
          tto: '[{"from":"2026-03-15","days":10},{"from":"2026-06-01","days":5}]',
          ttr: '[0,1,2,3,4]',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();
    const body = JSON.parse(result.body);

    expect(body[0].tto).toEqual([
      { from: '2026-03-15', days: 10 },
      { from: '2026-06-01', days: 5 },
    ]);
    expect(body[0].ttr).toEqual([0, 1, 2, 3, 4]);
  });

  it('should return empty array when no enabled records', async () => {
    const mockResponse = {
      results: [
        {
          tri: 'disabled1',
          total: 5,
          enabled: false,
          tto: '[]',
          ttr: '[]',
        },
        {
          tri: 'disabled2',
          total: 3,
          enabled: false,
          tto: '[]',
          ttr: '[]',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();
    const body = JSON.parse(result.body);

    expect(body).toEqual([]);
  });

  it('should handle empty results', async () => {
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();
    const body = JSON.parse(result.body);

    expect(body).toEqual([]);
    expect(result.statusCode).toBe(200);
  });

  it('should format response body with pretty print', async () => {
    const mockResponse = {
      results: [
        {
          tri: 'test',
          total: 5,
          enabled: true,
          tto: '[]',
          ttr: '[]',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();

    // Check that body is formatted with 2-space indentation
    expect(result.body).toContain('\n');
    expect(result.body).toContain('  '); // 2-space indentation
  });

  it('should only include specified fields in output', async () => {
    const mockResponse = {
      results: [
        {
          tri: 'test',
          total: 5,
          enabled: true,
          tto: '[]',
          ttr: '[]',
          extraField: 'should not be included',
          anotherField: 'also ignored',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await handler();
    const body = JSON.parse(result.body);

    expect(body[0]).toEqual({
      tri: 'test',
      total: 5,
      tto: [],
      ttr: [],
    });

    expect(body[0]).not.toHaveProperty('enabled');
    expect(body[0]).not.toHaveProperty('extraField');
    expect(body[0]).not.toHaveProperty('anotherField');
  });
});
