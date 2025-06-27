import { useMemo } from 'react';

/**
 * useFavoriteDay - Custom hook to check if a day is a favorite.
 * @param {string} dayLabel - The label of the day (e.g. 'L', 'M', etc.).
 * @param {Array<string>} dayPrefs - Array of favorite day labels.
 * @returns {boolean} True if the day is a favorite.
 */
const useFavoriteDay = (dayLabel, dayPrefs) =>
  useMemo(() => dayPrefs?.some(d => d === dayLabel) ?? false, [dayLabel, dayPrefs]);

export default useFavoriteDay;
