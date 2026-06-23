<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { locales, defaultLocale, isLocale, htmlLang } from '$lib/i18n';
	import { SITE_URL, SITE_NAME } from '$lib/site';

	const ogImage = `${SITE_URL}/img/hero/hero-home.webp`;

	// Prerendered as a language chooser; on the client we jump to the best locale.
	onMount(() => {
		const nav = navigator.language?.slice(0, 2);
		const target = isLocale(nav) ? nav : defaultLocale;
		goto('/' + target, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Voimareitti - training, food and a printable program</title>
	<meta name="description" content="Voimareitti builds a personal strength program and nutrition targets you can print, in Finnish, Hungarian, English and Swedish." />
	<!-- The chooser consolidates to the x-default locale; hreflang exposes every language to crawlers. -->
	<link rel="canonical" href={`${SITE_URL}/${defaultLocale}`} />
	{#each locales as l (l)}
		<link rel="alternate" hreflang={htmlLang[l]} href={`${SITE_URL}/${l}`} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${SITE_URL}/${defaultLocale}`} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content="Voimareitti" />
	<meta property="og:description" content="A personal strength program and nutrition targets you can print." />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<div class="container">
	<h1>Voimareitti</h1>
	<p class="muted">Valitse kieli / Choose your language</p>
	<nav class="langs" aria-label="Language">
		{#each locales as l (l)}
			<a href={'/' + l}>{l.toUpperCase()}</a>
		{/each}
	</nav>
</div>

<style>
	.langs {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.langs a {
		padding: 0.3rem 0.7rem;
		border: 1px solid var(--line);
		border-radius: 0.4rem;
		text-decoration: none;
	}
</style>
