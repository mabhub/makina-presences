import useTable from './useTable';

const { VITE_TABLE_ID_ADDITIONALS: tableID } = import.meta.env;

const useAdditionals = place => useTable(tableID)
  .filter(({ Plan: [{ value } = {}] = [] }) => value === place);

export default useAdditionals;
