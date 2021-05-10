import { useMutation, useQuery, useQueryClient } from 'react-query';

const { VITE_DATA_TOKEN, VITE_DATA_TABLE } = import.meta.env;

const headers = {
  Authorization: `Token ${VITE_DATA_TOKEN}`,
  'Content-Type': 'application/json',
};

const basePath = `https://api.baserow.io/api/database/rows/table/${VITE_DATA_TABLE}/`;

const usePresences = () => {
  const queryClient = useQueryClient();

  const { data: { results: presences = [] } = {} } = useQuery(
    'presences',
    async () => {
      const response = await fetch(
        basePath,
        { headers: { Authorization: `Token ${VITE_DATA_TOKEN}` } },
      );

      return response.json();
    },
    { staleTime: 60000, refetchInterval: 60000 },
  );

  const createRow = useMutation(record => fetch(
    basePath,
    { headers, method: 'POST', body: JSON.stringify(record) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData('presences', previous => ({
        results: [
          ...previous.results,
          { ...record, fake: true, id: record.field_90299 },
        ],
      }));
    },
    onSettled: () => queryClient.invalidateQueries('presences'),
  });

  const updateRow = useMutation(record => fetch(
    `${basePath}${record.id}/`,
    { headers, method: 'PATCH', body: JSON.stringify(record) },
  ), { onSettled: () => queryClient.invalidateQueries('presences') });

  const deleteRow = useMutation(record => fetch(
    `${basePath}${record.id}/`,
    { headers, method: 'DELETE' },
  ), { onSettled: () => queryClient.invalidateQueries('presences') });

  return {
    presences,
    createRow,
    updateRow,
    deleteRow,
  };
};

export default usePresences;
