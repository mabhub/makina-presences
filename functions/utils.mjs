/**
 * Wraps fetch with an AbortController-based timeout.
 * Clears the timeout once fetch settles to avoid memory leaks.
 *
 * A request cut by the timeout rejects with an error naming the host and the
 * delay, so that monitoring tells which service was too slow instead of a
 * bare "This operation was aborted".
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (merged with abort signal)
 * @param {number} ms - Timeout in milliseconds
 * @param {Function} fetchFn - Fetch implementation (injectable for tests, defaults to global fetch)
 * @returns {Promise<Response>} Resolves with the fetch response
 * @throws {Error} `Timeout after <ms>ms: <host>` if the request exceeds the
 *   timeout, with the original AbortError as `cause`; other failures are rethrown as is
 */
const fetchWithTimeout = async (url, options, ms, fetchFn = globalThis.fetch) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    return await fetchFn(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Timeout after ${ms}ms: ${new URL(url).host}`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Tells whether a TT cache row must be processed and served.
 *
 * The two flags answer different questions. `exclude` describes the nature of
 * the account: it permanently marks non-human entries (system accounts, service
 * accounts, shared mailboxes, test accounts), which must never be processed
 * whatever `enabled` says. `enabled` is the mutable switch deciding whether a
 * human account is currently tracked; untracked people (former employees, staff
 * outside the scope of the feature) are simply disabled, not excluded.
 *
 * Both the sync job and the front-facing list apply this same predicate, so an
 * excluded row can never be served with stale data after an accidental enable.
 *
 * @param {Object} row - A TT cache row
 * @param {boolean} [row.enabled] - Whether the human account is currently tracked
 * @param {boolean} [row.exclude] - Whether the account is non-human
 * @returns {boolean} True when the row is active
 */
export const isActiveRow = ({ enabled, exclude }) => Boolean(enabled) && !exclude;

export default fetchWithTimeout;
