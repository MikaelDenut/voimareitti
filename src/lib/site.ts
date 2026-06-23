// Central site config. One place to set the public origin used by canonical
// URLs, hreflang alternates, OG tags, the sitemap and robots.txt.
//
// Production origin. Currently the Netlify subdomain; switch to the custom domain
// (https://voimareitti.fi) once domain/trademark clearance is settled - the
// canonical/sitemap/hreflang/OG URLs all follow automatically from this one line.
export const SITE_URL = 'https://voimareitti.netlify.app';
export const SITE_NAME = 'Voimareitti';
export const PUBLISHER = 'Cyborvent Oy';

export function urlFor(lang: string, path = ''): string {
	return `${SITE_URL}/${lang}${path}`;
}
