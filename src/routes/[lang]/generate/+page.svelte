<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import PrintGuide from '$lib/PrintGuide.svelte';
	import { generate, swapOptions, mobilityOptions, sessionFillOptions, prefersEasier, type Profile, type Plan } from '$lib/engine/engine';
	import { profile } from '$lib/profile.svelte';
	import InfoTip from '$lib/InfoTip.svelte';
	import { glossary } from '$lib/content/glossary';
	import {
		L, muscle, goals, nutritionGoals, emphases, splits,
		bmiNote, paceNote, pregnancyBodyNote, waistNote, type Exercise, type Loc
	} from '$lib/content/data';
	import ProfilePanel from '$lib/ProfilePanel.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import { saveWorkout } from '$lib/saved.svelte';
	import { currentWorkout } from '$lib/workout.svelte';
	import { owner } from '$lib/owner.svelte';
	import { exerciseImages, exerciseImageSrc, maleImages, prenatalImages } from '$lib/content/exercise-images';
	import { nutritionTopics } from '$lib/content/nutrition-content';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);
	// Locale-aware one-decimal formatter (fi/hu/sv use a comma decimal separator, not a period).
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
	// localStorage can throw in Safari private mode / on quota; never let that break the flow.
	function safeGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
	function safeSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore: private mode / quota */ } }

	// Deterministic lifestyle-scene pick, stable per language; hero-home stays the OG/default (see Seo.svelte).
	const heroScenes = ['hero-apartment', 'hero-garden', 'hero-desk'];
	const heroScene = $derived(heroScenes[[...lang].reduce((sum, c) => sum + c.charCodeAt(0), 0) % heroScenes.length]);

	let acked = $state(false);
	let ackChecked = $state(false);
	let loaded = $state(false);

	// Profile is the shared store ($lib/profile) - the one source of truth across Workout, Exercises,
	// Nutrition, and Recipes. It loads + migrates the legacy `vr-profile` blob and auto-persists itself,
	// so this page no longer keeps a local copy or its own load/save.

	let doneDays = $state<Record<number, boolean>>({});
	// Result controls (mirror the nutrition result): print detail + regenerate seed.
	let printDensity = $state<'compact' | 'full'>('full');
	let seedOffset = $state(0);
	const guideTitleLbl: Loc = { en: 'Workout guide', fi: 'Treeniopas', hu: 'Edzésútmutató', sv: 'Träningsguide' };
	const g = (k: string) => ({ title: L(glossary[k].title, lang), body: L(glossary[k].body, lang) });

	// Workout -> nutrition funnel (planning section 16). Food-group cards open an info modal with two CTAs
	// (recipes filtered by focus, and the planner). Supplements stay a separate, untouched block.
	type FoodGroupCard = { name: Loc; examples: Loc; image?: string };
	let openGroup = $state<FoodGroupCard | null>(null);
	// image slug -> recipes ?focus key (named + tested mapping).
	const FOCUS_BY_IMAGE: Record<string, string> = {
		'foods-protein': 'protein', 'foods-carbs': 'carbs', 'foods-veg': 'vegetables',
		'foods-fruit': 'fruit', 'foods-fats': 'fats', 'foods-legumes': 'fibre'
	};
	const focusOf = (card: FoodGroupCard) => (card.image && FOCUS_BY_IMAGE[card.image]) || 'protein';
	const fgInfo: Record<string, { en: string; fi: string; hu: string; sv: string }> = {
		protein: { en: 'Protein helps you keep and build muscle and keeps meals filling. Aim for a source at each meal.', fi: 'Proteiini auttaa ylläpitämään ja kasvattamaan lihasta ja pitää ateriat kylläisinä. Tavoittele lähde joka aterialle.', hu: 'A fehérje segít megőrizni és építeni az izmot, és jóllakottá teszi az étkezést. Minden étkezésnél legyen forrása.', sv: 'Protein hjälper dig behålla och bygga muskler och gör måltider mättande. Sikta på en källa vid varje måltid.' },
		carbs: { en: 'Quality carbs fuel training and recovery. Favour whole grains, potatoes, fruit.', fi: 'Laadukkaat hiilihydraatit antavat energiaa treeniin ja palautumiseen. Suosi täysjyvää, perunaa, hedelmiä.', hu: 'A minőségi szénhidrátok energiát adnak az edzéshez és regenerációhoz. Részesítsd előnyben a teljes kiőrlésűt, burgonyát, gyümölcsöt.', sv: 'Bra kolhydrater ger energi till träning och återhämtning. Välj fullkorn, potatis, frukt.' },
		vegetables: { en: 'Vegetables add fibre, vitamins and volume for few calories. Fill half the plate.', fi: 'Vihannekset tuovat kuitua, vitamiineja ja tilavuutta vähin kalorein. Täytä puolet lautasesta.', hu: 'A zöldségek rostot, vitaminokat és tömeget adnak kevés kalóriával. Töltsd meg velük a tányér felét.', sv: 'Grönsaker ger fiber, vitaminer och volym för få kalorier. Fyll halva tallriken.' },
		fruit: { en: 'Fruit is an easy source of vitamins, fibre and natural sweetness.', fi: 'Hedelmä on helppo vitamiinien, kuidun ja luontaisen makeuden lähde.', hu: 'A gyümölcs a vitaminok, rostok és természetes édesség egyszerű forrása.', sv: 'Frukt är en enkel källa till vitaminer, fiber och naturlig sötma.' },
		fats: { en: 'Healthy fats support hormones and help you absorb vitamins. A little goes a long way.', fi: 'Terveelliset rasvat tukevat hormoneja ja auttavat vitamiinien imeytymisessä. Pieni määrä riittää.', hu: 'Az egészséges zsírok támogatják a hormonokat és segítik a vitaminok felszívódását. Kevés is sokat számít.', sv: 'Nyttiga fetter stödjer hormoner och hjälper dig ta upp vitaminer. Lite räcker långt.' },
		fibre: { en: 'Fibre-rich foods aid digestion and keep you full. Beans, lentils, oats, whole grains.', fi: 'Kuitupitoiset ruoat edistävät ruoansulatusta ja pitävät kylläisenä. Pavut, linssit, kaura, täysjyvä.', hu: 'A rostban gazdag ételek segítik az emésztést és jóllakottá tesznek. Bab, lencse, zab, teljes kiőrlésű.', sv: 'Fiberrik mat hjälper matsmältningen och håller dig mätt. Bönor, linser, havre, fullkorn.' }
	};
	const fgInfoText = (card: FoodGroupCard) => fgInfo[focusOf(card)][lang];
	const ctaRecipes = { en: 'See recipes', fi: 'Katso reseptit', hu: 'Receptek', sv: 'Se recept' };
	const ctaPlanner = { en: 'Plan meals', fi: 'Suunnittele ateriat', hu: 'Étrend tervezése', sv: 'Planera måltider' };

	let result = $state<Plan | null>(null);
	let used = $state<Profile | null>(null);
	// Landing vs result view, decoupled from `result` (2026-07 parity audit H2): Back now returns to the
	// landing WITHOUT destroying the plan (mirrors the nutrition planner); the plan also survives in-app
	// navigation via the currentWorkout store, manual edits included.
	let showResult = $state(false);
	// Bias toward easier variations (swap ordering + tip prominence) for the cohort that benefits.
	const needsEasier = $derived(used ? prefersEasier(used) : false);
	// Which figure variant the card is showing, as a label chip (null = the neutral default, no chip).
	function figLabelFor(id: string): string | null {
		if (!used) return null;
		if (result?.prenatal && prenatalImages.has(id)) return T('figure_pregnant');
		if (used.sex === 'male' && maleImages.has(id)) return T('figure_male');
		if (used.sex === 'female') return T('figure_female');
		return null;
	}
	// Stable per-item ids so swap/remove survive reordering after a removal. Assigned in run() + on add.
	let uidCounter = 0;
	const nextUid = () => 'u' + uidCounter++;
	// (Re)assign a fresh uid to every item of the current result and reset the counter. Used by run() AND
	// the "Use as my plan" handoff path - the handoff restores items that already carry u0,u1,... so without
	// this the counter would stay at 0 and the next add/swap would mint a colliding uid (duplicate {#each}
	// keys -> wrong card edited). Re-keying on restore is safe: nothing outside this page references the old uids.
	function assignUids() {
		if (!result) return;
		uidCounter = 0;
		for (const it of result.warmup.items) it.uid = nextUid();
		for (const it of result.cooldown.items) it.uid = nextUid();
		for (const s of result.sessions) for (const it of s.items) it.uid = nextUid();
		if (result.birthPrep) for (const it of result.birthPrep.items) it.uid = nextUid();
	}

	onMount(() => {
		if (!browser) return;
		if (safeGet('vr-ack') === '1') acked = true;
		// "Use as my plan" from a saved snapshot hands off the exact Plan via this key so manual edits
		// survive (instead of regenerating from the profile). Consume it once, then fall back to restore.
		const handoff = safeGet('voimareitti.workout.live');
		if (handoff) {
			try {
				const snap = JSON.parse(handoff) as { plan: Plan; used: Profile };
				if (snap?.plan && snap?.used) {
					result = snap.plan;
					used = snap.used;
					assignUids(); // re-key restored items so a later add/swap can't collide with serialized uids
					swaps = {};
					doneDays = {};
					acked = true;
					showResult = true;
					currentWorkout.plan = result;
					currentWorkout.used = used;
					safeSet('vr-ack', '1');
					safeSet('vr-generated', '1');
				}
			} catch { /* ignore malformed handoff */ }
			try { localStorage.removeItem('voimareitti.workout.live'); } catch { /* ignore */ }
		}
		// Restore the in-memory working plan across in-app navigation (manual edits preserved) - mirrors
		// the nutrition planner's currentPlan restore. A full reload falls back to the deterministic re-run.
		if (!result && currentWorkout.plan && currentWorkout.used) {
			result = currentWorkout.plan;
			used = currentWorkout.used;
			assignUids();
			showResult = true;
		}
		// profile (shared store) + owner ($lib/owner.svelte) load + persist themselves.
		if (!result && safeGet('vr-generated') === '1') run(true);
		loaded = true;
	});

	// Pregnancy/postpartum only applies to female users; clear it otherwise.
	$effect(() => {
		if (profile.sex !== 'female' && (profile.pregnant || profile.postpartum)) {
			profile.pregnant = false;
			profile.postpartum = false;
		}
	});
	// Waist circumference is meaningless during pregnancy - clear it so no stale ratio is shown.
	$effect(() => {
		if (profile.pregnant && profile.waistCm != null) profile.waistCm = undefined;
	});

	// Warm-up / cool-down swap + add (mobility moves).
	function mobilityExcl(): string[] {
		return [...result!.warmup.items, ...result!.cooldown.items].map((it) => it.exercise.id);
	}
	function swapMobility(sessionKey: 'warmup' | 'cooldown', uid: string) {
		if (!result || !used) return;
		const items = result[sessionKey].items;
		const ii = items.findIndex((it) => it.uid === uid);
		if (ii < 0) return;
		if (!swaps[uid]) {
			const excl = mobilityExcl().filter((id) => id !== items[ii].exercise.id);
			swaps[uid] = { list: [items[ii].exercise, ...mobilityOptions(used, excl)], idx: 0 };
		}
		const s = swaps[uid];
		if (s.list.length < 2) return;
		s.idx = (s.idx + 1) % s.list.length;
		items[ii].exercise = s.list[s.idx];
	}
	function removeMobility(sessionKey: 'warmup' | 'cooldown', uid: string) {
		if (!result) return;
		result[sessionKey].items = result[sessionKey].items.filter((it) => it.uid !== uid);
		delete swaps[uid];
	}
	function addMobility(sessionKey: 'warmup' | 'cooldown') {
		if (!result || !used) return;
		const opts = mobilityOptions(used, mobilityExcl());
		if (!opts.length) return;
		const reps = sessionKey === 'cooldown' ? '20-40 s' : '6-8';
		const tempo = sessionKey === 'cooldown' ? 'hold' : 'slow';
		result[sessionKey].items = [...result[sessionKey].items, { exercise: opts[0], sets: 1, reps, restSec: 0, tempo, uid: nextUid() }];
	}

	function openApp() {
		acked = true;
		if (browser) safeSet('vr-ack', '1');
	}


	// Per-slot swap state: a stable list of alternatives + the current index.
	let swaps = $state<Record<string, { list: Exercise[]; idx: number }>>({});
	function swap(si: number, uid: string) {
		if (!result || !used) return;
		const items = result.sessions[si].items;
		const ii = items.findIndex((it) => it.uid === uid);
		if (ii < 0) return;
		if (!swaps[uid]) {
			const siblings = items.filter((_, k) => k !== ii).map((it) => it.exercise.id);
			swaps[uid] = { list: [items[ii].exercise, ...swapOptions(used, items[ii].exercise, siblings, prefersEasier(used))], idx: 0 };
		}
		const s = swaps[uid];
		if (s.list.length < 2) return;
		s.idx = (s.idx + 1) % s.list.length;
		items[ii].exercise = s.list[s.idx];
	}

	// Remove a training exercise (keyed by stable uid so siblings stay aligned).
	function removeItem(si: number, uid: string) {
		if (!result) return;
		result.sessions[si].items = result.sessions[si].items.filter((it) => it.uid !== uid);
		delete swaps[uid];
	}

	// Add another exercise of the session's movement pattern (mirror of the warm-up "add"). An EMPTY
	// session falls back to the session-key pattern pool (2026-07 parity audit H3): before this, a user
	// who removed every exercise from a day could not refill it without regenerating (losing all edits).
	function addToSession(si: number) {
		if (!result || !used) return;
		const s = result.sessions[si];
		const excl = s.items.map((it) => it.exercise.id);
		const ref = s.items[0]?.exercise;
		const opts = ref ? swapOptions(used, ref, excl) : sessionFillOptions(used, s.titleKey, excl);
		if (!opts.length) return;
		const gd = result.guidance;
		s.items = [...s.items, { exercise: opts[0], sets: gd.setsPerExercise, reps: gd.reps, restSec: gd.restSec, tempo: gd.tempo, uid: nextUid() }];
	}

	// Clamp numeric inputs to their valid ranges so a cleared or out-of-range field can never produce
	// a NaN/Infinity plan (e.g. height 0 -> infinite BMI). Mirrors the <input> min/max.
	const clampN = (v: unknown, lo: number, hi: number, d: number) => {
		const n = Number(v);
		return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
	};

	function run(restore = false) {
		const snap = {
			...profile,
			equipment: [...profile.equipment],
			age: clampN(profile.age, 14, 100, 30),
			weightKg: clampN(profile.weightKg, 35, 250, 75),
			heightCm: clampN(profile.heightCm, 120, 220, 175),
			days: clampN(profile.days, 1, 6, 3),
			minutes: clampN(profile.minutes, 15, 90, 45),
			waistCm: profile.waistCm != null && Number.isFinite(Number(profile.waistCm))
				? Math.min(200, Math.max(40, Number(profile.waistCm)))
				: undefined
		};
		used = snap;
		swaps = {};
		doneDays = {};
		result = generate(snap, seedOffset);
		assignUids();
		showResult = true;
		currentWorkout.plan = result;
		currentWorkout.used = used;
		if (browser) {
			safeSet('vr-generated', '1');
			if (!restore) queueMicrotask(() => {
				const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
				document.getElementById('result')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
			});
		}
	}

	const weeklyWorkoutLbl: Loc = { en: 'Weekly workout plan', fi: 'Viikon treenisuunnitelma', hu: 'Heti edzésterv', sv: 'Veckans träningsplan' };
	const emphasisLbl: Loc = { en: 'Workout emphasis', fi: 'Harjoittelun painotus', hu: 'Edzés hangsúlya', sv: 'Träningsbetoning' };
	const saveLbl: Loc = { en: 'Save program', fi: 'Tallenna ohjelma', hu: 'Program mentése', sv: 'Spara program' };
	const savedLbl: Loc = { en: 'Saved', fi: 'Tallennettu', hu: 'Mentve', sv: 'Sparad' };
	const regenLbl: Loc = { en: 'Regenerate', fi: 'Luo uudelleen', hu: 'Újragenerálás', sv: 'Skapa nytt' };
	const printDetailLbl: Loc = { en: 'Print detail', fi: 'Tulosteen tarkkuus', hu: 'Nyomtatás részletei', sv: 'Utskriftsnivå' };
	const compactLbl: Loc = { en: 'Compact', fi: 'Tiivis', hu: 'Tömör', sv: 'Kompakt' };
	const fullLbl: Loc = { en: 'Full', fi: 'Täysi', hu: 'Teljes', sv: 'Fullständig' };
	let justSaved = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	function saveProgram() {
		if (!result || !used) return;
		// Store the generated PLAN snapshot (with any manual swaps/removes/adds) + the profile used.
		saveWorkout(new Date().toLocaleDateString(lang), { plan: result, used });
		justSaved = true;
		clearTimeout(savedTimer); // repeated saves no longer race the reset
		savedTimer = setTimeout(() => (justSaved = false), 2000);
	}

	// Back is NON-destructive (2026-07 parity audit H2, mirrors the nutrition planner): return to the
	// landing, keep the plan + every manual edit. Generate/Regenerate replace it; "Back to your plan"
	// on the landing reopens it.
	function back() {
		showResult = false;
	}
	const backToPlanLbl: Loc = { en: 'Back to your plan', fi: 'Takaisin suunnitelmaan', hu: 'Vissza a tervhez', sv: 'Tillbaka till planen' };

	function regenerate() { seedOffset += 1; run(); }

	function exportPdf() {
		if (browser) window.print();
	}

	// ---- display helpers ----
	const nameOf = (arr: { id: string; name: { en: string } }[], id: string) => {
		const it = arr.find((x) => x.id === id);
		return it ? L(it.name, lang) : id;
	};
	const trainingGoalName = $derived(nameOf(goals, used?.trainingGoal ?? 'general'));
	const nutritionGoalName = $derived(nameOf(nutritionGoals, used?.nutritionGoal ?? 'maintain'));
	const emphasisName = $derived(nameOf(emphases, used?.emphasis ?? 'balanced'));
	const splitName = $derived(result ? nameOf(splits, result.resolvedSplit) : '');

	function splitLabel(titleKey: string): string {
		const map: Record<string, string> = {
			session: 's_fullbody', upper: 's_upper', lower: 's_lower',
			push: 's_push', pull: 's_pull', legs: 's_legs'
		};
		return map[titleKey] ? T(map[titleKey]) : titleKey;
	}
	const warmMin = $derived(result ? Math.round(result.warmup.items.length * 1.5) : 0);
	function dayMinutes(s: { items: { sets: number; restSec: number }[] }): number {
		const work = s.items.reduce((t, it) => t + it.sets * (45 + it.restSec), 0);
		return Math.round(work / 60) + warmMin;
	}

	// Live weekly volume + set count, recomputed from the CURRENT sessions so the summary stays correct
	// after a swap / remove / add (the engine's weeklyVolume is only the initial snapshot).
	const liveVolume = $derived.by(() => {
		if (!result) return [] as { muscle: string; sets: number }[];
		const vol: Record<string, number> = {};
		for (const s of result.sessions) for (const it of s.items) for (const m of it.exercise.primary) vol[m] = (vol[m] ?? 0) + it.sets;
		return Object.entries(vol)
			.map(([m, sets]) => ({ muscle: m, sets }))
			.sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle))
			.slice(0, 8);
	});
	const liveWeeklySets = $derived(result ? result.sessions.reduce((t, s) => t + s.items.reduce((u, it) => u + it.sets, 0), 0) : 0);
	const volMax = $derived(Math.max(1, ...liveVolume.map((v) => v.sets)));
	const meals = $derived(used && used.days >= 5 ? 4 : 3);
	const proteinPerMeal = $derived(result ? Math.round(((result.energy.proteinLow + result.energy.proteinHigh) / 2) / meals) : 0);
	const proteinPerKg = $derived(
		result && used && used.weightKg
			? `${fmt1(result.energy.proteinLow / used.weightKg)}-${fmt1(result.energy.proteinHigh / used.weightKg)} g/kg`
			: ''
	);
	// Practical, expandable "learn more" nutrition topics tailored to the nutrition goal.
	const dietTopics = $derived.by(() => {
		const want = ['protein', 'meal-structure', 'fibre', 'hydration'];
		if (used?.nutritionGoal === 'lose') want.push('fat-loss-tactics');
		if (used?.nutritionGoal === 'gain') want.push('muscle-gain-tactics');
		return want.map((id) => nutritionTopics.find((t) => t.id === id)).filter((t) => !!t);
	});
</script>

<Seo {lang} path="/generate" title={`${T('cta_make')} - Voimareitti`} description={T('gen_intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	{#if !acked}
		<section class="ack">
			<img class="ack-hero" src={`/img/hero/${heroScene}.webp`} alt="" />
			<h1>{T('ack_title')}</h1>
			<p class="disc-big">{T('disclaimer')}</p>
			<label class="check big">
				<input type="checkbox" bind:checked={ackChecked} />
				<span>{T('ack_check')}</span>
			</label>
			<button class="go" disabled={!ackChecked} onclick={openApp}>{T('ack_open')}</button>
		</section>
	{:else}
		<img class="pagebanner no-print" src="/img/banners/training.webp" alt="" />
		<h1>{L(guideTitleLbl, lang)}</h1>
		<p class="muted intro">{T('gen_intro')}</p>
		{#if !result || !showResult}
		<form class="form" onsubmit={(e) => { e.preventDefault(); run(); }}>
			{#if result}
				<button type="button" class="ghost backtoplan no-print" onclick={() => (showResult = true)}>{L(backToPlanLbl, lang)} &rarr;</button>
			{/if}
			<ProfilePanel {lang} collapsed={{ food: true }} />

			<section class="planopts">
				<h2 class="planopts-h">{L(weeklyWorkoutLbl, lang)}</h2>
				<div class="chips" role="group" aria-label={L(emphasisLbl, lang)}>
					<span class="chips-label">{L(emphasisLbl, lang)}</span>
					<div class="chiprow">
						{#each emphases as em (em.id)}
							<button type="button" class="chip" class:on={profile.emphasis === em.id} aria-pressed={profile.emphasis === em.id} onclick={() => (profile.emphasis = em.id)}>{L(em.name, lang)}</button>
						{/each}
					</div>
				</div>
			</section>

			<button class="go" type="submit">{T('generate')}</button>
			<p class="disc gen-disc">{T('disclaimer')}</p>
		</form>
		{:else}
		<div id="result">
			<div class="actions no-print">
				<button class="back" onclick={back}>&larr; {T('back')}</button>
				<button class="ghost" onclick={exportPdf}>{T('export_pdf')}</button>
				<button class="ghost" onclick={saveProgram}>{justSaved ? L(savedLbl, lang) : L(saveLbl, lang)}</button>
				<button class="ghost" onclick={regenerate}>{L(regenLbl, lang)}</button>
				<span class="pd">
					<span class="pd-label">{L(printDetailLbl, lang)}</span>
					<SegmentedControl
						options={[{ value: 'compact', label: L(compactLbl, lang) }, { value: 'full', label: L(fullLbl, lang) }]}
						value={printDensity}
						ariaLabel={L(printDetailLbl, lang)}
						onchange={(v) => (printDensity = v as 'compact' | 'full')}
					/>
				</span>
			</div>

			{#if used?.postpartum}
				<img class="result-scene no-print" src="/img/hero/hero-postpartum.webp" alt="" />
			{/if}
			<h2 class="result-title">{T('result_title')}</h2>

			<!-- Info boxes first, immediately after the title (mirrors the nutrition result) -->
			<div class="cardrow">
				<section class="statcard">
					<h2>{T('r_body')}</h2>
					<div class="stats">
						<div class="stat"><b>{result.body.bmi}</b><span>{T('m_bmi')}{#if !result.prenatal} . {T('bmi_' + result.body.bmiCategory)}{/if}</span></div>
						<div class="stat"><b>{result.energy.bmr}</b><span>{T('m_bmr')}</span></div>
						<div class="stat"><b>{result.energy.tdee}</b><span>{T('m_tdee')}</span></div>
						{#if result.body.waistRatio}
							<div class="stat"><b>{result.body.waistRatio}</b><span>{T('m_waist')}</span></div>
						{/if}
						{#if !result.prenatal}
							<div class="stat accent"><b>{result.body.weeklyChangeKg > 0 ? '+' : ''}{result.body.weeklyChangeKg} kg</b><span>{T('m_proj')} {T('per_week_short')}</span></div>
						{/if}
					</div>
					{#if result.prenatal}
						<p class="muted small">{L(pregnancyBodyNote, lang)}</p>
					{:else}
						<p class="muted small">{L(bmiNote, lang)}</p>
						{#if result.body.waistRatio}<p class="muted small">{L(waistNote, lang)}</p>{/if}
						{#if result.body.fastPace}<p class="tip">{L(paceNote, lang)}</p>{/if}
					{/if}
				</section>

				<section class="statcard targets-card">
					<h2>{T('energy_title')}</h2>
					<div class="stats">
						<div class="stat accent"><b>{result.energy.target}</b><span>{T('kcal')}</span></div>
						<div class="stat"><b>{result.energy.proteinLow}-{result.energy.proteinHigh} g</b><span>{T('protein')}{#if proteinPerKg} <span class="pk">({proteinPerKg})</span>{/if}</span></div>
						<div class="stat"><b>{result.energy.carbG} g</b><span>{T('carbs')}</span></div>
						<div class="stat"><b>{result.energy.fatG} g</b><span>{T('fat')}</span></div>
						<div class="stat"><b>{result.energy.fiberG} g</b><span>{T('fiber')}</span></div>
						<div class="stat"><b>{fmt1(result.energy.waterMl / 1000)} l</b><span>{T('water')}</span></div>
					</div>
					<p class="muted small">{T('feeler')}</p>
					{#if result.energy.nutritionAdjusted}
						<p class="tip">{T(result.energy.nutritionAdjusted === 'underweight' ? 'nutr_underweight' : 'nutr_minor')}</p>
					{/if}
				</section>
			</div>

			{#if result.mobilityOnly}<p class="tip">{T('mobility_only_banner')}</p>{/if}
			{#if result.easeLevel > 0}<p class="tip">{T('ease_banner')}</p>{/if}

			<!-- Settings that shaped this plan -->
			<section class="overview">
				<span class="pill">{trainingGoalName}</span>
				<span class="pill">{nutritionGoalName}</span>
				<span class="pill">{emphasisName}</span>
				<span class="pill">{splitName}</span>
				<span class="pill">{used?.days}&times;{used?.minutes} min</span>
				<span class="pill">{T('exp_' + (used?.experience ?? 'beginner'))}</span>
				<span class="pill">{used?.location === 'gym' ? T('where_gym') : T('where_home')}</span>
			</section>

			<!-- Warm-up -->
			{#if result.warmup.items.length}
				<section class="block">
					<h2>{T('r_warmup')}</h2>
						<p class="muted small">{T('warmup_each')}</p>
					<div class="cards">
						{#each result.warmup.items as it (it.uid)}
							{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: result.prenatal, sex: used?.sex })}
							<article class="card">
								<button class="remove no-print" title={T('delete_label')} aria-label={T('delete_label')} onclick={() => removeMobility('warmup', it.uid!)}>&times;</button>
								<button class="swap no-print" title={T('swap_title')} aria-label={T('swap_title')} onclick={() => swapMobility('warmup', it.uid!)}>
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
								</button>
								{#if exSrc}
									{@const figL = figLabelFor(it.exercise.id)}
									<div class="figcell">
										<img class="eximg" src={exSrc} alt="" loading="lazy" />
										{#if figL}<span class="figchip no-print">{figL}</span>{/if}
									</div>
								{/if}
								<div class="cbody">
									<b>{L(it.exercise.name, lang)}</b>
									<span class="muted small">{L(it.exercise.cue, lang)}</span>
								</div>
							</article>
						{/each}
					</div>
					<button class="addbtn no-print" type="button" onclick={() => addMobility('warmup')}>+ {T('add_more')}</button>
				</section>
			{/if}

			<!-- Birth preparation (pregnant users) -->
			{#if result.birthPrep && result.birthPrep.items.length}
				<section class="block">
					<h2>{T('r_birthprep')}</h2>
					<p class="tip">{T('birthprep_note')}</p>
					<div class="cards">
						{#each result.birthPrep.items as it (it.uid ?? it.exercise.id)}
							{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: result.prenatal, sex: used?.sex })}
							<article class="card">
								{#if exSrc}<img class="eximg" src={exSrc} alt="" loading="lazy" />{/if}
								<div class="cbody">
									<a class="exname" href={`/${lang}/exercises/${it.exercise.id}`}>{L(it.exercise.name, lang)}</a>
									<span class="muted small">{L(it.exercise.cue, lang)}</span>
									{#if it.exercise.safety}<span class="modtip small">{L(it.exercise.safety, lang)}</span>{/if}
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Training -->
			{#if !result.mobilityOnly}
			<section class="block">
				<h2>{T('r_training')}</h2>
				<p class="weekline">{used?.days} {T('days_word')} &middot; {splitName}</p>

				<div class="guide">
					<span><b>{T('effort')}:</b> {L(result.guidance.rir, lang)} <InfoTip {...g('effort')} /></span>
					<span><b>{T('tempo')}:</b> {result.guidance.tempo} <InfoTip {...g('tempo')} /></span>
					<span><b>{T('progression_label')}:</b> {L(result.guidance.progression, lang)} <InfoTip {...g('progression')} /></span>
					<span><b>{T('cardio_label')}:</b> {L(result.guidance.cardio, lang)} <InfoTip {...g('cardio')} /></span>
						<span class="terms">{T('sets')} <InfoTip {...g('sets')} /> &middot; {T('reps')} <InfoTip {...g('reps')} /> &middot; {T('rest')} <InfoTip {...g('rest')} /></span>
				</div>

				{#if liveVolume.length}
					<div class="vol">
						<h3>{T('r_volume')} <span class="muted small">({liveWeeklySets} {T('weekly_sets')})</span></h3>
						{#each liveVolume as v (v.muscle)}
							<div class="volrow">
								<span class="vlabel">{muscle(v.muscle, lang)}</span>
								<span class="vbar"><span class="vfill" style={`width:${(v.sets / volMax) * 100}%`}></span></span>
								<span class="vnum">{v.sets}</span>
							</div>
						{/each}
					</div>
				{/if}

				{#if result.pullGap}<p class="tip">{T('pull_gap')}</p>{/if}

				{#each result.sessions as s, i (s.titleKey + '-' + i)}
					<h3 class="sess" class:done={doneDays[s.day]}>
						<span>{T('day_label')} {s.day} &middot; {splitLabel(s.titleKey)} <span class="daymin">~{dayMinutes(s)} min</span></span>
						<label class="donechk no-print"><input type="checkbox" checked={!!doneDays[s.day]} onchange={(e) => (doneDays[s.day] = e.currentTarget.checked)} /> {T('done_label')}</label>
					</h3>
					<div class="cards">
						{#each s.items as it (it.uid)}
							{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: result.prenatal, sex: used?.sex })}
							<article class="card">
								<button class="remove no-print" title={T('delete_label')} aria-label={T('delete_label')} onclick={() => removeItem(i, it.uid!)}>&times;</button>
								<button class="swap no-print" title={T('swap_title')} aria-label={T('swap_title')} onclick={() => swap(i, it.uid!)}>
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
								</button>
								{#if exSrc}
									{@const figL = figLabelFor(it.exercise.id)}
									<div class="figcell">
										<img class="eximg" src={exSrc} alt="" loading="lazy" />
										{#if figL}<span class="figchip no-print">{figL}</span>{/if}
									</div>
								{/if}
								<div class="cbody">
									<a class="exname" href={`/${lang}/exercises/${it.exercise.id}`}>{L(it.exercise.name, lang)}</a>
									<span class="muscles">{it.exercise.primary.map((m) => muscle(m, lang)).join(' . ')}</span>
									<span class="dose">{it.sets} {T('sets')} . {it.reps} {T('reps')} . {T('rest')} {it.restSec} s</span>
									<span class="muted small">{L(it.exercise.cue, lang)}</span>
									{#if it.exercise.modTips}<span class="modtip small">{L(it.exercise.modTips, lang)}</span>{/if}
									{#if needsEasier && it.exercise.experienceMin !== 'beginner'}<span class="modtip small"><b>{T('ex_easier')}:</b> {L(it.exercise.easier, lang)}</span>{/if}
									<details class="exd">
										<summary>{T('ex_details')}</summary>
										<dl>
											<dt>{T('ex_purpose')}</dt><dd>{L(it.exercise.purpose, lang)}</dd>
											<dt>{T('ex_setup')}</dt><dd>{L(it.exercise.setup, lang)}</dd>
											<dt>{T('ex_mistakes')}</dt><dd>{L(it.exercise.mistakes, lang)}</dd>
											<dt>{T('ex_easier')}</dt><dd>{L(it.exercise.easier, lang)}</dd>
											<dt>{T('ex_harder')}</dt><dd>{L(it.exercise.harder, lang)}</dd>
											{#if it.exercise.safety}<dt class="warn">{T('ex_safety')}</dt><dd>{L(it.exercise.safety, lang)}</dd>{/if}
										</dl>
									</details>
								</div>
							</article>
						{/each}
					</div>
					{#if !s.items.length}
						<p class="tip no-print">{T('empty_session_hint')}</p>
					{/if}
					<!-- Always show the add control: an emptied session is refillable via sessionFillOptions
					     (2026-07 parity audit H3 - mirrors the nutrition empty slot's "+ Add food"). -->
					<button class="addbtn no-print" type="button" onclick={() => addToSession(i)}>+ {T('add_more')}</button>
				{/each}
			</section>
			{/if}

			<!-- Cool-down -->
			{#if result.cooldown.items.length}
				<section class="block">
					<h2>{T('r_cooldown')}</h2>
					<p class="muted small">{T('cooldown_note')}</p>
					<div class="cards">
						{#each result.cooldown.items as it (it.uid)}
							{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: result.prenatal, sex: used?.sex })}
							<article class="card">
								<button class="remove no-print" title={T('delete_label')} aria-label={T('delete_label')} onclick={() => removeMobility('cooldown', it.uid!)}>&times;</button>
								<button class="swap no-print" title={T('swap_title')} aria-label={T('swap_title')} onclick={() => swapMobility('cooldown', it.uid!)}>
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
								</button>
								{#if exSrc}
									{@const figL = figLabelFor(it.exercise.id)}
									<div class="figcell">
										<img class="eximg" src={exSrc} alt="" loading="lazy" />
										{#if figL}<span class="figchip no-print">{figL}</span>{/if}
									</div>
								{/if}
								<div class="cbody">
									<b>{L(it.exercise.name, lang)}</b>
									<span class="muted small">{L(it.exercise.cue, lang)}</span>
								</div>
							</article>
						{/each}
					</div>
					<button class="addbtn no-print" type="button" onclick={() => addMobility('cooldown')}>+ {T('add_more')}</button>
				</section>
			{/if}

			<p class="disc">{T('disclaimer')}</p>
		</div>
		{/if}
	{/if}
</main>

{#if result && used}
	<PrintGuide plan={result} profile={used} {owner} {lang} density={printDensity} />
{/if}

<style>
	.ack { max-width: 46rem; margin: 1.5rem auto; }
	.ack-hero { width: 100%; max-width: 640px; border-radius: var(--radius); margin-bottom: 1.25rem; }
	.pagebanner { display: block; width: 100%; height: auto; border-radius: var(--radius); margin: 1rem 0 0.25rem; }
	.result-scene { display: block; width: 100%; max-width: 720px; height: auto; border-radius: var(--radius); margin: 0.25rem 0 1rem; }
	.disc-big { max-width: 60ch; margin: 1rem 0 1.5rem; }
	.check.big { font-size: 1rem; align-items: flex-start; }
	.intro { margin: 0 0 1rem; }
	.form { margin-top: 0; display: flex; flex-direction: column; gap: 1.25rem; }
	.planopts { margin: 0; }
	.planopts-h { margin: 0 0 0.6rem; font-size: 1.15rem; font-weight: 700; }
	.chips { margin: 0; }
	.chips-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.4rem; }
	.chiprow { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.chip { min-height: 40px; padding: 0.4rem 0.9rem; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--text); font: inherit; font-size: 0.85rem; cursor: pointer; }
	.chip.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); font-weight: 600; }
	.gen-disc { margin-top: 0.25rem; }
	label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: var(--muted); }
	.check { flex-direction: row; align-items: center; gap: 0.5rem; color: var(--text); }
	.go { align-self: flex-start; background: var(--accent); color: #fff; border: 0; border-radius: 0.5rem; padding: 0.7rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
	.go:hover { filter: brightness(0.95); }
	.go:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Result view: even flex-column rhythm mirroring the Nutrition result. */
	#result { display: flex; flex-direction: column; gap: 1rem; }
	/* The page-level <h1> (the guide title) persists above the result, so the result title is an <h2>
	   for a valid single-h1 outline; sized to match the old h1 so the look is unchanged. */
	#result h2.result-title { margin: 0; font-size: 2em; }
	.actions { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin: 0; }
	.back { font: inherit; background: none; border: none; color: var(--accent); cursor: pointer; padding: 0; font-weight: 600; }
	.ghost { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.5rem 1rem; min-height: 44px; cursor: pointer; display: inline-flex; align-items: center; text-decoration: none; }
	.ghost:hover { border-color: var(--accent); }
	.backtoplan { align-self: flex-start; color: var(--accent); }
	.overview { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; }
	.pill { background: var(--accent-soft); color: var(--primary); border-radius: 2rem; padding: 0.2rem 0.7rem; font-size: 0.8rem; font-weight: 600; }
	.disc { font-size: 0.78rem; color: var(--muted); margin: 0.5rem 0 0; max-width: 60ch; }
	.block { margin: 0; padding-top: 1.25rem; border-top: 1px solid var(--line); }
	.guide { display: flex; flex-direction: column; gap: 0.3rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.7rem 0.9rem; font-size: 0.9rem; margin-bottom: 1rem; }
	.vol { margin: 0.5rem 0 1rem; }
	.volrow { display: grid; grid-template-columns: 7.5rem 1fr 2rem; align-items: center; gap: 0.5rem; margin: 0.2rem 0; font-size: 0.85rem; }
	.vbar { background: var(--accent-soft); border-radius: 1rem; height: 0.7rem; overflow: hidden; }
	.vfill { display: block; height: 100%; background: var(--accent); border-radius: 1rem; }
	.vnum { text-align: right; color: var(--muted); }
	.weekline { color: var(--muted); margin: 0 0 0.5rem; font-size: 0.9rem; }
	.sess { margin-top: 1.3rem; padding-bottom: 0.3rem; border-bottom: 2px solid var(--accent-soft); }
	.daymin { font-weight: 400; font-size: 0.8rem; color: var(--muted); }
	.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; margin: 0.6rem 0 1rem; }
	.card { position: relative; display: flex; gap: 0.7rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.7rem; }
	.swap { position: absolute; top: 0.4rem; right: 0.4rem; display: flex; align-items: center; justify-content: center; width: 1.7rem; height: 1.7rem; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); color: var(--accent); cursor: pointer; padding: 0; }
	.swap:hover { background: var(--accent-soft); border-color: var(--accent); }
	.remove { position: absolute; top: 0.4rem; right: 2.3rem; display: flex; align-items: center; justify-content: center; width: 1.7rem; height: 1.7rem; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); color: var(--muted); cursor: pointer; padding: 0; font-size: 1.15rem; line-height: 1; }
	.remove:hover { background: #fdecec; border-color: #d98b8b; color: #9a4a13; }
	.exname { font-weight: 700; color: var(--text); text-decoration: none; }
	/* Reserve the action-icon column ONLY on cards that actually have the swap/remove buttons, so
	   birth-prep titles (no icons) get the full width and warm-up titles never run under the icons. */
	.card:has(.swap) .cbody { padding-right: 3.4rem; }
	.exname:hover { color: var(--primary); text-decoration: underline; }
	.eximg { width: 72px; height: 96px; object-fit: contain; background: var(--accent-soft); border-radius: 0.4rem; flex: none; display: block; }
	.figcell { position: relative; flex: none; }
	.figchip { position: absolute; left: 0.25rem; bottom: 0.25rem; background: rgba(40,74,99,0.82); color: #fff; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.02em; padding: 0.05rem 0.35rem; border-radius: 1rem; line-height: 1.4; }
	.cbody { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; overflow-wrap: anywhere; }
	.muscles { font-size: 0.78rem; color: var(--accent); }
	.modtip { font-size: 0.8rem; color: var(--accent); }
	.dose { font-size: 0.85rem; }
	.small { font-size: 0.8rem; }
	.exd { margin-top: 0.35rem; }
	.exd summary { cursor: pointer; font-size: 0.8rem; color: var(--primary); }
	.exd dl { margin: 0.4rem 0 0; font-size: 0.82rem; }
	.exd dt { font-weight: 600; margin-top: 0.35rem; }
	.exd dt.warn { color: #9a4a13; }
	.exd dd { margin: 0 0 0.1rem; color: var(--muted); }
	.tip { background: var(--accent-soft); border-radius: 0.4rem; padding: 0.5rem 0.8rem; font-size: 0.85rem; }
	h3 { margin-top: 0.6rem; }

	/* Distinct stat cards for body metrics + daily targets */
	.cardrow { display: flex; flex-direction: column; gap: 1rem; margin: 0; }
	.statcard { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.8rem 1rem; }
	.statcard h2 { margin: 0 0 0.6rem; font-size: 1.05rem; }
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.6rem; }
	.stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); padding: 0.6rem 0.4rem; text-align: center; }
	.stat b { font-size: 1.15rem; color: var(--text); line-height: 1; }
	.stat span { font-size: 0.75rem; color: var(--muted); line-height: 1.18; }
	.pk { display: block; font-size: 0.62rem; color: var(--accent); font-weight: 600; }
	.stat.accent b { color: var(--primary); }
	.pd { display: inline-flex; align-items: center; gap: 0.4rem; }
	.pd-label { font-size: 0.78rem; color: var(--muted); font-weight: 600; }
	.addbtn { margin-top: 0.5rem; background: none; border: 1px dashed var(--accent); color: var(--accent); border-radius: 0.5rem; padding: 0.4rem 0.9rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
	.addbtn:hover { background: var(--accent-soft); }
	.donechk { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 400; color: var(--muted); }
	.sess.done span { color: var(--muted); text-decoration: line-through; }
	.terms { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: var(--muted); }

	/* Visible keyboard focus on every interactive control (parity with the form inputs). */
	.go:focus-visible, .ghost:focus-visible, .back:focus-visible, .addbtn:focus-visible,
	.swap:focus-visible, .remove:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	/* Slightly larger small labels for legibility on phones. */
	.figchip { font-size: 0.68rem; }
	.stat span { font-size: 0.76rem; }

	/* Mobile-first: the primary action is full-width and the card swap/remove buttons reach 44px. */
	@media (max-width: 760px) {
		.go { width: 100%; align-self: stretch; text-align: center; }
		.swap { width: 2.75rem; height: 2.75rem; top: 0.3rem; right: 0.3rem; }
		.remove { width: 2.75rem; height: 2.75rem; top: 0.3rem; right: 3.25rem; font-size: 1.3rem; }
		.card:has(.swap) .cbody { padding-right: 6.2rem; }
	}

	/* Print: hide the entire web UI; PrintGuide renders the A4 handout instead. */
	@media print {
		main.container { display: none !important; }
		:global(body) { background: #fff; }
	}
</style>
