import useTable from './useTable';

const { VITE_TABLE_ID_PLANS: tableId } = import.meta.env;

const usePlans = () => useTable(tableId);

export default usePlans;
