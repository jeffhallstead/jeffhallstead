import handler, { config } from '../netlify/functions/subscribe.mjs';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const BEEHIIV    = 'api.beehiiv.com';
const DUMMY      = 'XXXX.DUMMY.TOKEN.XXXX';

// Exactly what Cloudflare returns for each dummy secret key, per its testing docs.
const SITEVERIFY_REPLIES = {
  '1x0000000000000000000000000000000AA': { status: 200, body: { success: true,  'error-codes': [], challenge_ts: '2026-09-09T17:00:00Z', hostname: 'jeffhallstead.com' } },
  '2x0000000000000000000000000000000AA': { status: 200, body: { success: false, 'error-codes': ['invalid-input-response'] } },
  '3x0000000000000000000000000000000AA': { status: 200, body: { success: false, 'error-codes': ['timeout-or-duplicate'] } },
  'BAD_SECRET':                          { status: 200, body: { success: false, 'error-codes': ['invalid-input-secret'] } },
  'CF_OUTAGE':                           { status: 500, body: {} },
};

let calls;

globalThis.fetch = async (url, opts) => {
  const href = String(url);
  if (href === SITEVERIFY) {
    const params = new URLSearchParams(opts.body);
    calls.siteverify.push({ secret: params.get('secret'), response: params.get('response'), remoteip: params.get('remoteip') });
    const reply = SITEVERIFY_REPLIES[params.get('secret')];
    if (!reply) throw new Error('unmapped secret ' + params.get('secret'));
    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { 'Content-Type': 'application/json' } });
  }
  if (href.includes(BEEHIIV)) {
    calls.beehiiv.push(JSON.parse(opts.body));
    return new Response(JSON.stringify({ data: { status: 'pending' } }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  }
  throw new Error('unexpected fetch to ' + href);
};

async function run({ secret = '1x0000000000000000000000000000000AA', body = {}, method = 'POST', omitSecret = false }) {
  calls = { siteverify: [], beehiiv: [] };
  process.env.BEEHIIV_API_KEY = 'test-beehiiv-key';
  process.env.BEEHIIV_PUBLICATION_ID = 'pub_test';
  if (omitSecret) delete process.env.TURNSTILE_SECRET_KEY;
  else process.env.TURNSTILE_SECRET_KEY = secret;

  const req = new Request('https://jeffhallstead.com/.netlify/functions/subscribe', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
  const res = await handler(req, { ip: '203.0.113.45' });
  let payload = {};
  try { payload = JSON.parse(await res.clone().text()); } catch {}
  return { status: res.status, payload, calls };
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + JSON.stringify(detail) : '')); }
}

const good = { email: 'jeff@example.com', page: '/index.html', turnstileToken: DUMMY };

console.log('\nTURNSTILE TOKEN PATHS\n');

{
  const r = await run({ body: good });
  check('valid token -> 200', r.status === 200, r);
  check('valid token -> beehiiv called exactly once', r.calls.beehiiv.length === 1, r.calls.beehiiv);
  check('valid token -> siteverify called before beehiiv', r.calls.siteverify.length === 1, r.calls);
  check('valid token -> client IP forwarded to Cloudflare', r.calls.siteverify[0]?.remoteip === '203.0.113.45', r.calls.siteverify[0]);
}
{
  const r = await run({ body: { email: 'jeff@example.com', page: '/index.html' } });
  check('missing token -> 400', r.status === 400, r);
  check('missing token -> siteverify never called', r.calls.siteverify.length === 0, r.calls);
  check('missing token -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
}
{
  const r = await run({ secret: '2x0000000000000000000000000000000AA', body: good });
  check('invalid token -> 403', r.status === 403, r);
  check('invalid token -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
  check('invalid token -> generic failure message', r.payload.error === 'Verification failed. Please try again.', r.payload);
}
{
  const r = await run({ secret: '3x0000000000000000000000000000000AA', body: good });
  check('expired token -> 403', r.status === 403, r);
  check('expired token -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
  check('expired token -> expiry message', r.payload.error === 'That verification expired. Please try again.', r.payload);
}
{
  // Cloudflare returns timeout-or-duplicate for a replayed token too.
  const first  = await run({ body: good });
  const replay = await run({ secret: '3x0000000000000000000000000000000AA', body: good });
  check('reused token -> first use succeeds', first.status === 200, first);
  check('reused token -> replay rejected 403', replay.status === 403, replay);
  check('reused token -> replay never reaches beehiiv', replay.calls.beehiiv.length === 0, replay.calls);
}

console.log('\nHONEYPOT\n');
{
  const r = await run({ body: { ...good, company_website: 'http://spam.example' } });
  check('honeypot filled -> 200 (bot learns nothing)', r.status === 200, r);
  check('honeypot filled -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
  check('honeypot filled -> siteverify never called', r.calls.siteverify.length === 0, r.calls);
  check('honeypot filled -> response shape matches a real success', r.payload.success === true && typeof r.payload.status === 'string', r.payload);
}
{
  const r = await run({ body: { ...good, company_website: '' } });
  check('honeypot empty -> normal signup proceeds', r.status === 200 && r.calls.beehiiv.length === 1, r);
}

console.log('\nMISCONFIGURATION AND ABUSE\n');
{
  const r = await run({ omitSecret: true, body: good });
  check('no TURNSTILE_SECRET_KEY -> 500, not an open door', r.status === 500, r);
  check('no TURNSTILE_SECRET_KEY -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
}
{
  const r = await run({ secret: 'BAD_SECRET', body: good });
  check('bad secret -> 500 our fault, not 403 visitor fault', r.status === 500, r);
  check('bad secret -> message leaks nothing about the key', !/secret|key/i.test(r.payload.error || ''), r.payload);
}
{
  const r = await run({ secret: 'CF_OUTAGE', body: good });
  check('Cloudflare outage -> fails closed, not open', r.status !== 200, r);
  check('Cloudflare outage -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
}
{
  const r = await run({ body: { email: 'not-an-email', turnstileToken: DUMMY } });
  check('bad email -> 400', r.status === 400, r);
  check('bad email -> beehiiv never called', r.calls.beehiiv.length === 0, r.calls);
}
{
  const r = await run({ method: 'GET' });
  check('GET -> 405', r.status === 405, r);
}
{
  const r = await run({ method: 'OPTIONS' });
  check('OPTIONS preflight -> 204', r.status === 204, r);
}

console.log('\nPRESERVED BEEHIIV BEHAVIOUR\n');
{
  const r = await run({ body: good });
  const sent = r.calls.beehiiv[0] || {};
  check('default source -> utm_source jeffhallstead.com', sent.utm_source === 'jeffhallstead.com', sent);
  check('default source -> utm_medium footer_subscribe', sent.utm_medium === 'footer_subscribe', sent);
  check('default source -> referring_site is the page path', sent.referring_site === '/index.html', sent);
  check('double opt-in -> send_welcome_email true', sent.send_welcome_email === true, sent);
  check('double opt-in -> reactivate_existing false', sent.reactivate_existing === false, sent);
  check('double opt-in -> no double_opt_override sent', !('double_opt_override' in sent), sent);
}
{
  const r = await run({ body: { ...good, source: 'activation-index' } });
  const sent = r.calls.beehiiv[0] || {};
  check('activation-index -> utm_source activation-index', sent.utm_source === 'activation-index', sent);
  check('activation-index -> utm_medium lead_magnet', sent.utm_medium === 'lead_magnet', sent);
  check('activation-index -> referring_site preserved', sent.referring_site === 'activation-index.jeffhallstead.com', sent);
}

console.log('\nRATE LIMIT CONFIG\n');
check('rateLimit exported', !!config?.rateLimit, config);
check('windowLimit is 5', config?.rateLimit?.windowLimit === 5, config);
check('windowSize within Netlify max of 180s', config?.rateLimit?.windowSize <= 180, config);
check('aggregated by ip', (config?.rateLimit?.aggregateBy || []).includes('ip'), config);

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
