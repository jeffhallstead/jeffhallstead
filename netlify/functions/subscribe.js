// Newsletter signup for The Branded Entertainment Brief.
//
// The footer subscribe band used to just open beehiiv's /subscribe page with
// ?email=... appended — but beehiiv ignores that parameter, so the visitor had
// to type their address a second time. This subscribes them directly instead.
//
// Requires two env vars set in Netlify (Site configuration → Environment variables):
//   BEEHIIV_API_KEY         — beehiiv → Settings → API
//   BEEHIIV_PUBLICATION_ID  — the pub_xxxxxxxx id for the Brief

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Where a signup came from. The footer band on this site sends no source and
// keeps its original tagging. The Activation Index wall sends its own.
const SOURCES = {
  'activation-index': {
    utm_source: 'activation-index',
    utm_medium: 'lead_magnet',
    referring_site: 'activation-index.jeffhallstead.com',
  },
};

const DEFAULT_SOURCE = {
  utm_source: 'jeffhallstead.com',
  utm_medium: 'footer_subscribe',
  referring_site: 'jeffhallstead.com',
};

exports.handler = async function (event) {
  // Cross-origin callers preflight before posting JSON, so answer OPTIONS.
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  if (!API_KEY || !PUBLICATION_ID) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Newsletter signup is not configured.' }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const email = (body.email || '').trim();
  const source = SOURCES[body.source] || {
    ...DEFAULT_SOURCE,
    referring_site: body.page || DEFAULT_SOURCE.referring_site,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'Please enter a valid email address.' }),
    };
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: source.utm_source,
          utm_medium: source.utm_medium,
          referring_site: source.referring_site,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.errors?.[0]?.message || data.message || `beehiiv error ${res.status}`);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, status: data.data?.status || 'pending' }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
