# StoryBrand Homepage Rewrite — jeffhallstead.com

Messaging-only refactor of `index.html`. No redesign: typography, color palette, nav, spacing
system, imagery, and responsive behavior are unchanged. Every new component reuses existing
design tokens and patterns already in the codebase.

---

## 1. Section ordering

### Recommended order (implemented)

| # | Section | StoryBrand role | Change |
|---|---------|-----------------|--------|
| 1 | Hero | Character + Problem + CTA | Rewritten |
| 2 | Problem | Problem (external + internal) | Expanded |
| 3 | Guide (was "About") | Guide: empathy + authority | Rewritten, **moved up** |
| 4 | **Results / Social Proof** (was "Track Record") | Authority (evidence) | Rebuilt, **moved up** |
| 5 | Process | Plan | Tightened |
| 6 | Mid CTA | Call to action | Rewritten |
| 7 | Outcomes (was "Success") | Success | Rewritten, **moved up** |
| 8 | Stakes | Failure | Condensed |
| 9 | Final CTA | Call to action | **Split into its own section** |

> **Owner decision (post-review):** an above-fold stats banner (`4x / 250K+ / 50+ / 0→1`) was
> built and then **removed at Jeff's direction** — the underlying data wasn't considered
> compelling enough to lead with. This is a knowing, documented departure from the PRD's
> "social proof significantly more visible" requirement. Social proof and testimonials are
> deferred to a future update. See *Deferred* at the end of this document.

### What moved and why

**Guide moved above Process.** StoryBrand order is Problem → Guide → Plan. Previously the plan
(Process) came before the reader had any reason to trust the planner. Establishing the guide
first makes the three steps feel credible rather than presumptuous.

**Social proof consolidated into one placement.** The build originally split evidence in two — a
thin metrics strip above the fold plus a full Results section. The above-fold strip was removed at
Jeff's direction (see note above), leaving a single **Results section directly after the Guide**,
where it functions as evidence for the authority claim just made.

The trade-off this creates: a visitor now has to scroll past the Problem and Guide sections before
encountering any proof. The 10-second "can they solve my problem?" question is answered by the
hero's claim rather than by evidence. Worth revisiting when stronger numbers or testimonials exist.

**Outcomes moved above Stakes, and the Final CTA separated out.** Previously the outcome
paragraph and the closing CTA were the same section, and Stakes (the negative) came last before
it. Now the page runs positive vision → cost of inaction → close, so the last thing before the
button restates the transformation rather than the threat.

**Standalone Newsletter section removed.** ⚠️ *Flagging this one explicitly.* The homepage had a
full `#newsletter` section whose form was byte-for-byte identical to the subscribe band already
sitting in the footer, ~200px below it. It was a second CTA competing with the primary one right
before the close. The footer subscribe band is untouched, so **no functionality or conversion
path was lost** — the newsletter signup is still on the page. Easy to restore if you disagree.

---

## 2. Copy diff, section by section

### Section 1 — Hero

**Eyebrow**

> **Before:** Advisory Services · Brand Strategy · Content Leadership · Media
>
> **After:** For CMOs, brand leaders, and founders building owned audiences

*Rationale:* The old label listed what Jeff sells. The new one names who the page is for, which
is the "Is this for me?" question. A CMO now self-identifies in the first line they read.

**Headline**

> **Before:** The Brands Building Lasting Audiences Aren't Running Ads. *They're Creating
> Entertainment. Here's How to Do It.*
>
> **After:** Your Brand Doesn't Need More Ads. *It Needs an Audience It Owns.*

*Rationale:* The old headline was about "the brands" — third-party, observational, industry
commentary. The new one addresses the reader as "you" and states their problem and the desired
outcome in nine words. Adopted the PRD's suggested direction essentially as-written; it was
stronger than the alternatives I drafted. The two-line italic treatment is preserved exactly.

**Subheadline**

> **Before:** Jeff Hallstead works with brand teams ready to move beyond advertising, building
> branded entertainment strategies, executive producing original content, and developing the
> distribution infrastructure that turns content into a competitive asset.
>
> **After:** Every quarter, you pay more to reach the same people — and it disappears the moment
> the campaign ends. Jeff Hallstead helps brand and marketing leaders build original
> entertainment people choose to watch: content you own, on platforms you control, that keeps
> working long after the media buy stops.

*Rationale:* The before is a list of Jeff's service lines. The after leads with the reader's pain
("you pay more… it disappears"), then names who he helps, what they get, and why it matters —
the three things the PRD requires. The `productions.html` inline link is preserved.

**CTAs**

> **Before:** `book a strategy call` / `see the work →` (→ `#track`)
>
> **After:** `book a strategy call` / `see the results →` (→ `#results`)

*Rationale:* Primary CTA needed no change — it was already action-oriented and matches the PRD's
examples, so it stays identical everywhere for consistency. Secondary changed from "work"
(activity) to "results" (outcome).

---

### ~~Proof strip~~ — built, then removed

An above-fold band of four metrics sat between the Hero and the Problem section:

| Metric | Source |
|---|---|
| `4x` DTC revenue growth, year one | `case-study-plf.html` |
| `250K+` visits from a single brand partnership | Mastercard Europe campaign, `case-study-plf.html` |
| `50+` countries reached via DTC | `case-study-plf.html` / `about.html` |
| `0→1` new company built, brand to platform | `case-study-sae.html` |

**Removed at Jeff's direction** — the data wasn't judged compelling enough to lead with. All
markup and CSS were deleted cleanly; the metrics themselves still appear in context inside the
Results section, where the case study narrative gives them meaning.

If this is revisited, the strongest candidates for an above-fold band are a named client outcome
or a testimonial line, not raw figures.

---

### Section 2 — Problem

> **Before (summarized):** One 78-word paragraph. "Most brand teams already know that branded
> entertainment is where attention is going. The gap isn't awareness of the opportunity; it's the
> ability to execute it… That's the gap Jeff fills." Purely operational framing.
>
> **After:** Headline "You're Paying More Every Year to Rent an Audience You'll Never Own," a
> two-sentence external framing, then five internal/emotional problems as a scannable list, then
> a closing line that removes blame.

The five internal problems now stated explicitly:

- Leadership expects measurable growth, and the numbers are getting harder to defend.
- Your budget is under more scrutiny than it has ever been.
- Agencies keep delivering campaigns that expire instead of assets that compound.
- Your team is already stretched, with no in-house production or distribution experience.
- Getting the exec team aligned on a multi-quarter content bet feels harder than the bet itself.

*Rationale:* This is the PRD's Rule 2 and the largest single gap in the original page. The old
copy described a market condition; it never named what the reader personally feels — executive
pressure, budget scrutiny, agency frustration, alignment difficulty. The closing line ("you're
being asked to build something most marketing teams have never had to build before") reframes
the reader's situation as structural rather than a personal failure, which is what makes the
section land as empathy instead of accusation. Note the section ends by naming the problem, not
by naming Jeff — the old version resolved to "That's the gap Jeff fills," which stole the moment.

**Secondary CTA**

> **Before:** `take the content readiness assessment →`
>
> **After:** `not ready to talk? take the publisher test →`

*Rationale:* Explicitly labels the off-ramp for visitors who aren't ready to book, per Rule 4,
and matches the tool's actual name in the nav ("The Publisher Test") rather than a third name for
the same asset.

---

### Section 3 — Guide (formerly "About")

> **Before (summarized):** Three paragraphs of chronological biography. "Jeff Hallstead has spent
> 15+ years inside the organizations doing the real work — as CEO, co-founder, fractional Chief
> Content Officer, and trusted advisor… on three continents." Headline: "He's Built Branded
> Content Programs. He Knows How to Distribute Them."
>
> **After:** Headline "You Need Someone Who's Already Built This." Opens with empathy — a
> description of the reader's position — then delivers authority as specific, named evidence,
> then closes on the benefit to the reader.

*Rationale:* Rule 3. The before opened with "Jeff Hallstead has spent 15+ years…" — the classic
guide-as-hero move. The after opens with "Most brand leaders exploring branded entertainment are
doing it with no in-house production experience, no distribution relationships, and a board that
wants returns in two quarters," so the reader sees themselves before they see Jeff. Credentials
were also made concrete: "trusted advisor across… three continents" became named proof —
NBCUniversal, Mastercard Europe, Nielsen/Comscore/Kantar. Closing line answers "so what does that
get me": *"you're not paying someone to learn on your budget."*

Cut 162 → 130 words. The production/distribution credits (Robin Wright series, platform list) were
removed here because the Results section immediately below proves the same point with more
specificity — stating it twice in adjacent sections weakened both.

The eyebrow changed from "About Jeff" to "Your Guide" — same information, reframed around the
reader's need.

---

### Section 4 — Results / Social Proof (formerly "Track Record")

> **Before (summarized):** Headline "A Proven Track Record of Building Where Others Speculate,"
> followed by four generic capability bullets ("15+ years in audience measurement…", "Fractional
> content and brand leadership for DTC, media, and entertainment brands"). No numbers, no client
> names, no outcomes.
>
> **After:** Headline "What It Looks Like When It Works." Two case cards led by a metric, each
> with concrete named outcomes and a link to the full case study, plus a partner strip.

*Rationale:* The old section asserted a track record; it never evidenced one. Every bullet was a
category of work rather than a result. The new cards lead with `4x` and `0→1` and name verifiable
specifics (Robin Wright, Shoppable TV, 250,000+ visits, Cannes Lions, Clinton Global Initiative).
This is the PRD's "use quantitative results wherever possible."

**Partner strip.** Labeled *"Organizations across Jeff's client work, brand partnerships, and
distribution"* — deliberately precise wording. Netflix / HBO Max / Amazon are distribution
partners of Bombo Sports & Entertainment (where Jeff is EP and strategic advisor), and
Nielsen / Comscore are former employers, not clients. The label is accurate for all ten names
without implying each is a consulting client. Rendered as type in the existing display font
rather than logo images, since no logo assets exist in the repo and adding them would mean
sourcing third-party marks.

---

### ⚠️ Testimonials — deliberately not written

The PRD asks for testimonials. **There are none anywhere on this site**, and I did not invent
any. Writing fabricated quotes attributed to real people or companies is not something I'll
produce — beyond the ethics, a made-up quote from a named executive is a concrete legal and
reputational risk for Jeff.

What shipped instead: ready-to-fill markup, commented out in `index.html` in the Results section,
with real styling already wired up (`.testimonial-quote`, `.testimonial-attrib`). Nothing fake
renders. To activate, get 2–3 real quotes and uncomment the block.

**This is the highest-value remaining item on the page.** Suggested ask to past clients — one
question, easy to answer:

> "What changed for your business as a result of this work?"

Best placement is where the markup already sits: directly beneath the two results cards and above
the partner strip, so quotes reinforce metrics that were just proven.

---

### Section 5 — Process

Eyebrow changed "The Process" → "The Plan". Headline "A Clear Path Forward" → "Three Steps. No
Ambiguity." (borrowed from `about.html`, where this phrasing already exists — keeps the site
consistent with itself).

| Step | Before | After |
|---|---|---|
| 01 | "The Clarity Conversation" — 3 sentences | "Book a Strategy Call" — 1 sentence |
| 02 | "The Strategic Roadmap" — Jeff-subject, 1 long sentence | "Get Your Strategic Roadmap" — reader-subject |
| 03 | "Build and Execute" | "Build It With Jeff in the Room" |

*Rationale:* Step names are now verbs the reader performs, not nouns Jeff delivers. Step 01's
name now matches the CTA button copy exactly, so the button and the plan reinforce each other.
Each step is one sentence per the PRD.

---

### Section 6 — Mid CTA

> **Before:** "Ready to close the gap?" / secondary: `looking for a fractional CCO? see the
> content studio →`
>
> **After:** "Ready to own your audience instead of renting it?" / secondary: `need a fractional
> CCO? see services →`

*Rationale:* "Close the gap" is consultant-speak that means nothing to a first-time visitor.
The new line restates the page's core promise in the reader's language. Secondary CTA shortened
and pointed at "Services," which is what the nav actually calls that page — the old copy called
it "the content studio," a third name for the same destination.

---

### Section 7 — Outcomes

> **Before:** "Imagine Knowing Exactly How to Tell Your Story — and Having the Market Actually
> Listen." Body ended on "That's what working with Jeff makes possible."
>
> **After:** "A Year From Now, Your Best Marketing Asset Could Be One You Own." Body is a
> concrete list of business outcomes: owned library that appreciates, distribution where
> customers already are, measurement proving brand equity, less paid-media dependence, an aligned
> exec team.

*Rationale:* "Imagine knowing how to tell your story" is a feeling, not a business outcome, and
is not measurable by anyone's board. The new version is time-bound and asset-focused, and every
clause maps to something a CMO can report upward. Dropped the closing "That's what working with
Jeff makes possible" — it swung the camera back to Jeff at the exact moment the reader should be
picturing themselves. Also removed the duplicate CTA buttons here, since the Final CTA now
follows immediately.

---

### Section 8 — Stakes

Cut from 79 words to 41. Headline "…Aren't Always Making the Best Products" → "…Aren't Always the
Ones With the Best Product."

*Rationale:* The original made the same point four times (window closing, movers build
relationships, library compounds, laggards pay to reach someone else's audience). Keeping the
strongest version — rising cost to reach your own customers while a competitor's library
compounds — makes it land harder and shortens the run to the close.

---

### Section 9 — Final CTA *(now its own section)*

> **After:** Eyebrow "Next Step." Headline "Stop Renting Attention. Start Building an Audience
> You Own." Body restates who it's for and what the call delivers. `book a strategy call` /
> `read a case study →`

*Rationale:* Restates problem (renting attention) and transformation (an audience you own) using
the hero's exact vocabulary, and introduces no new concepts, per the PRD. The 45-minute detail is
repeated here so a visitor who scrolled straight to the bottom still knows exactly what they're
agreeing to.

---

## 3. CTA hierarchy

**One primary CTA, identical copy, three placements:** `book a strategy call` → `contact.html`
(hero, mid-page, final). Unchanged from the original — it was already right.

**Secondary CTAs, each serving a different not-ready-yet reader:**

| Reader state | CTA | Destination |
|---|---|---|
| Wants evidence first | `see the results →` | `#results` |
| Not ready to talk to anyone | `not ready to talk? take the publisher test →` | readiness assessment |
| Wants a different service | `need a fractional CCO? see services →` | `content-studio.html` |
| Wants depth | `read a case study →` | `case-study-plf.html` |
| Wants to stay in touch passively | Newsletter subscribe | footer band |

---

## 4. Messaging hierarchy

```
Who it's for        CMOs, brand leaders, founders building owned audiences
External problem    Paying more each year to rent an audience you'll never own
Internal problem    Exec pressure · budget scrutiny · stretched team · alignment difficulty
Philosophical       Attention you rent disappears; attention you own compounds
The guide           Empathy: has stood where you stand
                    Authority: built it — named, quantified, verifiable
The plan            Book a call → Get a roadmap → Build it with Jeff in the room
Primary CTA         book a strategy call
Success             A content library you own that appreciates while paid media depreciates
Failure             Cost to reach your own customers rises while a competitor's library compounds
```

---

## 5. Acceptance criteria

| Criterion | Status |
|---|---|
| Customer consistently positioned as hero | ✅ Every section headline addresses "you" or the reader's outcome |
| Jeff functions as trusted guide | ✅ Guide section leads with empathy; authority is evidence, not résumé |
| Internal emotional problems articulated | ✅ Five named in the Problem section |
| Transformation concrete and business-focused | ✅ Outcomes section is asset- and metric-oriented |
| Every major section has a clear purpose | ✅ Mapped in the ordering table above |
| Primary CTA appears consistently | ✅ Identical copy, three placements |
| Social proof significantly more visible | ❌ **Not met — deliberate owner decision.** The Results section is stronger than the old Track Record, but the above-fold stats banner was removed and there are no testimonials. Deferred to a future update. |
| Copy more concise than current | ❌ **Not met on total word count.** See below. |
| Understandable in under 30 seconds | ⚠️ **Partially.** Hero answers "is this for me?" immediately; "can they solve my problem?" now requires scrolling to the Results section. |

### On conciseness — the honest number

The finished page is **longer**, not shorter: 756 → 795 words in `<main>` (**+5.2%**).

The single largest driver is the Problem section, which the PRD explicitly said to expand
(82 → 143 words, +61). Every section the PRD did *not* ask to expand got tighter — about 10% down
in aggregate:

| Section | Before | After |
|---|---|---|
| Guide (was About) | 162 | 130 |
| Stakes | 82 | 47 |
| Process | 106 | 95 |
| Outcomes | 86 | 73 |
| Track Record *(replaced by Results)* | 113 | — |
| Newsletter *(removed, duplicate)* | 40 | — |

If you want the total under 756, the realistic lever is trimming the Problem list from five items
to three (−25) — but that section is doing the heaviest StoryBrand work on the page, so I'd argue
against it.

---

## 6. Deferred to a future update

Both are conscious decisions, not oversights. Together they mean the homepage currently
under-delivers on the PRD's social proof requirement — a known, accepted trade.

**Testimonials.** None exist anywhere on the site, and none were invented. Ready-to-fill markup
sits commented out in the Results section of `index.html` with styling already wired
(`.testimonial-quote`, `.testimonial-attrib`); nothing fake renders. To activate, collect 2–3 real
quotes and uncomment the block. Suggested ask: *"What changed for your business as a result of this
work?"*

**Above-fold social proof.** The stats banner was removed as not compelling enough to lead with.
When better material exists, the strongest replacement is a single named client outcome or a
testimonial line rather than a row of figures.

---

## 7. Other work completed alongside this rewrite

- **Contact form migrated to Netlify Forms.** Previously a `mailto:` handoff that displayed
  "Message received" unconditionally — including when no mail client opened and nothing was ever
  sent. Now a real POST with a honeypot; the success state appears only on a successful response,
  and failures surface an error plus a direct email fallback. See section 8.
- **`about.html` stray markdown fences removed** — were rendering as visible text and forcing the
  JSON-LD block out of `<head>`.
- **16 broken `@media` queries fixed across 8 pages** — the keyword was missing, so the newsletter
  band never stacked on mobile and its Subscribe button was clipped off-screen.
- **8 `your.com` email placeholders corrected** to `your@email.com`.

---

## 8. Still open

1. **Verify the contact form end-to-end after deploy.** Netlify registers forms by scanning
   deployed HTML, so the success path cannot be tested locally. After the first deploy, confirm
   "contact" appears under **Site configuration → Forms** and set up email notifications —
   otherwise submissions collect silently in the dashboard.
2. **Voice inconsistency across the site.** `index.html` refers to "Jeff" in third person;
   `about.html` is first person ("I've built companies from zero"). A visitor moving between them
   notices. Worth picking one — first person generally reads warmer for a solo consultant.
3. **Other pages still lead with the old positioning.** `content-studio.html`, `about.html`, and
   `contact.html` describe the audience as "brands, social enterprises, and media companies,"
   which doesn't match the homepage's new CMO/brand-leader framing.
4. **Dead CSS:** the `#track .credentials` / `.cred-item` rules in `index.html` are now unused.
   Left in place deliberately — harmless, and useful if you restore that section.
