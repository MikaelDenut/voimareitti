<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);

	// Deterministic lifestyle-scene pick, stable per language; hero-home stays the OG/default (see Seo.svelte).
	const heroScenes = ['hero-apartment', 'hero-garden', 'hero-desk'];
	const heroScene = $derived(heroScenes[[...lang].reduce((sum, c) => sum + c.charCodeAt(0), 0) % heroScenes.length]);
</script>

<Seo {lang} title={`Voimareitti - ${t(lang, 'tagline')}`} description={t(lang, 'intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<header class="brand">
		<h1 class="sr-only">Voimareitti - {t(lang, 'tagline')}</h1>
		<img class="logo" src="/img/brand/logo.png" alt="Voimareitti" />
		<p class="tagline">{t(lang, 'tagline')}</p>
	</header>

	<img class="hero" src={`/img/hero/${heroScene}.webp`} alt="" loading="lazy" />

	<p class="intro">{t(lang, 'intro')}</p>

	<p class="cta-row"><a class="cta" href={`/${lang}/generate`}>{t(lang, 'cta_make')}</a></p>
</main>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.brand {
		margin-top: 1.5rem;
	}
	.logo {
		max-width: 340px;
		width: 70%;
		height: auto;
	}
	.hero {
		display: block;
		width: 100%;
		max-width: 720px;
		height: auto;
		border-radius: var(--radius);
		margin-top: 1.5rem;
	}
	.tagline {
		font-size: 1.15rem;
		color: var(--accent);
		margin-top: 0.25rem;
	}
	.intro {
		max-width: 48ch;
		margin-top: 1.5rem;
	}
	.cta-row {
		margin-top: 1.5rem;
	}
	.cta {
		display: inline-block;
		background: var(--accent);
		color: #fff;
		text-decoration: none;
		padding: 0.7rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
	}
	.cta:hover {
		filter: brightness(0.95);
	}
</style>
