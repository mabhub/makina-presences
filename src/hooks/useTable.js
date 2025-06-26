import { useQuery } from '@tanstack/react-query';

const { VITE_BASEROW_TOKEN: token } = import.meta.env;

/**
 * React hook to fetch all rows from a given Baserow table.
 * Uses TanStack Query (formerly react-query) for caching and polling.
 *
 * @function
 * @param {string|number} tableId - The Baserow table ID.
 * @returns {Array<Object>} Array of row objects from the table.
 */
const useTable = tableId => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${tableId}/`;

  const queryKey = [tableId];
  const qs = [
    '?',
    'user_field_names=true',
    'size=200',
  ].join('&');

  const { data: { results = [] } = {} } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        basePath + qs,
        { headers: { Authorization: `Token ${token}` } },
      );

      const nextData = await response.json();

      return nextData;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 10000,
  });

  return results;
};

export default useTable;
