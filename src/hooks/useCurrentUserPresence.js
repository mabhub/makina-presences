import { useMemo } from 'react';
import { sameLowC } from '../helpers';

/**
 * useCurrentUserPresence - Custom hook to find the current user's presence (not cumulative).
 * @param {Array<Object>} todayPresences - Presences for the current day.
 * @param {string} tri - Current tri value.
 * @param {Array<Object>} cumulativeSpot - Array of cumulative spots.
 * @returns {Object|undefined} The current user's presence or undefined.
 */
const useCurrentUserPresence = (todayPresences, tri, cumulativeSpot) =>
  useMemo(() => {
    const cumulativeIds = cumulativeSpot.map(({ Identifiant }) => Identifiant);
    return todayPresences
      .filter(({ spot }) => !cumulativeIds.includes(spot))
      .find(({ tri: t }) => sameLowC(t, tri));
  }, [todayPresences, tri, cumulativeSpot]);

export default useCurrentUserPresence;
