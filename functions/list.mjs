/**
 * Liste les présences actives depuis Baserow
 * @param {Object} deps - Dépendances injectées (pour tests)
 * @returns {Response} Liste des utilisateurs actifs avec leurs TTO/TTR
 */
export const handleList = async (deps) => {
  const { baserowTablePath, baserowHeaders } = deps;

  const response = await fetch(
    [
      `${baserowTablePath}?`,
      'user_field_names=true',
      'include=tri,total,enabled,tto,ttr',
      'size=200',
    ].join('&'),
    { headers: baserowHeaders },
  );

  const data = await response.json();
  const results = data.results
    .filter(({ enabled }) => enabled)
    .map(({ tri, total, tto, ttr }) =>
      ({ tri, total, tto: JSON.parse(tto), ttr: JSON.parse(ttr) }));

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Retourne les dépendances par défaut pour le handler
 * @returns {Object} Configuration Baserow depuis les variables d'environnement
 */
const getDefaultDeps = () => ({
  baserowTablePath: Netlify.env.get('TT_BASEROW_TABLE'),
  baserowHeaders: {
    Authorization: `Token ${Netlify.env.get('TT_BASEROW_TOKEN')}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Handler Netlify Functions (nouvelle API)
 * @param {Request} req - Requête HTTP entrante
 * @param {Object} context - Contexte Netlify
 * @returns {Response} Réponse HTTP
 */
export default async (req, context) => {
  return handleList(getDefaultDeps());
};
