/* eslint-disable no-restricted-syntax */

const fetch = async (...args) => {
  const { default: f } = await import('node-fetch');
  return f(...args);
};

const fetchJson = async (...args) => {
  const raw = await fetch(...args);
  return raw.json();
};

const baserowTablePath = process.env.TT_BASEROW_TABLE;
const baserowHeaders = {
  Authorization: `Token ${process.env.TT_BASEROW_TOKEN}`,
  'Content-Type': 'application/json',
};

const bmApiPath = process.env.BM_APIPATH;
const bmDomain = process.env.BM_DOMAIN;
const bmHeaders = {
  'X-BM-ApiKey': process.env.BM_APIKEY,
};

const bmQueryTpl = (uid, query = 'TTO') => (
  {
    containers: [`calendar:Default:${uid}`],
    eventQuery: {
      query,
      dateMin: { precision: 'Date', iso8601: '2022-01-01' },
      dateMax: { precision: 'Date', iso8601: '2022-12-31' },
      size: 100,
    },
  }
);

const parseEvent = event => {
  const { value: { main } } = event;

  const start = new Date(main.dtstart.iso8601);
  const end = new Date(main.dtend.iso8601);

  const delta = end.getTime() - start.getTime();
  const days = Math.ceil(delta / (1000 * 3600 * 24));

  return {
    from: main.dtstart.iso8601,
    days,
  };
};

const parseSearchResult = results => {
  const validResults = results.filter(({ displayName }) => displayName.match(/^TTO.*/));
  return validResults.map(result => parseEvent(result));
};

exports.handler = async () => {
  const { results: cacheTable } = await fetchJson(
    `${baserowTablePath}?user_field_names=true&size=200`,
    { headers: baserowHeaders },
  );

  const cacheUids = cacheTable.map(({ uid }) => uid).filter(Boolean);

  const allUids = await fetchJson(
    `${bmApiPath}users/${bmDomain}/_alluids`,
    { headers: bmHeaders },
  );

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
  const limit = pLimit(5);

  const processUid = async uid => {
    const results = await fetchJson(
      `${bmApiPath}calendars/_search`,
      {
        headers: { ...bmHeaders, 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(bmQueryTpl(uid, 'TTO')),
      },
    );

    const days = parseSearchResult(results);
    const total = days.reduce((acc, { days: d = 0 }) => (acc + d), 0);

    const { updated, order, ...record } = cacheTable.find(({ uid: tUid }) => (tUid === uid));

    if (JSON.stringify(days, null, 2) === record['tt-dates']) {
      // Data did not change: early return.
      console.info(`No change on ${record.tri} data: skip update.`);
      return;
    }

    console.info(`Do ${record.tri} update !!`);

    const body = JSON.stringify({
      id: record.id,
      'tt-dates': JSON.stringify(days, null, 2),
      'last-check': new Date().toISOString(),
      total,
    });

    const response = await fetch(
      `${baserowTablePath}${record.id}?user_field_names=true`,
      { headers: baserowHeaders, method: 'PATCH', body },
    );

    if (response.status !== 200) {
      const errorContent = await response.json();
      process.stderr.write(JSON.stringify(errorContent, null, 2));
    }
  };

  const pipe = enabledUids.map(({ uid }) => limit(() => processUid(uid)));
  await Promise.all(pipe);

  return {
    statusCode: 200,
    body: JSON.stringify({ updateCount: enabledUids.length }),
  };
};
