const { VITE_FEATURE_FLAGS: flags = '*' } = import.meta.env;

export const FF_FULLSCREEN = 'fullScreen';
export const FF_WEEKPREF = 'weekPref';
export const FF_PASTDAYS = 'pastDays';
export const FF_WEEKDAY = 'weekDay';
export const FF_AGENCY = 'agency';
export const FF_FAVORITE = 'favorite';
export const FF_HALFDAY = 'halfDay';
export const FF_COMPLEMENTARY = 'complementayInformation';

const baseFlags = [
  FF_FULLSCREEN,
  FF_WEEKPREF,
  FF_PASTDAYS,
  FF_WEEKDAY,
  FF_AGENCY,
  FF_FAVORITE,
  FF_HALFDAY,
  FF_COMPLEMENTARY,
];

const getFeatureFlags = () => {
  const parsedFlag = flags.split(',');
  const ff = baseFlags.filter(flag => !parsedFlag.includes(`-${flag}`));
  if (parsedFlag.includes('*')) return ff;
  return ff.filter(flag => parsedFlag.includes(flag));
};

const featureFlags = getFeatureFlags();

export const isEnable = flag => featureFlags.includes(flag);
