import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import fetchWithTimeout, { isActiveRow } from '../utils.mjs';

describe(fetchWithTimeout, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns response when fetch resolves within timeout', async () => {
    const mockResponse = { ok: true, status: 200 };
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);

    const responsePromise = fetchWithTimeout('https://example.com', {}, 5000, mockFetch);
    await vi.runAllTimersAsync();
    const response = await responsePromise;

    expect(response).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('aborts and throws when fetch exceeds timeout', async () => {
    const mockFetch = vi.fn().mockImplementation(
      (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
    );

    const responsePromise = fetchWithTimeout('https://example.com', {}, 1000, mockFetch);
    vi.advanceTimersByTime(1001);

    await expect(responsePromise).rejects.toThrow('aborted');
  });

  it('passes additional options to fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    const options = { method: 'POST', headers: { 'X-Custom': 'value' } };

    const responsePromise = fetchWithTimeout('https://example.com', options, 5000, mockFetch);
    await vi.runAllTimersAsync();
    await responsePromise;

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'POST',
        headers: { 'X-Custom': 'value' },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('clears timeout when fetch resolves', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });

    const responsePromise = fetchWithTimeout('https://example.com', {}, 5000, mockFetch);
    await vi.runAllTimersAsync();
    await responsePromise;

    // oxlint-disable-next-line jest/prefer-called-with
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe(isActiveRow, () => {
  it('keeps a tracked human account', () => {
    expect(isActiveRow({ enabled: true, exclude: false })).toBeTruthy();
  });

  it('rejects an untracked human account', () => {
    expect(isActiveRow({ enabled: false, exclude: false })).toBeFalsy();
  });

  it('rejects a non-human account even when enabled', () => {
    expect(isActiveRow({ enabled: true, exclude: true })).toBeFalsy();
  });

  it('rejects an account that is both disabled and non-human', () => {
    expect(isActiveRow({ enabled: false, exclude: true })).toBeFalsy();
  });

  it('falls back on enabled when exclude is missing', () => {
    // A row fetched without the exclude field must not be excluded by default.
    expect(isActiveRow({ enabled: true })).toBeTruthy();
    expect(isActiveRow({ enabled: false })).toBeFalsy();
  });

  it('returns a boolean when enabled is missing', () => {
    expect(isActiveRow({})).toBeFalsy();
  });
});
