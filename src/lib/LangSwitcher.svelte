<script lang="ts">
	// In-app language switcher. Links to the same page in each locale; the page
	// persists the profile in localStorage, so switching language keeps the user's state.
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { locales, localeNames, t, type Locale } from '$lib/i18n';

	let { lang }: { lang: Locale } = $props();

	// Replace the leading /<lang> segment with the target locale, keep the rest of the path AND (client-side)
	// the query string (e.g. /en/recipes?focus=protein -> /fi/recipes?focus=protein) so the recipes deep-link
	// filter from the workout funnel is not dropped on a language switch. The site is fully prerendered and
	// SvelteKit forbids reading url.search during prerender, so the search is only appended in the browser
	// (the prerendered link carries the path; the client updates it to include the query after hydration).
	function hrefFor(l: Locale): string {
		const rest = $page.url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
		return `/${l}${rest}${browser ? $page.url.search : ''}`;
	}
</script>

<nav class="langs" aria-label={t(lang, 'lang_label')}>
	{#each locales as l (l)}
		<a href={hrefFor(l)} class:active={l === lang} aria-current={l === lang ? 'true' : undefined} title={localeNames[l]}>{l.toUpperCase()}</a>
	{/each}
</nav>

<style>
	.langs { display: flex; gap: 0.25rem; }
	.langs a {
		padding: 0.25rem 0.5rem;
		border-radius: 0.4rem;
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted);
		border: 1px solid transparent;
	}
	.langs a:hover { color: var(--text); }
	.langs a.active { color: var(--primary); background: var(--accent-soft); border-color: var(--accent); }
</style>
