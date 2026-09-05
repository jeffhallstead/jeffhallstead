# Work order: search discovery fixes

Status: Ready
Shipped in: —
Target files: `sitemap.xml` (rewrite), `robots.txt` (new), plus a canonical/`og:url` pass across 9 root pages.
Verified against: working tree at `301c7ca`. Every find string below was matched against the live files and confirmed to occur exactly once. All acceptance numbers are measured from a full scratch-copy simulation, not assumed.
Scope: four stories. No copy, layout, or component changes anywhere.

## Why this exists

Search Console, 90 days: 11 clicks, 514 impressions, 13 pages indexed, 34 not. URL
Inspection on **both** `https://jeffhallstead.com/content-studio` and
`https://jeffhallstead.com/content-studio.html` returns *"URL is unknown to Google"* —
never crawled, no referring sitemap detected. `/productions` and `/microdramas` are
absent from the report too.

Cause: `sitemap.xml` carries May `lastmod` dates despite being edited August 5, so
Google last read it on **June 7, 2026** and has had no reason to return. `/case-studies`
is listed in it and returns 404 (verified live). There is no `robots.txt`, so the second
discovery path is missing as well.

Full evidence: `search-visibility-diagnosis.md` in the Claude project.

## Before you start

- Ship all four stories in one deploy. Stories 1 and 4 interact: the sitemap declares
  extensionless URLs, internal links use `.html`, and nine pages carry no canonical.
  Fixing the sitemap without the canonicals invites Google to index both forms.
- Do not change any page copy, heading, component, or style. This work order touches
  `<head>` metadata and two site-root files only.
- `lastmod` is `2026-09-02` for every page. That is the real author date of the last
  commit touching each of the twelve root pages (`b0380a6`), verified with
  `git log -1 --format=%ad --date=short -- <file>`. Do not invent a newer date — a
  sitemap that lies about freshness is what caused this.
- Story 5 is manual work in Search Console **after** the deploy is live. It is not
  optional; the code changes alone do not trigger a recrawl fast enough to matter.

## Sequence

| # | Fix | Effort | Consequence if skipped |
|---|---|---|---|
| 1 | Rewrite `sitemap.xml` | 10 min | The single highest-leverage change here. Without it Google keeps believing nothing has changed since May 30. |
| 2 | Add `robots.txt` | 2 min | The second discovery path stays missing. |
| 3 | `og:url` uses `.html` on 8 pages | 5 min | Social metadata keeps contradicting the sitemap. |
| 4 | 9 of 12 pages have no canonical | 10 min | Google picks its own canonical, and may split signals between `/x` and `/x.html`. |
| 5 | Resubmit and request indexing | 10 min | Everything above sits unread for weeks. |

---

## Story 1 — Rewrite `sitemap.xml`

Three defects: stale `lastmod` on every entry, a 404 URL, and five real pages missing.

The current file has 8 `<loc>` entries. `/case-studies` is one of them and it 404s —
nothing in the repo links to it (`grep -rn 'case-studies' *.html` returns nothing), so
remove it rather than building a page. Missing entirely: `/contact`, `/case-study-plf`,
`/case-study-sae`, `/case-study-founders-ceiling-quiz`, `/case-study-sdg-advisor`.

Replace the entire file with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://jeffhallstead.com/</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/about</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/content-studio</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/fractional-cco-vs-agency</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/productions</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/microdramas</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/newsletter</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/contact</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/case-study-plf</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/case-study-sae</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/case-study-founders-ceiling-quiz</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://jeffhallstead.com/case-study-sdg-advisor</loc>
    <lastmod>2026-09-02</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

</urlset>
```

**Acceptance:**

- `grep -c '<loc>' sitemap.xml` returns `12`.
- `grep -c 'case-studies<' sitemap.xml` returns `0`.
- `grep -o '<lastmod>[^<]*' sitemap.xml | sort -u | wc -l` returns `1`.
- Parses: `python3 -c "import xml.dom.minidom;xml.dom.minidom.parse('sitemap.xml');print('ok')"`
- Every `<loc>` maps to an existing file. All twelve confirmed in simulation.

**Maintenance note:** `lastmod` is now the thing that has to stay honest. Bump the dates
for pages a change actually touches whenever content ships, or this defect returns.

---

## Story 2 — Add `robots.txt`

New file at the repo root. `publish = "."` in `netlify.toml`, so it deploys as-is.

```
User-agent: *
Allow: /

Sitemap: https://jeffhallstead.com/sitemap.xml
```

**Acceptance:**

- `robots.txt` exists at the repo root.
- After deploy, `https://jeffhallstead.com/robots.txt` returns the four lines above.
- Nothing is disallowed. The `/tools/` and `/uploads/` paths are handled by `_redirects`
  and should stay crawlable so the 301s are followed.

---

## Story 3 — Point `og:url` at the extensionless URL

Eight pages advertise a `.html` URL that the sitemap contradicts. `index.html` is already
correct (`https://jeffhallstead.com/`) and is not touched by this story.

Each find string below occurs **exactly once** in its file.

| File | Find | Replace with |
|---|---|---|
| `about.html` | `<meta property="og:url" content="https://jeffhallstead.com/about.html">` | `<meta property="og:url" content="https://jeffhallstead.com/about">` |
| `case-study-founders-ceiling-quiz.html` | `…/case-study-founders-ceiling-quiz.html">` | `…/case-study-founders-ceiling-quiz">` |
| `case-study-plf.html` | `…/case-study-plf.html">` | `…/case-study-plf">` |
| `case-study-sae.html` | `…/case-study-sae.html">` | `…/case-study-sae">` |
| `case-study-sdg-advisor.html` | `…/case-study-sdg-advisor.html">` | `…/case-study-sdg-advisor">` |
| `contact.html` | `…/contact.html">` | `…/contact">` |
| `content-studio.html` | `…/content-studio.html">` | `…/content-studio">` |
| `newsletter.html` | `…/newsletter.html">` | `…/newsletter">` |

The `…` above is `<meta property="og:url" content="https://jeffhallstead.com` in every
row. Write the full attribute; do not leave an ellipsis in the file.

**Acceptance:**

- `grep -o 'og:url" content="[^"]*\.html"' *.html | wc -l` returns `0`.
- `og:image` and `twitter:image` still point at `https://jeffhallstead.com/og-preview.jpg`
  on all twelve pages. Those are asset URLs, not page URLs, and do not change.

---

## Story 4 — Add canonical tags to the nine pages without one

`fractional-cco-vs-agency.html`, `microdramas.html`, and `productions.html` already carry
one, each pointing at the extensionless URL. Match that pattern exactly on the other nine.

In `productions.html` the tag sits immediately before `<style>`. Two pages
(`index.html`, `contact.html`) have a `<template id="__bundler_thumbnail">` block in
between, so anchor on the `twitter:image` line instead — it occurs exactly once in every
one of the nine files, verified.

**Find** (identical in all nine files, occurs once each):

```html
<meta name="twitter:image" content="https://jeffhallstead.com/og-preview.jpg">
```

**Replace with** that same line, followed by a new line carrying the page's canonical:

| File | Canonical href |
|---|---|
| `index.html` | `https://jeffhallstead.com/` |
| `about.html` | `https://jeffhallstead.com/about` |
| `content-studio.html` | `https://jeffhallstead.com/content-studio` |
| `newsletter.html` | `https://jeffhallstead.com/newsletter` |
| `contact.html` | `https://jeffhallstead.com/contact` |
| `case-study-plf.html` | `https://jeffhallstead.com/case-study-plf` |
| `case-study-sae.html` | `https://jeffhallstead.com/case-study-sae` |
| `case-study-founders-ceiling-quiz.html` | `https://jeffhallstead.com/case-study-founders-ceiling-quiz` |
| `case-study-sdg-advisor.html` | `https://jeffhallstead.com/case-study-sdg-advisor` |

So `about.html` becomes:

```html
<meta name="twitter:image" content="https://jeffhallstead.com/og-preview.jpg">
<link rel="canonical" href="https://jeffhallstead.com/about">
```

**Acceptance:**

- `grep -l 'rel="canonical"' *.html | wc -l` returns `12`.
- The three pre-existing canonical tags are unchanged, still on their own line before
  `<style>`.
- No page has two canonical tags: `grep -o 'rel="canonical"' *.html | wc -l` returns `12`.

---

## Story 5 — Resubmit and request indexing (manual, after deploy)

Code changes do not trigger a recrawl on any useful timescale. Do this by hand once the
deploy is live:

1. Search Console → Sitemaps → resubmit `https://jeffhallstead.com/sitemap.xml`. Confirm
   "Last read" updates to today. It has read `2026-06-07` for three months.
2. URL Inspection → **Request Indexing** for, in order:
   `https://jeffhallstead.com/content-studio`, `https://jeffhallstead.com/productions`,
   `https://jeffhallstead.com/microdramas`.
3. Check back in seven days. The success signal is `/content-studio` moving from *"URL is
   unknown to Google"* to indexed. Impressions follow later; indexing comes first.

---

## Whole-file acceptance, run after stories 1–4

Measured against a full scratch-copy simulation of all four stories at `301c7ca`.

```
grep -l 'rel="canonical"' *.html | wc -l                      # 12
grep -o 'rel="canonical"' *.html | wc -l                      # 12
grep -o 'og:url" content="[^"]*\.html"' *.html | wc -l        # 0
grep -c '<loc>' sitemap.xml                                   # 12
grep -c 'case-studies<' sitemap.xml                           # 0
grep -o '<lastmod>[^<]*' sitemap.xml | sort -u | wc -l        # 1
grep -o '<div' content-studio.html | wc -l                    # 67
grep -o '</div>' content-studio.html | wc -l                  # 67
ls robots.txt                                                 # exists
python3 -c "import xml.dom.minidom;xml.dom.minidom.parse('sitemap.xml');print('ok')"
```

The `content-studio.html` div counts are the tripwire: this work order touches only
`<head>` metadata, so 67/67 must hold before and after. If `docs/services-page-fixes.md`
has already shipped, that count still holds — none of its stories adds or removes a div
either.

Then load `/content-studio`, `/about`, and `/contact` and view source: one canonical tag
each, pointing at the extensionless URL, matching `og:url`.

**Simulation note:** all four stories were applied to a scratch copy of the working tree
at `301c7ca`. Every find string matched exactly once, all twelve sitemap `<loc>` values
resolved to an existing file, the XML parsed, and the div counts held at 67/67. The
numbers above are measured.

---

## Out of scope, but found while checking

**Internal links still use the `.html` form.** Every nav and body link across the site
points at `about.html`, `content-studio.html`, and so on. Netlify serves both forms, and
after Story 4 the canonical resolves the ambiguity for Google, so this is no longer
harmful — but internal links are the strongest crawl signal a site has, and pointing them
at the canonical URL is the tidier end state. A separate, mechanical sitewide pass.

**Roughly 131 impressions still land on old `www.jeffhallstead.com` blog URLs** —
`/5-ways-a-data-driven-approach-can-define-your-luxury-brand/` and
`/trust-based-philanthropy-transforming-lives-through-compassionate-giving/` — which is
more than `/contact` receives. Those are from the previous site and the previous
positioning. Deciding whether to redirect them into the current site or let them decay is
a positioning question, not a technical one, and belongs in the project.
