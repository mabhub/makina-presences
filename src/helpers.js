export const nrmlStr = (str = '') => str.toLocaleLowerCase().trim();

export const sameLowC = (a, b) => (nrmlStr(a) === nrmlStr(b));

export const cleanTri = str => (str.length <= 3 ? nrmlStr(str) : str.trim());
