# CLAUDE.md: Tenonpath website

Standing instructions for any Claude Code session working in this repo. Read this file fully, then read the docs below, before writing any code.

## Read first, every session
1. `docs/PROJECT_LOG.md`: current phase, decisions, open items. Start here.
2. `docs/BRAND.md`: name, voice, color, type, logo, motion rules.
3. `docs/SITE_SPEC.md`: every page and section, interactions, acceptance checks.
4. `docs/COPY.md`: all site text. Use it word for word. Do not invent marketing copy.

If the docs conflict, the order of authority is: PROJECT_LOG decisions > SITE_SPEC > BRAND > COPY. If something is unclear or missing, do not guess. Add it under "Open questions" in PROJECT_LOG and build the rest.

## Who decides what
- Brian (owner) approves everything that ships.
- The orchestrator (Claude, in claude.ai) writes specs, copy and reviews commits.
- You (Claude Code) build. You may propose design improvements in PROJECT_LOG, but do not silently change the brand, copy or structure.

## Stack
- Astro (latest stable), static output. TypeScript where it helps; plain is fine for small scripts.
- Plain CSS with custom properties (design tokens in `src/styles/tokens.css`). No Tailwind, no UI kits, no component libraries.
- GSAP + ScrollTrigger for scroll animation. Lenis for smooth scroll.
- SVG for the logo, icons and diagrams, hand written, inline where animated.
- Fonts self-hosted from `public/fonts` (no Google Fonts requests at runtime).
- Deploy target: Railway (static build served by a tiny server or Railway's static setup). Domain tenonpath.com.

## Non-negotiable design rules (the "no AI look" list)
Do NOT use any of these:
- Glowing blobs, aurora or mesh gradients, purple/blue "AI" gradients, neon glows
- Heavy drop shadows, glassmorphism, frosted cards
- Pills, badges, chips, emoji, initials circles, generic icon sets (Heroicons, Lucide etc.) used as decoration
- Stock photos, 3D blobs, robots, brains, sparkles, "magic" wand icons
- Centered-everything layouts with a giant gradient headline
- Buttons that do nothing, fake logos of "trusted by" companies, fake testimonials, fake stats

DO:
- Use the drafting-table system in BRAND.md: ink background, bone text, brass accent, thin rules, blueprint grid, mono labels.
- Make every animation mean "parts fitting together precisely".
- Wide layouts that use the screen, generous whitespace, a strict 12-column grid.
- Real content only. Every claim on the site must be true.

## Quality bar
- Lighthouse (mobile): Performance 90+, Accessibility 95+, Best Practices 95+, SEO 100.
- `prefers-reduced-motion`: all scroll animations collapse to simple fades or static end states. Smooth scroll off.
- Works at 360px wide through 2560px. No horizontal scroll. No cut-off text.
- Keyboard navigable, visible focus states (brass outline), text contrast WCAG AA minimum.
- Total JS on the homepage under ~120 KB gzipped. Lazy load the demo.
- No console errors. No layout shift on load (reserve space for fonts and the hero).

## Copy rules (for any text you must write, e.g. alt text, aria labels, error messages)
- Plain, confident, human. Short sentences.
- No em dashes. No "unlock", "elevate", "seamless", "leverage", "cutting-edge", "revolutionize", "empower", "game-changer".
- No exclamation marks.

## Workflow
- Work in the phase named in PROJECT_LOG. Do not jump ahead.
- Small, clear commits. Message format: `phase N: what changed`.
- At the end of every work session, update `docs/PROJECT_LOG.md`: tick what is done, note decisions you made and why, list anything you need from Brian or the orchestrator.
- Never commit secrets. Form endpoints and keys go in environment variables, documented in `.env.example`.
- Ask before adding any dependency not listed in Stack.
