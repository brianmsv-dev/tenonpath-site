// Builds the brand files that are not part of the site bundle. Node built-ins only.
// Run: npm run brand
//
// SVG (always):  public/brand/logo-full.svg        mark + wordmark, for dark backgrounds
//                public/brand/logo-full-light.svg  mark + wordmark, for light backgrounds
//                public/brand/email-signature.svg  600x200, white background
// PNG (needs Google Chrome or Edge installed; set CHROME=path to override):
//                public/og.png                       1200x630 social card
//                public/brand/email-signature.png    600x200
//                public/brand/email-signature@2x.png 1200x400 (sharper on high-DPI screens)
//
// The mark comes from src/data/logo-marks.ts and the outlined wordmark from src/data/wordmark.ts,
// so every file matches the site exactly. PNGs are rendered by headless Chrome from small HTML
// pages served on a temporary local port with the real self-hosted fonts.
import { writeFileSync, readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MARKS } from '../src/data/logo-marks.ts';
import { WORDMARK } from '../src/data/wordmark.ts';

const INK = '#0E1116';
const BONE = '#EDE8DF';
const BRASS = '#C8963E';
const root = new URL('../', import.meta.url);
const out = (p) => new URL(p, root);

/* ---------- Lockup geometry ----------
   Same proportions as the site header: mark height = 1.17 x font size, gap = 0.42 x font size,
   wordmark centred on the mark. Units: the mark is 100 tall. */
const M = 100;
const fontSize = M / 1.17;
const s = fontSize / WORDMARK.unitsPerEm;
const [, yMin, xMax, yMax] = WORDMARK.bounds;
const gap = 0.42 * fontSize;
const baseline = M / 2 - ((yMin + yMax) / 2) * s;
const wordWidth = xMax * s;
const lockupW = M + gap + wordWidth;

function lockup(markColor, wordColor) {
  const mk = MARKS.a;
  return (
    `<g transform="scale(${M / 32})"><path d="${mk.fixed}" fill="${markColor}"/><path d="${mk.tenon}" fill="${markColor}"/></g>` +
    `<path transform="translate(${(M + gap).toFixed(2)} ${baseline.toFixed(2)}) scale(${s.toFixed(5)})" d="${WORDMARK.d}" fill="${wordColor}"/>`
  );
}
const svgDoc = (w, h, body, label = 'Tenonpath') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h}" width="${Math.round(w)}" height="${h}" role="img" aria-label="${label}">${body}</svg>\n`;

writeFileSync(out('public/brand/logo-full.svg'), svgDoc(lockupW, M, lockup(BRASS, BONE)));
writeFileSync(out('public/brand/logo-full-light.svg'), svgDoc(lockupW, M, lockup(BRASS, INK)));

// Email signature, 600x200 on white: the lockup as large as fits with 30px padding, centred vertically.
const sigScale = Math.min((200 - 80) / M, (600 - 60) / lockupW);
const sig =
  `<rect width="600" height="200" fill="#FFFFFF"/>` +
  `<g transform="translate(30 ${(200 - M * sigScale) / 2}) scale(${sigScale.toFixed(4)})">${lockup(BRASS, INK)}</g>`;
writeFileSync(out('public/brand/email-signature.svg'), svgDoc(600, 200, sig));
console.log('SVGs written: logo-full.svg, logo-full-light.svg, email-signature.svg');

/* ---------- PNGs via headless Chrome ---------- */
const candidates = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.log('No Chrome or Edge found: PNGs skipped (set CHROME=/path/to/chrome to render them).');
  process.exit(0);
}

const fontFaces = `
@font-face{font-family:'General Sans';src:url(/fonts/GeneralSans-Semibold.woff2) format('woff2');font-weight:600}
@font-face{font-family:'General Sans';src:url(/fonts/GeneralSans-Regular.woff2) format('woff2');font-weight:400}
@font-face{font-family:'IBM Plex Mono';src:url(/fonts/IBMPlexMono-Medium.woff2) format('woff2');font-weight:500}`;

// Social card. Copy from docs/COPY.md: hero headline and the footer line.
const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${INK};color:${BONE};font-family:'General Sans',sans-serif;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,#2A313B 1px,transparent 1px),linear-gradient(to bottom,#2A313B 1px,transparent 1px);background-size:32px 32px;opacity:.45;
-webkit-mask-image:radial-gradient(ellipse 80% 75% at 60% 45%,#000 35%,transparent 100%)}
.wrap{position:absolute;inset:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.logo svg{height:56px;width:auto;display:block}
h1{font-weight:600;font-size:118px;line-height:1.0;letter-spacing:-0.02em}
.foot{display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:#A9A39A;border-top:1px solid #5D6674;padding-top:22px}
.foot b{color:${BRASS};font-weight:500}
</style></head><body><div class="grid"></div><div class="wrap">
<div class="logo">${svgDoc(lockupW, M, lockup(BRASS, BONE))}</div>
<h1>Your systems,<br>joined.</h1>
<div class="foot"><span>Dashboards, integrations and web apps, built to fit.</span><b>tenonpath.com</b></div>
</div></body></html>`;

const sigHtml = (scale) => `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}body{width:${600 * scale}px;height:${200 * scale}px;background:#fff}
svg{width:${600 * scale}px;height:${200 * scale}px;display:block}</style></head><body>${svgDoc(600, 200, sig)}</body></html>`;

const pages = {
  '/og.html': ogHtml,
  '/sig1.html': sigHtml(1),
  '/sig2.html': sigHtml(2),
};
const server = createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (pages[url]) return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(pages[url]);
  if (url.startsWith('/fonts/') && /^[\w./-]+$/.test(url) && !url.includes('..')) {
    const file = out('public' + url);
    if (existsSync(file)) return res.writeHead(200, { 'Content-Type': 'font/woff2' }).end(readFileSync(file));
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = mkdtempSync(join(tmpdir(), 'tp-brand-'));
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  const t = setTimeout(() => reject(new Error('Chrome did not start')), 20000);
  proc.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      clearTimeout(t);
      resolve(m[1]);
    }
  });
});
const browser = new WebSocket(wsUrl);
await new Promise((r) => (browser.onopen = r));
let id = 0;
const pending = new Map();
browser.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    browser.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
const { result } = await send('Target.createTarget', { url: 'about:blank' });
const { result: att } = await send('Target.attachToTarget', { targetId: result.targetId, flatten: true });
const sid = att.sessionId;
await send('Page.enable', {}, sid);

async function shot(path, w, h, file) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sid);
  await send('Page.navigate', { url: base + path }, sid);
  await new Promise((r) => setTimeout(r, 800)); // fonts
  const { result: img } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } }, sid);
  writeFileSync(out(file), Buffer.from(img.data, 'base64'));
  console.log('PNG written:', file);
}
await shot('/og.html', 1200, 630, 'public/og.png');
await shot('/sig1.html', 600, 200, 'public/brand/email-signature.png');
await shot('/sig2.html', 1200, 400, 'public/brand/email-signature@2x.png');

browser.close();
proc.kill();
server.close();
