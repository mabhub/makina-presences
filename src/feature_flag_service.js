const { VITE_FEATURE_FLAGS: flags = '*' } = import.meta.env;

export const baseFlags = {
  FF_FULLSCREEN: 'fullScreen',
  FF_WEEKPREF: 'weekPref',
  FF_PASTDAYS: 'pastDays',
  FF_WEEKDAY: 'weekDay',
  FF_AGENCY: 'agency',
  FF_FAVORITE: 'favorite',
  FF_HALFDAY: 'halfDay',
  FF_COMPLEMENTARY: 'complementaryInformation',
};

const getFeatureFlags = () => {
  const parsedFlag = flags.split(',');
  const ff = Object.values(baseFlags).filter(flag => !parsedFlag.includes(`-${flag}`));
  if (parsedFlag.includes('*')) return ff;
  return ff.filter(flag => parsedFlag.includes(flag));
};

const featureFlags = getFeatureFlags();

export const isEnable = flag => featureFlags.includes(flag);
