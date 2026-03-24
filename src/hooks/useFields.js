import { useQuery } from '@tanstack/react-query';
import baserowFetch from '../helpers/baserowFetch';

const { VITE_BASEROW_TOKEN: token } = import.meta.env;

/**
 * React hook to fetch the list of fields for a given Baserow table.
 * Uses TanStack Query (formerly react-query) for caching and polling.
 *
 * @function
 * @param {string|number} tableId - The Baserow table ID.
 * @returns {Array<Object>} Array of field objects for the table.
 */
const useFields = tableId => {
  const basePath = `https://api.baserow.io/api/database/fields/table/${tableId}/`;

  const queryKey = [tableId];

  const { data = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await baserowFetch(
        basePath,
        { headers: { Authorization: `Token ${token}` } },
      );
      return response.json();
    },
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 10000,
  });

  return data;
};

export default useFields;
