import { useQuery } from 'react-query';

const { VITE_BASEROW_TOKEN: token } = import.meta.env;

/**
 * React hook to fetch the list of fields for a given Baserow table.
 * Uses react-query for caching and polling.
 *
 * @function
 * @param {string|number} tableId - The Baserow table ID.
 * @returns {Array<Object>} Array of field objects for the table.
 */
const useFields = tableId => {
  const basePath = `https://api.baserow.io/api/database/fields/table/${tableId}/`;

  const queryKey = [tableId];

  const { data = [] } = useQuery(
    queryKey,
    async () => {
      const response = await fetch(
        basePath,
        { headers: { Authorization: `Token ${token}` } },
      );

      const nextData = await response.json();

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

  return data;
};

export default useFields;
