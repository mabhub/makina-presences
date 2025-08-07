import { useQuery } from '@tanstack/react-query';

const qs = [
  '?',
  'user_field_names=true',
  'size=200',
].join('&');

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
  const token = import.meta.env.VITE_BASEROW_TOKEN;
  const queryKey = ['table', tableId, qs];

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        basePath + qs,
        { headers: { Authorization: `Token ${token}` } },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!tableId && !!token, // Only make the request if tableId and token are defined
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 10000,
  });

  return data?.results;
};

export default useTable;
