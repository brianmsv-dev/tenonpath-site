# Project log: Tenonpath

The running record. Newest entries at the top of each section. Anyone (Brian, the orchestrator, Claude Code) updates this at the end of a work session.

## Current phase
**Phase 4: Demo dashboard**: in progress.

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
- [ ] Fictional data set in `src/data/demo/`
- [ ] `/demo` with Overview, Collections, Leases, Tasks, Pipeline
- [ ] Embedded cut-down demo in homepage section 04, lazy loaded
- **Review gate**

### Phase 5: Launch
- [ ] Contact form backend, spam protection, `.env.example`
- [ ] `/real-estate`, `/privacy`, `/404`
- [ ] SEO: meta, schema, sitemap, robots, OG image
- [ ] Lighthouse and accessibility pass, cross-device check
- [ ] Deploy to Railway, connect tenonpath.com and www
- [ ] Email signature logo (PNG + SVG)

## Decisions
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
- [ ] Footer and demo section link to routes that do not exist yet (/demo, /real-estate, /privacy). They arrive in phases 4 and 5. All homepage anchors (#demo, #services, #process, #pricing, #contact) now work.
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
- 2026-11-26 (Claude Code): Phase 2 review applied (wider layout, larger hero drawing, play-once end-state guarantees, decisions logged). Phase 3 built: sections 02 to 10, demo placeholder frame, contact form UI. All JS about 54 KB gzipped. Checked in headless Chrome at 360, 768, 1280, 1440, 1920 and 2560px, motion on and off: no horizontal scroll, one h1, no console errors. Interaction checks passed: problem timeline completes, process ticks lock 1 to 4 with scroll, FAQ toggles, empty submit shows 6 errors and focuses Name, bad email flagged, email-app fallback, success and error previews. Hero ends on 94.2% / $412,860 / $18,240 / 37 with the chart drawn in all 9 scenarios (normal, fast scroll past, hidden tab, loaded below the hero, reduced motion, scrub, jump). Not yet checked on real phones or Safari; Lighthouse is phase 5. Stopped at the phase 3 review gate.
- 2026-11-26 (Claude Code): Phase 1 review applied (refined Concept A, B and C dropped, log cleaned). Phase 2 built: hero, joinery animation, header logo with slide-in, favicon set. Homepage JS about 53 KB gzipped. Checked in headless Chrome at 360, 768, 1024, 1440 and 2560px with motion on and off: no horizontal scroll, one h1 per page, no console errors; scrubbed sequence checked frame by frame (0/5 to 5/5, figures counting, chart drawing). Not yet checked on real phones or Safari. Stopped at the phase 2 review gate.
- 2026-11-26 (Claude Code): Phase 1 built. Astro 7.4 static, GSAP 3.15, Lenis 1.3 (all in the Stack list, no other dependencies). Homepage JS is about 51 KB gzipped (budget 120 KB). Checked in headless Chrome at 360, 768, 1440 and 2560px, with motion on and off: no horizontal scroll, no console errors, mobile menu traps focus, closes on Escape and returns focus. Lighthouse not run yet (full audit is phase 5). Run locally with `npm install`, `npm run dev`, then open http://localhost:4321/styleguide. Stopped at the phase 1 review gate.
- 2026-11-26 (orchestrator): Created CLAUDE.md, BRAND.md, SITE_SPEC.md, COPY.md, this log and company docs v1. Next: Brian opens Claude Code in VS Code and starts Phase 1.
