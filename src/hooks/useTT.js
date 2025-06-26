import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch TT (time tracking) data from Netlify functions.
 * Uses TanStack Query v5 syntax for caching and network robustness.
 *
 * @returns {Object} Query result object with data, loading state, error, etc.
 */
const useTT = () => useQuery({
  queryKey: ['tt'],
  queryFn: async () => {
    const response = await fetch('/.netlify/functions/list');
    const nextData = await response.json();
    return nextData;
  },
  staleTime: 60000,
  refetchInterval: 60000,
  retry: 3,
  retryDelay: 10000,
});

export default useTT;
