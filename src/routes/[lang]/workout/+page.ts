import { redirect } from '@sveltejs/kit';
import { locales } from '$lib/i18n';
import type { EntryGenerator, PageLoad } from './$types';

// /[lang]/workout is the canonical "Workout" URL; it redirects to the existing generator route.
export const prerender = true;
export const entries: EntryGenerator = () => locales.map((lang) => ({ lang }));
export const load: PageLoad = ({ params }) => {
	redirect(308, `/${params.lang}/generate`);
};
