<script lang="ts">
	import '../app.css';
	import { locales } from '$lib/i18n';
	import { SITE_URL, SITE_NAME, PUBLISHER } from '$lib/site';

	let { children } = $props();

	// Site-wide JSON-LD: who publishes this and what the site is.
	const orgLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}/img/brand/logo.png`,
		publisher: { '@type': 'Organization', name: PUBLISHER }
	});
	const siteLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		inLanguage: [...locales]
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${orgLd}</script>`}
	{@html `<script type="application/ld+json">${siteLd}</script>`}
</svelte:head>

{@render children()}
