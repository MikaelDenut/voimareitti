import { locales } from '$lib/i18n';
import type { EntryGenerator } from './$types';

export const prerender = true;

// Prerender /fi/generate, /hu/generate, /en/generate, /sv/generate.
export const entries: EntryGenerator = () => locales.map((lang) => ({ lang }));
