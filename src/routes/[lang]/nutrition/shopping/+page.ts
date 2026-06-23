import { locales } from '$lib/i18n';
import type { EntryGenerator } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => locales.map((lang) => ({ lang }));
