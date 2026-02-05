import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import { handleList } from '../list.mjs';

describe('list.mjs handler', () => {
  let mockFetch;
  let deps;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Create dependencies for injection
    deps = {
      baserowTablePath: 'https://api.baserow.io/api/database/rows/table/123',
      baserowHeaders: {
        Authorization: 'Token test-token-123',
        'Content-Type': 'application/json',
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete global.fetch;
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

    const response = await handleList(deps);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = JSON.parse(await response.text());
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

    await handleList(deps);

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

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

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

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body).toEqual([]);
  });

  it('should handle empty results', async () => {
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body).toEqual([]);
    expect(response.status).toBe(200);
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

    const response = await handleList(deps);
    const bodyText = await response.text();

    // Check that body is formatted with 2-space indentation
    expect(bodyText).toContain('\n');
    expect(bodyText).toContain('  '); // 2-space indentation
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

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

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
