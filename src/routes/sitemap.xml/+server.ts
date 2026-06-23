import { locales, htmlLang, defaultLocale } from '$lib/i18n';
import { SITE_URL } from '$lib/site';
import { exercises } from '$lib/content/data';
import { recipes } from '$lib/content/recipes';

export const prerender = true;

// Public pages (path after the locale prefix), incl. every exercise + recipe detail page.
const paths = [
	'',
	'/generate',
	'/exercises',
	'/muscles',
	'/nutrition',
	'/nutrition/shopping',
	'/recipes',
	'/about',
	...exercises.map((e) => `/exercises/${e.id}`),
	...recipes.map((r) => `/recipes/${r.id}`)
];

export function GET() {
	const entries = paths
		.flatMap((p) => {
			const alts = [
				...locales.map(
					(l) => `<xhtml:link rel="alternate" hreflang="${htmlLang[l]}" href="${SITE_URL}/${l}${p}"/>`
				),
				`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${defaultLocale}${p}"/>`
			].join('');
			return locales.map(
				(l) => `<url><loc>${SITE_URL}/${l}${p}</loc>${alts}</url>`
			);
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
