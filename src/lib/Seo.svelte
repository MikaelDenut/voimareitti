<script lang="ts">
	// Per-page SEO head: title, description, canonical, hreflang alternates, OG + Twitter.
	import { locales, htmlLang, ogLocale, defaultLocale, type Locale } from '$lib/i18n';
	import { SITE_URL, SITE_NAME } from '$lib/site';

	let {
		lang,
		path = '',
		title,
		description,
		image
	}: { lang: Locale; path?: string; title: string; description: string; image?: string } = $props();

	const canonical = $derived(`${SITE_URL}/${lang}${path}`);
	// Per-page social image when provided (e.g. a recipe photo), else the default hero.
	const ogImage = $derived(image ?? `${SITE_URL}/img/hero/hero-home.webp`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#each locales as l (l)}
		<link rel="alternate" hreflang={htmlLang[l]} href={`${SITE_URL}/${l}${path}`} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${SITE_URL}/${defaultLocale}${path}`} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={ogLocale[lang]} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
