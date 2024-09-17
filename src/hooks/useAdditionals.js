import useTable from './useTable';

const { VITE_TABLE_ID_ADDITIONALS: tableID } = import.meta.env;

const useAdditionals = placeID => useTable(tableID)
  .filter(({ Plan: [{ id } = {}] = [] }) => id === placeID);

export default useAdditionals;