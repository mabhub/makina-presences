import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QUERY_DEFAULTS } from './queryDefaults';
import baserowFetch from '../helpers/baserowFetch';

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

  useEffect(() => {
    if (!tableId) {
      console.info('useTable: tableId is not defined, query will not be executed');
    }
    if (!token) {
      console.info('useTable: VITE_BASEROW_TOKEN is not defined, query will not be executed');
    }
  }, [tableId, token]);

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await baserowFetch(
        basePath + qs,
        { headers: { Authorization: `Token ${token}` } },
      );
      return response.json();
    },
    enabled: !!tableId && !!token, // Only make the request if tableId and token are defined
    ...QUERY_DEFAULTS,
  });

  return data?.results ?? [];
};

export default useTable;
