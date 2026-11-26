# Project log: Tenonpath

The running record. Newest entries at the top of each section. Anyone (Brian, the orchestrator, Claude Code) updates this at the end of a work session.

## Current phase
**Phase 1: Foundation** (not started)

## Phases
### Phase 1: Foundation
- [ ] Astro project scaffold, static output, Railway-ready
- [ ] `src/styles/tokens.css` from BRAND.md (colors, type scale, spacing, grid)
- [ ] Self-hosted fonts: General Sans (400/500/600), IBM Plex Mono (400/500)
- [ ] Base layout: header, footer, 12-column grid, blueprint grid background, section label component, measurement-line divider component
- [ ] Lenis smooth scroll + GSAP ScrollTrigger wired up, with reduced-motion fallback
- [ ] A `/styleguide` page (not linked, `noindex`) showing colors, type, buttons, rules, section labels, so Brian can judge the look
- [ ] Three logo concepts (A, B, C from BRAND.md) as SVG on the styleguide page, each animated
- **Review gate:** Brian picks a logo and approves or tweaks colors and type

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
- [ ] Move DNS from GoDaddy to Cloudflare (recommended before launch, see orchestrator notes) or keep GoDaddy.
- [ ] Logo pick after phase 1.

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
- 2026-11-26 (orchestrator): Created CLAUDE.md, BRAND.md, SITE_SPEC.md, COPY.md, this log and company docs v1. Next: Brian opens Claude Code in VS Code and starts Phase 1.
