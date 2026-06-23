<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import { exercises, L, muscle, muscleKeys } from '$lib/content/data';
	import { exerciseImages } from '$lib/content/exercise-images';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);

	// Muscles that are actually trained by at least one exercise, with their exercises.
	const groups = $derived(
		muscleKeys
			.map((m) => ({ m, list: exercises.filter((e) => e.primary.includes(m)) }))
			.filter((g) => g.list.length)
	);
</script>

<Seo {lang} path="/muscles" title={`${T('muscles_title')} - Voimareitti`} description={T('muscles_intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<h1>{T('muscles_title')}</h1>
	<p class="muted intro">{T('muscles_intro')}</p>

	{#each groups as g (g.m)}
		<section class="mblock">
			<h2>{muscle(g.m, lang)}</h2>
			<div class="chips">
				{#each g.list as e (e.id)}
					<a class="chip" href={`/${lang}/exercises/${e.id}`}>
						{#if exerciseImages.has(e.id)}<img src={`/img/exercises/${e.id}.webp`} alt="" loading="lazy" />{/if}
						{L(e.name, lang)}
					</a>
				{/each}
			</div>
		</section>
	{/each}
</main>

<style>
	h1 { margin-top: 1.5rem; }
	.intro { margin: 0 0 1rem; }
	.mblock { border-top: 1px solid var(--line); padding-top: 1rem; margin-top: 1rem; }
	.mblock h2 { font-size: 1.1rem; color: var(--primary); margin-bottom: 0.6rem; }
	.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.chip { display: flex; align-items: center; gap: 0.45rem; border: 1px solid var(--line); border-radius: 2rem; padding: 0.3rem 0.85rem 0.3rem 0.4rem; text-decoration: none; color: var(--text); font-size: 0.9rem; }
	.chip:hover { border-color: var(--accent); background: var(--accent-soft); }
	.chip img { width: 30px; height: 38px; object-fit: contain; border-radius: 0.3rem; }
</style>
