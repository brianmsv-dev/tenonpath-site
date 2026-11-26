// robots.txt: everything crawlable. /styleguide and /demo/embed carry a noindex meta tag, and Google
// can only see that tag if it is allowed to crawl the page, so they are not blocked here.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://tenonpath.com');
  return new Response(
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap.xml', base).href}`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
