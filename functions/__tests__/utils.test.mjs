import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';

import fetchWithTimeout from '../utils.mjs';

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
