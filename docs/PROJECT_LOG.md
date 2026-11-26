# Project log: Tenonpath

The running record. Newest entries at the top of each section. Anyone (Brian, the orchestrator, Claude Code) updates this at the end of a work session.

## Current phase
**Phase 5: Launch**: account-free work done. Stopped before anything that needs accounts (form backend, Railway, DNS). See "Needed from Brian to launch".

## Phases
### Phase 1: Foundation
- [x] Astro project scaffold, static output, Railway-ready
- [x] `src/styles/tokens.css` from BRAND.md (colors, type scale, spacing, grid)
- [x] Self-hosted fonts: General Sans (400/500/600), IBM Plex Mono (400/500)
- [x] Base layout: header, footer, 12-column grid, blueprint grid background, section label component, measurement-line divider component
- [x] Lenis smooth scroll + GSAP ScrollTrigger wired up, with reduced-motion fallback
- [x] A `/styleguide` page (not linked, `noindex`) showing colors, type, buttons, rules, section labels, so Brian can judge the look
- [x] Three logo concepts (A, B, C from BRAND.md) as SVG on the styleguide page, each animated
- **Review gate:** Brian picks a logo and approves or tweaks colors and type. Done 2026-11-26: Concept A, refined.

### Phase 2: Hero
- [x] Hero layout and copy
- [x] Joinery scroll animation (SITE_SPEC 01), desktop pinned/scrubbed, mobile play-once, reduced-motion end state
- [x] Final logo applied in header, favicon set
- **Review gate:** Brian approves the hero. Done 2026-11-26 with changes (see Decisions).

### Phase 3: Homepage sections
- [x] Sections 02 to 10 per SITE_SPEC and COPY (demo section uses a placeholder frame until phase 4)
- [x] Contact form UI (submission wired in phase 5)
- **Review gate** Done 2026-11-26 with changes (see Decisions).

### Phase 4: Demo dashboard
- [x] Fictional data set in `src/data/demo/`
- [x] `/demo` with Overview, Collections, Leases, Tasks, Pipeline
- [x] Embedded cut-down demo in homepage section 04, lazy loaded
- **Review gate** Done 2026-11-26 with changes (see Decisions).

### Phase 5: Launch
- [ ] Contact form backend, spam protection, `.env.example`. UI, validation and the honeypot are done, `.env.example` documents `PUBLIC_FORM_ENDPOINT`, and the form already posts JSON to that URL (Formspree-compatible). Needs the account and URL from Brian (below).
- [ ] `/real-estate`, `/privacy`: need copy (not in COPY.md yet). `/404`: done.
- [x] SEO: meta, schema, sitemap, robots, OG image. Canonical, Open Graph and Twitter tags on every page; Organization, ProfessionalService and FAQPage JSON-LD on the homepage; /sitemap.xml and /robots.txt built at deploy; public/og.png 1200x630.
- [x] Lighthouse and accessibility pass (mobile, local production build): home 100/100/100/100, /demo 99/100/100/100, CLS 0 on both. [ ] Cross-device check on real phones and Safari: still to do (needs devices, or a deployed preview URL).
- [ ] Deploy to Railway, connect tenonpath.com and www. railway.json is ready (build `npm run build`, start `npm start`, health check `/`). Needs the Railway account and DNS access (below).
- [x] Email signature logo (PNG + SVG): public/brand/email-signature.svg, .png (600x200) and @2x.png (1200x400); also logo-full.svg (dark) and logo-full-light.svg. Rebuild with `npm run brand`.

## Needed from Brian to launch
1. **Contact form.** Pick one: (a) **Formspree** (recommended, simplest): create a free account with hello@tenonpath.com, create a form, send the form URL (https://formspree.io/f/xxxx). It becomes `PUBLIC_FORM_ENDPOINT` in Railway's variables. It is public by design (used in the browser), so it is not a secret. Formspree adds its own spam filtering and rate limits on top of our honeypot. Or (b) a small endpoint on our own Railway server that sends mail: needs SMTP credentials for the GoDaddy mailbox (host, port, user, app password) as Railway secrets, and about half a day more work.
2. **Railway.** A Railway account (or an invite to Brian's), connected to the GitHub repo brianmsv-dev/tenonpath-site. No secrets needed for the site itself.
3. **DNS.** Decide: move DNS to Cloudflare (recommended in the open questions) or stay on GoDaddy. Then access to add the records Railway gives for tenonpath.com and www (usually a CNAME for www and an ALIAS/ANAME or flattened CNAME for the root). Keep the existing MX records for email untouched.
4. **Copy for /real-estate and /privacy.** Both are in SITE_SPEC but have no text in COPY.md. Privacy needs to say what the form collects, where it goes (Formspree or our server), how long it is kept and who to contact. Ask the orchestrator to draft both.
5. **Demo photos** (optional): 8 property images into `src/assets/demo/photos/` (README there).
6. **COPY wording**: the demo body says "fictional industrial portfolio" but the portfolio is now mixed (see open questions).
7. **Real-device check** after the first deploy: an iPhone (Safari) and an Android phone, plus Safari on a Mac if available.

## Decisions
- 2026-11-26 (Claude Code, phase 5): No new dependencies. Sitemap and robots are Astro endpoints (no @astrojs/sitemap). Brand PNGs and the OG card are rendered by `npm run brand` with the locally installed Chrome; the wordmark SVG paths were extracted once from General Sans Semibold (fontTools, run outside the project) and are stored in src/data/wordmark.ts. Lighthouse was run with `npx lighthouse@12` (a one-off tool, not added to package.json).
- 2026-11-26 (Claude Code, phase 5): Scroll reveals now animate opacity only (no visibility: hidden), so content not yet revealed stays available to screen readers and keyboard users. This fixed the only accessibility flag (heading order).
- 2026-11-26 (Claude Code, phase 5): Fonts are served with a one-year immutable cache (as are hashed build files). If a font file is ever replaced, give it a new file name.
- 2026-11-26 (Claude Code, phase 5): 404 shows the mark with its stem shifted sideways: it slides up and butts against the bar because the tongue misses the slot. Static with reduced motion. noindex.
- 2026-11-26 (Claude Code, phase 5): The email signature is 600x200 on white (most email clients have white backgrounds), lockup sized to fit with 30px padding; a 1200x400 version is included for sharp display on high-DPI screens (set it to 600x200 in the signature editor).
- 2026-11-26 (Brian + orchestrator, phase 4 review): Demo changes, all built:
  1. Money in integer cents, whole dollars only, rounded once at display (no rounding happens, since amounts are whole). The generator refuses to write, and `astro build` fails, unless every total ties out: each tenant's buckets to its total, bucket columns to the aging figures, tenants to past due, properties to the portfolio, payments to collected, the chart's end to collected, task counts to the headline, and the headline figures to the hero. Proven: a $1 change to one balance fails the build. The old $1 mismatch (Pellmont $4,145 + $4,145 = $8,289) is gone.
  2. "Collected this month vs last month" replaces "Collections by week": cumulative by day of month, this month in the data colour (solid), last month neutral and dashed (so the two differ by more than colour), as-of marker with the running total, and one line comparing to the same day last month. Overview and embed.
  3. Open tasks past due show the date in the alert colour and count in an "Overdue" figure in the Tasks summary; Overview's open tasks show "N overdue" under the count, and the Open tasks figure shows it too. Currently 8 of 37 are overdue.
  4. DEMO DATA label moved into the top banner (part of the page flow), so it can never cover content.
  5. Tabs fit one line at 360px: neutral sans, size clamps from about 12.5px, tighter gaps. Measured at 360, 390, 414 and 768px on /demo and in the embed: one line, no overflow, no scrollbar.
  6. Homepage embed shows all five tabs, no inner scroll; the frame grows to fit. Long tables (Paid this month, Leases, open tasks) show 8 rows with "Showing 8 of N." and an "Open the full demo" link; the Collections filter re-applies the cap and totals still count every matching row. The embed's Tasks view is one table of open tasks by due date.
  A. The dashboard is now a neutral client product with its own theme system (Light default, Classic warm light with navy, Dark) and five accents (Blue, Navy, Green, Burgundy, Amber). Our chrome (banner, Tenonpath logo, "Make it yours", frame lines) stays in our brand around it. "Make it yours" on /demo: Company name (live, max 40, nothing stored or sent: no cookies or storage, no requests; verified), Theme, Accent, and the COPY line. Embed: Company name and Theme. Contrast, all AA: text 4.5:1 or better and chart lines and UI marks 3:1 or better in every theme. Data line 5.47 / 5.34 / 6.82, last-month line 3.77 / 3.76 / 5.39, alert text 6.57 / 6.84 / 6.89, accents as text 5.70 or better (Light / Classic / Dark).
  B. Portfolio renamed "Harbor & Pine Properties", deliberately generic: 4 industrial, 2 flex, 1 neighborhood retail center, 1 small office building, across Dallas and Austin TX, Tempe AZ, Columbus OH, Indianapolis IN, Kansas City MO, Nashville TN and Charlotte NC. 42 tenants with invented names suited to each asset type. Tasks are generic operations (maintenance, inspections, vendors, leasing, tenant requests); insurance and lender items are capped at 4 of 52; snow removal only appears in the Midwest. Pipeline mixes types and markets (TX, AZ, OH, MO, NC, TN). Regenerated; everything ties out.
  C. Property thumbnails on /demo only, lazy loaded, WebP at build. Photos go in `src/assets/demo/photos/property-1.jpg` ... `property-8.jpg`, not `public/demo/photos/` as first suggested: only files under `src/` go through Astro's built-in image pipeline (it uses sharp, which ships with Astro, so no new dependency). Tested with a temporary image: it came out as a 128x88 WebP with loading="lazy". Until photos exist, a hand-drawn line icon per asset type is shown. No photos on the homepage.
- 2026-11-26 (Claude Code, phase 4 review): Originality. No code, data, naming or layout in this repo was copied from any other repository, including brianmsv-dev/rm-connector. Claude Code did not open, clone or read any other repository during this work; everything here was written from the docs in this repo.
- 2026-11-26 (Claude Code, phase 4 review): Demo dates now shift by whole months (not weeks) to the latest 20th before the build, so "this month vs last month" lines up with calendar months.
- 2026-11-26 (Claude Code, phase 4): Demo data is generated by `npm run demo-data` (scripts/generate-demo-data.mjs, fixed seed, Node built-ins) into src/data/demo/*.json. Fictional "Harbor & Pine Industrial": 8 properties in the US Southeast (invented names, city names only, no addresses), 40 tenants with invented names, payments, aging, 52 tasks, 37 critical dates, 9 acquisition deals. The generator refuses to write unless the totals match the hero exactly: 94.2% occupancy by SF, $412,860 collected this month, $18,240 past due (4 tenants, all four aging buckets used), 37 open tasks. The weekly chart's last three weeks are built from the same payments, so every number on the site reconciles. Invented names were chosen to avoid real companies, but a coincidental match with some real business somewhere cannot be ruled out entirely.
- 2026-11-26 (Claude Code, phase 4): Demo dates are shifted forward in whole weeks at build time, so the "as of" date is always the latest Friday before the build and the 180-day window stays current. Each deploy refreshes it.
- 2026-11-26 (Claude Code, phase 4): The demo is rendered at build time (Astro, plain HTML tables and SVG) with a small script (about 1.4 KB gzipped) for tabs, the property filter and sorting. No chart or table library. The Collections filter recomputes the aging buckets, counts and paid total from the visible rows.
- 2026-11-26 (Claude Code, phase 4): Homepage section 04 lazy loads /demo/embed/ (a noindex fragment, about 5.6 KB gzipped) when the frame is within about 800px of the viewport, copies its stylesheet in and imports the demo script on demand. The embed is cut down to Overview, Collections and Leases. The frame has a fixed size (16:9 on desktop, 80% of the screen height on phones) and scrolls inside itself, so there is no layout shift. If the fetch fails, the frame says so and links to /demo.
- 2026-11-26 (Claude Code, phase 4): /demo has its own top bar (logo to home, portfolio name), the SITE_SPEC banner with "Start a project" linking to /#contact, and the fixed "DEMO DATA" label. No site header, footer or smooth scroll there. The selected view is kept in the URL hash (/demo#collections) so a view can be shared. On phones, tables become labelled stacked rows instead of scrolling sideways, and the tab bar wraps rather than scrolling.
- 2026-11-26 (Claude Code, phase 4): Dashboard UI labels (column headers like "Collected MTD", block titles like "Paid this month", "Critical dates, next 180 days", task owners as roles, deal codenames "Project Osprey" etc.) are product content inside the fictional demo, not marketing copy. Flag any you want changed.
- 2026-11-26 (Brian, phase 3 review): Problem strike-through redone. A 1.5px brass line on the task text only (inline background line with box-decoration-break: clone, so it follows wrapped lines), never across timestamps or empty space; the text dims to bone-dim once struck; row hairlines only between rows. Reduced motion shows the same struck, dimmed end state with the answer visible. Checked at 390, 1440 and 1920px, motion on and off.
- 2026-11-26 (Brian, phase 3 review): FAQ gets the COPY headline "Before you ask." in the left column, styled like the other section headlines.
- 2026-11-26 (Brian, phase 3 review): Contact form requires only Name, Email and "What systems do you use today?". Company, "What do you want to see in one place?", Budget range and "How did you hear about us?" are optional. Error wording unchanged. Labels stay exactly as COPY (only the last says "(optional)").
- 2026-11-26 (Claude Code, phase 3): 02 Problem. "A thin brass line strikes through the whole list" is built as one brass line through each row, drawn in quick succession after the rows slide in, then "Or: open one dashboard." appears in brass. Plays once on enter.
- 2026-11-26 (Claude Code, phase 3): 05 Process. SITE_SPEC says the brass line draws "as the user scrolls"; BRAND says scrub only the hero. SITE_SPEC wins (authority order), so the line is scroll-scrubbed but not pinned. Each tick locks when the line reaches it. Horizontal from 900px, vertical below.
- 2026-11-26 (Claude Code, phase 3): 04 Demo uses COPY.md's split (body, then the note "Fictional portfolio. Real build quality.") rather than SITE_SPEC's one-line note; the body already carries "connected to your own systems". The frame is 16:9 with dimension lines, brass corner marks and a build marker inside ("Placeholder / interactive demo arrives in phase 4") that phase 4 removes. "Open the full demo" links to /demo, which 404s until phase 4.
- 2026-11-26 (Claude Code, phase 3): 06 and 09 have no single headline in COPY. 06 uses its two column headlines as h2s; 09 uses its section label "09 / QUESTIONS" as the h2. FAQ is native <details>, so it works with the keyboard and without JS; FAQPage schema is generated from the same data (src/data/faq.ts).
- 2026-11-26 (Claude Code, phase 3): 07 Pricing prints prices without the trailing full stops used in COPY ("From $2,500"), since they are set as figures; "per month" is set smaller after $200. Words unchanged.
- 2026-11-26 (Claude Code, phase 3): 10 Contact. All fields required except "How did you hear about us? (optional)", as COPY implies. Field error messages are new wording (plain, short), the form error is COPY's. Hidden honeypot field. Until phase 5 there is no backend: if PUBLIC_FORM_ENDPOINT is empty, Send opens the visitor's email app with the message filled in to hello@tenonpath.com and says so; the "Received" state only shows after a server accepts the message. Preview the states with /?form=success#contact and /?form=error#contact.
- 2026-11-26 (Claude Code, phase 3): Optional "stack" line in 08 About left out (optional in SITE_SPEC, and no approved copy).
- 2026-11-26 (Brian, phase 2 review): Layout fills the screen. Side padding 20px on mobile, 32 to 40px on desktop (was 48 to 80px); max content width raised, only very wide screens center. Set globally in tokens and in SITE_SPEC's Grid line. Claude Code set the max to 1840px rather than 1760px: the container is max width plus 2 x 40px padding, so 1840px is what lets a 1920px screen fill edge to edge with only very wide screens (2560px) centering. Lower it if you prefer 1760px.
- 2026-11-26 (Brian, phase 2 review): Joinery drawing scaled up about 25 to 30% on desktop to fill the right 7 columns, vertically centered with the headline block; snippet text readable at 1440px (mono, dim). Checked at 1280, 1440, 1920 and 2560px.
- 2026-11-26 (Brian, phase 2 review): Source blocks stay visible but dimmed in the end state. Not folded away.
- 2026-11-26 (Brian, phase 2 review): Mobile play-once and reduced motion must always end on 94.2%, $412,860, $18,240, 37 with the chart fully drawn, including fast scrolling and background tabs.
- 2026-11-26 (Brian, phase 2 review): Pin length stays at 175vh.
- 2026-11-26 (Claude Code, phase 2 revision): The hero headline is also capped at 14% of the viewport height on desktop, so the pinned hero (text, drawing and CTAs) fits a 1280x720 laptop screen. On taller screens nothing changes.
- 2026-11-26 (Claude Code, phase 2): Joinery breakpoints. 1024px and up: pinned for 175vh and scrubbed (text and drawing side by side). 640 to 1023px: the same drawing stacked under the text, played once on enter (pinning a stacked hero taller than the screen would trap the scroll). Under 640px: a simplified phone drawing, five labelled tabs that drop into slots on the frame's top edge, no content snippets, played once. Reduced motion: no pin, finished dashboard.
- 2026-11-26 (Claude Code, phase 2): The block snippets (rent roll rows, task items, a #REF! cell, email subjects, CSV lines) and the dashboard figures and chart are fictional and only decorate the animation. No real names or addresses. The figures are the ones in SITE_SPEC.
- 2026-11-26 (Claude Code, phase 2): Hero headline is capped at 8.2vw from 1024px up so "systems," always fits its 5 columns. It reaches the full 120px at about 1460px wide.
- 2026-11-26 (Claude Code, phase 2): Favicon set is generated by `npm run icons` (scripts/build-icons.mjs, Node built-ins only) from the same geometry as the on-page mark: favicon.ico (16/32/48), favicon.svg, apple-touch-icon (180), icon-192, icon-512, site.webmanifest, plus logo-mark.svg in brass, bone and ink under public/brand. Icons are a brass mark on an ink square so they read on light and dark browser tabs. Rerun it if the mark ever changes.
- 2026-11-26 (Claude Code, phase 2): Homepage is now indexable with the COPY.md title and description (it was a noindex holding page). The site is not deployed, so nothing is public yet.
- 2026-11-26 (Claude Code, phase 1 refinement): Refined mark uses a 4 unit tongue. A wider tongue or a 14 unit stem would put edges on odd units and blur the 16px favicon, so the joint reads a little finer than before. Say if you want it heavier.
- 2026-11-26 (Brian, phase 1 review): Logo is Concept A (slot and stem), refined lighter: bar 10 units (was 12), stem 12 wide (was 16), tongue 4 wide. Concepts B and C dropped. The four added color tokens and the type scale are approved.
- 2026-11-26 (Claude Code, phase 1, for review): Added four tokens because parts of the brand palette fail WCAG AA. `--rule-strong` #5D6674 (borders that must be seen, 3.26:1 on ink), `--brass-press` #B5852F (primary button hover fill; ink on brass-soft is only 3.77:1), `--inv-text-dim` #5C5A55 and `--inv-accent` #7A5A24 (brass and bone-dim fail on the bone section). BRAND.md colors are otherwise unchanged.
- 2026-11-26 (Claude Code): Logo marks drawn on a 32 unit grid with every edge on an even coordinate and a 2 unit gap at each joint, so the 16px favicon lands on whole pixels with a 1px joint line.
- 2026-11-26 (Claude Code): Logo animation uses the Web Animations API, not GSAP, so the header logo will cost no extra JS. 620ms: expo.out slide stopping 1 screen pixel short, then a power3.out press home (the "1px settle").
- 2026-11-26 (Claude Code): Railway serves the build with a zero-dependency `server.mjs` (Node built-ins: brotli/gzip, long cache for hashed assets, 404 page, security headers). Start command `npm start`, Node 24 via `engines`. No `serve` package needed.
- 2026-11-26 (Claude Code): Fonts: General Sans from Fontshare (ITF Free Font License, allows web use), IBM Plex Mono latin subset (OFL). License files sit next to the fonts in `public/fonts`. Fallback fonts are metric-matched (size-adjust computed from the font files) to avoid layout shift.
- 2026-11-26 (Claude Code): Reduced motion turns Lenis off and shows end states. The preference is watched live, so toggling it takes effect without a reload.
- 2026-11-26 (Claude Code): The header shows only the wordmark until the mark is chosen. The homepage is a noindex holding page until phase 2.
- 2026-11-26: Prices approved: dashboards from $2,500, automation sprints from $750, websites from $1,200, monthly support from $200.
- 2026-11-26: No claim about years of experience on the site for now. About says "hands-on experience" only.
- 2026-11-26: No statement on code ownership on the site for now (FAQ question removed). Decide per contract.
- 2026-11-26: Brand name **Tenonpath** (tenonpath.com registered). Tagline idea: "Built to fit."
- 2026-11-26: Email: brian@tenonpath.com mailbox (GoDaddy), hello@tenonpath.com alias used on the site.
- 2026-11-26: No real client work shown on the site until clients approve. Proof comes from a fictional demo dashboard.
- 2026-11-26: Primary audience US commercial real estate firms; secondary growing businesses in Kenya and worldwide.
- 2026-11-26: Stack: Astro, plain CSS tokens, GSAP + Lenis, hand-written SVG, hosted on Railway.
- 2026-11-26: Division of work: orchestrator writes specs, copy, reviews; Claude Code (Opus) builds; Brian approves. Sub-agents only for bigger client builds later.
- 2026-11-26: Brian chose to start from our own design direction (drafting table at night) before gathering outside inspiration, to stay original.

## Open questions (for Brian)
- [ ] Footer links to /real-estate and /privacy, which arrive in phase 5. /demo now exists.
- [ ] COPY: the demo body says "a fictional industrial portfolio", but the portfolio is now mixed (industrial, flex, retail, office). Suggest "a fictional commercial real estate portfolio" (homepage 04 body and the /demo meta description). Not changed: copy is the orchestrator's call.
- [ ] Property photos for /demo: 8 images into `src/assets/demo/photos/` as property-1.jpg ... property-8.jpg (see the README there).
- [ ] Move DNS from GoDaddy to Cloudflare (recommended before launch, see orchestrator notes) or keep GoDaddy.

## Account and infrastructure notes
- Domain: tenonpath.com, registered at GoDaddy. DNS currently at GoDaddy.
- Email: GoDaddy Professional Email, MX smtp.secureserver.net (+ page 2 records). Mailbox brian@, alias hello@.
- Repo: github.com/brianmsv-dev/tenonpath-site. Local clone: C:\Users\Admin\Brian\tenonpath-site
- Hosting: Railway (project to be created in phase 5).

## Company docs
- `docs/company/ONE_PAGER.md`: what we do, for whom, how (done, v1)
- `docs/company/SERVICES_AND_PRICING.md`: internal pricing guide (done, v1)
- [ ] Scope of work template
- [ ] Simple terms (payment schedule, revisions, ownership, support)
- [ ] Invoice template

## Session notes
- 2026-11-26 (Claude Code): Phase 4 review applied (cents and tie-out, month-over-month chart, overdue tasks, DEMO DATA in the banner, one-line tabs, embed with five tabs and capped tables, client themes and Make it yours, generic Harbor & Pine Properties data, property thumbnails). Every displayed number on /demo re-verified by summing what the page shows: 16 of 16 checks tie out. Phase 5 account-free work done: 404, SEO tags, schema, sitemap, robots, OG image, brand and email signature files, Railway config, Lighthouse (home 100/100/100/100). Regression: no horizontal scroll at 360 to 2560px on /, /styleguide, /demo with motion on and off; no console errors; hero ends on the exact figures in all 9 scenarios. Stopped before accounts. See "Needed from Brian to launch".
- 2026-11-26 (Claude Code): Phase 3 review applied (inline strike, FAQ headline, three required form fields; decisions logged). Phase 4 built: demo data and generator, /demo with five views, /demo/embed, lazy-loaded embed in homepage 04. Checked in headless Chrome at 360, 768, 1280, 1440, 1920 and 2560px on /, /styleguide and /demo, motion on and off: no horizontal scroll, one h1 per page, no console errors. Demo interactions checked: tabs by click, arrow keys, Home/End and URL hash; property filter totals (all, Riverlace, Heronfield with empty state); sort ascending and descending with aria-sort; embed not loaded at page top, loaded near section 04, tabs work there without touching the page hash. Hero end-state checks (9 scenarios) and form checks still pass. Homepage JS unchanged at about 54 KB gzipped; the demo script and embed load only when needed. Not yet checked on real phones or Safari; Lighthouse is phase 5. Stopped at the phase 4 review gate.
- 2026-11-26 (Claude Code): Phase 2 review applied (wider layout, larger hero drawing, play-once end-state guarantees, decisions logged). Phase 3 built: sections 02 to 10, demo placeholder frame, contact form UI. All JS about 54 KB gzipped. Checked in headless Chrome at 360, 768, 1280, 1440, 1920 and 2560px, motion on and off: no horizontal scroll, one h1, no console errors. Interaction checks passed: problem timeline completes, process ticks lock 1 to 4 with scroll, FAQ toggles, empty submit shows 6 errors and focuses Name, bad email flagged, email-app fallback, success and error previews. Hero ends on 94.2% / $412,860 / $18,240 / 37 with the chart drawn in all 9 scenarios (normal, fast scroll past, hidden tab, loaded below the hero, reduced motion, scrub, jump). Not yet checked on real phones or Safari; Lighthouse is phase 5. Stopped at the phase 3 review gate.
- 2026-11-26 (Claude Code): Phase 1 review applied (refined Concept A, B and C dropped, log cleaned). Phase 2 built: hero, joinery animation, header logo with slide-in, favicon set. Homepage JS about 53 KB gzipped. Checked in headless Chrome at 360, 768, 1024, 1440 and 2560px with motion on and off: no horizontal scroll, one h1 per page, no console errors; scrubbed sequence checked frame by frame (0/5 to 5/5, figures counting, chart drawing). Not yet checked on real phones or Safari. Stopped at the phase 2 review gate.
- 2026-11-26 (Claude Code): Phase 1 built. Astro 7.4 static, GSAP 3.15, Lenis 1.3 (all in the Stack list, no other dependencies). Homepage JS is about 51 KB gzipped (budget 120 KB). Checked in headless Chrome at 360, 768, 1440 and 2560px, with motion on and off: no horizontal scroll, no console errors, mobile menu traps focus, closes on Escape and returns focus. Lighthouse not run yet (full audit is phase 5). Run locally with `npm install`, `npm run dev`, then open http://localhost:4321/styleguide. Stopped at the phase 1 review gate.
- 2026-11-26 (orchestrator): Created CLAUDE.md, BRAND.md, SITE_SPEC.md, COPY.md, this log and company docs v1. Next: Brian opens Claude Code in VS Code and starts Phase 1.
