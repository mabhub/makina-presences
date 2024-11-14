import { useQuery } from 'react-query';
import adapter from '../keycloak';

const { getBaseRowToken } = adapter;

const useTable = tableId => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${tableId}/`;

  const queryKey = [tableId];
  const qs = [
    '?',
    'user_field_names=true',
    'size=200',
  ].join('&');

  const { data: { results = [] } = {} } = useQuery(
    queryKey,
    async () => {
      const response = await fetch(
        basePath + qs,
        { headers: { Authorization: `Token ${getBaseRowToken()}` } },
      );

      const nextData = await response.json();

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

  return results;
};

export default useTable;
