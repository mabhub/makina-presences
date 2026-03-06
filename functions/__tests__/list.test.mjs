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
    globalThis.fetch = mockFetch;

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
    delete globalThis.fetch;
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
          // This should be filtered out
          enabled: false,
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
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = JSON.parse(await response.text());
    // Only enabled records
    expect(body).toHaveLength(2);

    expect(body[0]).toStrictEqual({
      tri: 'abc',
      total: 10,
      tto: [{ from: '2026-01-01', days: 5 }],
      ttr: [0, 2, 4],
    });

    expect(body[1]).toStrictEqual({
      tri: 'ghi',
      total: 8,
      tto: [{ from: '2026-02-01', days: 3 }],
      ttr: [1, 3],
    });
  });

  it('should call Baserow API with correct parameters', async () => {
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValue({
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    await handleList(deps);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.baserow.io/api/database/rows/table/123?&user_field_names=true&include=tri,total,enabled,tto,ttr&size=200',
      expect.objectContaining({
        headers: {
          Authorization: 'Token test-token-123',
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      }),
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
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body[0].tto).toStrictEqual([
      { from: '2026-03-15', days: 10 },
      { from: '2026-06-01', days: 5 },
    ]);
    expect(body[0].ttr).toStrictEqual([0, 1, 2, 3, 4]);
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
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body).toStrictEqual([]);
  });

  it('should handle empty results', async () => {
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValue({
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body).toStrictEqual([]);
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
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const bodyText = await response.text();

    // Check that body is formatted with 2-space indentation
    expect(bodyText).toContain('\n');
    // 2-space indentation
    expect(bodyText).toContain('  ');
  });

  it('should abort and throw when Baserow fetch exceeds timeout', async () => {
    mockFetch.mockImplementation((_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
    );

    const depsWithFetch = { ...deps, fetch: mockFetch, timeoutMs: 100 };
    vi.useFakeTimers();

    const responsePromise = handleList(depsWithFetch);
    vi.advanceTimersByTime(200);

    await expect(responsePromise).rejects.toThrow('aborted');
    vi.useRealTimers();
  });

  it('should throw an error with HTTP status when Baserow returns non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });

    await expect(handleList(deps)).rejects.toThrow('HTTP 401');
  });

  it('should throw an error when Baserow returns 503', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve({}),
    });

    await expect(handleList(deps)).rejects.toThrow('HTTP 503');
  });

  it('should throw a structured error when Baserow returns an errorCode', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve({ errorCode: 'ERROR_REQUEST_BODY_VALIDATION', detail: 'invalid' }),
    });

    await expect(handleList(deps)).rejects.toThrow('ERROR_REQUEST_BODY_VALIDATION');
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
      ok: true,
      // oxlint-disable-next-line promise/prefer-await-to-then
      json: () => Promise.resolve(mockResponse),
    });

    const response = await handleList(deps);
    const body = JSON.parse(await response.text());

    expect(body[0]).toStrictEqual({
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
