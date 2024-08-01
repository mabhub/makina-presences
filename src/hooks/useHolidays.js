import { useQuery } from 'react-query';

const useHolidays = () => {
  const { data } = useQuery(
    'holidays',
    async () => {
      const response = await fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json');
      return response.json();
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  return data || {};
};

export default useHolidays;
