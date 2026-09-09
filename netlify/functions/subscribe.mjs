// Newsletter signup for The Branded Entertainment Brief.
//
// The footer subscribe band used to just open beehiiv's /subscribe page with
// ?email=... appended — but beehiiv ignores that parameter, so the visitor had
// to type their address a second time. This subscribes them directly instead.
//
// Every request must carry a Cloudflare Turnstile token, verified here against
// Cloudflare's siteverify endpoint before beehiiv is called. A request that
// fails verification never reaches beehiiv, so a bot cannot burn list quota or
// pollute the subscriber file.
//
// Modern (v2) function, hence the .mjs extension — the `config` export below
// carries the rate-limit rule, which the legacy exports.handler form has no
// way to declare. The endpoint is unchanged: /.netlify/functions/subscribe
//
// Requires three env vars in Netlify (Site configuration → Environment variables):
//   BEEHIIV_API_KEY         — beehiiv → Settings → API
//   BEEHIIV_PUBLICATION_ID  — the pub_xxxxxxxx id for the Brief
//   TURNSTILE_SECRET_KEY    — Cloudflare dashboard → Turnstile → your widget
//
// All three are server-only. None is ever sent to the browser. The Turnstile
// SITE key is the only half that appears in frontend code (assets/subscribe.js),
// and it is public by design.

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

const HONEYPOT_FIELD = 'company_website';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// What the visitor is told when siteverify says no. Cloudflare's own codes are
// terser than they look: invalid-input-response covers a token that was
// malformed, forged, or minted for a different site key, while
// timeout-or-duplicate is the single code for both expired and already-spent.
const VERIFY_MESSAGES = {
  'missing-input-response': 'Verification is missing. Please try again.',
  'invalid-input-response': 'Verification failed. Please try again.',
  'timeout-or-duplicate': 'That verification expired. Please try again.',
  'invalid-widget-id': 'Verification failed. Please try again.',
  'invalid-parsed-secret': 'Newsletter signup is not configured.',
  'bad-request': 'Verification failed. Please try again.',
  'internal-error': 'Verification is temporarily unavailable. Please try again.',
};

const json = (statusCode, payload) =>
  new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

async function verifyTurnstile(token, secret, ip) {
  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  // A non-200 from Cloudflare is an outage, not a failed challenge. Treat it as
  // a failure anyway — failing closed is the whole point of the control.
  if (!res.ok) {
    return { ok: false, codes: ['internal-error'] };
  }

  const data = await res.json().catch(() => ({}));
  return { ok: data.success === true, codes: data['error-codes'] || [] };
}

export default async function handler(request, context) {
  // Cross-origin callers preflight before posting JSON, so answer OPTIONS.
  if (request.method === 'OPTIONS') {
    // 204 is a null-body status: passing '' here throws in undici and would
    // 500 every cross-origin preflight.
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
  const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

  if (!API_KEY || !PUBLICATION_ID || !TURNSTILE_SECRET) {
    return json(500, { error: 'Newsletter signup is not configured.' });
  }

  let body;
  try { body = await request.json(); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  // Honeypot. A real visitor can never fill this — it is off-screen, tab-skipped
  // and aria-hidden. Answer as though the signup worked so the bot has nothing
  // to learn from the difference, and go no further.
  const honeypot = (body[HONEYPOT_FIELD] || '').trim();
  if (honeypot) {
    return json(200, { success: true, status: 'pending' });
  }

  const email = (body.email || '').trim();
  const source = SOURCES[body.source] || {
    ...DEFAULT_SOURCE,
    referring_site: body.page || DEFAULT_SOURCE.referring_site,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  const token = (body.turnstileToken || '').trim();
  if (!token) {
    return json(400, { error: VERIFY_MESSAGES['missing-input-response'] });
  }

  let verdict;
  try {
    verdict = await verifyTurnstile(token, TURNSTILE_SECRET, context?.ip);
  } catch {
    return json(502, { error: VERIFY_MESSAGES['internal-error'] });
  }

  if (!verdict.ok) {
    const code = verdict.codes[0];

    // A bad or missing secret is our misconfiguration, not the visitor's
    // problem. Say nothing about the key; log it so it shows up in the
    // function log where it belongs.
    if (code === 'invalid-input-secret' || code === 'missing-input-secret') {
      console.error('Turnstile secret rejected by siteverify:', verdict.codes.join(', '));
      return json(500, { error: 'Newsletter signup is not configured.' });
    }

    return json(403, {
      error: VERIFY_MESSAGES[code] || 'Verification failed. Please try again.',
    });
  }

  // Verified. Only now does beehiiv hear about this address.
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

    return json(200, { success: true, status: data.data?.status || 'pending' });
  } catch (err) {
    return json(502, { error: err.message });
  }
}

// Netlify's own rate limiting, applied at the edge before this function is
// invoked — so a flood costs no function invocations.
//
// windowSize is capped at 180 seconds by Netlify, so the ten-minute window is
// not expressible here. Five attempts per three minutes per IP is the closest
// the platform allows, and is still far below any human signup rate.
export const config = {
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ['ip', 'domain'],
  },
};
