import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fieldMap, placesId } from '../settings';

const { VITE_DATA_TOKEN } = import.meta.env;

const headers = {
  Authorization: `Token ${VITE_DATA_TOKEN}`,
  'Content-Type': 'application/json',
};

const usePresences = (place, dayRefFrom, dayRefTo) => {
  const queryClient = useQueryClient();
  const basePath = `https://api.baserow.io/api/database/rows/table/${placesId[place]}/`;

  const queryKey = ['presences', place, dayRefFrom, dayRefTo];
  const qs = [
    `?filter__${fieldMap[place].DAYREF}__higher_than=${dayRefFrom - 1}`,
    `&filter__${fieldMap[place].DAYREF}__lower_than=${dayRefTo + 1}`,
  ].join('');

  const { data: { results: presences = [] } = {} } = useQuery(
    queryKey,
    async () => {
      const response = await fetch(
        basePath + qs,
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
      queryClient.setQueryData(queryKey, previous => ({
        results: [
          ...previous.results,
          { ...record, fake: true, id: record[fieldMap[place].KEY] },
        ],
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const updateRow = useMutation(record => fetch(
    `${basePath}${record.id}/`,
    { headers, method: 'PATCH', body: JSON.stringify(record) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, ({ results = [] }) => ({
        results: results.map(result => (
          result.id === record.id
            ? { ...result, ...record, fake: true }
            : result
        )),
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const deleteRow = useMutation(record => fetch(
    `${basePath}${record.id}/`,
    { headers, method: 'DELETE' },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, ({ results = [] }) => ({
        results: results.filter(result => (result.id !== record.id)),
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  return {
    presences,
    createRow,
    updateRow,
    deleteRow,
  };
};

export default usePresences;
