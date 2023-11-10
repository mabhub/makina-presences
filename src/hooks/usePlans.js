import useTable from './useTable';

const usePlans = () => useTable('32972').filter(({ Brouillon }) => !Brouillon);

export default usePlans;
