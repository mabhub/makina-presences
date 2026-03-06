/**
 * Shared React Query defaults for Baserow API queries.
 * Polling every 60s with 3 retries spaced 10s apart.
 */
export const QUERY_DEFAULTS = {
  staleTime: 60000,
  refetchInterval: 60000,
  retry: 3,
  retryDelay: 10000,
};
