import { useQuery } from '@tanstack/react-query';

/**
 * React hook to fetch French public holidays (Metropole) as an object.
 * Uses TanStack Query (formerly react-query) for caching and network robustness.
 *
 * @function
 * @returns {Object} An object where keys are ISO dates and values are holiday names.
 */
const useHolidays = () => {
  const { data } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const response = await fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity, // cacheTime renamed to gcTime in v5
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return data || {};
};

export default useHolidays;
