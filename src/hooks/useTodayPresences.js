import { useMemo } from 'react';

/**
 * useTodayPresences - Custom hook to filter presences for a given day.
 * @param {string} isoDate - ISO date string (YYYY-MM-DD).
 * @param {Array<Object>} presences - Array of presences.
 * @returns {Array<Object>} Presences for the given day.
 */
const useTodayPresences = (isoDate, presences) =>
  useMemo(() => presences.filter(({ day }) => day === isoDate), [isoDate, presences]);

export default useTodayPresences;
