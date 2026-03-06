/**
 * Centralised persisted state hooks.
 * All localStorage keys are defined here — change in one place.
 */
import createPersistedState from 'use-persisted-state';

export const useTriState = createPersistedState('tri');
export const useWeekPrefs = createPersistedState('weekPref');
export const useDayPrefs = createPersistedState('dayPrefs');
export const useThemePrefs = createPersistedState('themePref');
export const useFavoritesState = createPersistedState('favorites');
export const useAgencyPref = createPersistedState('agency');
export const usePastDays = createPersistedState('pastDays');
export const useMaxWidthState = createPersistedState('useMaxWidth');
export const useLegendState = createPersistedState('legend');
