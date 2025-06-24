/**
 * Normalize a string: lowercase and trim.
 * @param {string} [str=''] - The string to normalize.
 * @returns {string} Normalized string.
 */
export const nrmlStr = (str = '') => str.toLocaleLowerCase().trim();

/**
 * Compare two strings, case-insensitive and trimmed.
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {boolean} True if equal after normalization.
 */
export const sameLowC = (a, b) => (nrmlStr(a) === nrmlStr(b));

/**
 * Clean a trigram: normalize if <= 3 chars, else trim only.
 * @param {string} str - The trigram string.
 * @returns {string} Cleaned trigram.
 */
export const cleanTri = str => (str.length <= 3 ? nrmlStr(str) : str.trim());

/**
 * Remove duplicates from an array of objects based on a key.
 * @param {Array} collection - The array to deduplicate.
 * @param {string} key - The key to deduplicate by.
 * @param {Function} [customSortFn] - Optional sort function.
 * @returns {Array} Deduplicated array.
 */
export const deduplicate = (collection, key, customSortFn) =>
  (customSortFn ? collection.sort(customSortFn) : collection)
    .reduce((acc, curr) => {
      const { values = new Set(), store = [] } = acc;
      if (values.has(curr[key])) return acc;
      return {
        values: new Set([...values, curr[key]]),
        store: [...store, curr],
      };
    }, {}).store || [];

/**
 * Find duplicate values in an array.
 * @param {Array} arr - The array to check.
 * @returns {Array} Array of duplicate values.
 */
export const findDuplicates = arr => {
  const sortedArr = arr.slice().sort();
  const results = [];
  for (let i = 0; i < sortedArr.length - 1; i += 1) {
    if (sortedArr[i + 1] === sortedArr[i]) {
      results.push(sortedArr[i]);
    }
  }
  return results;
};

/**
 * Snap a value to the nearest multiple.
 * @param {number} value - The value to snap.
 * @param {number} [multiple=5] - The multiple to snap to.
 * @returns {number} Snapped value.
 */
export const snap = (value, multiple = 5) => Math.round(value / multiple) * multiple;

/**
 * Determine if a day card should be displayed in the calendar.
 * @function
 * @param {boolean} isPast - True if the day is in the past.
 * @param {boolean} isHoliday - True if the day is a holiday.
 * @param {string} isoDate - ISO date string (YYYY-MM-DD).
 * @param {boolean} dayIsFavorite - True if the day is a favorite.
 * @param {string} selectedDay - The currently selected day (ISO format).
 * @param {boolean} showPastDays - User preference to show past days.
 * @returns {boolean} True if the card should be displayed.
 * @example
 * displayCard(true, false, '2024-06-01', true, '2024-06-01', true);
 */
export const displayCard = (
  isPast,
  isHoliday,
  isoDate,
  dayIsFavorite,
  selectedDay,
  showPastDays,
) => {
  if (isoDate === selectedDay || isHoliday) return true;
  if (dayIsFavorite && (!isPast || showPastDays || showPastDays === undefined)) return true;
  if (!dayIsFavorite && (showPastDays || showPastDays === undefined) && isPast) return true;
  return false;
};
