<script lang="ts">
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import { exercises, goals, L, muscle, categoryKey, equipmentNeed } from '$lib/content/data';
	import { getProfile, purposeLabel, levelLabel, equipLabel, bodyPartLabel } from '$lib/content/profiles';
	import { exerciseImages, maleImages, prenatalImages } from '$lib/content/exercise-images';
	import { SITE_URL } from '$lib/site';

	let { data }: { data: { lang: Locale; id: string } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);
	const ex = $derived(exercises.find((e) => e.id === data.id) ?? exercises[0]);
	const prof = $derived(getProfile(ex.id));

	// Structured data: HowTo for the movement + a breadcrumb back to the library. Rich-result eligible.
	const howToLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: L(ex.name, lang),
		description: L(ex.purpose, lang),
		image: `${SITE_URL}/img/exercises/${ex.id}.webp`,
		step: [
			{ '@type': 'HowToStep', name: T('ex_setup'), text: L(ex.setup, lang) },
			{ '@type': 'HowToStep', text: L(ex.cue, lang) }
		]
	}));
	const crumbLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: T('lib_title'), item: `${SITE_URL}/${lang}/exercises` },
			{ '@type': 'ListItem', position: 2, name: L(ex.name, lang), item: `${SITE_URL}/${lang}/exercises/${ex.id}` }
		]
	}));

	// Client-only figure preview. The prerendered/canonical figure stays the general image (SEO unchanged);
	// this toggle just swaps in the male/prenatal variant when one exists for this exercise.
	type FigVariant = 'default' | 'male' | 'pregnant';
	let figVariant = $state<FigVariant>('default');
	const hasMale = $derived(maleImages.has(ex.id));
	const hasPrenatal = $derived(prenatalImages.has(ex.id));
	const figSrc = $derived(
		figVariant === 'male' && hasMale
			? `/img/exercises/${ex.id}.male.webp`
			: figVariant === 'pregnant' && hasPrenatal
				? `/img/exercises/${ex.id}.prenatal.webp`
				: `/img/exercises/${ex.id}.webp`
	);
	const figOptions = $derived([
		{ value: 'default', label: T('figure_female') },
		...(hasMale ? [{ value: 'male', label: T('figure_male') }] : []),
		...(hasPrenatal ? [{ value: 'pregnant', label: T('figure_pregnant') }] : [])
	]);
</script>

<Seo {lang} path={`/exercises/${ex.id}`} title={`${L(ex.name, lang)} - Voimareitti`} description={L(ex.purpose, lang)} />

<svelte:head>
	{@html `<script type="application/ld+json">${howToLd}</script>`}
	{@html `<script type="application/ld+json">${crumbLd}</script>`}
</svelte:head>

<SiteHeader {lang} />

<main id="main-content" class="container">
	<nav class="crumbs"><a href={`/${lang}/exercises`}>&larr; {T('ex_all_link')}</a></nav>

	<article class="detail">
		<div class="hero">
			<div class="figwrap">
				{#if exerciseImages.has(ex.id)}
					<img class="fig" src={figSrc} alt={L(ex.name, lang)} onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')} />
				{:else}
					<div class="fig ph"></div>
				{/if}
				{#if hasMale || hasPrenatal}
					<div class="figswitch no-print">
						<SegmentedControl
							options={figOptions}
							value={figVariant}
							ariaLabel={T('figure_shown_as')}
							onchange={(v) => (figVariant = v as FigVariant)}
						/>
					</div>
				{/if}
			</div>
			<div class="head">
				<h1>{L(ex.name, lang)}</h1>
				<p class="muscles">{ex.primary.map((m) => muscle(m, lang)).join(' . ')}</p>
				<p class="tags">{#if prof}<span class="pill alt">{bodyPartLabel(prof.bodyPart, lang)}</span>{/if}<span class="pill">{T('cat_' + categoryKey(ex.pattern))}</span><span class="pill">{T('eq_' + equipmentNeed(ex.minTier))}</span><span class="pill">{prof ? levelLabel(prof.level, lang) : T('exp_' + ex.experienceMin)}</span></p>
				<p class="cue">{L(ex.cue, lang)}</p>
				<a class="go" href={`/${lang}/generate`}>{T('ex_use')}</a>
			</div>
		</div>

		{#if prof}
			<section class="profile">
				<h2>{T('p_profile')}</h2>
				<div class="prows">
					<div class="prow"><span class="plabel">{T('p_purpose')}</span><span class="pval chips">{#each prof.purposes as pp (pp)}<span class="pchip">{purposeLabel(pp, lang)}</span>{/each}</span></div>
					<div class="prow"><span class="plabel">{T('p_effectiveness')}</span><span class="pval"><span class="stars">{'★'.repeat(prof.effectiveness)}{'☆'.repeat(5 - prof.effectiveness)}</span> <span class="muted small">{prof.effectiveness}/5</span></span></div>
					<div class="prow"><span class="plabel">{T('p_equipment')}</span><span class="pval">{prof.equipment.map((e) => equipLabel(e, lang)).join(', ')}</span></div>
					{#if prof.secondary && prof.secondary.length}
						<div class="prow"><span class="plabel">{T('p_secondary')}</span><span class="pval">{prof.secondary.map((m) => muscle(m, lang)).join(', ')}</span></div>
					{/if}
					<div class="prow"><span class="plabel">{T('p_dose')}</span><span class="pval">{L(prof.recommended, lang)}</span></div>
					<div class="prow"><span class="plabel">{T('p_suitability')}</span>
						<span class="pval suitgrid">
							<span class="srow"><span class="sk">{T('suit_age')}</span><span class="sv2" class:restrict={prof.ageMin || prof.ageMax}>{prof.ageMin ? prof.ageMin + '+' : prof.ageMax ? '<= ' + prof.ageMax : T('suit_any')}</span></span>
							<span class="srow"><span class="sk">{T('suit_bmi')}</span><span class="sv2" class:restrict={!!prof.bmiMax}>{prof.bmiMax ? '< ' + prof.bmiMax : T('suit_any')}</span></span>
							<span class="srow"><span class="sk">{T('suit_sex')}</span><span class="sv2" class:restrict={!!prof.genderNote}>{prof.genderNote ? L(prof.genderNote, lang) : T('suit_any')}</span></span>
							<span class="srow"><span class="sk">{T('suit_height')}</span><span class="sv2" class:restrict={!!prof.heightNote}>{prof.heightNote ? L(prof.heightNote, lang) : T('suit_any')}</span></span>
							<span class="srow"><span class="sk">{T('suit_waist')}</span><span class="sv2" class:restrict={!!prof.waistNote}>{prof.waistNote ? L(prof.waistNote, lang) : T('suit_any')}</span></span>
						</span>
					</div>
					{#if prof.note}
						<div class="prow"><span class="plabel"></span><span class="pval suitwhy">{L(prof.note, lang)}</span></div>
					{/if}
				</div>
			</section>
		{/if}

		<dl class="guide">
			<dt>{T('ex_purpose')}</dt><dd>{L(ex.purpose, lang)}</dd>
			<dt>{T('ex_setup')}</dt><dd>{L(ex.setup, lang)}</dd>
			<dt>{T('ex_mistakes')}</dt><dd>{L(ex.mistakes, lang)}</dd>
			<dt>{T('ex_easier')}</dt><dd>{L(ex.easier, lang)}</dd>
			<dt>{T('ex_harder')}</dt><dd>{L(ex.harder, lang)}</dd>
			{#if ex.safety}<dt class="warn">{T('ex_safety')}</dt><dd>{L(ex.safety, lang)}</dd>{/if}
		</dl>

		{#if ex.pattern !== 'mobility'}
			<section class="bygoal">
				<h2>{T('ex_byGoal')}</h2>
				<div class="goalgrid">
					{#each goals as g (g.id)}
						<div class="goalcard">
							<b>{L(g.name, lang)}</b>
							<span>{g.sets[0]}-{g.sets[1]} {T('sets')} . {g.reps[0]}-{g.reps[1]} {T('reps')}</span>
							<span class="muted small">{T('rest')} {g.restSec}s</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</article>
</main>

<style>
	.crumbs { margin: 1.25rem 0 0.5rem; font-size: 0.9rem; }
	.detail { max-width: 52rem; }
	.hero { display: flex; gap: 1.25rem; flex-wrap: wrap; align-items: flex-start; margin-bottom: 1.25rem; }
	.fig { width: 100%; max-width: min(78vw, 300px); aspect-ratio: 3 / 4; height: auto; object-fit: contain; background: var(--accent-soft); border: 1px solid var(--line); border-radius: var(--radius); flex: none; }
	.fig.ph { background: #f0efea; }
	.figwrap { display: flex; flex-direction: column; gap: 0.5rem; flex: none; }
	.figswitch { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.4rem; }
	.head { flex: 1; min-width: 240px; }
	.head h1 { margin: 0.25rem 0 0.4rem; }
	.muscles { color: var(--accent); font-size: 0.9rem; margin: 0 0 0.5rem; }
	.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 0.7rem; }
	.pill { background: var(--accent-soft); color: var(--primary); border-radius: 2rem; padding: 0.2rem 0.7rem; font-size: 0.78rem; font-weight: 600; }
	.cue { margin: 0 0 1rem; }
	.go { display: inline-block; background: var(--accent); color: #fff; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; font-weight: 600; }
	.go:hover { filter: brightness(0.95); }
	.profile { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.9rem 1.1rem; margin: 0 0 1.5rem; }
	.profile h2 { font-size: 1.05rem; color: var(--primary); margin: 0 0 0.6rem; }
	.prows { display: flex; flex-direction: column; gap: 0.5rem; }
	.prow { display: grid; grid-template-columns: 9rem 1fr; gap: 0.6rem; align-items: baseline; font-size: 0.92rem; }
	.plabel { color: var(--muted); font-size: 0.8rem; }
	.pval.chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }
	.pchip { background: var(--accent-soft); color: var(--primary); border-radius: 2rem; padding: 0.1rem 0.6rem; font-size: 0.78rem; font-weight: 600; }
	.stars { color: var(--accent); letter-spacing: 0.1em; }
	.suitgrid { display: flex; flex-direction: column; gap: 0.25rem; }
	.srow { display: grid; grid-template-columns: 4.5rem 1fr; gap: 0.5rem; align-items: baseline; }
	.sk { color: var(--muted); font-size: 0.8rem; }
	.sv2 { font-size: 0.85rem; }
	.sv2.restrict { color: #9a4a13; font-weight: 600; }
	.suitwhy { color: var(--muted); font-size: 0.85rem; }
	.guide { margin: 0 0 1.5rem; }
	.guide dt { font-weight: 600; margin-top: 0.7rem; }
	.guide dt.warn { color: #9a4a13; }
	.guide dd { margin: 0.1rem 0 0; color: var(--muted); }
	.bygoal { border-top: 1px solid var(--line); padding-top: 1.1rem; }
	.goalgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.6rem; margin-top: 0.5rem; }
	.goalcard { display: flex; flex-direction: column; gap: 0.15rem; border: 1px solid var(--line); border-radius: 0.5rem; padding: 0.6rem 0.8rem; font-size: 0.9rem; }
	.goalcard b { color: var(--primary); }
	.small { font-size: 0.8rem; }
</style>
