/**
 * Custom hook for managing spot presence logic
 * Encapsulates all calculations and actions related to presences
 */

import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import createPersistedState from 'use-persisted-state';

import { sameLowC } from '../helpers';
import usePresences from './usePresences';
import usePlan from './usePlan';
import useSpots from './useSpots';
import { FULLDAY_PERIOD, MORNING_PERIOD, AFTERNOON_PERIOD } from './constants/periods';
import {
  getPresencesByPeriod,
  getCurrentTriPeriod,
  calculateSpotStates,
  getCurrentPresence,
  isCumulativeSpot as checkIsCumulativeSpot,
  getContextualMenuItems,
} from '../utils/spotPresenceCalculations';

const useTriState = createPersistedState('tri');

/**
 * Spot presence logic hook
 * @param {Object} spot - Spot data
 * @param {Function} onConflict - Conflict handling callback
 * @returns {Object} State and actions for presences
 */
const useSpotPresenceLogic = (spot, onConflict) => {
  const [ownTri] = useTriState('');
  const { place, day = dayjs().format('YYYY-MM-DD') } = useParams();

  const currentPlan = usePlan({ Name: place });
  const currentPlanUuid = currentPlan?.uuid;

  const spots = useSpots(place);
  const cumulativeSpots = spots.filter(({ Cumul }) => Cumul);

  const isCumulativeSpot = useCallback(
    identifiant => checkIsCumulativeSpot(identifiant, cumulativeSpots),
    [cumulativeSpots],
  );

  const { presences, setPresence, deletePresence } = usePresences(place);

  // Memoize day presences filtering for performance
  const dayPresences = useMemo(
    () => presences.filter(presence => presence.day === day),
    [presences, day],
  );

  // Calculate presences by spot
  const spotPresences = useMemo(
    () => dayPresences.reduce((acc, { spot: s, ...presence }) => ({
      ...acc,
      [s]: [...(acc[s] || []), presence],
    }), {}),
    [dayPresences],
  );

  const { Bloqué: blocked, Identifiant: spotId, Cumul } = spot;

  // Calculate presences by period for this spot
  const [fullDays, mornings, afternoons] = useMemo(
    () => {
      const spotIdPresences = spotPresences[spotId] || [];
      return getPresencesByPeriod(spotIdPresences);
    },
    [spotPresences, spotId],
  );

  const [presenceFullDay] = fullDays;

  const restFullDay = useMemo(
    () => fullDays?.slice(1) || [],
    [fullDays],
  );

  // User's current period
  const triPeriod = useMemo(
    () => getCurrentTriPeriod(fullDays, mornings, afternoons, ownTri),
    [fullDays, mornings, afternoons, ownTri],
  );

  // Calculated states
  const states = useMemo(
    () => calculateSpotStates({
      blocked,
      presenceFullDay,
      mornings,
      afternoons,
      restFullDay,
      spotPresences,
      spotId,
      ownTri,
      cumul: Cumul,
    }),
    [
      blocked,
      presenceFullDay,
      mornings,
      afternoons,
      restFullDay,
      spotPresences,
      spotId,
      ownTri,
      Cumul,
    ],
  );

  // Conflict handling
  const handleConflict = useCallback(
    (value, tri) => onConflict(value, tri, spotId),
    [onConflict, spotId],
  );

  useEffect(() => {
    if (states.isConflict && restFullDay.some(({ tri }) => sameLowC(ownTri, tri))) {
      handleConflict(
        states.isConflict,
        fullDays.find(({ tri: t }) => ownTri !== t)?.tri,
      );
    }
  }, [fullDays, handleConflict, states.isConflict, ownTri, restFullDay]);

  // Actions on presences
  const removePresence = useCallback(period => {
    if (period === FULLDAY_PERIOD) deletePresence(getCurrentPresence(fullDays, ownTri));
    if (period === MORNING_PERIOD) deletePresence(getCurrentPresence(mornings, ownTri));
    if (period === AFTERNOON_PERIOD) deletePresence(getCurrentPresence(afternoons, ownTri));
  }, [fullDays, mornings, afternoons, ownTri, deletePresence]);

  const unsubscribe = useCallback(() => {
    removePresence(triPeriod);
  }, [removePresence, triPeriod]);

  const handleClick = useCallback(p => {
    if ((!states.isOccupied && !states.isLocked) || triPeriod) {
      const [firstId, ...extraneous] = dayPresences
        ?.filter(({ tri: t }) => sameLowC(t, ownTri)) // Keep only own points
        .filter(({ spot: s }) => !isCumulativeSpot(s)) // Keep only non cumulative
        .filter(() => !states.isCumulative)
        .map(({ id }) => id) || [];

      setPresence({
        id: firstId,
        day,
        tri: ownTri,
        spot: spotId,
        plan: place,
        presencePlan: currentPlanUuid ? [currentPlanUuid] : undefined,
        period: p,
      });
      extraneous.forEach(i => deletePresence({ id: i }));
    }

    const [previousPeriod = FULLDAY_PERIOD] = dayPresences
      .filter(({ spot: s }) => !isCumulativeSpot(s))
      .filter(({ tri: t }) => sameLowC(t, ownTri))
      .map(({ period }) => period);

    if (states.isOwnSpot && previousPeriod === p) {
      return unsubscribe();
    }

    return null;
  }, [
    states.isOccupied,
    states.isLocked,
    states.isCumulative,
    states.isOwnSpot,
    triPeriod,
    dayPresences,
    ownTri,
    isCumulativeSpot,
    setPresence,
    deletePresence,
    day,
    spotId,
    place,
    unsubscribe,
  ]);

  const fullDay = useCallback(() => {
    handleClick(FULLDAY_PERIOD);
  }, [handleClick]);

  const morningOnly = useCallback(() => {
    handleClick(MORNING_PERIOD);
  }, [handleClick]);

  const afternoonOnly = useCallback(() => {
    handleClick(AFTERNOON_PERIOD);
  }, [handleClick]);

  // Contextual menu items
  const contextualMenuItems = useMemo(
    () => getContextualMenuItems({
      mornings,
      afternoons,
      fullDays,
      ownTri,
      triPeriod,
      fullDay,
      morningOnly,
      afternoonOnly,
      unsubscribe,
    }),
    [
      mornings,
      afternoons,
      fullDays,
      ownTri,
      triPeriod,
      fullDay,
      morningOnly,
      afternoonOnly,
      unsubscribe,
    ],
  );

  return {
    // Data
    spotPresences,
    fullDays,
    mornings,
    afternoons,
    presenceFullDay,
    restFullDay,
    triPeriod,
    dayPresences,

    // Calculated states
    ...states,

    // Action functions
    handleClick,
    handleConflict,
    removePresence,
    unsubscribe,
    fullDay,
    morningOnly,
    afternoonOnly,
    isCumulativeSpot,

    // UI
    contextualMenuItems,

    // User data
    ownTri,
    place,
    day,
  };
};

export default useSpotPresenceLogic;
