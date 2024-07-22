import useTable from './useTable';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useSpots = place => {
  const allSpots = useTable(Number(spotsTableId));

  return allSpots
    .filter(({ Plan: [{ value } = {}] = [] }) => value === place);
};

export default useSpots;
