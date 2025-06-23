import useTable from './useTable';

const { VITE_TABLE_ID_ADDITIONALS: tableID } = import.meta.env;

/**
 * React hook to get additional information for a given place.
 * Filters the additionals table by the provided place name.
 *
 * @function
 * @param {string} place - The name of the place to filter additionals.
 * @returns {Array<Object>} Array of additional information objects for the place.
 */
const useAdditionals = place => useTable(tableID)
  .filter(({ Plan: [{ value } = {}] = [] }) => value === place);

export default useAdditionals;
