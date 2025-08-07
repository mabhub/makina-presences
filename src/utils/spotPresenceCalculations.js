/**
 * Utility functions for spot presence calculations
 * Pure functions without side effects
 */

import { sameLowC } from '../helpers';
import { FULLDAY_PERIOD, MORNING_PERIOD, AFTERNOON_PERIOD } from '../constants/periods';

/**
 * Filter spot presences by period
 * @param {Array} spotPresences - Presences for a given spot
 * @returns {Array} [fullDayPresences, morningPresences, afternoonPresences]
 */
export const getPresencesByPeriod = spotPresences => {
  const morningPresences = spotPresences.filter(p => p.period === MORNING_PERIOD);
  const afternoonPresences = spotPresences.filter(p => p.period === AFTERNOON_PERIOD);
  const fullDayPresences = spotPresences.filter(p =>
    !Object.hasOwn(p, 'period')
    || p.period === ''
    || p.period === null
    || p.period === FULLDAY_PERIOD);

  return [fullDayPresences, morningPresences, afternoonPresences];
};

/**
 * Determine user's current period for this spot
 * @param {Array} fullDays - Full day presences
 * @param {Array} mornings - Morning presences
 * @param {Array} afternoons - Afternoon presences
 * @param {string} ownTri - User's trigram
 * @returns {string|undefined} Current period or undefined
 */
export const getCurrentTriPeriod = (fullDays, mornings, afternoons, ownTri) => {
  if (fullDays.some(({ tri }) => tri === ownTri)) return FULLDAY_PERIOD;
  if (mornings.some(({ tri }) => tri === ownTri)) return MORNING_PERIOD;
  if (afternoons.some(({ tri }) => tri === ownTri)) return AFTERNOON_PERIOD;
  return undefined;
};

/**
 * Calculate spot states
 * @param {Object} params - Calculation parameters
 * @returns {Object} Calculated states
 */
export const calculateSpotStates = ({
  blocked,
  presenceFullDay,
  mornings,
  afternoons,
  restFullDay,
  spotPresences,
  spotId,
  ownTri,
  cumul,
}) => {
  const isLocked = Boolean(blocked);
  const isConflict = Boolean(restFullDay.length);
  const isOccupied = Boolean(presenceFullDay || (mornings.length === 1 && afternoons.length === 1));
  const isOwnSpot = spotPresences[spotId]?.some(({ tri }) => sameLowC(tri, ownTri));
  const isCumulative = Boolean(cumul);
  const canClick = Boolean(!isLocked && (!isOccupied || isOwnSpot));

  return {
    isLocked,
    isConflict,
    isOccupied,
    isOwnSpot,
    isCumulative,
    canClick,
  };
};

/**
 * Find user's current presence in a given period
 * @param {Array} presencePeriod - Presences for a period
 * @param {string} ownTri - User's trigram
 * @returns {Object|undefined} Found presence or undefined
 */
export const getCurrentPresence = (presencePeriod, ownTri) =>
  presencePeriod.find(({ tri }) => sameLowC(tri, ownTri));

/**
 * Check if a spot is cumulative
 * @param {string} spotId - Spot identifier
 * @param {Array} cumulativeSpots - List of cumulative spots
 * @returns {boolean} True if the spot is cumulative
 */
export const isCumulativeSpot = (spotId, cumulativeSpots) =>
  cumulativeSpots.map(({ Identifiant }) => Identifiant).includes(spotId);

/**
 * Calculate contextual menu items
 * @param {Object} params - Menu parameters
 * @returns {Array} Contextual menu items
 */
export const getContextualMenuItems = ({
  mornings,
  afternoons,
  fullDays,
  ownTri,
  triPeriod,
  fullDay,
  morningOnly,
  afternoonOnly,
  unsubscribe,
}) => [
  {
    item: 'Journée entière',
    action: fullDay,
    disabled: mornings.filter(({ tri: t }) => !sameLowC(t, ownTri)).length > 0
      || afternoons.filter(({ tri: t }) => !sameLowC(t, ownTri)).length > 0
      || fullDays.filter(({ tri: t }) => sameLowC(t, ownTri)).length === 1,
  },
  { item: 'Matinée uniquement', action: morningOnly, disabled: mornings.length > 0 },
  { item: 'Après-midi uniquement', action: afternoonOnly, disabled: afternoons.length > 0 },
  { item: 'separator', separator: true },
  { item: 'Se désinscrire', action: unsubscribe, disabled: !triPeriod },
];
