// Tiny static file server for Railway. No dependencies, Node built-ins only.
// Serves the Astro build in ./dist with sensible caching, compression and headers.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync, constants as zc } from 'node:zlib';

const ROOT = fileURLToPath(new URL('./dist', import.meta.url));
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.svg', '.webmanifest']);

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Compressed bodies are cached in memory; the build is immutable for the life of the process.
const cache = new Map();

async function resolveFile(urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  const safe = normalize(join(ROOT, p));
  if (safe !== ROOT && !safe.startsWith(ROOT + sep)) return null;
  const candidates = extname(safe) ? [safe] : [join(safe, 'index.html'), safe + '.html'];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {}
  }
  return null;
}

async function load(file, encoding) {
  const key = file + '|' + encoding;
  if (cache.has(key)) return cache.get(key);
  let body = await readFile(file);
  if (encoding === 'br') body = brotliCompressSync(body, { params: { [zc.BROTLI_PARAM_QUALITY]: 11 } });
  else if (encoding === 'gzip') body = gzipSync(body, { level: 9 });
  cache.set(key, body);
  return body;
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let file = await resolveFile(req.url || '/');
  let status = 200;
  if (!file) {
    file = join(ROOT, '404.html');
    status = 404;
    try {
      await stat(file);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...HEADERS }).end('Not found');
      return;
    }
  }

  const ext = extname(file);
  const accept = String(req.headers['accept-encoding'] || '');
  const encoding = COMPRESSIBLE.has(ext) ? (accept.includes('br') ? 'br' : accept.includes('gzip') ? 'gzip' : null) : null;

  // Hashed build assets and fonts never change in place (a replaced font gets a new file name),
  // so both are cached for a year. Everything else revalidates.
  const cacheControl =
    file.includes(sep + '_astro' + sep) || file.includes(sep + 'fonts' + sep)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate';
  const headers = {
    ...HEADERS,
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
    Vary: 'Accept-Encoding',
  };
  if (encoding) headers['Content-Encoding'] = encoding;

  try {
    const body = await load(file, encoding);
    headers['Content-Length'] = body.length;
    res.writeHead(status, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...HEADERS }).end('Server error');
  }
}).listen(PORT, () => {
  console.log(`Serving ${ROOT} on port ${PORT}`);
});
