# Site spec: tenonpath.com

Audience: owners, operators, asset managers and property managers at small and mid-size US commercial real estate firms. Secondary: growing businesses (Kenya and international) that need web apps, automations or a serious website.

The visitor's question is: "So you say you can connect my systems into one view. Show me." The site answers it with a working demo, not adjectives.

Goal of every page: get a qualified visitor to the contact form ("Tell us what you're running on").

## Pages
| Route | Purpose | Phase |
|---|---|---|
| `/` | Homepage, the full story in one scroll | 2 to 3 |
| `/demo` | Full-screen interactive demo dashboard (fictional data) | 4 |
| `/real-estate` | SEO landing page: real estate dashboards and integrations | 5 |
| `/privacy` | Privacy policy for the form | 5 |
| `/404` | On-brand not-found page (a tenon that does not fit its slot) | 5 |

Keep it to these. No blog at launch.

## Global
- **Header**: logo left; links right: Work (anchor to demo), Services, Process, Pricing; a brass "Start a project" button that scrolls to the contact form. Header hides on scroll down, shows on scroll up. Mobile: full-screen menu, mono labels.
- **Footer**: logo, one-line description, hello@tenonpath.com, location line ("Nairobi, Kenya. Working with clients in the US and worldwide."), links (Demo, Real estate, Privacy), copyright. Thin measurement-line border on top.
- **Section labels**: mono, `01 / PROBLEM` format, brass number.
- **Grid**: 12 columns, max content width ~1840px (fills a 1920px screen; only very wide screens such as 2560px center the content), side padding fluid (20px mobile, 32 to 40px desktop). Set globally in `src/styles/tokens.css`.

## Homepage sections (in order)

### 01 Hero: "Your systems, joined."
Purpose: in five seconds, show what we do.

Layout: headline and subline on the left 5 columns; the joinery animation on the right 7 columns (stacked on mobile, animation below the text and simplified).

**The joinery animation (signature piece).** Pinned for about 150 to 200vh of scroll, scrubbed:
1. Start: four or five loose "system blocks" drawn as hairline-bordered rectangles with mono labels: `PROPERTY SYSTEM`, `TASK BOARD`, `SPREADSHEET`, `INBOX`, `BANK EXPORTS`. Each shows a tiny snippet of messy content inside (a few fake rows, a column header, an email subject). They sit slightly rotated and misaligned on the blueprint grid. Faint dashed lines between them that do not connect.
2. As the user scrolls: each block straightens (rotation to 0) and slides along one axis toward the center. Each block's edge has a tenon (tongue) shape; the center has a frame with mortises (slots).
3. Each block locks into its slot one after another with a firm stop and a 1px settle. On each lock, a brass tick mark flashes on the frame edge and a mono counter updates: `1/5 CONNECTED` ... `5/5 CONNECTED`.
4. Final state: the joined frame becomes a clean mini dashboard: a header row "Portfolio overview", four key figures that count up (e.g. Occupancy 94.2%, Collected this month $412,860, Past due $18,240, Open tasks 37) and a small line chart that draws itself in `--data` teal.
5. Below the animation, a mono caption: `5 SYSTEMS / 1 VIEW / UPDATED LIVE`.

Implementation notes: inline SVG, GSAP timeline bound to ScrollTrigger (scrub: true, pin: true). Mobile: no pin; play the sequence once on enter at a fixed speed. Reduced motion: show the final dashboard state with blocks already joined.

CTAs under the subline: primary "See the live demo" (scrolls to section 04), secondary text link "Start a project".

### 02 Problem: "Five systems. One analyst. Every Monday."
Purpose: make the buyer feel seen.
Layout: large statement on the left; on the right, a "week in the life" list rendered as a timeline with mono timestamps (e.g. `MON 08:10  Export rent roll`, `MON 08:40  Paste into the master Excel`, `MON 09:30  Chase the task board`, `TUE 14:00  Investor asks for occupancy, rebuild the numbers`...). As the section enters, each line types or slides in, then a thin brass line strikes through the whole list and a single line appears: `Or: open one dashboard.`

### 03 What we build
Four cards in a 2x2 grid (1 column mobile), hairline borders, each with: mono number, title, two-sentence description, three concrete examples in a plain list, and a small hand-drawn SVG diagram (line art, no icon sets) that animates its lines on hover.
1. Dashboards
2. Integrations and automations
3. Internal tools and web apps
4. Websites
Copy in COPY.md.

### 04 Live demo: "Don't take our word for it."
Purpose: the "let me see" moment.
Layout: a wide framed panel (dimension lines around the frame like a technical drawing: `1440 px`, `LIVE DEMO / FICTIONAL DATA`). Inside: an embedded, interactive, cut-down version of the demo dashboard (lazy loaded when near viewport). Under it: "Open the full demo" button to `/demo`, and a line: "Fictional portfolio. Real build quality. Your version would connect to your own systems."

### 05 How we work
Four steps on a horizontal measured line (vertical on mobile). As the user scrolls, a brass line draws from step to step and each step's tick locks in.
1. Discovery call (30 minutes, free)
2. Fixed scope and price (written, within 3 business days)
3. Build (weekly previews you can click)
4. Launch and support (hosting, monitoring, small changes on a monthly plan)

### 06 Who it's for
Two columns. Left, larger: "Commercial real estate teams" with roles listed (owners, operators, asset managers, property managers, acquisitions teams) and the systems we connect (any property management system with an API or export, task boards like Monday.com, Excel and Google Sheets, Outlook and Gmail, banking exports). Right, smaller: "Growing businesses" (web apps, automations, websites; Kenya and international).

### 07 Pricing: "Know the cost before we start."
Inverted section (bone background, ink text) for rhythm. Four columns as a clean table-like layout (not floating cards): Dashboard, Automation sprint, Website, Monthly support. Each with "from" price, what's included (4 to 5 lines), typical timeline. Note under the table: "Every project gets a written fixed quote before work starts. Kenyan clients: pricing in KSh on request."

### 08 About: "Built by someone who's done the work."
Short, first person plural but honest. Kenya-based studio; hands-on years inside US commercial real estate operations (leases, rent rolls, due diligence, insurance, investor reporting) plus development. No client names, no company names. Optional: a small mono "stack" line listing technologies.

### 09 FAQ
Accordion, 6 to 8 questions (COPY.md). Mark up with FAQPage schema.

### 10 Contact: "Tell us what you're running on."
Form fields: Name, Email, Company, "What systems do you use today?" (textarea), "What do you want to see in one place?" (textarea), Budget range (select: Under $2,500 / $2,500 to $6,000 / $6,000 to $15,000 / Not sure yet), optional "How did you hear about us?". Submit button: "Send". Success state: the logo tenon slides into place and the text "Received. We reply within one business day." Error state in plain words.
Backend: Formspree (or a small Railway endpoint; decide in phase 5). Spam protection: honeypot field + rate limit. Sends to hello@tenonpath.com. Also show the plain email address for people who prefer email.

## /demo page (phase 4)
Fictional portfolio: "Harbor & Pine Industrial", 8 properties (industrial, flex and small bay) in the US Southeast, ~40 tenants. All data from `src/data/demo/*.json`, generated and clearly fictional (no real addresses or company names).
Views (tabs in a top bar, no scrollbar, no cut-off text):
1. **Overview**: key figures (occupancy, collected MTD, past due, open tasks), collections by week line chart, properties table.
2. **Collections**: tenants with balance, aging buckets (0-30, 31-60, 61-90, 90+), who paid this month, filter by property.
3. **Leases**: upcoming expirations and critical dates in the next 180 days, sortable.
4. **Tasks**: items synced from a "task board", grouped by property and status (plain text status, no pills).
5. **Pipeline**: acquisitions under review / LOI / under contract / closed, simple cards with key metrics.
Table style: first column left aligned, other columns centered. Plain text statuses, no pills or initials circles. Small "DEMO DATA" mono label fixed in a corner. A banner at top: "This is a demo with fictional data. Want this for your portfolio? Start a project."

## SEO (phase 5)
- Title/description per page. Home title: "Tenonpath | Dashboards and integrations for real estate teams".
- Target phrases: real estate portfolio dashboard, property management integration, Rent Manager API dashboard, Monday.com real estate integration, commercial real estate reporting automation, custom web app developer Kenya.
- Schema: Organization, ProfessionalService, FAQPage. Sitemap, robots.txt, canonical URLs, OG image.
- Semantic headings (one h1 per page). Alt text on all meaningful SVGs.

## Acceptance checklist (every phase)
- [ ] Matches BRAND.md tokens and rules; nothing from the "no AI look" list
- [ ] Copy exactly as COPY.md
- [ ] 360px to 2560px with no overflow or cut-off text
- [ ] Reduced motion works
- [ ] Keyboard and focus states work
- [ ] Lighthouse targets met (phase 5 for full audit)
- [ ] PROJECT_LOG updated
