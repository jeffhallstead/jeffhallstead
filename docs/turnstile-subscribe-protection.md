# Turnstile protection for newsletter signup

Status: Ready — not deployed
Shipped in: —

Cloudflare Turnstile now gates every newsletter subscription. A request that
fails verification never reaches beehiiv.

---

## 1. What changed

| File | Change |
|---|---|
| `assets/subscribe.js` | New. One shared handler replacing eleven pasted copies. Renders Turnstile, injects the honeypot, posts to the function. |
| `netlify/functions/subscribe.mjs` | Replaces `subscribe.js`. Verifies the token with Cloudflare siteverify before calling beehiiv. Carries the rate-limit rule. |
| 11 root HTML pages | Inline handler and `onsubmit` attribute removed; `<script src="/assets/subscribe.js" defer>` added. |
| `tests/subscribe.test.mjs` | 44 offline assertions covering every token path. |
| `tests/live-turnstile-check.mjs` | Live check against Cloudflare, for a machine with network access. |

Net: 552 lines deleted, 22 added across the HTML.

## 2. Before this can deploy

**Site key: done.** `0x4AAAAAAEuHWN8IG5yaCKB1` is set in `assets/subscribe.js`.
It is public by design and renders into the DOM on every page. That one line is
the only place it lives, so a rotation is a one-line edit.

**Secret key: still required.** Netlify → Site configuration → Environment
variables → add `TURNSTILE_SECRET_KEY`. Server-only. Until it is set, the
function returns 500 and no signup completes — it fails closed rather than
letting anything through unverified.

**Check the widget's domain list** in the Cloudflare dashboard. It needs
`jeffhallstead.com` and `www.jeffhallstead.com`, plus
`activation-index.jeffhallstead.com` if that page shares this widget. A domain
missing from the list fails verification server-side, which on the page looks
exactly like a broken form rather than a configuration problem.

`BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` are unchanged and still required.

## 3. Order of operations

The Activation Index wall at `activation-index.jeffhallstead.com` posts to
this same endpoint. It is the Lovable project `content-muse-69`
(Content Strategy Hub), and the wall is `src/components/EmailGate.tsx`.

**Its Turnstile widget is written and committed in Lovable
(`e53d179`), but not published.** It now sends `turnstileToken` alongside
`source: "activation-index"`, runs the challenge at submit, and resets before
each attempt.

Deploy in this order:

1. Publish the Lovable project.
2. Deploy this site.

Reversing that order stops Activation Index signups. Note that the wall
deliberately fails open on archive access: a reader always gets in. Before this
change a failed subscribe was a silent `console.warn`, so a reader believed they
had signed up when they had not. The wall now shows a plain one-line notice in
that case instead.

**The Turnstile widget's domain list must include
`activation-index.jeffhallstead.com`.** Turnstile validates the domain where the
widget renders, and a domain that is not on the list returns error 110200 and
issues no token — so every signup from the Index would fail verification.
Confirmed during testing: the widget returns 110200 on any domain outside the
list.

## 4. Design decisions

**The widget runs at submit, not at page load.** `execution: "execute"` means
the challenge fires when the visitor clicks Subscribe, so the token is seconds
old when it reaches Cloudflare. Rendering at page load would mint a token that
expires after five minutes — a visitor who reads the page and then subscribes
would hit `timeout-or-duplicate` and see a failure they did nothing to cause.

**`appearance: "interaction-only"`** keeps the widget invisible unless
Cloudflare decides a challenge is warranted, so the footer band keeps its
current shape for the great majority of visitors.

**The honeypot answers with a fake success.** A bot that fills the off-screen
`company_website` field gets `{ success: true }` and beehiiv is never called.
Returning an error would teach the bot which field to skip.

**Verification failure fails closed.** A Cloudflare outage returns an error to
the visitor rather than waving the signup through. A signup lost to an outage
is recoverable; a list poisoned by bots is not.

**A rejected secret returns 500, not 403.** A misconfigured key is this site's
fault, not the visitor's, and it belongs in the function log rather than in a
message that blames the person trying to subscribe.

## 5. Rate limiting

```
windowLimit: 5, windowSize: 180, aggregateBy: ["ip", "domain"]
```

Five attempts per three minutes per IP, enforced by Netlify at the edge before
the function is invoked — so a flood costs no function invocations.

**This is not the ten-minute window originally specified.** Netlify caps
`windowSize` at 180 seconds. Ten minutes is not expressible through the
platform rule. Five per three minutes is the closest available and still sits
far above any human signup rate. A true ten-minute window would require a
per-IP counter in Netlify Blobs — more moving parts, and the counter itself
becomes state to maintain.

## 6. Testing

Offline suite, no network required:

```
node tests/subscribe.test.mjs
```

44 assertions: valid, missing, invalid, expired and reused tokens; honeypot
filled and empty; missing and rejected secrets; Cloudflare outage; bad email;
wrong method; preflight; and the preserved beehiiv acquisition-source and
double opt-in fields.

Live check against Cloudflare's real endpoint, run from a machine with
outbound network access:

```
node tests/live-turnstile-check.mjs
```

Cloudflare's dummy secrets accept only the dummy token, and real secrets reject
dummy tokens, so neither script can touch production data.

### Manual check after deploy

With the real keys in place, subscribe from the footer band on `index.html`.
The Netlify function log should show one siteverify call followed by one beehiiv
call. Then, in the browser console, post to the endpoint with no
`turnstileToken` and confirm a 403 with no beehiiv call behind it.

## 7. Known, not fixed here

`netlify.toml` sets `publish = "."`, which puts `netlify/functions/` inside the
publish directory. Netlify serves those source files publicly — `submit-quiz.js`
is readable today at its repo path, exposing the Airtable base and table IDs.

No secret leaks this way; all three are read from `process.env` and never
written to a file. But the honeypot field name is visible, which weakens that
layer, and the Airtable IDs are not information worth publishing.

The proper fix is moving the static pages into a `public/` directory and
pointing `publish` at it. That is a routing change touching the sitemap and
`_redirects` during active search remediation, so it is deliberately not bundled
into this work order.
