/**
 * Wraps fetch with an AbortController-based timeout.
 * Clears the timeout on resolution to avoid memory leaks.
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (merged with abort signal)
 * @param {number} ms - Timeout in milliseconds
 * @param {Function} fetchFn - Fetch implementation (injectable for tests, defaults to global fetch)
 * @returns {Promise<Response>} Resolves with the fetch response
 * @throws {DOMException} AbortError if the request exceeds the timeout
 */
const fetchWithTimeout = (url, options, ms, fetchFn = globalThis.fetch) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetchFn(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export default fetchWithTimeout;
