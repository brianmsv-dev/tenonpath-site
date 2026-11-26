// Builds the favicon set and mark SVGs from the logo geometry. Node built-ins only.
// Run: npm run icons   (writes to public/ and public/brand/)
//
// The mark is all axis-aligned rectangles on even grid units, so rasterising at integer
// scales (0.5x for 16px, 1x, 1.5x, 4x, 12x) puts every edge on a pixel boundary.
// No anti-aliasing is needed and none is applied: the PNGs are exactly as crisp as the SVG.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const INK = [0x0e, 0x11, 0x16];
const BRASS = [0xc8, 0x96, 0x3e];

// Read the in-use mark (concept "a") from the TS source so there is one source of truth.
const src = readFileSync(new URL('../src/data/logo-marks.ts', import.meta.url), 'utf8');
const block = src.slice(src.indexOf('  a: {'));
const fixed = block.match(/fixed: '([^']+)'/)[1];
const tenon = block.match(/tenon: '([^']+)'/)[1];

/** Parse an "M x y H x V y ... Z" path into polygon points. */
function polygon(d) {
  const pts = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, a, b] of d.matchAll(/([MHVZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?/g)) {
    if (cmd === 'M') (x = +a), (y = +b);
    else if (cmd === 'H') x = +a;
    else if (cmd === 'V') y = +a;
    else continue;
    pts.push([x, y]);
  }
  return pts;
}
const shapes = [polygon(fixed), polygon(tenon)];

function inside(pts, px, py) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** RGBA pixels: background square (or transparent) with the mark at `scale`, offset by `pad` px. */
function render(size, scale, pad, fg, bg) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x + 0.5 - pad) / scale; // sample the pixel centre in grid units
      const gy = (y + 0.5 - pad) / scale;
      const on = shapes.some((s) => inside(s, gx, gy));
      const c = on ? fg : bg;
      const o = (y * size + x) * 4;
      if (c) (px[o] = c[0]), (px[o + 1] = c[1]), (px[o + 2] = c[2]), (px[o + 3] = 255);
    }
  }
  return px;
}

function png(size, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function ico(images) {
  // ICO container holding PNG images (supported by every current browser and Windows Vista+).
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header[e] = size >= 256 ? 0 : size;
    header[e + 1] = size >= 256 ? 0 : size;
    header.writeUInt16LE(1, e + 4); // planes
    header.writeUInt16LE(32, e + 6); // bpp
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

const out = new URL('../public/', import.meta.url);
mkdirSync(new URL('brand/', out), { recursive: true });

// Tab icons: brass mark filling the square on ink, so it reads on light and dark browser chrome.
const tab = (size) => png(size, render(size, size / 32, 0, BRASS, INK));
writeFileSync(new URL('favicon.ico', out), ico([16, 32, 48].map((size) => ({ size, data: tab(size) }))));

// Touch and app icons: mark at an integer scale, centred with room for platform masks.
writeFileSync(new URL('apple-touch-icon.png', out), png(180, render(180, 4, 26, BRASS, INK)));
writeFileSync(new URL('icon-192.png', out), png(192, render(192, 4, 32, BRASS, INK)));
writeFileSync(new URL('icon-512.png', out), png(512, render(512, 12, 64, BRASS, INK)));

// SVGs
const svg = (fg, bg, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="${label}">` +
  (bg ? `<rect width="32" height="32" fill="${bg}"/>` : '') +
  `<path d="${fixed}" fill="${fg}"/><path d="${tenon}" fill="${fg}"/></svg>\n`;
writeFileSync(new URL('favicon.svg', out), svg('#C8963E', '#0E1116', 'Tenonpath'));
writeFileSync(new URL('brand/logo-mark.svg', out), svg('#C8963E', null, 'Tenonpath'));
writeFileSync(new URL('brand/logo-mark-bone.svg', out), svg('#EDE8DF', null, 'Tenonpath'));
writeFileSync(new URL('brand/logo-mark-ink.svg', out), svg('#0E1116', null, 'Tenonpath'));

writeFileSync(
  new URL('site.webmanifest', out),
  JSON.stringify(
    {
      name: 'Tenonpath',
      short_name: 'Tenonpath',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#0E1116',
      background_color: '#0E1116',
      display: 'browser',
    },
    null,
    2,
  ) + '\n',
);

console.log('Icons written to public/ and public/brand/');
