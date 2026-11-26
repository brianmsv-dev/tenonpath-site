// sitemap.xml: public pages only (not /styleguide, /demo/embed or the 404).
// Every public page. Keep in sync when pages are added.
import type { APIRoute } from 'astro';

const PAGES = ['/', '/real-estate/', '/demo/', '/privacy/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://tenonpath.com');
  const urls = PAGES.map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
