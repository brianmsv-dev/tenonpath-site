/*
  Hero joinery animation geometry (docs/SITE_SPEC.md > 01 Hero).

  A central frame with mortises (slots) cut into its edges, and five system blocks, each with a
  tenon (tongue) on the edge that faces the frame. All coordinates are SVG user units.
  Blocks are defined in their seated position; `from` is how far out along their one axis they
  start, `rot` their starting tilt in degrees. Order in the array = lock order.

  Two layouts:
  - wide: blocks around all four sides of the frame, with messy content snippets (640px and up)
  - compact: five labelled tabs along the top edge, no snippets (phones). The spec's "simplified".
*/
export type Side = 'left' | 'right' | 'top' | 'bottom';

export interface BlockDef {
  id: string;
  /** Label lines, mono caps. */
  label: string[];
  side: Side;
  /** Centre of the block along the frame edge it joins. */
  along: number;
  w: number;
  h: number;
  from: number;
  rot: number;
  /** Fictional, deliberately messy content shown inside the block (wide layout only). */
  snippet?: string[];
}

export interface Layout {
  name: 'wide' | 'compact';
  width: number;
  height: number;
  frame: { x: number; y: number; w: number; h: number; band: number };
  /** Gap between a seated block's shoulder and the frame edge. */
  gap: number;
  tongue: { len: number; width: number };
  /** Space left around the tongue inside its slot. */
  clearance: number;
  blocks: BlockDef[];
  type: { label: number; snippet: number; header: number; figLabel: number; figValue: number };
  /** Pairs of block ids joined by broken dashed lines in the loose state. */
  links: [string, string][];
}

/* Dashboard figures. Fictional portfolio, matches SITE_SPEC. */
export const FIGURES = [
  { label: 'Occupancy', value: 94.2, format: 'pct' as const },
  { label: 'Collected this month', value: 412860, format: 'usd' as const },
  { label: 'Past due', value: 18240, format: 'usd' as const, tone: 'alert' as const },
  { label: 'Open tasks', value: 37, format: 'int' as const },
];

/** Weekly collections for the small line chart, in thousands. Fictional. */
export const CHART = [62, 71, 58, 84, 77, 92, 88, 101, 96, 110, 104, 118];

export function formatFigure(v: number, format: 'pct' | 'usd' | 'int') {
  if (format === 'pct') return `${v.toFixed(1)}%`;
  if (format === 'usd') return `$${Math.round(v).toLocaleString('en-US')}`;
  return String(Math.round(v));
}

export const WIDE: Layout = {
  name: 'wide',
  width: 800,
  height: 600,
  frame: { x: 200, y: 150, w: 400, h: 280, band: 24 },
  gap: 6,
  tongue: { len: 18, width: 26 },
  clearance: 3,
  type: { label: 10, snippet: 8.5, header: 15, figLabel: 8.5, figValue: 22 },
  blocks: [
    {
      id: 'property',
      label: ['PROPERTY SYSTEM'],
      side: 'left',
      along: 232,
      w: 150,
      h: 104,
      from: -42,
      rot: -4,
      snippet: ['UNIT    STATUS   BAL', 'B4-110  CURRENT  0.00', 'B2-205  30+  3,915.50', 'B1-012  VACANT     -'],
    },
    {
      id: 'tasks',
      label: ['TASK BOARD'],
      side: 'top',
      along: 400,
      w: 200,
      h: 86,
      from: -44,
      rot: 3,
      snippet: ['Roof bid, Bldg 2        STUCK', 'Renewal, Ste 140        ?', 'COI update              DONE??'],
    },
    {
      id: 'sheet',
      label: ['SPREADSHEET'],
      side: 'right',
      along: 330,
      w: 150,
      h: 104,
      from: 40,
      rot: 5,
      snippet: ['   A      B      C', 'OCC %  93.8   #REF!', 'AR     =SUM(C4:C40)', 'v7_FINAL_final.xlsx'],
    },
    {
      id: 'inbox',
      label: ['INBOX'],
      side: 'bottom',
      along: 300,
      w: 180,
      h: 86,
      from: 46,
      rot: -3,
      snippet: ['RE: RE: Fwd: rent roll v7', 'Broker update, Bldg 6', '(no subject)'],
    },
    {
      id: 'bank',
      label: ['BANK EXPORTS'],
      side: 'bottom',
      along: 505,
      w: 180,
      h: 86,
      from: 38,
      rot: 4,
      snippet: ['DATE,TYPE,AMOUNT', '11/03,ACH CR,4180.00', '11/03,LOCKBOX,12665.21'],
    },
  ],
  links: [
    ['property', 'tasks'],
    ['tasks', 'sheet'],
    ['sheet', 'bank'],
    ['bank', 'inbox'],
    ['inbox', 'property'],
  ],
};

export const COMPACT: Layout = {
  name: 'compact',
  width: 360,
  height: 500,
  frame: { x: 5, y: 112, w: 350, h: 382, band: 18 },
  gap: 5,
  tongue: { len: 14, width: 18 },
  clearance: 2,
  type: { label: 9.5, snippet: 0, header: 16, figLabel: 10.5, figValue: 26 },
  blocks: [
    { id: 'property', label: ['PROPERTY', 'SYSTEM'], side: 'top', along: 40, w: 62, h: 50, from: -34, rot: -5 },
    { id: 'tasks', label: ['TASK', 'BOARD'], side: 'top', along: 110, w: 62, h: 50, from: -46, rot: 4 },
    { id: 'sheet', label: ['SPREAD-', 'SHEET'], side: 'top', along: 180, w: 62, h: 50, from: -30, rot: -3 },
    { id: 'inbox', label: ['INBOX'], side: 'top', along: 250, w: 62, h: 50, from: -42, rot: 5 },
    { id: 'bank', label: ['BANK', 'EXPORTS'], side: 'top', along: 320, w: 62, h: 50, from: -38, rot: -4 },
  ],
  links: [],
};

/* ---------- Derived geometry ---------- */

export interface BlockGeom extends BlockDef {
  x: number;
  y: number;
  axis: 'x' | 'y';
  path: string;
  /** Brass seat line drawn inside the frame band when the block locks. */
  tick: [number, number, number, number];
  cx: number;
  cy: number;
}

export function blockGeometry(l: Layout): BlockGeom[] {
  const { frame: f, gap, tongue: t, clearance: c } = l;
  const tw = t.width / 2;
  const depth = t.len - gap + c; // slot depth
  const tickIn = depth + 3; // seat line sits just past the slot bottom
  const tickHalf = tw + c + 6;
  return l.blocks.map((b) => {
    let x = 0;
    let y = 0;
    let path = '';
    let tick: [number, number, number, number];
    if (b.side === 'left') {
      x = f.x - gap - b.w;
      y = b.along - b.h / 2;
      const r = x + b.w;
      path = `M${x} ${y}H${r}V${b.along - tw}H${r + t.len}V${b.along + tw}H${r}V${y + b.h}H${x}Z`;
      tick = [f.x + tickIn, b.along - tickHalf, f.x + tickIn, b.along + tickHalf];
    } else if (b.side === 'right') {
      x = f.x + f.w + gap;
      y = b.along - b.h / 2;
      path = `M${x} ${y}H${x + b.w}V${y + b.h}H${x}V${b.along + tw}H${x - t.len}V${b.along - tw}H${x}Z`;
      tick = [f.x + f.w - tickIn, b.along - tickHalf, f.x + f.w - tickIn, b.along + tickHalf];
    } else if (b.side === 'top') {
      x = b.along - b.w / 2;
      y = f.y - gap - b.h;
      const btm = y + b.h;
      path = `M${x} ${y}H${x + b.w}V${btm}H${b.along + tw}V${btm + t.len}H${b.along - tw}V${btm}H${x}Z`;
      tick = [b.along - tickHalf, f.y + tickIn, b.along + tickHalf, f.y + tickIn];
    } else {
      x = b.along - b.w / 2;
      y = f.y + f.h + gap;
      path = `M${x} ${y}H${b.along - tw}V${y - t.len}H${b.along + tw}V${y}H${x + b.w}V${y + b.h}H${x}Z`;
      tick = [b.along - tickHalf, f.y + f.h - tickIn, b.along + tickHalf, f.y + f.h - tickIn];
    }
    const axis = b.side === 'left' || b.side === 'right' ? 'x' : 'y';
    return { ...b, x, y, axis, path, tick, cx: x + b.w / 2, cy: y + b.h / 2 };
  });
}

/** Frame outline with a mortise cut into the edge for every block. Walks the edges clockwise. */
export function framePath(l: Layout): string {
  const { frame: f, gap, tongue: t, clearance: c } = l;
  const depth = t.len - gap + c;
  const half = t.width / 2 + c;
  const slots = (side: Side) => l.blocks.filter((b) => b.side === side).map((b) => b.along);
  const R = f.x + f.w;
  const B = f.y + f.h;
  let d = `M${f.x} ${f.y}`;
  for (const a of slots('top').sort((p, q) => p - q))
    d += `H${a - half}V${f.y + depth}H${a + half}V${f.y}`;
  d += `H${R}`;
  for (const a of slots('right').sort((p, q) => p - q))
    d += `V${a - half}H${R - depth}V${a + half}H${R}`;
  d += `V${B}`;
  for (const a of slots('bottom').sort((p, q) => q - p))
    d += `H${a + half}V${B - depth}H${a - half}V${B}`;
  d += `H${f.x}`;
  for (const a of slots('left').sort((p, q) => q - p))
    d += `V${a + half}H${f.x + depth}V${a - half}H${f.x}`;
  return d + 'Z';
}

/** Polyline for the chart inside a box. */
export function chartPath(x: number, y: number, w: number, h: number) {
  const min = Math.min(...CHART) * 0.9;
  const max = Math.max(...CHART) * 1.02;
  return CHART.map((v, i) => {
    const px = x + (w * i) / (CHART.length - 1);
    const py = y + h - ((v - min) / (max - min)) * h;
    return `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join('');
}
