import { Validator } from 'jsonschema';

const v = new Validator();
const favoriteSchema = {
  id: '/Favorite',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      place: { type: 'string' },
    },
  },
};

export const localStorageSchema = {
  id: '/LocalStorage',
  type: 'object',
  properties: {
    weekPref: { type: 'string' },
    themePref: { type: 'string' },
    pastDays: { type: 'boolean' },
    tri: { type: 'string' },
    agency: { type: 'string' },
    useMaxWidth: { type: 'boolean' },
    dayPrefs: { type: 'array', items: { type: 'string' } },
    VITE_PROJECT_VERSION: { type: 'string' },
    favorites: { $ref: '/Favorite' },
  },
};

v.addSchema(favoriteSchema, '/Favorite');

export default v;
