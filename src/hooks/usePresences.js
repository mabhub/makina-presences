import dayjs from 'dayjs';
import React from 'react';

import createPersistedState from 'use-persisted-state';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { cleanTri } from '../helpers';

const { VITE_BASEROW_TOKEN: token,
  VITE_TABLE_ID_PRESENCES: presencesTableId,
  VITE_FIELD_PRESENCES_DAY: dayFieldId,
  VITE_FIELD_PRESENCES_PLAN: planFieldID } = import.meta.env;

const headers = {
  Authorization: `Token ${token}`,
  'Content-Type': 'application/json',
};

const fields = {
  day: `field_${dayFieldId}`,
  plan: `field_${planFieldID}`,
};

const useWeekPrefs = createPersistedState('weekPref');

const usePresences = place => {
  const [weekPref] = useWeekPrefs('2');

  let timespan = 14;
  if ([1, 2, 3].includes(parseInt(weekPref, 10))) timespan = parseInt(weekPref, 10) * 7;

  const today = dayjs(dayjs().format('YYYY-MM-DD')); // Wacky trick to strip time
  const dayFrom = today.day(0).format('YYYY-MM-DD');
  const dayTo = today.day(timespan).format('YYYY-MM-DD');

  const queryClient = useQueryClient();
  const basePath = `https://api.baserow.io/api/database/rows/table/${presencesTableId}/`;

  const queryKey = ['presences', place, dayFrom, dayTo];

  const qs = [
    '?',
    'user_field_names=true',
    `filter__${fields.day}__date_after=${dayFrom}`,
    `filter__${fields.day}__date_before=${dayTo}`,
    `filter__${fields.plan}__equal=${place}`,
    'size=200',
  ].join('&');

  const { data: { results: presences = [] } = {} } = useQuery(
    queryKey,
    async () => {
      const response = await fetch(
        basePath + qs,
        { headers },
      );

      const nextData = await response.json();
      const prevData = queryClient.getQueryData(queryKey);

      if (prevData && Array.isArray(nextData.results)) {
        // Transpose `prevData.results` as object for quicker finding existing items
        const prevResults = prevData.results?.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr }),
          {},
        );

        // Replace unchanged new items with pre-existing items
        nextData.results = nextData.results.map(nextResult => {
          const prevResult = prevResults[nextResult.id] || {};
          const prevHash = JSON.stringify([prevResult.fake, prevResult.spot]);
          const newHash = JSON.stringify([nextResult.fake, nextResult.spot]);

          return prevHash === newHash ? prevResult : nextResult;
        });
      }

      return nextData;
    },
    { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
  );

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
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const updateRow = useMutation(record => fetch(
    `${basePath}${record.id}/?user_field_names=true`,
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

  const createPresence = React.useCallback(
    (date, tri, changes) => {
      const isoDate = date?.format?.('YYYY-MM-DD') || date;

      return createRow.mutate({
        key: `${isoDate}-${cleanTri(tri)}`,
        day: isoDate,
        tri: cleanTri(tri),
        ...changes,
      });
    },
    [createRow],
  );

  const deletePresence = React.useCallback(
    presence => deleteRow.mutate(presence),
    [deleteRow],
  );

  const setPresence = React.useCallback(
    presence => {
      const { id, day, tri, plan, spot } = presence;
      if (id && !spot) {
        return deleteRow.mutate(presence);
      }

      if (id && spot) {
        return updateRow.mutate(presence);
      }

      if (!id && (day && tri && plan && spot)) {
        createPresence(day, tri, { spot, plan });
      }

      return null;
    },
    [createPresence, deleteRow, updateRow],
  );

  return {
    presences,
    setPresence,
    createPresence,
    deletePresence,
    createRow,
    updateRow,
    deleteRow,
  };
};

export default usePresences;
