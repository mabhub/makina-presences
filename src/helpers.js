export const nrmlStr = (str = '') => str.toLocaleLowerCase().trim();

export const sameLowC = (a, b) => (nrmlStr(a) === nrmlStr(b));
