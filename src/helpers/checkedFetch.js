/**
 * Generic fetch wrapper that validates HTTP response status.
 * Used for non-Baserow API calls (holidays, backups, etc.).
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<Response>} The fetch Response on success
 * @throws {Error} When the HTTP response status indicates an error
 */
const checkedFetch = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
};

export default checkedFetch;
