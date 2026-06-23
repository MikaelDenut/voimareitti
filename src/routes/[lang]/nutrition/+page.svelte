<script lang="ts">
	// Nutrition page. Mirrors the Workout page: banner + heading + intro, then the NutritionPlanner, which
	// owns the two-phase flow (landing: profile + Weekly meal plan / nutrient focus + Generate; result:
	// header bar + daily-target boxes + the plan). All nutrition REFERENCE content (food groups, diet
	// guides, basics, supplements, etc.) now lives on the Help page. The page keeps MealPrint (print-only)
	// bound to the planner's week.
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import NutritionPlanner from '$lib/NutritionPlanner.svelte';
	import MealPrint from '$lib/MealPrint.svelte';
	import { profile } from '$lib/profile.svelte';
	import { owner } from '$lib/owner.svelte';
	import type { WeekPlan } from '$lib/engine/meal-planner';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);

	// The planner owns generation; the page holds the week so the print-only MealPrint can render it.
	let planWeek = $state<WeekPlan | null>(null);
	let printDensity = $state<'compact' | 'full'>('full');
</script>

<Seo {lang} path="/nutrition" title={`${T('nutr_title')} - Voimareitti`} description={T('nutr_intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<img class="pagebanner" src="/img/banners/nutrition.webp" alt="" />
	<h1>{T('nutr_title')}</h1>
	<p class="muted intro">{T('nutr_intro')}</p>

	<NutritionPlanner {lang} bind:week={planWeek} bind:density={printDensity} />
</main>

<MealPrint mode="plan" {lang} week={planWeek} {profile} density={printDensity} {owner} />

<style>
	@media print {
		main.container { display: none !important; }
		:global(body) { background: #fff; }
	}
	.pagebanner { display: block; width: 100%; height: auto; border-radius: var(--radius); margin: 1rem 0 0.25rem; }
	.intro { margin: 0 0 1rem; }
	.muted { color: var(--muted); }
</style>
