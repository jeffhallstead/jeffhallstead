// Live check against Cloudflare's real siteverify endpoint.
//
// The offline suite (tests/subscribe.test.mjs) stubs siteverify, so it proves
// this site's logic but not Cloudflare's half of the exchange. This script
// proves the other half: that Cloudflare answers each dummy secret the way the
// function expects. Run it from a machine with outbound network access.
//
//   node tests/live-turnstile-check.mjs
//
// Cloudflare's dummy secrets accept only the dummy token below, and dummy
// tokens are rejected by real secrets — so this touches nothing in production.

const URL_ = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

const CASES = [
  { name: 'valid token',           secret: '1x0000000000000000000000000000000AA', token: DUMMY_TOKEN, expectSuccess: true,  expectCode: null },
  { name: 'invalid token',         secret: '2x0000000000000000000000000000000AA', token: DUMMY_TOKEN, expectSuccess: false, expectCode: 'invalid-input-response' },
  { name: 'reused / spent token',  secret: '3x0000000000000000000000000000000AA', token: DUMMY_TOKEN, expectSuccess: false, expectCode: 'timeout-or-duplicate' },
  { name: 'missing token',         secret: '1x0000000000000000000000000000000AA', token: '',          expectSuccess: false, expectCode: 'missing-input-response' },
  { name: 'malformed token',       secret: '1x0000000000000000000000000000000AA', token: 'garbage',   expectSuccess: false, expectCode: 'invalid-input-response' },
];

let fail = 0;

for (const c of CASES) {
  const form = new URLSearchParams();
  form.append('secret', c.secret);
  form.append('response', c.token);

  let data;
  try {
    const res = await fetch(URL_, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    data = await res.json();
  } catch (err) {
    console.log('  ERROR ' + c.name + ' -> ' + err.message);
    fail++;
    continue;
  }

  const codes = data['error-codes'] || [];
  const okSuccess = data.success === c.expectSuccess;
  const okCode = c.expectCode === null ? true : codes.includes(c.expectCode);

  if (okSuccess && okCode) {
    console.log('  PASS  ' + c.name + '  -> success=' + data.success + (codes.length ? ' [' + codes.join(', ') + ']' : ''));
  } else {
    console.log('  FAIL  ' + c.name + '  -> ' + JSON.stringify(data));
    fail++;
  }
}

console.log('\n' + (fail ? fail + ' failed' : 'all live checks passed') + '\n');
process.exit(fail ? 1 : 0);
