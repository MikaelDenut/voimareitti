// Central site config. One place to set the public origin used by canonical
// URLs, hreflang alternates, OG tags, the sitemap and robots.txt.
//
// Production origin: the live custom domain. Canonical/sitemap/hreflang/OG URLs
// all follow automatically from this one line.
export const SITE_URL = 'https://voimareitti.fi';
export const SITE_NAME = 'Voimareitti';
export const PUBLISHER = 'Cyborvent Oy';

export function urlFor(lang: string, path = ''): string {
	return `${SITE_URL}/${lang}${path}`;
}
