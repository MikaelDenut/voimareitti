<script lang="ts">
	import { onMount } from 'svelte';
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import FoodImage from '$lib/FoodImage.svelte';
	import { L, type Loc } from '$lib/content/data';
	import { recipes, type Recipe } from '$lib/content/recipes';
	import { getIngredient } from '$lib/content/ingredients';
	import { recipeImage } from '$lib/recipe-images';
	import {
		matchesGoal, matchesDiet, matchesFodmap, matchesNutrient, isAlcoholFree, isContradiction, courseLabel,
		type NutrientChip, type GoalBucket
	} from '$lib/recipe-filters';
	import { profile } from '$lib/profile.svelte';
	import { currentPlan, planSettingsSig } from '$lib/plan.svelte';
	import { goto } from '$app/navigation';
	import { estimateEnergy } from '$lib/engine/engine';
	import { saved, deleteMeal, type SavedPlan } from '$lib/saved.svelte';
	import { isValidWeekPlanPayload } from '$lib/saved-core';
	import type { WeekPlan } from '$lib/engine/meal-planner';
	import ProfilePanel from '$lib/ProfilePanel.svelte';
	import MealSnapshot from '$lib/MealSnapshot.svelte';
	import type { DietaryFilter } from '$lib/profile-core';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);
	const nf = (n: number) => new Intl.NumberFormat(lang).format(Math.round(n));

	// Filters (diet + FODMAP prefilled from the shared profile).
	let search = $state('');
	let course = $state('all');
	let goal = $state<'all' | GoalBucket>('all');
	let fodmap = $state(profile.fodmap);
	let alcoholFree = $state(profile.alcoholFree);
	let selectedDiet = $state<DietaryFilter[]>([...profile.dietaryFilters]);
	let selectedNutrients = $state<NutrientChip[]>([]);
	let sort = $state<'name' | 'kcal' | 'protein' | 'fibre' | 'carbs'>('name');
	let macroMode = $state<'serving' | '100g'>('serving');
	// Theme 6.2 ingredient include-filter + 6.3 macro-target filters.
	let selectedIngredients = $state<string[]>([]);
	let ingredientQuery = $state('');
	let maxKcal = $state<number | null>(null);
	let minProtein = $state<number | null>(null);
	let maxCarbs = $state<number | null>(null);
	// Theme 3: Browse / Saved tab.
	let tab = $state<'browse' | 'saved'>('browse');
	// Saved-plan snapshot: opening a saved plan shows a read-only result-style view in-page (NOT a
	// navigation to the shopping list). Back returns here to the Saved tab.
	let viewing = $state<SavedPlan<WeekPlan> | null>(null);
	// Guard the payload shape before rendering (2026-07 audit M3): an old-schema or corrupted saved plan
	// used to throw inside MealSnapshot and take down the whole page until localStorage was cleared.
	function openMeal(s: SavedPlan<WeekPlan>) { if (isValidWeekPlanPayload(s.payload)) viewing = s; }
	function useMeal() {
		if (!viewing) return;
		// Load the saved plan into the in-memory working store and navigate WITHOUT a full reload (so the
		// store survives). The signature is set to the current profile so the planner/shopping accept it.
		currentPlan.week = viewing.payload;
		currentPlan.sig = planSettingsSig(profile);
		goto(`/${lang}/nutrition`);
	}

	const lbl: Record<string, Loc> = {
		title: { en: 'Recipe library', fi: 'Reseptikirjasto', hu: 'Recepttár', sv: 'Receptbibliotek' },
		intro: { en: 'Browse recipes by course, goal, diet, and nutrient.', fi: 'Selaa reseptejä ruokalajin, tavoitteen, ruokavalion ja ravintoaineiden mukaan.', hu: 'Böngéssz receptek között fogás, cél, étrend és tápanyag szerint.', sv: 'Bläddra bland recept efter rätt, mål, kost och näringsämne.' },
		search: { en: 'Search recipe or ingredient', fi: 'Hae reseptiä tai raaka-ainetta', hu: 'Keress receptet vagy hozzávalót', sv: 'Sök recept eller ingrediens' },
		all: { en: 'All', fi: 'Kaikki', hu: 'Mind', sv: 'Alla' },
		course: { en: 'Course', fi: 'Ruokalaji', hu: 'Fogás', sv: 'Rätt' },
		goal: { en: 'Goal', fi: 'Tavoite', hu: 'Cél', sv: 'Mål' },
		lose: { en: 'Lose fat', fi: 'Pudota rasvaa', hu: 'Fogyás', sv: 'Tappa fett' },
		maintain: { en: 'Maintain', fi: 'Ylläpidä', hu: 'Fenntartás', sv: 'Bibehåll' },
		gain: { en: 'Gain muscle', fi: 'Kasvata lihasta', hu: 'Izomépítés', sv: 'Bygg muskler' },
		fodmap: { en: 'FODMAP', fi: 'FODMAP', hu: 'FODMAP', sv: 'FODMAP' },
		fodmapOff: { en: 'Off', fi: 'Pois', hu: 'Ki', sv: 'Av' },
		fodmapGentle: { en: 'Gentle', fi: 'Kevyt', hu: 'Enyhe', sv: 'Mild' },
		fodmapStrict: { en: 'Strict', fi: 'Tiukka', hu: 'Szigorú', sv: 'Strikt' },
		diet: { en: 'Diet', fi: 'Ruokavalio', hu: 'Étrend', sv: 'Kost' },
		nutrients: { en: 'Nutrient', fi: 'Ravintoaine', hu: 'Tápanyag', sv: 'Näring' },
		alcoholFree: { en: 'Alcohol-free', fi: 'Alkoholiton', hu: 'Alkoholmentes', sv: 'Alkoholfri' },
		sort: { en: 'Sort', fi: 'Järjestä', hu: 'Rendezés', sv: 'Sortera' },
		sortName: { en: 'Name', fi: 'Nimi', hu: 'Név', sv: 'Namn' },
		sortKcal: { en: 'Calories (low to high)', fi: 'Kalorit (vähiten ensin)', hu: 'Kalória (növekvő)', sv: 'Kalorier (lågt till högt)' },
		sortProtein: { en: 'Protein (high to low)', fi: 'Proteiini (eniten ensin)', hu: 'Fehérje (csökkenő)', sv: 'Protein (högt till lågt)' },
		sortFibre: { en: 'Fibre (high to low)', fi: 'Kuitu (eniten ensin)', hu: 'Rost (csökkenő)', sv: 'Fiber (högt till lågt)' },
		sortCarbs: { en: 'Carbs (high to low)', fi: 'Hiilihydraatit (eniten ensin)', hu: 'Szénhidrát (csökkenő)', sv: 'Kolhydrater (högt till lågt)' },
		perServing: { en: 'Per serving', fi: 'Per annos', hu: 'Adagonként', sv: 'Per portion' },
		per100g: { en: 'Per 100 g', fi: 'Per 100 g', hu: '100 g-onként', sv: 'Per 100 g' },
		results: { en: 'results', fi: 'tulosta', hu: 'találat', sv: 'resultat' },
		reset: { en: 'Reset', fi: 'Tyhjennä', hu: 'Törlés', sv: 'Rensa' },
		empty: { en: 'No recipes match these filters.', fi: 'Mikään resepti ei vastaa näitä suodattimia.', hu: 'Egy recept sem felel meg ezeknek a szűrőknek.', sv: 'Inga recept matchar dessa filter.' },
		relaxNote: { en: 'No matches with the nutrient filters. Try removing one.', fi: 'Ei osumia ravintoainesuodattimilla. Poista yksi.', hu: 'Nincs találat a tápanyagszűrőkkel. Vegyél el egyet.', sv: 'Inga träffar med näringsfiltren. Ta bort ett.' },
		contradiction: { en: 'A muscle-gain goal with a low-calorie filter rarely matches.', fi: 'Lihaskasvutavoite ja vähäkalorinen suodatin sopivat harvoin yhteen.', hu: 'Az izomépítési cél és az alacsony kalóriás szűrő ritkán fér össze.', sv: 'Ett muskelmål med ett lågkalorifilter matchar sällan.' },
		kcal: { en: 'kcal', fi: 'kcal', hu: 'kcal', sv: 'kcal' },
		protein: { en: 'protein', fi: 'proteiini', hu: 'fehérje', sv: 'protein' },
		quick: { en: 'Quick', fi: 'Nopea', hu: 'Gyors', sv: 'Snabb' },
		min: { en: 'min', fi: 'min', hu: 'perc', sv: 'min' },
		ingFilter: { en: 'Must contain', fi: 'Sisältää', hu: 'Tartalmazza', sv: 'Måste innehålla' },
		ingSearch: { en: 'Search an ingredient to add', fi: 'Hae lisättävä raaka-aine', hu: 'Keress hozzávalót', sv: 'Sök en ingrediens' },
		macroFilter: { en: 'Macros per serving', fi: 'Makrot per annos', hu: 'Makrók adagonként', sv: 'Makron per portion' },
		maxKcal: { en: 'Max kcal', fi: 'Enint. kcal', hu: 'Max kcal', sv: 'Max kcal' },
		minProtein: { en: 'Min protein (g)', fi: 'Väh. proteiini (g)', hu: 'Min. fehérje (g)', sv: 'Minst protein (g)' },
		maxCarbs: { en: 'Max carbs (g)', fi: 'Enint. hiilihydraatit (g)', hu: 'Max szénhidrát (g)', sv: 'Max kolhydrater (g)' },
		fitTargets: { en: 'Use my targets', fi: 'Käytä tavoitteitani', hu: 'Saját célok', sv: 'Använd mina mål' },
		clearMacros: { en: 'Clear', fi: 'Tyhjennä', hu: 'Törlés', sv: 'Rensa' },
		tabBrowse: { en: 'Browse', fi: 'Selaa', hu: 'Böngészés', sv: 'Bläddra' },
		tabSaved: { en: 'Saved', fi: 'Tallennetut', hu: 'Mentett', sv: 'Sparade' },
		open: { en: 'Open', fi: 'Avaa', hu: 'Megnyitás', sv: 'Öppna' },
		delete: { en: 'Delete', fi: 'Poista', hu: 'Törlés', sv: 'Radera' },
		noSaved: { en: 'No saved meal plans yet. Generate a weekly plan and tap "Save plan".', fi: 'Ei tallennettuja ateriasuunnitelmia. Luo viikkosuunnitelma ja paina "Tallenna suunnitelma".', hu: 'Még nincs mentett étrend. Készíts heti tervet, és nyomd meg a "Terv mentése" gombot.', sv: 'Inga sparade matplaner än. Skapa en veckoplan och tryck "Spara plan".' }
	};
	const courseName = (c: string) => courseLabel(c, lang);

	const dietLbl: Record<DietaryFilter, Loc> = {
		vegetarian: { en: 'Vegetarian', fi: 'Kasvis', hu: 'Vegetáriánus', sv: 'Vegetarisk' },
		vegan: { en: 'Vegan', fi: 'Vegaani', hu: 'Vegán', sv: 'Vegansk' },
		noRedMeat: { en: 'No red meat', fi: 'Ei punaista lihaa', hu: 'Vörös hús nélkül', sv: 'Inget rött kött' },
		noPork: { en: 'No pork', fi: 'Ei sianlihaa', hu: 'Sertés nélkül', sv: 'Inget fläsk' },
		noFish: { en: 'No fish', fi: 'Ei kalaa', hu: 'Hal nélkül', sv: 'Ingen fisk' },
		glutenFree: { en: 'Gluten-free', fi: 'Gluteeniton', hu: 'Gluténmentes', sv: 'Glutenfri' },
		lactoseFree: { en: 'Lactose-free', fi: 'Laktoositon', hu: 'Laktózmentes', sv: 'Laktosfri' },
		dairyFree: { en: 'Dairy-free', fi: 'Maidoton', hu: 'Tejmentes', sv: 'Mjölkfri' },
		nutFree: { en: 'Nut-free', fi: 'Pähkinätön', hu: 'Dióféle nélkül', sv: 'Nötfri' },
		soyFree: { en: 'Soy-free', fi: 'Soijaton', hu: 'Szójamentes', sv: 'Sojafri' }
	};
	const dietOrder: DietaryFilter[] = ['vegetarian', 'vegan', 'noRedMeat', 'noPork', 'noFish', 'glutenFree', 'lactoseFree', 'dairyFree', 'nutFree', 'soyFree'];
	const nutrientLbl: Record<NutrientChip, Loc> = {
		'high-protein': { en: 'High protein', fi: 'Runsasproteiininen', hu: 'Magas fehérje', sv: 'Proteinrik' },
		'high-fibre': { en: 'High fibre', fi: 'Runsaskuituinen', hu: 'Magas rost', sv: 'Fiberrik' },
		'low-cal': { en: 'Low calorie', fi: 'Vähäkalorinen', hu: 'Alacsony kalória', sv: 'Lågkalori' },
		'low-carb': { en: 'Low carb', fi: 'Vähähiilihydraattinen', hu: 'Alacsony szénhidrát', sv: 'Lågkolhydrat' }
	};
	const nutrientOrder: NutrientChip[] = ['high-protein', 'high-fibre', 'low-cal', 'low-carb'];

	// Component / sub-recipes (e.g. bechamel) are building blocks, not browsable meals - keep them out of the
	// course filter chips and the recipe grid (they surface only as a click-to-view ingredient popup).
	const browsable = recipes.filter((r) => !r.component);
	const courseOptions = [...new Set(browsable.flatMap((r) => r.course))].sort();

	// Theme 6.1: multi-language searchable text per recipe. Indexes ALL FOUR languages of the recipe name
	// + every ingredient name (4 langs) + aliases, so a query in any language matches whatever the UI
	// language is. Language-independent, so built once (not per-locale).
	const LANGS = ['en', 'fi', 'hu', 'sv'] as const;
	const searchIndex = (() => {
		const m = new Map<string, string>();
		for (const r of recipes) {
			const parts: string[] = LANGS.map((l) => r.name[l]);
			for (const ing of r.ingredients) {
				const d = getIngredient(ing.ingredientId);
				if (d) {
					for (const l of LANGS) parts.push(d.name[l]);
					if (d.aliases) parts.push(d.aliases.join(' '));
				}
			}
			m.set(r.id, parts.join(' ').toLowerCase());
		}
		return m;
	})();

	// Theme 6.2: ingredient include-filter. Candidate canonical ingredients that actually appear in a
	// recipe, with a 4-language searchable blob for the picker's own little search box.
	const ingredientCandidates = (() => {
		const ids = new Set<string>();
		for (const r of recipes) for (const ing of r.ingredients) ids.add(ing.ingredientId);
		return [...ids]
			.map((id) => getIngredient(id))
			.filter((d): d is NonNullable<typeof d> => !!d)
			.map((d) => ({ id: d.id, blob: LANGS.map((l) => d.name[l]).join(' ').toLowerCase() }));
	})();
	const ingredientPicks = $derived.by(() => {
		const q = ingredientQuery.trim().toLowerCase();
		const list = q ? ingredientCandidates.filter((c) => c.blob.includes(q)) : ingredientCandidates;
		return [...list].sort((a, b) => ingName(a.id).localeCompare(ingName(b.id), lang)).slice(0, q ? 40 : 0);
	});
	const ingName = (id: string) => { const d = getIngredient(id); return d ? L(d.name, lang) : id; };

	// Theme 6.3: per-serving macro-target filters, prefilled from the profile's effective per-meal targets.
	function fitMyTargets() {
		const e = estimateEnergy(profile);
		const meals = Math.max(1, profile.mealsPerDay || 3);
		maxKcal = Math.round(e.target / meals / 10) * 10;
		minProtein = Math.round(e.proteinBand[0] / meals);
		maxCarbs = e.carbCeilingG != null ? Math.round(e.carbCeilingG / meals) : null;
	}

	function toggle<T>(arr: T[], v: T): T[] {
		return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
	}
	function reset() {
		search = ''; course = 'all'; goal = 'all'; fodmap = 'off'; alcoholFree = false;
		selectedDiet = []; selectedNutrients = []; sort = 'name';
		selectedIngredients = []; ingredientQuery = ''; maxKcal = null; minProtein = null; maxCarbs = null;
	}

	// Hard filters (everything except the soft nutrient chips) - used to detect the relaxation case.
	const hardFiltered = $derived(
		browsable.filter((r) => {
			if (course !== 'all' && !r.course.includes(course)) return false;
			if (goal !== 'all' && !matchesGoal(r, goal)) return false;
			if (!matchesFodmap(r, fodmap)) return false;
			if (alcoholFree && !isAlcoholFree(r)) return false;
			for (const f of selectedDiet) if (!matchesDiet(r, f)) return false;
			// Theme 6.2: must contain ALL ticked ingredients.
			if (selectedIngredients.length &&
				!selectedIngredients.every((id) => r.ingredients.some((i) => i.ingredientId === id))) return false;
			// Theme 6.3: per-serving macro targets.
			const ns = r.nutritionPerServing;
			if (maxKcal != null && ns.energy_kcal > maxKcal) return false;
			if (minProtein != null && ns.protein_g < minProtein) return false;
			if (maxCarbs != null && ns.carbohydrates_g > maxCarbs) return false;
			if (search.trim()) {
				if (!(searchIndex.get(r.id) ?? '').includes(search.trim().toLowerCase())) return false;
			}
			return true;
		})
	);

	const filtered = $derived(
		hardFiltered.filter((r) => selectedNutrients.every((c) => matchesNutrient(r, c)))
	);

	const sorted = $derived.by(() => {
		const list = [...filtered];
		const macros = (r: Recipe) => r.nutritionPerServing;
		switch (sort) {
			case 'kcal': list.sort((a, b) => macros(a).energy_kcal - macros(b).energy_kcal || a.id.localeCompare(b.id)); break;
			case 'protein': list.sort((a, b) => macros(b).protein_g - macros(a).protein_g || a.id.localeCompare(b.id)); break;
			case 'fibre': list.sort((a, b) => macros(b).fiber_g - macros(a).fiber_g || a.id.localeCompare(b.id)); break;
			case 'carbs': list.sort((a, b) => macros(b).carbohydrates_g - macros(a).carbohydrates_g || a.id.localeCompare(b.id)); break;
			default: list.sort((a, b) => L(a.name, lang).localeCompare(L(b.name, lang)));
		}
		return list;
	});

	const showRelax = $derived(selectedNutrients.length > 0 && filtered.length === 0 && hardFiltered.length > 0);
	const showContradiction = $derived(isContradiction(goal, selectedNutrients));

	const macrosOf = (r: Recipe) => (macroMode === '100g' ? r.nutritionPer100g : r.nutritionPerServing);

	// Workout-funnel focus param -> preset a nutrient filter / sort (client-only; query not prerendered).
	onMount(() => {
		const focus = new URL(window.location.href).searchParams.get('focus');
		if (!focus) return;
		if (focus === 'protein') selectedNutrients = ['high-protein'];
		else if (focus === 'fibre') selectedNutrients = ['high-fibre'];
		else if (focus === 'carbs') sort = 'carbs';
		else if (focus === 'fats') sort = 'kcal';
	});
</script>

<Seo {lang} path="/recipes" title={`${L(lbl.title, lang)} - Voimareitti`} description={L(lbl.intro, lang)} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<img class="pagebanner" src="/img/banners/nutrition.webp" alt="" />
	<h1>{L(lbl.title, lang)}</h1>
	<p class="muted intro">{L(lbl.intro, lang)}</p>

	{#if viewing}
		<MealSnapshot week={viewing.payload} {lang} onBack={() => (viewing = null)} onUse={useMeal} />
	{:else}
	<ProfilePanel {lang} startCollapsed collapsed={{ training: true }} />

	<div class="tabs" role="tablist" aria-label={L(lbl.title, lang)}>
		<button type="button" role="tab" class="tab" class:on={tab === 'browse'} aria-selected={tab === 'browse'} onclick={() => (tab = 'browse')}>{L(lbl.tabBrowse, lang)}</button>
		<button type="button" role="tab" class="tab" class:on={tab === 'saved'} aria-selected={tab === 'saved'} onclick={() => (tab = 'saved')}>{L(lbl.tabSaved, lang)} ({saved.meals.length})</button>
	</div>

	{#if tab === 'browse'}
	<div class="filters">
		<input class="search" type="search" placeholder={L(lbl.search, lang)} bind:value={search} aria-label={L(lbl.search, lang)} />
		<label>{L(lbl.course, lang)}
			<select value={course} onchange={(e) => (course = e.currentTarget.value)}>
				<option value="all">{L(lbl.all, lang)}</option>
				{#each courseOptions as c (c)}<option value={c}>{courseName(c)}</option>{/each}
			</select>
		</label>
		<label>{L(lbl.goal, lang)}
			<select value={goal} onchange={(e) => (goal = e.currentTarget.value as 'all' | GoalBucket)}>
				<option value="all">{L(lbl.all, lang)}</option>
				<option value="lose">{L(lbl.lose, lang)}</option>
				<option value="maintain">{L(lbl.maintain, lang)}</option>
				<option value="gain">{L(lbl.gain, lang)}</option>
			</select>
		</label>
		<label>{L(lbl.fodmap, lang)}
			<select value={fodmap} onchange={(e) => (fodmap = e.currentTarget.value as 'off' | 'gentle' | 'strict')}>
				<option value="off">{L(lbl.fodmapOff, lang)}</option>
				<option value="gentle">{L(lbl.fodmapGentle, lang)}</option>
				<option value="strict">{L(lbl.fodmapStrict, lang)}</option>
			</select>
		</label>
		<label>{L(lbl.sort, lang)}
			<select value={sort} onchange={(e) => (sort = e.currentTarget.value as typeof sort)}>
				<option value="name">{L(lbl.sortName, lang)}</option>
				<option value="kcal">{L(lbl.sortKcal, lang)}</option>
				<option value="protein">{L(lbl.sortProtein, lang)}</option>
				<option value="fibre">{L(lbl.sortFibre, lang)}</option>
				<option value="carbs">{L(lbl.sortCarbs, lang)}</option>
			</select>
		</label>
	</div>

	<div class="chips" role="group" aria-label={L(lbl.diet, lang)}>
		<span class="chips-label">{L(lbl.diet, lang)}</span>
		<div class="chiprow">
			{#each dietOrder as d (d)}
				<button type="button" class="chip" class:on={selectedDiet.includes(d)} aria-pressed={selectedDiet.includes(d)} onclick={() => (selectedDiet = toggle(selectedDiet, d))}>{L(dietLbl[d], lang)}</button>
			{/each}
			<button type="button" class="chip" class:on={alcoholFree} aria-pressed={alcoholFree} onclick={() => (alcoholFree = !alcoholFree)}>{L(lbl.alcoholFree, lang)}</button>
		</div>
	</div>

	<div class="chips" role="group" aria-label={L(lbl.nutrients, lang)}>
		<span class="chips-label">{L(lbl.nutrients, lang)}</span>
		<div class="chiprow">
			{#each nutrientOrder as n (n)}
				<button type="button" class="chip" class:on={selectedNutrients.includes(n)} aria-pressed={selectedNutrients.includes(n)} onclick={() => (selectedNutrients = toggle(selectedNutrients, n))}>{L(nutrientLbl[n], lang)}</button>
			{/each}
		</div>
	</div>

	<!-- Theme 6.2: ingredient include-filter (searchable tick list) -->
	<div class="chips ingfilter" role="group" aria-label={L(lbl.ingFilter, lang)}>
		<span class="chips-label">{L(lbl.ingFilter, lang)}</span>
		{#if selectedIngredients.length}
			<div class="chiprow">
				{#each selectedIngredients as id (id)}
					<button type="button" class="chip on" aria-pressed="true" onclick={() => (selectedIngredients = toggle(selectedIngredients, id))}>{ingName(id)} &times;</button>
				{/each}
			</div>
		{/if}
		<input class="ingsearch" type="search" placeholder={L(lbl.ingSearch, lang)} bind:value={ingredientQuery} aria-label={L(lbl.ingSearch, lang)} />
		{#if ingredientPicks.length}
			<div class="chiprow picks">
				{#each ingredientPicks as c (c.id)}
					{#if !selectedIngredients.includes(c.id)}
						<button type="button" class="chip" onclick={() => { selectedIngredients = [...selectedIngredients, c.id]; ingredientQuery = ''; }}>+ {ingName(c.id)}</button>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<!-- Theme 6.3: macro-target filters (per serving), prefilled from the profile -->
	<div class="chips macros-filter" role="group" aria-label={L(lbl.macroFilter, lang)}>
		<span class="chips-label">{L(lbl.macroFilter, lang)}</span>
		<div class="macrorow">
			<label class="mf">{L(lbl.maxKcal, lang)}<input type="number" min="0" step="10" bind:value={maxKcal} /></label>
			<label class="mf">{L(lbl.minProtein, lang)}<input type="number" min="0" step="1" bind:value={minProtein} /></label>
			<label class="mf">{L(lbl.maxCarbs, lang)}<input type="number" min="0" step="1" bind:value={maxCarbs} /></label>
			<button type="button" class="chip" onclick={fitMyTargets}>{L(lbl.fitTargets, lang)}</button>
			<button type="button" class="chip" onclick={() => { maxKcal = null; minProtein = null; maxCarbs = null; }}>{L(lbl.clearMacros, lang)}</button>
		</div>
	</div>

	<div class="resultbar">
		<span class="count">{sorted.length} {L(lbl.results, lang)}</span>
		<div class="rb-right">
			<SegmentedControl
				options={[{ value: 'serving', label: L(lbl.perServing, lang) }, { value: '100g', label: L(lbl.per100g, lang) }]}
				value={macroMode}
				ariaLabel={L(lbl.perServing, lang)}
				onchange={(v) => (macroMode = v as 'serving' | '100g')}
			/>
			<button type="button" class="reset" onclick={reset}>{L(lbl.reset, lang)}</button>
		</div>
	</div>

	{#if showContradiction}<p class="hint">{L(lbl.contradiction, lang)}</p>{/if}
	{#if showRelax}<p class="hint">{L(lbl.relaxNote, lang)}</p>{/if}

	{#if !sorted.length}
		<div class="empty">
			<p class="muted">{L(lbl.empty, lang)}</p>
			<button type="button" class="reset" onclick={reset}>{L(lbl.reset, lang)}</button>
		</div>
	{:else}
		<div class="grid">
			{#each sorted as r (r.id)}
				{@const m = macrosOf(r)}
				<a class="card" href={`/${lang}/recipes/${r.id}`}>
					<FoodImage src={recipeImage(r)} alt="" klass="rimg" />
					<div class="cbody">
						<b>{L(r.name, lang)}</b>
						<span class="badges">{r.course.map(courseName).join(' . ')}</span>
						<span class="macros">{nf(m.energy_kcal)} {L(lbl.kcal, lang)} . {nf(m.protein_g)} g {L(lbl.protein, lang)}</span>
						<span class="meta">{r.prepMinutes + r.cookMinutes} {L(lbl.min, lang)}{#if (r.prepMinutes + r.cookMinutes) <= 20} . {L(lbl.quick, lang)}{/if}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
	{:else}
		{#if saved.meals.length === 0}
			<p class="muted">{L(lbl.noSaved, lang)}</p>
		{:else}
			<ul class="savedlist">
				{#each saved.meals as s (s.id)}
					<li class="saveditem">
						<span class="sv-name">{s.name}</span>
						<span class="sv-date muted">{new Date(s.savedAt).toLocaleDateString(lang)}</span>
						<button type="button" class="chip" onclick={() => openMeal(s)}>{L(lbl.open, lang)}</button>
						<button type="button" class="chip" onclick={() => deleteMeal(s.id)}>{L(lbl.delete, lang)}</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
	{/if}
</main>

<style>
	.pagebanner { display: block; width: 100%; height: auto; border-radius: var(--radius); margin: 1rem 0 0.25rem; }
	.intro { margin: 0 0 1rem; }
	.muted { color: var(--muted); }
	.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.6rem 0.8rem; align-items: end; margin: 1rem 0 0.6rem; }
	.filters .search { grid-column: 1 / -1; width: 100%; }
	.filters label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; color: var(--muted); }
	.filters label select { width: 100%; }
	.chips { margin: 0 0 0.6rem; }
	.chips-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.35rem; }
	.chiprow { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.chip { min-height: 36px; padding: 0.3rem 0.7rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--text); font: inherit; font-size: 0.8rem; cursor: pointer; }
	.chip.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); font-weight: 600; }
	.tabs { display: flex; gap: 0.4rem; margin: 0.5rem 0 0.8rem; }
	.tab { min-height: 40px; padding: 0.4rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
	.tab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); }
	.savedlist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
	.saveditem { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.6rem 0.8rem; }
	.sv-name { font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
	.sv-date { font-size: 0.8rem; margin-right: auto; }
	.chip:hover { border-color: var(--accent); }
	.resultbar { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; flex-wrap: wrap; margin: 0.2rem 0 0.6rem; }
	.rb-right { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
	.count { font-size: 0.85rem; color: var(--muted); font-weight: 600; }
	.reset { font: inherit; font-size: 0.82rem; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 0.35rem 0.8rem; min-height: 36px; cursor: pointer; }
	.reset:hover { border-color: var(--accent); }
	.hint { background: var(--accent-soft); color: var(--primary); border-radius: var(--radius); padding: 0.5rem 0.8rem; font-size: 0.85rem; margin: 0.2rem 0 0.6rem; }
	.empty { margin: 1.5rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.8rem; margin: 0.6rem 0 2rem; }
	.card { display: flex; gap: 0.7rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.7rem; text-decoration: none; color: var(--text); }
	.card:hover { border-color: var(--accent); }
	.card :global(.rimg) { width: 84px; height: 84px; object-fit: cover; border-radius: 0.5rem; flex: none; background: var(--accent-soft); }
	.cbody { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
	.cbody b, .cbody span { overflow-wrap: anywhere; hyphens: auto; }
	.ingsearch { width: 100%; max-width: 340px; min-height: 40px; margin: 0.35rem 0; padding: 0 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; }
	.picks { max-height: 168px; overflow: auto; }
	.macrorow { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; }
	.mf { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--muted); }
	.mf input { min-height: 40px; width: 120px; }
	.badges { font-size: 0.75rem; color: var(--muted); }
	.macros { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
	.meta { font-size: 0.74rem; color: var(--muted); }
	@media (max-width: 760px) {
		.filters { position: sticky; top: 0; z-index: 5; background: var(--bg); padding-top: 0.4rem; }
	}
</style>
