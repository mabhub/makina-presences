import { useQuery } from 'react-query';
import adapter from '../keycloak';

const { keycloak, isSessionExpired } = adapter;

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
      if (await isSessionExpired()) return null;
      const response = await fetch(
        basePath + qs,
        { headers: { Authorization: `Token ${keycloak.tokenParsed.baserow_token[0]}` } },
      );

      const nextData = await response.json();

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

  return results;
};

export default useTable;
