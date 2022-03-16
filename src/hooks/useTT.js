import { useQuery } from 'react-query';

const useTT = () => useQuery(
  'tt',
  async () => {
    const response = await fetch('/.netlify/functions/list');
    const nextData = await response.json();
    return nextData;
  },
  { staleTime: 60000, refetchInterval: 60000, retryDelay: 10000 },
);

export default useTT;
