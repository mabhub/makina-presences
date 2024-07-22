import useTable from './useTable';

const { VITE_TABLE_ID_SPOTS: tableId } = import.meta.env;

const useSpots = place => {
  const allSpots = useTable(tableId);

  return allSpots
    .filter(({ Plan: [{ value } = {}] = [] }) => value === place);
};

export default useSpots;
