// Get feature flags from environment variable, default to '*'
const { VITE_FEATURE_FLAGS: flags = '*' } = import.meta.env;

/**
 * List of all available feature flags.
 * @type {Object<string, string>}
 */
export const baseFlags = {
  FF_FULLSCREEN: 'fullScreen',
  FF_WEEKPREF: 'weekPref',
  FF_PASTDAYS: 'pastDays',
  FF_WEEKDAY: 'weekDay',
  FF_AGENCY: 'agency',
  FF_FAVORITE: 'favorite',
  FF_HALFDAY: 'halfDay',
  FF_COMPLEMENTARY: 'complementaryInformation',
  FF_PARKING: 'parking',
};

/**
 * Parse and return the list of enabled feature flags.
 * Supports disabling a flag with a '-' prefix and enabling all with '*'.
 * @returns {string[]} Array of enabled feature flag names.
 */
const getFeatureFlags = () => {
  // Split and trim flags, filter out empty strings
  const parsedFlags = flags.split(',').map(f => f.trim()).filter(Boolean);
  // Remove flags explicitly disabled with a '-' prefix
  const enabledFlags = Object.values(baseFlags).filter(flag => !parsedFlags.includes(`-${flag}`));
  // If '*' is present, enable all except those explicitly disabled
  if (parsedFlags.includes('*')) return enabledFlags;
  // Otherwise, enable only those explicitly listed and not disabled
  return enabledFlags.filter(flag => parsedFlags.includes(flag));
};

/**
 * Cached list of enabled feature flags.
 * @type {string[]}
 */
const featureFlags = getFeatureFlags();

/**
 * Check if a feature flag is enabled.
 * @param {string} flag - The feature flag name (value from baseFlags).
 * @returns {boolean} True if enabled, false otherwise.
 */
export const isEnable = flag => featureFlags.includes(flag);
