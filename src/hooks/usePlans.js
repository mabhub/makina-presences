import { useMutation, useQueryClient } from 'react-query';
import { useEffect, useState } from 'react';
import useTable from './useTable';

const {
  VITE_TABLE_ID_PLANS: tableId,
  VITE_BASEROW_TOKEN: token,
} = import.meta.env;

const headers = {
  Authorization: `Token ${token}`,
  'Content-Type': 'application/json',
};

const usePlans = () => {
  const basePath = `https://api.baserow.io/api/database/rows/table/${tableId}/`;
  const uploadPath = 'https://api.baserow.io/api/user-files/upload-file/';
  const queryKey = [tableId];
  const queryClient = useQueryClient();

  const plans = useTable(tableId);

  const [toCreate, setToCreate] = useState();

  const updateRow = useMutation(record => fetch(
    `${basePath}${record.id}/?user_field_names=true`,
    { headers,
      method: 'PATCH',
      body: JSON.stringify({
        ...record,
        Postes: record.Postes.map(({ id }) => id),
      }) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, ({ results = [] }) => {
        console.log(record);
        return {
          result: results.map(result => (
            result.id === record.id
              ? { ...result }
              : result
          )),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const createRow = useMutation(record => fetch(
    `${basePath}?user_field_names=true`,
    { headers, method: 'POST', body: JSON.stringify(record) },
  ), {
    onMutate: async record => {
      queryClient.setQueryData(queryKey, previous => ({
        result: [
          ...previous.results,
          { ...record },
        ],
      }));
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });

  const uploadPlan = useMutation(record => fetch(
    `${uploadPath}`,
    { headers: { Authorization: `Token ${token}` }, method: 'POST', body: record },
  ), {
    onSuccess: resp => {
      resp.json().then(planImage => {
        createRow.mutate({
          ...toCreate.plan,
          plan: [{
            name: planImage.name,
          }],
        });
      });
    },
  });

  useEffect(() => {
    if (toCreate) {
      uploadPlan.mutate(toCreate.rawImage);
      setToCreate();
    }
  }, [toCreate, uploadPlan]);

  const createPlan = (plan, rawImage) => {
    setToCreate({
      plan, rawImage,
    });
  };

  const updatePlan = plan => {
    updateRow.mutate(plan);
  };

  return {
    plans,
    createRow,
    updateRow,
    createPlan,
    updatePlan,
  };
};

export default usePlans;
