const baserowHeaders = {
  Authorization: `Token ${process.env.TT_BASEROW_TOKEN}`,
  'Content-Type': 'application/json',
};

const fetch = async (...args) => {
  const { default: f } = await import('node-fetch');
  return f(...args);
};

const fetchJson = async (...args) => {
  const raw = await fetch(...args);
  return raw.json();
};

exports.handler = async () => {
  const response = await fetchJson(
    [
      `${process.env.TT_BASEROW_TABLE}?`,
      'user_field_names=true',
      'include=tri,total,enabled,tto,ttr',
      'size=200',
    ].join('&'),
    { headers: baserowHeaders },
  );

  const results = response.results
    .filter(({ enabled }) => enabled)
    .map(({ tri, total, tto, ttr }) => ({ tri, total, tto: JSON.parse(tto), ttr: JSON.parse(ttr) }));

  return {
    statusCode: 200,
    body: JSON.stringify(results, null, 2),
  };
};
