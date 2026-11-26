# Project log: Tenonpath

The running record. Newest entries at the top of each section. Anyone (Brian, the orchestrator, Claude Code) updates this at the end of a work session.

## Current phase
**Phase 1: Foundation**: built, waiting at the review gate (Brian picks a logo, approves colors and type).

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
- [ ] Hero layout and copy
- [ ] Joinery scroll animation (SITE_SPEC 01), desktop pinned/scrubbed, mobile play-once, reduced-motion end state
- [ ] Final logo applied in header, favicon set
- **Review gate:** Brian approves the hero

### Phase 3: Homepage sections
- [ ] Sections 02 to 10 per SITE_SPEC and COPY (demo section uses a placeholder frame until phase 4)
- [ ] Contact form UI (submission wired in phase 5)
- **Review gate**

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
- [ ] Header and footer link to routes and anchors that do not exist yet (/#demo, /#services, /demo, /real-estate, /privacy and so on). They come alive in phases 3 to 5. Fine while the site is not deployed.
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
- 2026-11-26 (Claude Code): Phase 1 built. Astro 7.4 static, GSAP 3.15, Lenis 1.3 (all in the Stack list, no other dependencies). Homepage JS is about 51 KB gzipped (budget 120 KB). Checked in headless Chrome at 360, 768, 1440 and 2560px, with motion on and off: no horizontal scroll, no console errors, mobile menu traps focus, closes on Escape and returns focus. Lighthouse not run yet (full audit is phase 5). Run locally with `npm install`, `npm run dev`, then open http://localhost:4321/styleguide. Stopped at the phase 1 review gate.
- 2026-11-26 (orchestrator): Created CLAUDE.md, BRAND.md, SITE_SPEC.md, COPY.md, this log and company docs v1. Next: Brian opens Claude Code in VS Code and starts Phase 1.
