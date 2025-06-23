import { useQuery } from 'react-query';

/**
 * React hook to fetch French public holidays (Metropole) as an object.
 * Uses react-query for caching and network robustness.
 *
 * @function
 * @returns {Object} An object where keys are ISO dates and values are holiday names.
 */
const useHolidays = () => {
  const { data } = useQuery(
    'holidays',
    async () => {
      const response = await fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json');
      return response.json();
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  return data || {};
};

export default useHolidays;
