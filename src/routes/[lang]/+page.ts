import { locales } from '$lib/i18n';
import type { EntryGenerator } from './$types';

export const prerender = true;

// One prerendered page per language (entries must live on the page, not the layout).
export const entries: EntryGenerator = () => locales.map((lang) => ({ lang }));
