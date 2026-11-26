# Brand: Tenonpath

## The name
A tenon is the end of a piece of timber cut to fit exactly into a slot (the mortise). Together they make a joint that holds without glue or nails, because it was cut to fit. Tenonpath is the precise route between the systems a business already uses.

Short version for the site: **Built to fit.**

## What we are
A small, senior-led software studio. We connect the software a business already pays for into one clear, working tool: dashboards, integrations, automations and internal web apps. Our first focus is US commercial real estate firms. We also build for growing businesses in Kenya and elsewhere.

## Promise to clients
1. **Exact fit.** Built to how your team actually works, not a template.
2. **Fixed scope, fixed price.** You know the cost before we start.
3. **Weeks, not months.** Fast delivery without cutting corners.
4. **Standards.** Clean, documented, reliable work you can hand to anyone.

## Voice
- Like a sharp operator who also codes. Calm, direct, specific.
- Talk about the client's problems in their words: rent rolls, AR, due diligence, investor reports, Monday boards, "the Excel file only one person understands".
- Show, don't claim. Prefer a demo or a concrete example over an adjective.
- No hype, no AI buzzwords, no em dashes, no exclamation marks.

## Visual concept: the drafting table at night
A precision workshop. Dark, calm surfaces, thin exact lines, warm brass highlights, and pieces that slide into place.

### Color tokens (starting point, tune in phase 1 and show Brian)
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0E1116` | Main background |
| `--ink-2` | `#151A21` | Raised sections, demo frame |
| `--rule` | `#2A313B` | Hairlines, grid, borders |
| `--bone` | `#EDE8DF` | Primary text |
| `--bone-dim` | `#A9A39A` | Secondary text |
| `--brass` | `#C8963E` | Accent: CTAs, the tenon, focus, key numbers |
| `--brass-soft` | `#8A6A33` | Hover states, secondary accent |
| `--data` | `#3FB6A8` | Data only: chart lines, live values. Never decoration |
| `--alert` | `#D4694A` | Data only: past due, risk |

Optional light section (e.g. pricing or FAQ) may invert to bone background with ink text for rhythm. Max one or two inverted sections.

### Typography
- Headlines: **General Sans** (Fontshare, free), weights 500 and 600. Tight tracking on large sizes (-0.02em).
- Body: General Sans 400, 17 to 18px, line height 1.6.
- Labels, data, small caps details, code: **IBM Plex Mono** 400/500, uppercase for labels with +0.08em tracking.
- Sizes on a fluid scale (clamp). Hero headline roughly 56px mobile to 120px desktop.

### Texture and details
- Faint blueprint grid on the ink background (1px `--rule` lines at low opacity, 24px or 32px pitch), fading out toward the edges.
- Measurement marks: small tick marks and dimension lines (like `|<-- 1,240 SF -->|`) used as section dividers and around the demo frame.
- Section numbers in mono: `01 / PROBLEM`, `02 / WHAT WE BUILD`.
- Corners square or 2px radius. No rounded bubbly cards.
- Cards are defined by hairline borders and spacing, not shadows.

### Motion principles
- Everything moves like a well made joint: a short ease in, a firm stop. Use `power3.out` / `expo.out`, durations 0.4 to 0.9s.
- Things slide along one axis and lock. A tiny 1 to 2px settle at the end is fine. No bouncing, no spinning, no floating.
- Lines draw themselves (stroke-dashoffset). Numbers count up once when visible.
- Scroll-scrubbed only for the hero story; elsewhere, trigger once on enter.
- Reduced motion: show end states.

## Logo
Mark: an abstracted mortise and tenon joint that also reads as a **T**.
- Concept A: the T's horizontal bar is the mortise piece with a rectangular slot; the vertical stem is the tenon, its top shoulder cut so it seats into the slot.
- Concept B: two offset blocks, one with a notch, one with a tongue, locked together to form a square T.
- Concept C: a single square with a T-shaped cut, the cut piece shown slightly lifted (animates down into place).
Build all three as clean SVG on a 24 or 32 unit grid, 1 color (brass or bone), works at 16px favicon size. Wordmark: "tenonpath" in General Sans 600, lowercase, slight negative tracking. Brian picks one.

Logo animation (site load and hover): the tenon slides into the mortise along one axis and stops with a 1px settle. Under 700ms.

Deliverables once chosen: `logo-mark.svg`, `logo-full.svg` (mark + wordmark), `logo-mark-bone.svg`, `logo-mark-ink.svg`, favicon set, a 600x200 PNG and SVG for the email signature, OG image 1200x630.
