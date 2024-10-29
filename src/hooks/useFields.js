import { useQuery } from 'react-query';
import adapter from '../keycloak';

const { keycloak } = adapter;

const headers = {
  Authorization: `Token ${keycloak.tokenParsed.baserow_token[0]}`,
};

const useFields = tableId => {
  const basePath = `https://api.baserow.io/api/database/fields/table/${tableId}/`;

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
