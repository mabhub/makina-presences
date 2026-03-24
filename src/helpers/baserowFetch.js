/**
 * Baserow API fetch wrapper with error handling and French user messages.
 * @module helpers/baserowFetch
 */

/**
 * Custom error class for Baserow API failures.
 * Carries structured error data from the Baserow response body.
 */
export class BaserowError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} errorCode - Baserow error code (e.g. ERROR_ROW_COUNT_LIMIT_EXCEEDED)
   * @param {string} detail - Raw detail message from Baserow
   */
  constructor(status, errorCode, detail) {
    super(detail || `Baserow API error ${status}`);
    this.name = 'BaserowError';
    this.status = status;
    this.errorCode = errorCode;
    this.detail = detail;
  }
}

const BASEROW_ERROR_MESSAGES = {
  ERROR_ROW_COUNT_LIMIT_EXCEEDED: 'Le quota de lignes Baserow (3000) a été atteint. Supprimez des présences anciennes pour continuer.',
  ERROR_USER_NOT_IN_GROUP: 'Accès refusé à la base de données Baserow.',
  ERROR_TABLE_DOES_NOT_EXIST: 'Table Baserow introuvable.',
  ERROR_USER_INVALID_GROUP_PERMISSIONS_ERROR: 'Permissions insuffisantes sur la base Baserow.',
  ERROR_REQUEST_BODY_VALIDATION: 'Données invalides envoyées à Baserow.',
};

const DEFAULT_MESSAGE = 'Une erreur est survenue lors de la communication avec Baserow.';

/**
 * Returns a user-friendly French message for a given error.
 * Uses the Baserow error code mapping if the error is a BaserowError,
 * otherwise falls back to a generic message.
 *
 * @param {Error} error - The error to get a message for
 * @returns {string} French error message suitable for display to the user
 */
export const getErrorMessage = (error) => {
  if (error instanceof BaserowError) {
    return BASEROW_ERROR_MESSAGES[error.errorCode] ?? error.detail ?? DEFAULT_MESSAGE;
  }

  return error?.message ?? DEFAULT_MESSAGE;
};

/**
 * Fetch wrapper for Baserow API calls.
 * Checks response.ok and throws a BaserowError with structured data on failure.
 * On success, returns the raw Response for the caller to process.
 *
 * @param {string} url - The Baserow API URL
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<Response>} The fetch Response on success
 * @throws {BaserowError} When the HTTP response status indicates an error
 */
const baserowFetch = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorCode;
    let detail;

    try {
      const body = await response.json();
      errorCode = body.error;
      detail = body.detail;
    } catch {
      // Response body is not JSON — use status text as detail
      detail = response.statusText;
    }

    throw new BaserowError(response.status, errorCode, detail);
  }

  return response;
};

export default baserowFetch;
