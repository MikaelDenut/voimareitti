import { error } from '@sveltejs/kit';
import { locales } from '$lib/i18n';
import { recipes } from '$lib/content/recipes';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	locales.flatMap((lang) => recipes.map((r) => ({ lang, id: r.id })));

export const load: PageLoad = ({ params }) => {
	const r = recipes.find((x) => x.id === params.id);
	if (!r) error(404, 'Unknown recipe');
	return { id: params.id };
};
