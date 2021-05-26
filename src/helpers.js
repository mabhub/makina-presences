export const asDayRef = date => (
  date.year() * 1000 + date.dayOfYear()
);

export const nrmlStr = (str = '') => str.toLocaleLowerCase().trim();

export const sameLowC = (a, b) => (nrmlStr(a) === nrmlStr(b));
