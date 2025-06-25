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
 * Clean a trigram: normalize if trimmed length <= 3, else trim only.
 * @param {string} str - The trigram string.
 * @returns {string} Cleaned trigram.
 * @note The normalization is applied only if the trimmed string length is <= 3.
 */
export const cleanTri = str => (str.trim().length <= 3 ? nrmlStr(str) : str.trim());

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
 * Compute the number of days to display in the calendar based on user preference.
 * @param {string|number} pref - User preference (should be 1, 2, 3 or any other value).
 * @returns {number} Number of days to display.
 */
export const getTimespan = pref => {
  const prefNum = parseInt(pref, 10);
  if ([1, 2, 3].includes(prefNum)) {
    return prefNum * 7;
  }
  return 14;
};

/**
 * Determines if a day card should be displayed in the calendar.
 *
 * Business rules:
 * - Always show if the day is selected or is a holiday.
 * - Show if it's a favorite day and either not in the past or user wants to see past days.
 * - Show if not favorite, in the past, and user wants to see past days.
 * - Otherwise, do not show.
 *
 * @param {Object} params - Parameters object.
 * @param {boolean} [params.isPast=false] - True if the day is in the past.
 * @param {boolean} [params.isHoliday=false] - True if the day is a holiday.
 * @param {string} params.isoDate - ISO date string (YYYY-MM-DD).
 * @param {boolean} [params.dayIsFavorite=false] - True if the day is a favorite.
 * @param {string} params.selectedDay - The currently selected day (ISO format).
 * @param {boolean} [params.showPastDays=true] - User preference to show past days.
 * @returns {boolean} True if the card should be displayed.
 */
export const displayCard = ({
  isPast = false,
  isHoliday = false,
  isoDate,
  dayIsFavorite = false,
  selectedDay,
  showPastDays = true,
}) => {
  // Show if the day is selected
  if (isoDate === selectedDay) return true;

  // Show if it's a holiday
  if (isHoliday) return true;

  // Show if it's a favorite day and either not in the past or user wants to see past days
  if (dayIsFavorite && (!isPast || showPastDays)) return true;

  // Show if not favorite, but in the past and user wants to see past days
  if (!dayIsFavorite && isPast && showPastDays) return true;

  // Otherwise, do not show
  return false;
};

/**
 * Checks if a spot is cumulative (parking).
 * @param {string} spotId - The spot identifier to check.
 * @param {Array<Object>} spots - The array of all spots.
 * @returns {boolean} True if the spot is cumulative.
 */
export const isCumulativeSpot = (spotId, spots) =>
  spots.filter(({ Cumul }) => Cumul).some(({ Identifiant }) => Identifiant === spotId);

/**
 * Creates a new spot at the given event position.
 *
 * This function sends a POST request to the Baserow API to create a new spot
 * at the coordinates of the mouse event. The coordinates are snapped to a 5px grid.
 *
 * @param {MouseEvent} e - The mouse event (typically from a click on the plan).
 * @param {Object} options - Options object.
 * @param {string} options.spotsTableId - Table ID for spots (from env).
 * @param {string} options.token - API token (from env).
 * @returns {Promise<void>} Resolves when the spot is created.
 * @throws {Error} If the API call fails or the response is not OK.
 */
export const createSpot = async (e, {
  spotsTableId = import.meta.env.VITE_TABLE_ID_SPOTS,
  token,
}) => {
  try {
    const rect = e.target.getBoundingClientRect();
    const response = await fetch(
      `https://api.baserow.io/api/database/rows/table/${spotsTableId}/?user_field_names=true`,
      {
        method: 'POST',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Identifiant: 'PX',
          x: Math.round((e.clientX - rect.left) / 5) * 5,
          y: Math.round((e.clientY - rect.top) / 5) * 5,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to create spot: ${response.status}`);
    }
  } catch (err) {
    // Log technical error for dev/ops
    // eslint-disable-next-line no-console
    console.error('createSpot error:', err);
    throw err;
  }
};
