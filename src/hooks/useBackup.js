import { useQuery } from 'react-query';

const { VITE_ARCHIVE_ROOT } = import.meta.env;

const useBackups = () => {
  const { data } = useQuery(
    'backups',
    async () => {
      const response = await fetch(`${VITE_ARCHIVE_ROOT}/liste.json`);
      return response.json();
    },
    {
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60,
      retryDelay: 10 * 1000,
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  return data || [];
};

export default useBackups;
