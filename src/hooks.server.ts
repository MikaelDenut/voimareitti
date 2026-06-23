import type { Handle } from '@sveltejs/kit';
import { isLocale, defaultLocale, htmlLang } from '$lib/i18n';

// Set <html lang> per locale at prerender time (app.html carries the %lang% token).
// The first path segment is the locale for /[lang]/... routes; root falls back to en.
export const handle: Handle = ({ event, resolve }) => {
	const seg = event.url.pathname.split('/')[1];
	const lang = isLocale(seg) ? htmlLang[seg] : htmlLang[defaultLocale];
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
