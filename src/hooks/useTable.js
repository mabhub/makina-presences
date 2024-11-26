import { useAuth } from 'react-oidc-context';
import { useQuery } from 'react-query';

const useTable = tableId => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${tableId}/`;

  const { user: { profile: { baserow_token: [token] } = {} } = {} } = useAuth();

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
        { headers: { Authorization: `Token ${token}` } },
      );

      const nextData = await response.json();

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

  return results;
};

export default useTable;
