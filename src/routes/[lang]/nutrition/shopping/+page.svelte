<script lang="ts">
	// Interactive shopping list (planning section 13). Full-screen, mobile-first, grouped by aisle, tap to
	// check off. Reads the plan the Nutrition planner stored (voimareitti.plan) and rebuilds the rollup;
	// check-off state persists per plan under voimareitti.shop.<planHash> (keeps the last 3 plan hashes).
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import FoodImage from '$lib/FoodImage.svelte';
	import MealPrint from '$lib/MealPrint.svelte';
	import { L, type Loc } from '$lib/content/data';
	import { getIngredient } from '$lib/content/ingredients';
	import { ingredientImage } from '$lib/recipe-images';
	import type { WeekPlan } from '$lib/engine/meal-planner';
	import { shoppingList, formatQuantity, shopUnit, type ShoppingList, type Aisle } from '$lib/shopping';
	import { householdBuyAmount, UNIT_LABELS } from '$lib/nutrition/household-units';
	import { ingredientSwapOptions } from '$lib/ingredient-swap';
	import { dietAnnotations } from '$lib/recipe-filters';
	import { profile } from '$lib/profile.svelte';
	import { owner } from '$lib/owner.svelte';
	import { currentPlan, planSettingsSig } from '$lib/plan.svelte';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);

	let planForPrint = $state<WeekPlan | null>(null);
	let subs = $state<Record<string, string>>({});
	let subIdx = $state<Record<string, number>>({}); // per-line swap cycle index
	const list = $derived<ShoppingList | null>(planForPrint ? shoppingList(planForPrint, { substitutions: subs }) : null);
	let checked = $state<Record<string, boolean>>({});
	let loaded = $state(false);

	// Per-person / whole-household toggle (planning/56). Default whole-household: a shopping list is what you
	// BUY, and you buy for everyone. Per person divides each quantity by the household scale (your share).
	let shopView = $state<'person' | 'household'>('household');
	const hhActive = $derived(profile.household.length > 0);
	const hhScale = $derived(planForPrint?.meta.householdScale ?? 1);
	const shopDiv = $derived(hhActive && shopView === 'person' ? hhScale : 1);

	const lbl: Record<string, Loc> = {
		title: { en: 'Shopping list', fi: 'Ostoslista', hu: 'Bevásárlólista', sv: 'Inköpslista' },
		none: { en: 'No plan yet. Generate a weekly plan first, then open the shopping list.', fi: 'Ei suunnitelmaa. Luo ensin viikon ateriasuunnitelma ja avaa sitten ostoslista.', hu: 'Még nincs terv. Előbb készíts heti étrendet, majd nyisd meg a listát.', sv: 'Ingen plan än. Skapa en veckoplan först och öppna sedan listan.' },
		back: { en: 'Back to planner', fi: 'Takaisin suunnitelmaan', hu: 'Vissza a tervezőhöz', sv: 'Tillbaka till planeraren' },
		reset: { en: 'Uncheck all', fi: 'Poista valinnat', hu: 'Összes törlése', sv: 'Avmarkera alla' },
		got: { en: 'Got it', fi: 'Hankittu', hu: 'Megvan', sv: 'Klart' },
		pantry: { en: 'pantry', fi: 'ruokakomero', hu: 'kamra', sv: 'skafferi' },
		print: { en: 'Print', fi: 'Tulosta', hu: 'Nyomtatás', sv: 'Skriv ut' },
		swap: { en: 'Swap across the week', fi: 'Vaihda koko viikolle', hu: 'Csere az egész hétre', sv: 'Byt för hela veckan' },
		householdNote: {
			en: 'Quantities are scaled for your whole household ({n} people).',
			fi: 'Määrät on skaalattu koko ruokakunnalle ({n} henkilöä).',
			hu: 'A mennyiségek az egész háztartásra ({n} fő) vannak méretezve.',
			sv: 'Mängderna är skalade för hela hushållet ({n} personer).'
		},
		householdNotePerson: {
			en: 'Quantities shown per person (your share). You still buy for the whole household ({n} people).',
			fi: 'Määrät näytetään per henkilö (oma osuutesi). Ostat silti koko ruokakunnalle ({n} henkilöä).',
			hu: 'A mennyiségek személyenként (a te részed). Továbbra is az egész háztartásra ({n} fő) vásárolsz.',
			sv: 'Mängderna visas per person (din andel). Du handlar fortfarande för hela hushållet ({n} personer).'
		},
		hhView: { en: 'Show amounts', fi: 'Näytä määrät', hu: 'Mennyiségek', sv: 'Visa mängder' },
		hhPerson: { en: 'Per person', fi: 'Per henkilö', hu: 'Személyenként', sv: 'Per person' },
		hhWhole: { en: 'Whole household', fi: 'Koko ruokakunta', hu: 'Egész háztartás', sv: 'Hela hushållet' }
	};
	const aisleName: Record<Aisle, Loc> = {
		produce: { en: 'Produce', fi: 'Hedelmät ja vihannekset', hu: 'Zöldség-gyümölcs', sv: 'Frukt och grönt' },
		'meat-fish-protein': { en: 'Meat, fish & protein', fi: 'Liha, kala ja proteiini', hu: 'Hús, hal, fehérje', sv: 'Kött, fisk och protein' },
		'dairy-eggs': { en: 'Dairy & eggs', fi: 'Maito ja munat', hu: 'Tejtermék és tojás', sv: 'Mejeri och ägg' },
		'dry-goods-pantry': { en: 'Dry goods & pantry', fi: 'Kuivatuotteet', hu: 'Szárazáru', sv: 'Torrvaror' },
		frozen: { en: 'Frozen', fi: 'Pakasteet', hu: 'Fagyasztott', sv: 'Fryst' },
		condiments: { en: 'Condiments & oils', fi: 'Mausteet ja öljyt', hu: 'Fűszerek és olajok', sv: 'Tillbehör och oljor' },
		other: { en: 'Other', fi: 'Muut', hu: 'Egyéb', sv: 'Övrigt' }
	};

	const ingName = (id: string) => {
		const d = getIngredient(id);
		return d ? L(d.name, lang) : id;
	};
	const ingRole = (id: string) => getIngredient(id)?.role;
	// Theme 9: "(gluten free)" / "(lactose-free)" annotation under the active diet filters.
	const ingAnn = (id: string) => {
		const d = getIngredient(id);
		if (!d) return '';
		const a = dietAnnotations(d, profile.dietaryFilters).map((x) => L(x, lang));
		return a.length ? `(${a.join(', ')})` : '';
	};
	const qty = (id: string, grams: number) => {
		const ing = getIngredient(id);
		const u = ing ? shopUnit(ing, grams) : { value: grams, unit: 'g' as const };
		const g = formatQuantity(u.value, u.unit, lang);
		// A3: show whole household units where sensible ("6 pc (550 g)"); grams stay for everything else.
		const h = householdBuyAmount(id, grams);
		return h ? `${h.count} ${L(UNIT_LABELS[h.unit] ?? { en: h.unit }, lang)} (${g})` : g;
	};

	const total = $derived(list ? list.lines.length : 0);
	const doneCount = $derived(Object.values(checked).filter(Boolean).length);

	function storeKey(h: string) { return `voimareitti.shop.${h}`; }

	function persist() {
		if (!browser || !list) return;
		try {
			localStorage.setItem(storeKey(list.planHash), JSON.stringify(checked));
			// keep only the last 3 shop states
			const keys = Object.keys(localStorage).filter((k) => k.startsWith('voimareitti.shop.'));
			if (keys.length > 3) {
				keys.slice(0, keys.length - 3).forEach((k) => localStorage.removeItem(k));
			}
		} catch { /* ignore */ }
	}

	function toggle(id: string) {
		checked = { ...checked, [id]: !checked[id] };
		persist();
	}
	function resetChecks() {
		checked = {};
		persist();
	}
	function swapLine(lineId: string) {
		if (!list) return;
		const others = list.lines.map((l) => l.ingredientId).filter((x) => x !== lineId);
		// profile passed so every offered swap respects diet/allergen/FODMAP settings (2026-07 audit C1)
		const opts = ingredientSwapOptions(lineId, others, profile.dislikedIngredientIds, profile);
		if (!opts.length) return;
		// Cycle through alternatives on repeated clicks (no immediate repeat); avoided foods are excluded.
		const next = (subIdx[lineId] ?? -1) + 1;
		subIdx = { ...subIdx, [lineId]: next };
		subs = { ...subs, [lineId]: opts[next % opts.length].id }; // swaps this ingredient across the whole week
	}
	function canSwapLine(lineId: string): boolean {
		if (!list) return false;
		return ingredientSwapOptions(lineId, list.lines.map((l) => l.ingredientId).filter((x) => x !== lineId), profile.dislikedIngredientIds, profile).length > 0;
	}

	onMount(() => {
		if (!browser) return;
		try {
			// Read the in-memory working plan (planning/43); only use it if it matches the current settings.
			if (currentPlan.week && currentPlan.sig === planSettingsSig(profile)) {
				const plan = currentPlan.week;
				planForPrint = plan;
				const saved = localStorage.getItem(storeKey(plan.meta.planHash));
				if (saved) checked = JSON.parse(saved);
			}
		} catch { /* ignore */ }
		loaded = true;
	});
</script>

<Seo {lang} path="/nutrition/shopping" title={`${L(lbl.title, lang)} - Voimareitti`} description={L(lbl.title, lang)} />
<SiteHeader {lang} />

<main id="main-content" class="container">
	<a class="back no-print" href={`/${lang}/nutrition`}>&larr; {L(lbl.back, lang)}</a>
	<h1>{L(lbl.title, lang)}</h1>
	{#if hhActive}
		<div class="shoptoggle no-print">
			<span class="tlabel">{L(lbl.hhView, lang)}:</span>
			<button type="button" class="chip" class:on={shopView === 'person'} aria-pressed={shopView === 'person'} onclick={() => (shopView = 'person')}>{L(lbl.hhPerson, lang)}</button>
			<button type="button" class="chip" class:on={shopView === 'household'} aria-pressed={shopView === 'household'} onclick={() => (shopView = 'household')}>{L(lbl.hhWhole, lang)}</button>
		</div>
		<p class="hh-note">{L(shopView === 'person' ? lbl.householdNotePerson : lbl.householdNote, lang).replace('{n}', String(profile.household.length + 1))}</p>
	{/if}

	{#if loaded && !list}
		<p class="muted">{L(lbl.none, lang)}</p>
	{:else if list}
		<div class="progress no-print">
			<span>{doneCount} / {total}</span>
			<span class="pgbtns">
				<button type="button" class="reset" onclick={() => window.print()}>{L(lbl.print, lang)}</button>
				<button type="button" class="reset" onclick={resetChecks}>{L(lbl.reset, lang)}</button>
			</span>
		</div>

		{#each list.byAisle as group (group.aisle)}
			<section class="aisle">
				<h2>{L(aisleName[group.aisle], lang)}</h2>
				<ul>
					{#each group.lines as line (line.ingredientId)}
						<li class:done={checked[line.ingredientId]} class:pantry={line.pantry}>
							<button type="button" class="row" aria-pressed={!!checked[line.ingredientId]} onclick={() => toggle(line.ingredientId)}>
								<span class="box" aria-hidden="true">{checked[line.ingredientId] ? '✓' : ''}</span>
								<FoodImage src={ingredientImage(line.ingredientId, ingRole(line.ingredientId))} alt="" klass="iimg" />
								<span class="nm">{ingName(line.ingredientId)}{#if ingAnn(line.ingredientId)} <span class="tag gf">{ingAnn(line.ingredientId)}</span>{/if}{#if line.pantry} <span class="tag">{L(lbl.pantry, lang)}</span>{/if}</span>
								<span class="qt">{qty(line.ingredientId, line.grams / shopDiv)}</span>
							</button>
							{#if canSwapLine(line.ingredientId)}
								<button type="button" class="lineswap no-print" title={L(lbl.swap, lang)} aria-label={L(lbl.swap, lang)} onclick={() => swapLine(line.ingredientId)}>
									<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</main>

<MealPrint mode="shopping" {lang} week={planForPrint} {profile} {owner} />

<style>
	@media print {
		main.container { display: none !important; }
		:global(body) { background: #fff; }
	}
	.pgbtns { display: inline-flex; gap: 0.5rem; }
	.back { display: inline-block; margin-top: 1rem; color: var(--accent); text-decoration: none; font-size: 0.85rem; }
	h1 { margin: 0.5rem 0 0.8rem; }
	.hh-note { margin: -0.4rem 0 0.8rem; font-size: 0.85rem; color: var(--muted); }
	.shoptoggle { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin: 0.2rem 0 0.5rem; }
	.shoptoggle .tlabel { font-size: 0.85rem; color: var(--muted); }
	.shoptoggle .chip { font: inherit; font-size: 0.82rem; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 0.3rem 0.8rem; min-height: 36px; cursor: pointer; }
	.shoptoggle .chip.on { background: var(--accent); color: #fff; border-color: var(--accent); }
	.muted { color: var(--muted); }
	.progress { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; background: var(--bg); padding: 0.5rem 0; font-weight: 700; }
	.reset { font: inherit; font-size: 0.82rem; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 0.35rem 0.8rem; min-height: 40px; cursor: pointer; }
	.aisle { margin: 1rem 0; }
	h2 { font-size: 1rem; margin: 0 0 0.4rem; color: var(--primary); }
	ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	li { display: flex; align-items: center; gap: 0.4rem; }
	.row { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.7rem; min-height: 52px; padding: 0.4rem 0.6rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); font: inherit; color: var(--text); text-align: left; cursor: pointer; }
	/* Design Parity Contract: square swap icon in the shared spec (accent color, 0.4rem radius) -
	   the old 999px bubble was an explicit contract violation (2026-07 parity audit H1). Kept at the
	   list's 40px touch size (>= the contract's mobile 2.4rem). */
	.lineswap { flex: none; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); color: var(--accent); cursor: pointer; }
	.lineswap:hover { border-color: var(--accent); background: var(--accent-soft); }
	.row:hover { border-color: var(--accent); }
	.box { width: 26px; height: 26px; flex: none; border: 2px solid var(--accent); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: var(--accent); font-weight: 700; }
	.row :global(.iimg) { width: 40px; height: 40px; object-fit: contain; border-radius: 0.4rem; flex: none; background: transparent; }
	.nm { flex: 1; min-width: 0; font-weight: 500; }
	.qt { color: var(--accent); font-weight: 700; font-size: 0.9rem; }
	.tag { font-size: 0.68rem; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 0 0.4rem; }
	.tag.gf { color: var(--accent); border-color: var(--accent); }
	li.pantry .row { opacity: 0.72; }
	li.done .row { opacity: 0.5; }
	li.done .nm { text-decoration: line-through; }
</style>
