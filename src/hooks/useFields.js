import { useAuth } from 'react-oidc-context';
import { useQuery } from 'react-query';

const useFields = tableId => {
  const basePath = `https://api.baserow.io/api/database/fields/table/${tableId}/`;

  const { user: { profile: { baserow_token: [token] } = {} } = {} } = useAuth();

  const headers = {
    Authorization: `Token ${token}`,
  };

  const queryKey = [tableId];

  const { data = [] } = useQuery(
    queryKey,
    async () => {
      const response = await fetch(
        basePath,
        { headers },
      );

      const nextData = await response.json();

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

  return data;
};

export default useFields;
