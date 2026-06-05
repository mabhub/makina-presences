/* eslint-disable no-restricted-syntax */
import { wrapWithSentry } from './sentry.mjs';
import fetchWithTimeout from './utils.mjs';

const DAYS = 'MO,TU,WE,TH,FR,SA,SU'.split(',');

const BLUEMING_TIMEOUT_MS = 8000;

/**
 * Crée une fonction fetchJson à partir d'une fonction fetch donnée.
 * Applique un timeout via AbortController et vérifie response.ok.
 * @param {Function} fetchFn - La fonction fetch à utiliser
 * @param {number} timeoutMs - Timeout en millisecondes (défaut BLUEMING_TIMEOUT_MS)
 * @returns {Function} Une fonction qui fait un fetch avec timeout et parse le JSON
 */
export const createFetchJson = (fetchFn, timeoutMs = BLUEMING_TIMEOUT_MS) => {
  /**
   * @param {string} url - URL to fetch
   * @param {RequestInit} [options] - Fetch options
   * @returns {Promise<unknown>} Parsed JSON response
   */
  return async (url, options) => {
    const raw = await fetchWithTimeout(url, options ?? {}, timeoutMs, fetchFn);
    if (!raw.ok) {
      throw new Error(`HTTP ${raw.status}`);
    }
    return raw.json();
  };
};

/**
 * Retourne les dépendances par défaut pour le handler.
 * Permet l'injection de dépendances pour les tests.
 * @returns {Object} Les dépendances (config, fonctions fetch, etc.)
 */
const getDefaultDeps = () => {
  const fetchJson = createFetchJson(fetch);

  return {
    fetch,
    fetchJson,
    baserowTablePath: Netlify.env.get('TT_BASEROW_TABLE'),
    baserowHeaders: {
      Authorization: `Token ${Netlify.env.get('TT_BASEROW_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    bmApiPath: Netlify.env.get('BM_APIPATH'),
    bmDomain: Netlify.env.get('BM_DOMAIN'),
    bmHeaders: {
      'X-BM-ApiKey': Netlify.env.get('BM_APIKEY'),
    },
  };
};

/**
 * Génère la plage de dates pour l'année calendaire en cours au format ISO 8601.
 * Utilise UTC pour éviter les problèmes de fuseau horaire aux limites d'année.
 * @returns {{ dateMin: { precision: string, iso8601: string }, dateMax: { precision: string, iso8601: string } }} Date range object for the current year
 */
export const getCurrentYearDateRange = () => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();

  return {
    dateMin: { precision: 'Date', iso8601: `${currentYear}-01-01` },
    dateMax: { precision: 'Date', iso8601: `${currentYear}-12-31` },
  };
};

const DAY_MS = 1000 * 3600 * 24;

// Hard cap on expansion iterations: a safety net against malformed rrules.
// The real bound is always `yearEnd`; a daily recurrence over a year is ~366.
const MAX_ITER = 400;

// Frequencies the expander knows how to unroll. Others are counted as a single
// master occurrence and logged, so we never silently undercount.
const HANDLED_FREQUENCIES = new Set(['DAILY', 'WEEKLY']);

/**
 * Extract a stable calendar-date key "YYYY-MM-DD" from a BmDateTime.
 * Slices the raw ISO string rather than reinterpreting it, so a `Date`
 * precision value ('2026-09-04') and a `DateTime` value
 * ('2026-09-04T00:00:00Z') yield the same key. Never compare exdate/recurid
 * via getTime() — TTO/TTR are whole days, compared on the calendar date.
 *
 * @param {{ iso8601?: string }} [bmDateTime] - A BlueMind BmDateTime object
 * @returns {string} The "YYYY-MM-DD" key, or '' when absent
 */
export const toDateKey = bmDateTime => (bmDateTime?.iso8601 ?? '').slice(0, 10);

/**
 * Compute the duration in whole days between two BmDateTime values.
 * Mirrors the legacy getTTO calculation; always at least 1 day.
 * @param {{ iso8601: string }} dtstart - Start
 * @param {{ iso8601: string }} dtend - End
 * @returns {number} Number of days (>= 1)
 */
const durationInDays = (dtstart, dtend) => {
  const delta = new Date(dtend.iso8601).getTime() - new Date(dtstart.iso8601).getTime();
  return Math.max(Math.ceil(delta / DAY_MS), 1);
};

/**
 * Build the ISO string for a calendar date at UTC midnight.
 * @param {number} ms - Epoch milliseconds
 * @returns {string} ISO 8601 string
 */
const isoAtUtcMidnight = ms => {
  const d = new Date(ms);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
};

/**
 * Map a BlueMind weekday code (MO..SU, Monday-first) to a JS getUTCDay()
 * index (SU=0..SA=6).
 * @param {string} code - Weekday code
 * @returns {number} JS day index 0..6
 */
const weekdayCodeToJsDay = code => (DAYS.indexOf(code) + 1) % 7;

/**
 * Expand a single TTO series into atomic occurrences `[{ from, days }]`.
 *
 * Handles DAILY/WEEKLY recurrences with interval/byDay/count/until, bounded by
 * the calendar year end. Subtracts `main.exdate`, applies exception
 * occurrences (moved/shortened/cancelled) matched on `recurid`. `count`
 * counts actually-posted days (exdate and cancelled exceptions do not consume
 * it). Unhandled frequencies (MONTHLY/YEARLY/...) yield the master occurrence
 * and push a warning.
 *
 * @param {Object} eventSeries - A VEventSeries: { displayName, value: { main, occurrences } }
 * @param {Object} options - Options
 * @param {number} options.yearEnd - Epoch ms of the calendar year end (hard upper bound)
 * @param {string[]} options.warnings - Mutable array collecting unhandled-frequency warnings
 * @returns {Array<{ from: string, days: number }>} Atomic occurrences sorted by date
 */
/**
 * Generate the candidate recurrence dates (epoch ms at the targeted days) for a
 * handled rrule, in ascending order, bounded by [startMs, hardEnd]. Pure
 * mechanics: applies frequency, interval and byDay but knows nothing about
 * exdate, exceptions or count.
 *
 * @param {Object} rrule - The BlueMind RRule (frequency DAILY or WEEKLY)
 * @param {number} startMs - Series start, epoch ms
 * @param {number} hardEnd - Upper bound (min of until and year end), epoch ms
 * @returns {number[]} Candidate dates as epoch ms, sorted ascending
 */
const generateRecurrenceDates = (rrule, startMs, hardEnd) => {
  const interval = rrule.interval ?? 1;
  // WEEKLY with byDay targets specific weekdays; otherwise the dtstart weekday.
  const targetJsDays = rrule.frequency === 'WEEKLY' && rrule.byDay?.length
    ? rrule.byDay.map(({ day }) => weekdayCodeToJsDay(day)).toSorted((a, b) => a - b)
    : null;

  const dates = [];
  let cursor = startMs;
  let safety = 0;

  while (cursor <= hardEnd && safety < MAX_ITER) {
    safety += 1;

    if (rrule.frequency === 'DAILY') {
      dates.push(cursor);
      cursor += interval * DAY_MS;
    } else if (targetJsDays) {
      const weekStart = cursor - ((new Date(cursor).getUTCDay() + 6) % 7) * DAY_MS;
      const weekDates = targetJsDays
        .map(jsDay => weekStart + ((jsDay + 6) % 7) * DAY_MS)
        .filter(dateMs => dateMs >= startMs && dateMs <= hardEnd);
      dates.push(...weekDates);
      cursor = weekStart + 7 * interval * DAY_MS;
    } else {
      dates.push(cursor);
      cursor += 7 * interval * DAY_MS;
    }
  }

  return dates.toSorted((a, b) => a - b);
};

/**
 * Resolve a candidate recurrence date into a concrete occurrence, applying the
 * matching exception. Yields null when the occurrence is cancelled (so the
 * caller can drop it without consuming the count).
 *
 * @param {number} dateMs - Candidate date, epoch ms
 * @param {Object|undefined} exception - Matching VEventOccurrence, if any
 * @param {number} masterDays - Default occurrence length in days
 * @returns {{ from: string, days: number }|null} The occurrence, or null if cancelled
 */
const resolveOccurrence = (dateMs, exception, masterDays) => {
  if (!exception) {
    return { from: isoAtUtcMidnight(dateMs), days: masterDays };
  }

  if (exception.status === 'Cancelled') {
    return null;
  }

  const from = exception.dtstart?.iso8601 ?? isoAtUtcMidnight(dateMs);
  const days = exception.dtstart && exception.dtend
    ? durationInDays(exception.dtstart, exception.dtend)
    : masterDays;

  return { from, days };
};

export const expandTtoSeries = (eventSeries, { yearEnd, warnings }) => {
  const { displayName, value: { main, occurrences = [] } = {} } = eventSeries;
  const { rrule } = main;

  const masterDays = durationInDays(main.dtstart, main.dtend);
  const masterOccurrence = { from: main.dtstart.iso8601, days: masterDays };

  if (!rrule) {
    return [masterOccurrence];
  }

  if (!HANDLED_FREQUENCIES.has(rrule.frequency)) {
    warnings.push(`${displayName}: fréquence ${rrule.frequency} non gérée, comptée comme occurrence unique`);
    return [masterOccurrence];
  }

  const startMs = new Date(main.dtstart.iso8601).getTime();
  const untilMs = rrule.until ? new Date(rrule.until.iso8601).getTime() : Infinity;
  const hardEnd = Math.min(untilMs, yearEnd);
  const maxCount = rrule.count ?? Infinity;

  const exdateKeys = new Set((main.exdate ?? []).map(bmDate => toDateKey(bmDate)));
  const exceptionByKey = new Map(occurrences.map(occ => [toDateKey(occ.recurid), occ]));

  const results = generateRecurrenceDates(rrule, startMs, hardEnd)
    // Deleted occurrences: dropped, do not consume the count.
    .filter(dateMs => !exdateKeys.has(toDateKey({ iso8601: isoAtUtcMidnight(dateMs) })))
    .map(dateMs => {
      const key = toDateKey({ iso8601: isoAtUtcMidnight(dateMs) });
      return resolveOccurrence(dateMs, exceptionByKey.get(key), masterDays);
    })
    // Cancelled occurrences (null): dropped, do not consume the count.
    .filter(Boolean)
    .slice(0, maxCount === Infinity ? undefined : maxCount);

  return results.toSorted(({ from: a }, { from: b }) => a.localeCompare(b));
};

/**
 * Build the calendar-year-end epoch ms (UTC) for the year of `now`.
 * Mirrors the UTC reasoning of getCurrentYearDateRange.
 * @param {number} now - Reference epoch ms
 * @returns {number} Epoch ms of Dec 31 23:59:59.999 UTC of that year
 */
const yearEndMs = now => Date.UTC(new Date(now).getUTCFullYear(), 11, 31, 23, 59, 59, 999);

/**
 * Collect every TTO occurrence for a user, expanding recurring series.
 * Filters events whose displayName starts with "TTO", expands each series via
 * expandTtoSeries (handling rrule/exdate/exceptions), flattens and sorts by date.
 *
 * @param {Array} results - Raw VEventSeries from the BlueMind _search
 * @param {Object} [options] - Options
 * @param {number} [options.now] - Reference time (defaults to Date.now())
 * @param {string[]} [options.warnings] - Mutable array collecting unhandled-frequency warnings
 * @returns {Array<{ from: string, days: number }>} Atomic occurrences sorted by date
 */
export const getTTO = (results, { now = Date.now(), warnings = [] } = {}) => {
  const yearEnd = yearEndMs(now);

  return results
    .filter(({ displayName }) => displayName.match(/^TTO.*/i))
    .flatMap(eventSeries => expandTtoSeries(eventSeries, { yearEnd, warnings }))
    .toSorted(({ from: a }, { from: b }) => a.localeCompare(b));
};

export const getTTR = results => {
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
      const now = Date.now();

      return (start < now && now < end);
    })
    // Return an array of { day, len }
    .map(({ value: { main } }) => {
      const start = new Date(main.dtstart.iso8601);
      const end = new Date(main.dtend.iso8601);

      const delta = end.getTime() - start.getTime();
      const days = Math.ceil(delta / (1000 * 3600 * 24));

      return main.rrule.byDay?.map(({ day }) => ({ day, len: days }));
    })
    .flat()
    .reduce((acc, { day, len } = {}) => {
      const first = DAYS.indexOf(day);
      return [...acc, ...Array.from({ length: len }, (_, index) => ((first + index) % 7))];
    }, [])
    .toSorted();
};

/**
 * Logique principale de mise à jour des TTO/TTR
 * Export séparé pour permettre l'injection de dépendances dans les tests
 * @param {Object} deps - Dépendances (fetch, config, etc.)
 * @returns {Promise<Response>} Réponse HTTP avec la liste des mises à jour
 */
export const handleUpdate = async (deps) => {
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

  const cacheUids = new Set(cacheTable.map(({ uid }) => uid).filter(Boolean));

  const allUids = await fetchJson(
    `${bmApiPath}users/${bmDomain}/_alluids`,
    { headers: bmHeaders },
  );

  // Guard against BM authorization errors instead of a UID array
  if (allUids?.errorCode) {
    return Response.json(
      { error: allUids.errorCode, message: allUids.message },
      { status: 403 },
    );
  }

  const updates = [];

  /**
   * Create new entries
   */
  for await (const uid of allUids) {
    if (!cacheUids.has(uid)) {
      // Use /light instead of /complete (77% lighter, no vcard/mailbox)
      const { displayName, value: { login } } = await fetchJson(
        `${bmApiPath}users/${bmDomain}/${uid}/light`,
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
    .filter(({ enabled, exclude }) => enabled && !exclude);

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
    const warnings = [];

    if (results.errorCode) {
      data.error = results;
    } else {
      data.tto = getTTO(results, { warnings });
      data.ttr = [...new Set(getTTR(results))];
    }

    const { updated, order, ...record } = cacheTable.find(({ uid: tUid }) => (tUid === uid));

    if (
      JSON.stringify(data.tto, null, 2) === record.tto
      && JSON.stringify(data.ttr) === record.ttr
      && !data.error
    ) {
      // Data did not change: early return.
      // Warnings are intentionally excluded from this comparison: an unhandled
      // frequency produces stable tto/ttr, so its warning was already written
      // on the migration PATCH and must not trigger parasitic rewrites.
      return;
    }

    updates.push(record.tri);

    const body = JSON.stringify({
      id: record.id,
      tto: JSON.stringify((data.tto || []), null, 2),
      total: (data.tto || []).reduce((acc, { days: d = 0 }) => (acc + d), 0),
      ttr: JSON.stringify(data.ttr || []),
      'last-check': new Date().toISOString(),
      log: data?.error?.message ?? (warnings.length > 0 ? warnings.join(' | ') : undefined),
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

  return Response.json(updates, { status: 200 });
};

/**
 * Handler Netlify Functions (nouvelle API)
 * @param {Request} req - Requête HTTP entrante
 * @param {Object} context - Contexte Netlify
 * @returns {Response} Réponse HTTP
 */
export default wrapWithSentry('update', async (req, context) => {
  return handleUpdate(getDefaultDeps());
});

// Export getDefaultDeps pour les tests
export { getDefaultDeps };
