import { useMutation, useQueryClient } from 'react-query';
import useTable from './useTable';

const {
  VITE_TABLE_ID_ADDITIONALS: tableID,
  VITE_BASEROW_TOKEN: token,
} = import.meta.env;

const headers = {
  Authorization: `Token ${token}`,
  'Content-Type': 'application/json',
};

const useAdditionals = placeID => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${tableID}/`;
  const queryKey = [tableID];
  const queryClient = useQueryClient();

  const additionals = useTable(tableID)
    .filter(({ Plan: [{ id } = {}] = [] }) => id === placeID);

  const createRow = useMutation(record => fetch(
    `${basePath}?user_field_names=true`,
    { headers, method: 'POST', body: JSON.stringify(record) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, previous => ({
        results: [
          ...previous.results,
          { ...record, fake: true, id: record.key },
        ],
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const updateRow = useMutation(record => fetch(
    `${basePath}${record.id}/?user_field_names=true`,
    { headers, method: 'PATCH', body: JSON.stringify(record) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, ({ results = [] }) => ({
        result: results.map(result => (
          result.id === record.id
            ? { ...result, ...record }
            : record
        )),
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const deleteRow = useMutation(record => fetch(
    `${basePath}${record.id}/`,
    { headers, method: 'DELETE' },
  ), {
    onMutate: async record => (
      queryClient.setQueryData(queryKey, ({ results = [] }) => ({
        results: results.filter(result => result.id !== record.id),
      }))
    ),
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const createAdditional = additional => createRow.mutateAsync({
    ...additional,
    Plan: [additional.Plan[0].id],
  });

  const updateAdditional = additional => updateRow.mutateAsync({
    ...additional,
    Plan: [additional.Plan[0].id],
  });

  const setAdditionnal = additional => {
    const existingIDs = additionals.map(({ id }) => id);

    if (existingIDs.includes(additional.id)) {
      return updateAdditional(additional);
    }

    return createAdditional(additional);
  };

  return {
    additionals,
    createRow,
    updateRow,
    deleteRow,
    createAdditional,
    updateAdditional,
    setAdditionnal,
  };
};

export default useAdditionals;
