import { useQuery } from '@tanstack/react-query';

/**
 * React hook to fetch and cache the list of backup files from the archive root.
 * Uses TanStack Query (formerly react-query) for caching and network robustness.
 *
 * @function
 * @returns {Array<string>} Array of backup filenames (empty array if not loaded).
 * @example
 * const backups = useBackups();
 * // backups = ['2024-06-01.csv', '2024-06-01.tgz', ...]
 */
const useBackups = () => {
  const { data } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_ARCHIVE_ROOT}/liste.json`);
      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60, // cacheTime renamed to gcTime in v5
    retryDelay: 10 * 1000,
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return data || [];
};

export default useBackups;
