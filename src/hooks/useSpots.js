import useTable from './useTable';

const useSpots = place => {
  const allSpots = useTable('32973');

  return allSpots
    .filter(({ Plan: [{ value } = {}] = [] }) => value === place);
};

export default useSpots;
