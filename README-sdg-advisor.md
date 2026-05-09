# SDG Alignment Advisor — Setup & Deploy

## Files delivered

| File | Purpose |
|---|---|
| `uploads/sdg-alignment-advisor.html` | The live interactive tool (chat UI) |
| `case-study-sdg-advisor.html` | Marketing case study page |
| `netlify/functions/sdg-match.js` | Netlify serverless function (API proxy) |
| `lib/sdg-system-prompt.js` | Agent system prompt (required by the function) |
| `netlify.toml` | Build config + redirect: `/api/sdg-match` → `/.netlify/functions/sdg-match` |

All existing case study pages and `index.html` have been updated to include **SDG Alignment Advisor** in the Case Studies nav dropdown.

---

## Prerequisites

- Your site is hosted on [Netlify](https://netlify.com) (already confirmed)
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

---

## Add the API key to Netlify

1. Go to your site in the [Netlify dashboard](https://app.netlify.com).
2. Open **Site configuration → Environment variables**.
3. Click **Add a variable** and set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your key (starts with `sk-ant-…`)
4. Click **Save**, then trigger a redeploy (or it will pick up on the next deploy).

**Never commit this value to source control.**

---

## How the redirect works

The tool page calls `/api/sdg-match`. The `netlify.toml` transparently rewrites that to `/.netlify/functions/sdg-match`, so the HTML doesn't need to know anything about Netlify's function URL format.

---

## Deploy

Since the site is already on Netlify, just copy the new files into your site's repo/folder and push (or drag-and-drop if you're using Netlify's manual deploy UI):

**New files to add:**
- `netlify.toml`
- `netlify/functions/sdg-match.js`
- `lib/sdg-system-prompt.js`
- `uploads/sdg-alignment-advisor.html`
- `case-study-sdg-advisor.html`
- `README-sdg-advisor.md`

**Updated files (nav dropdown changes):**
- `index.html`
- `about.html`
- `contact.html`
- `content-studio.html`
- `case-study-plf.html`
- `case-study-sae.html`
- `case-study-founders-ceiling-quiz.html`

---

## Local development

Install the Netlify CLI to test functions locally:

```bash
npm install -g netlify-cli
netlify dev
```

Then open `http://localhost:8888/uploads/sdg-alignment-advisor.html`.

Create a `.env` file at the project root for local dev (already gitignored by Netlify CLI):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Opening `sdg-alignment-advisor.html` directly as a `file://` URL will not work — a server is required to handle the `/api/sdg-match` route.

---

## Editing the system prompt

The agent's behavior is entirely defined by `lib/sdg-system-prompt.js`. Edit the `SDG_SYSTEM_PROMPT` string to change tone, output format, or closing language. Changes take effect on the next deploy.

---

## Model

The function uses `claude-opus-4-7`. To change it, edit line 67 of `netlify/functions/sdg-match.js`:

```js
model: 'claude-opus-4-7',
```

---

## Rate limiting

10 requests per IP per hour, enforced in-memory inside the function. Resets on cold start — best-effort, not hard. For stricter enforcement, replace the `Map` with [Netlify Blobs](https://docs.netlify.com/blobs/overview/) or an external store like Upstash Redis.

---

## Confirmed URLs

| Page | URL |
|---|---|
| Tool | `https://jeffhallstead.com/uploads/sdg-alignment-advisor.html` |
| Case study | `https://jeffhallstead.com/case-study-sdg-advisor.html` |
| Contact CTA | `https://jeffhallstead.com/contact.html` |
