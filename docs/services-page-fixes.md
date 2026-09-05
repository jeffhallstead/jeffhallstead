# Work order: services page fixes

Status: Ready
Shipped in: —
Target file: `content-studio.html`
Verified against: HEAD `b0380a6`. Re-checked at `301c7ca` — `content-studio.html` is byte-identical between the two, so every find string below still matches exactly once. Confirmed by exact-string count, not grep.
Scope: four fixes. Nothing else on the page changes.

## Before you start

- **Read this file only.** Do not read `services-page-revision.md` or `PRD-services-ladder.md`. Both live in the newsletter folder, both contain retired offering copy and an unpublished price, and both are superseded for the purposes of this work. (Those two files should be moved into `docs/shipped/` with status headers so this warning stops being necessary.)
- This page uses **straight apostrophes** and **literal `—` and `→`** in body copy, never HTML entities. The single `&copy;` in the footer is the only entity in the file and stays as it is.
- Do not rename, recase, or repoint any Publisher Test or Publisher Blueprint label or URL.
- No price for the 90-Day Engagement or the Fractional Content Leadership retainer goes on this page or in its structured data. Both are unpublished by decision, September 2026.
- Markup trap, carried over from the last work order: `<div class="model">` is a **prefix** of `<div class="model-tag">` and `<div class="model-rule">`. A backward search for the card's opening div lands on the wrong one. The find strings below are full-text and avoid this, but keep it in mind if you deviate.

## Sequence

Do them in this order. Story 1 is the only one that costs anything if it ships late.

| # | Fix | Effort | Consequence if skipped |
|---|---|---|---|
| 1 | Blueprint card leads with a price, then says "free" | 5 min | A scanner reads $3,500 before they read that the entry point costs nothing. This is the one to fix before traffic hits the page. |
| 2 | Two identical `Proof — Pour Les Femmes` eyebrows | 2 min | Reads as a duplicated section. Small, but it's the kind of thing that makes a careful reader wonder what else got copy-pasted. |
| 3 | Four phases and three offerings, nothing maps them | copy call | The reader has to do the mapping. Most won't. |
| 4 | No structured data on the page that sells the service | 20 min | The page an AI assistant is most likely to be asked about is the one page it can't parse cleanly. |

---

## Story 1 — Lead the Blueprint card with the free entry point

The card's first paragraph is the price. Every other card on the page opens with a positioning line. A reader scanning the three cards hits `$3,500` before they learn the way in is free and takes twelve minutes.

Swap the two paragraphs, and swap their styles with them — the lead paragraph in each card carries no `margin-top`.

**Find** (occurs once):

```html
      <p>$3,500, credited in full against the 90-day engagement.</p>
      <p style="margin-top:14px">Start with the Publisher Test. Twelve minutes, free, and it captures everything Jeff needs to assess the opportunity.</p>
```

**Replace with:**

```html
      <p>Start with the Publisher Test. Twelve minutes, free, and it captures everything Jeff needs to assess the opportunity.</p>
      <p style="margin-top:14px">$3,500, credited in full against the 90-day engagement.</p>
```

**Acceptance:**

- `grep -o '\$3,500' content-studio.html | wc -l` returns `1`.
- The Blueprint card's first `<p>` after `<div class="model-rule"></div>` has no `style` attribute, matching the other two cards.
- Card 1 still has exactly one `<a href="https://blueprint.jeffhallstead.com/"`.

---

## Story 2 — Give the two Pour Les Femmes sections distinct eyebrows

Section 02 (the stat strip) and section 05 (the quote and the three facts) both carry the eyebrow `Proof — Pour Les Femmes`, with "How It Works" sitting between them. Their own `data-screen-label` attributes already distinguish them: `02 Proof` and `05 Case Study`. Bring the eyebrow into line with the label.

**Find** (occurs once — this is the section 05 block; the `The playbook, proven.` heading is what makes it unique):

```html
  <div class="eyebrow fade-up">Proof — Pour Les Femmes</div>
  <hr class="rule fade-up">
  <h2 class="fade-up">The playbook, proven.</h2>
```

**Replace with:**

```html
  <div class="eyebrow fade-up">Case Study — Pour Les Femmes</div>
  <hr class="rule fade-up">
  <h2 class="fade-up">The playbook, proven.</h2>
```

**Acceptance:**

- `grep -o 'Proof — Pour Les Femmes' content-studio.html | wc -l` returns `1`.
- `grep -o 'Case Study — Pour Les Femmes' content-studio.html | wc -l` returns `1`.
- Section 02's eyebrow is untouched.

---

## Story 3 — Bridge the four phases to the three offerings

"How It Works" gives four phases and says most brands start at phase two. "How to Work Together" gives three offerings. Nothing on the page connects them, so the reader has to hold both models and do the mapping themselves.

One sentence, dropped into the existing intro paragraph of the models section, before `Start where you are.`

**Find** (occurs once):

```html
They need to know whether the opportunity is real for them, and what it would take. Start where you are.</p>
```

**Replace with:**

```html
They need to know whether the opportunity is real for them, and what it would take. Those four phases map onto three ways in: the Blueprint tells you which phase you're standing in, the engagement builds the ones you're missing, and the retainer keeps all four running. Start where you are.</p>
```

**Note on the copy:** this is a judgment call, not a defect. If the sentence overloads the paragraph, the alternative is to move the flywheel section directly above the models section so the four phases are still on screen when the three cards arrive — a section reorder, no copy change. The sentence is the cheaper fix and it makes the relationship explicit rather than implied.

**Acceptance:**

- `grep -o 'Those four phases map onto three ways in' content-studio.html | wc -l` returns `1`.
- Straight apostrophe in `you're`, not a curly one.

---

## Story 4 — Add structured data to the services page

`index.html` carries three JSON-LD blocks (Person, ProfessionalService, FAQPage). `about.html` and `fractional-cco-vs-agency.html` carry one each. `content-studio.html` carries none — and it's the page that describes what Jeff sells, at what price, for whom. That's the page an assistant gets asked about.

Add one `Service` block with a `hasOfferCatalog` for the three offerings. Insert it **after `</style>` and before `</head>`**, matching the placement in `index.html`. Both strings occur exactly once in the file.

**URL form:** every URL in this block uses the **extensionless** path, matching `sitemap.xml` and the three pages that already carry `rel="canonical"`. Do not use the `.html` form here — the sitemap declares the extensionless URL canonical, and this block is the machine-readable description of the page.

**Find:**

```html
</style>
</head>
```

**Replace with:**

```html
</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Branded Entertainment Strategy and Fractional Content Leadership",
  "serviceType": "Branded Entertainment Strategy",
  "url": "https://jeffhallstead.com/content-studio",
  "description": "Jeff Hallstead helps brand and marketing leaders operate like media companies: the content strategy, the original programming, and the distribution that turn an audience into an asset the brand owns. Built for brand teams carrying a content mandate without a senior content leader.",
  "provider": {
    "@type": "Person",
    "name": "Jeff Hallstead",
    "url": "https://jeffhallstead.com"
  },
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "United States"
  },
  "audience": {
    "@type": "BusinessAudience",
    "name": "Brand and marketing leaders at consumer brands with an approved content budget of $250,000 a year or more"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Ways to work with Jeff Hallstead",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "The Publisher Blueprint",
        "price": "3500",
        "priceCurrency": "USD",
        "url": "https://blueprint.jeffhallstead.com/",
        "itemOffered": {
          "@type": "Service",
          "name": "The Publisher Blueprint",
          "description": "An executive analysis of where your audience spends attention, which content formats fit your brand and budget, and the highest-leverage gap to close first. Delivered as a sequenced 90-day roadmap with named owners and month-by-month initiatives, walked through live with your team, and credited in full against the 90-day engagement. Starts with the Publisher Test, a free twelve-minute assessment."
        }
      },
      {
        "@type": "Offer",
        "name": "The 90-Day Engagement",
        "url": "https://jeffhallstead.com/contact",
        "itemOffered": {
          "@type": "Service",
          "name": "The 90-Day Engagement",
          "description": "Jeff runs the Blueprint with your team over ninety days, building the operating model the shift requires: a slate of original programming the audience chooses to watch, distribution across the platforms where customers already spend time, and the measurement framework that proves the program is working before the next budget cycle."
        }
      },
      {
        "@type": "Offer",
        "name": "Fractional Content Leadership",
        "url": "https://jeffhallstead.com/contact",
        "itemOffered": {
          "@type": "Service",
          "name": "Fractional Content Leadership",
          "description": "Senior content leadership on a monthly retainer covering ten to twelve hours a month. Jeff sets the content strategy, keeps the measurement honest, and evaluates platform and talent partnerships as they surface, working alongside the agencies and vendors already in place. Most engagements run six to twelve months. Executive producing is scoped separately when a project is greenlit."
        }
      }
    ]
  }
}
</script>
</head>
```

**Deliberate omissions, so nobody adds them back:**

- **No price on the 90-Day Engagement or the retainer.** A structured-data validator will flag those two offers as incomplete. That is expected and correct — the alternative is publishing a number that isn't published anywhere else, and neither is on the site by decision.
- **No FAQPage block.** `index.html` already carries one. The same FAQ on two URLs is a duplicate, not a second chance.

**Acceptance:**

- `grep -o 'application/ld+json' content-studio.html | wc -l` returns `1`.
- The block parses as valid JSON. Quick check:
  `python3 -c "import re,json;s=open('content-studio.html').read();[json.loads(b) for b in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>',s,re.S)];print('ok')"`
- `grep -c '35,000\|35000' content-studio.html` returns `0`.
- `grep -o 'ten to twelve hours a month' content-studio.html | wc -l` returns `2` — once in the retainer card, once in the schema description. That is the expected count after this story, up from `1` before it.
- `grep -o 'jeffhallstead.com/content-studio.html\|jeffhallstead.com/contact.html' content-studio.html | wc -l` returns `0` inside the JSON-LD block. The pre-existing `og:url` still carries the `.html` form; that is out of scope here and handled by the canonical work below.
- Validates clean at validator.schema.org apart from the two intentional missing-price notices.

---

## Whole-file acceptance, run after all four

Use `grep -o ... | wc -l`, not `grep -c` — `grep -c` counts matching *lines*, and several of these sit on the same line as other content.

```
grep -o 'Strategy Session\|Entertainment Roadmap' content-studio.html | wc -l   # 0
grep -o '\$3,500' content-studio.html | wc -l                                   # 1
grep -o 'ten to twelve hours a month' content-studio.html | wc -l               # 2
grep -o '’\|“\|”' content-studio.html | wc -l                                   # 0
grep -o '&[a-z]\+;' content-studio.html | wc -l                                 # 1  (&copy; in the footer, pre-existing)
grep -o 'Proof — Pour Les Femmes' content-studio.html | wc -l                   # 1
grep -o 'Case Study — Pour Les Femmes' content-studio.html | wc -l              # 1
grep -o 'application/ld+json' content-studio.html | wc -l                       # 1
grep -o '<div' content-studio.html | wc -l                                      # 67
grep -o '</div>' content-studio.html | wc -l                                    # 67
```

The div counts are the copy-paste tripwire — 67 and 67 both before and after, since none of these four stories adds or removes a div.

Then render the page and check the three cards side by side: each one opens with a sentence, not a number.

**Simulation note:** all four edits were applied to `content-studio.html` at `b0380a6` in a scratch copy before this work order was written. Every find string matched exactly once, the div counts held at 67/67, and the JSON-LD block parsed. The numbers above are measured, not assumed. Independently re-verified against the working tree at `301c7ca`.

---

## Out of scope, but found while checking

**Canonical tags are inconsistent, not absent.** Three of twelve root pages carry `<link rel="canonical">` — `fractional-cco-vs-agency.html`, `microdramas.html`, `productions.html` — and all three point at the extensionless URL. The other nine carry none, and their `og:url` uses the `.html` form while `sitemap.xml` declares the extensionless URL for every page. So on three quarters of the site, the sitemap and the social metadata disagree about the canonical address.

The fix is a one-line addition per file plus an `og:url` correction on the same nine, following the pattern the three compliant pages already set. Separate, sitewide, and worth doing before the page gets real inbound traffic.
