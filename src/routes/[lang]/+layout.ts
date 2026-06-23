import { error } from '@sveltejs/kit';
import { isLocale } from '$lib/i18n';
import type { LayoutLoad } from './$types';

// prerender is inherited from the root +layout.ts (true for the whole site).
export const load: LayoutLoad = ({ params }) => {
	if (!isLocale(params.lang)) error(404, 'Unknown language');
	return { lang: params.lang };
};
