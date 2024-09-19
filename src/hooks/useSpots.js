import { useMutation, useQueryClient } from 'react-query';
import useTable from './useTable';
import { DELETED_KEY } from '../components/admin/const';

const {
  VITE_TABLE_ID_SPOTS: spotsTableId,
  VITE_BASEROW_TOKEN: token,
} = import.meta.env;

const headers = {
  Authorization: `Token ${token}`,
  'Content-Type': 'application/json',
};

const useSpots = placeID => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${spotsTableId}/`;
  const queryKey = [spotsTableId];
  const queryClient = useQueryClient();

  const spots = useTable(spotsTableId)
    .filter(({ Plan: [{ id } = {}] = [] }) => id === placeID && placeID !== undefined);

  const createRow = useMutation(record => fetch(
    `${basePath}?user_field_names=true`,
    { headers, method: 'POST', body: JSON.stringify(record) },
  ), {
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

  const createSpot = spot => {
    const { 'Dernière modification': modified, ...rest } = spot;
    return createRow.mutateAsync({
      ...rest,
      Type: rest.Type.id,
      Plan: [rest.Plan[0].id],
    });
  };

  const updateSpot = spot => {
    const { 'Dernière modification': modified, ...rest } = spot;
    return updateRow.mutateAsync({
      ...rest,
      Type: rest.Type.id,
      Plan: [rest.Plan[0].id],
    });
  };

  const setSpot = spot => {
    const { id } = spot;

    if (Object.hasOwn(spot, DELETED_KEY) && id) {
      return deleteRow.mutateAsync(spot);
    }

    if (id) {
      return updateSpot(spot);
    }

    if (!id && !Object.hasOwn(spot, DELETED_KEY)) {
      return createSpot(spot);
    }

    return null;
  };

  return {
    spots,
    createRow,
    updateRow,
    deleteRow,
    setSpot,
  };
};

export default useSpots;
