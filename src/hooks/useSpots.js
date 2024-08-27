import useTable from './useTable';

const { VITE_TABLE_ID_SPOTS: spotsTableId } = import.meta.env;

const useSpots = placeID => {
  const allSpots = useTable(Number(spotsTableId));

  return allSpots
    .filter(({ Plan: [{ id } = {}] = [] }) => id === placeID && placeID !== undefined);
};

export default useSpots;
