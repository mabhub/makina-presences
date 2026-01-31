/* eslint-disable no-restricted-syntax */
const DAYS = 'MO,TU,WE,TH,FR,SA,SU'.split(',');

const defaultFetch = async (...args) => {
  const { default: f } = await import('node-fetch');
  return f(...args);
};

/**
 * Crée une fonction fetchJson à partir d'une fonction fetch donnée
 * @param {Function} fetchFn - La fonction fetch à utiliser
 * @returns {Function} Une fonction qui fait un fetch et parse le JSON
 */
const createFetchJson = (fetchFn) => async (...args) => {
  const raw = await fetchFn(...args);
  return raw.json();
};

/**
 * Retourne les dépendances par défaut pour le handler.
 * Permet l'injection de dépendances pour les tests.
 * @returns {Object} Les dépendances (config, fonctions fetch, etc.)
 */
const getDefaultDeps = () => {
  const fetch = defaultFetch;
  const fetchJson = createFetchJson(fetch);

  return {
    fetch,
    fetchJson,
    baserowTablePath: process.env.TT_BASEROW_TABLE,
    baserowHeaders: {
      Authorization: `Token ${process.env.TT_BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    bmApiPath: process.env.BM_APIPATH,
    bmDomain: process.env.BM_DOMAIN,
    bmHeaders: {
      'X-BM-ApiKey': process.env.BM_APIKEY,
    },
  };
};

/**
 * Génère la plage de dates pour l'année calendaire en cours au format ISO 8601.
 * Utilise UTC pour éviter les problèmes de fuseau horaire aux limites d'année.
 * @returns {{ dateMin: { precision: string, iso8601: string }, dateMax: { precision: string, iso8601: string } }}
 */
const getCurrentYearDateRange = () => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();

  return {
    dateMin: { precision: 'Date', iso8601: `${currentYear}-01-01` },
    dateMax: { precision: 'Date', iso8601: `${currentYear}-12-31` },
  };
};

// Export functions for testing
exports.getCurrentYearDateRange = getCurrentYearDateRange;

const getTTO = results => {
  const validResults = results.filter(({ displayName }) => displayName.match(/^TTO.*/i));
  return validResults.map(({ value: { main } }) => {
    const start = new Date(main.dtstart.iso8601);
    const end = new Date(main.dtend.iso8601);

    const delta = end.getTime() - start.getTime();
    const days = Math.ceil(delta / (1000 * 3600 * 24));

    return {
      from: main.dtstart.iso8601,
      days,
    };
  });
};

// Export functions for testing
exports.getTTO = getTTO;

const getTTR = results => {
  const validResults = results.filter(({ displayName }) => displayName.match(/^TTR.*/i));

  return validResults
    .filter(({ value: { main } }) => {
      // Keep only recurring events
      if (!main?.rrule) {
        return false;
      }

      // Keep only (recurring) event including "today"
      const start = new Date(main.dtstart.iso8601).getTime();
      const end = main.rrule.until ? new Date(main.rrule.until.iso8601).getTime() : Infinity;
      const now = new Date().getTime();

      return (start < now && now < end);
    })
    .map(({ value: { main } }) => { // Return an array of { day, len }
      const start = new Date(main.dtstart.iso8601);
      const end = new Date(main.dtend.iso8601);

      const delta = end.getTime() - start.getTime();
      const days = Math.ceil(delta / (1000 * 3600 * 24));

      return main.rrule.byDay?.map(({ day }) => ({ day, len: days }));
    })
    .flat()
    .reduce((acc, { day, len } = {}) => {
      const first = DAYS.indexOf(day);
      return [...acc, ...[...Array(len)].map((_, index) => ((first + index) % 7))];
    }, [])
    .sort();
};

// Export functions for testing
exports.getTTR = getTTR;
exports.getDefaultDeps = getDefaultDeps;

exports.handler = async (deps = getDefaultDeps()) => {
  const {
    fetch,
    fetchJson,
    baserowTablePath,
    baserowHeaders,
    bmApiPath,
    bmDomain,
    bmHeaders,
  } = deps;

  const { results: cacheTable } = await fetchJson(
    `${baserowTablePath}?user_field_names=true&size=200`,
    { headers: baserowHeaders },
  );

  const cacheUids = cacheTable.map(({ uid }) => uid).filter(Boolean);

  const allUids = await fetchJson(
    `${bmApiPath}users/${bmDomain}/_alluids`,
    { headers: bmHeaders },
  );

  const updates = [];

  /**
   * Create new entries
   */
  for await (const uid of allUids) {
    if (!cacheUids.includes(uid)) {
      const { displayName, value: { login } } = await fetchJson(
        `${bmApiPath}users/${bmDomain}/${uid}/complete`,
        { headers: bmHeaders },
      );

      const record = {
        tri: login,
        name: displayName,
        uid,
      };

      await fetch(
        `${baserowTablePath}?user_field_names=true`,
        { headers: baserowHeaders, method: 'POST', body: JSON.stringify(record) },
      );
    }
  }

  const enabledUids = cacheTable
    .filter(({ enabled }) => enabled);
    // .filter(({ 'last-check': last }) => {
    //   const then = (new Date(last)).getTime();
    //   const now = Date.now();
    //   return (now - then) > 3600 * 1000;
    // });

  /**
   * Do calendar search
   */
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(7);

  const processUid = async uid => {
    const results = await fetchJson(
      `${bmApiPath}calendars/_search`,
      {
        headers: { ...bmHeaders, 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          containers: [`calendar:Default:${uid}`],
          eventQuery: {
            query: 'TTO || TTR',
            ...getCurrentYearDateRange(),
            size: 100,
          },
        }),
      },
    );

    const data = {};

    if (results.errorCode) {
      data.error = results;
    } else {
      data.tto = getTTO(results);
      data.ttr = Array.from(new Set(getTTR(results)));
    }

    const { updated, order, ...record } = cacheTable.find(({ uid: tUid }) => (tUid === uid));

    if (
      JSON.stringify(data.tto, null, 2) === record.tto
      && JSON.stringify(data.ttr) === record.ttr
      && !data.error
    ) {
      // Data did not change: early return.
      // console.info(`No change on ${record.tri} data: skip update.`);
      return;
    }

    // console.info(`Do ${record.tri} update !!`);
    updates.push(record.tri);

    const body = JSON.stringify({
      id: record.id,
      tto: JSON.stringify((data.tto || []), null, 2),
      total: (data.tto || []).reduce((acc, { days: d = 0 }) => (acc + d), 0),
      ttr: JSON.stringify(data.ttr || []),
      'last-check': new Date().toISOString(),
      log: data?.error?.message,
    });

    const response = await fetch(
      `${baserowTablePath}${record.id}/?user_field_names=true`,
      { headers: baserowHeaders, method: 'PATCH', body },
    );

    if (response.status !== 200) {
      const errorContent = await response.text();
      process.stderr.write(errorContent);
    }
  };

  const pipe = enabledUids.map(({ uid }) => limit(() => processUid(uid)));
  await Promise.all(pipe);

  return {
    statusCode: 200,
    body: JSON.stringify(updates),
  };
};
