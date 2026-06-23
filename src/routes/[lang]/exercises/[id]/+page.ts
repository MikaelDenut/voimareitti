import { error } from '@sveltejs/kit';
import { locales } from '$lib/i18n';
import { exercises } from '$lib/content/data';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	locales.flatMap((lang) => exercises.map((e) => ({ lang, id: e.id })));

export const load: PageLoad = ({ params }) => {
	const ex = exercises.find((e) => e.id === params.id);
	if (!ex) error(404, 'Unknown exercise');
	return { id: params.id };
};
