<script lang="ts">
	import { type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import FoodImage from '$lib/FoodImage.svelte';
	import Modal from '$lib/Modal.svelte';
	import { L, type Loc } from '$lib/content/data';
	import { recipes, getRecipe, type Recipe } from '$lib/content/recipes';
	import { getIngredient, type Ingredient } from '$lib/content/ingredients';
	import { recipeImage, hasRecipeImage, ingredientImage } from '$lib/recipe-images';
	import { goalBucketsOf, dietAnnotations, courseLabel } from '$lib/recipe-filters';
	import { ingredientSwapOptions } from '$lib/ingredient-swap';
	import { kcalMatchedGrams } from '$lib/nutrition/day-totals';
	import { householdAmount, UNIT_LABELS } from '$lib/nutrition/household-units';
	import { profile } from '$lib/profile.svelte';
	import { SITE_URL } from '$lib/site';

	let { data }: { data: { lang: Locale; id: string } } = $props();
	const lang = $derived(data.lang);
	const nf = (n: number) => new Intl.NumberFormat(lang).format(Math.round(n));
	const nf1 = (n: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
	// A2: friendly household-unit hint (e.g. "(2 kpl)") next to grams; '' when none sensible.
	const hhLabel = (id: string, grams: number): string => {
		const a = householdAmount(id, grams);
		return a ? ` (${nf1(a.count)} ${L(UNIT_LABELS[a.unit] ?? { en: a.unit }, lang)})` : '';
	};

	const r = $derived(getRecipe(data.id) ?? recipes[0]);
	const baseServings = $derived(r.base_servings || r.computed.baseServings || 1);
	let servings = $state(0);
	$effect(() => { if (servings === 0) servings = baseServings; });
	const inc = () => { servings = Math.min(12, servings + 1); };
	const dec = () => { servings = Math.max(1, servings - 1); };

	// Editable ingredient list (swap / remove). Reset whenever the recipe changes.
	// `origId` is the recipe's original ingredient for that row; the swap cycle is anchored to it (not to the
	// current swapped-to value) so options stay stable and cycle cleanly with no immediate repeat (planning/43 E).
	type EdIng = { ingredientId: string; origId: string; grams: number; preparation?: Loc };
	let ings = $state<EdIng[]>([]);
	let swapState = $state<Record<string, number>>({}); // keyed by origId, survives row removal
	$effect(() => {
		// reading r.id ties this reset to navigation, not to in-page edits
		void r.id;
		ings = r.ingredients.map((i) => ({ ingredientId: i.ingredientId, origId: i.ingredientId, grams: i.grams, preparation: i.preparation }));
		swapState = {};
	});

	const MAC = ['energy_kcal', 'protein_g', 'fat_g', 'carbohydrates_g', 'fiber_g', 'sugars_g', 'salt_g'] as const;
	const MIC = ['potassium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'zinc_mg', 'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_b12_ug', 'folate_ug'] as const;

	// Per-serving macros + micros computed live from the (possibly edited) ingredient list.
	const totals = $derived.by(() => {
		const m: Record<string, number> = {}; for (const k of MAC) m[k] = 0;
		const mic: Record<string, number> = {}; for (const k of MIC) mic[k] = 0;
		for (const ing of ings) {
			const d = getIngredient(ing.ingredientId);
			if (!d) continue;
			const f = ing.grams / 100;
			for (const k of MAC) m[k] += f * (d.per100g[k] ?? 0);
			for (const k of MIC) mic[k] += f * ((d.micros_per100g as unknown as Record<string, number>)[k] ?? 0);
		}
		return { m, mic };
	});
	const per = $derived.by(() => {
		const o: Record<string, number> = {};
		for (const k of MAC) o[k] = totals.m[k] / baseServings;
		return o;
	});
	const microPer = $derived.by(() => {
		const o: Record<string, number> = {};
		for (const k of MIC) o[k] = totals.mic[k] / baseServings;
		return o;
	});
	const servScale = $derived(servings / baseServings);

	const lbl: Record<string, Loc> = {
		back: { en: 'All recipes', fi: 'Kaikki reseptit', hu: 'Összes recept', sv: 'Alla recept' },
		servings: { en: 'Servings', fi: 'Annokset', hu: 'Adagok', sv: 'Portioner' },
		fewerServings: { en: 'Fewer servings', fi: 'Vähemmän annoksia', hu: 'Kevesebb adag', sv: 'Färre portioner' },
		moreServings: { en: 'More servings', fi: 'Enemmän annoksia', hu: 'Több adag', sv: 'Fler portioner' },
		ingredients: { en: 'Ingredients', fi: 'Ainekset', hu: 'Hozzávalók', sv: 'Ingredienser' },
		instructions: { en: 'Instructions', fi: 'Ohjeet', hu: 'Elkészítés', sv: 'Instruktioner' },
		perServing: { en: 'Per serving', fi: 'Per annos', hu: 'Adagonként', sv: 'Per portion' },
		per100g: { en: 'Per 100 g', fi: 'Per 100 g', hu: '100 g', sv: 'Per 100 g' },
		totalFor: { en: 'Total for', fi: 'Yhteensä', hu: 'Összesen', sv: 'Totalt för' },
		nutrition: { en: 'Nutrition', fi: 'Ravintosisältö', hu: 'Tápérték', sv: 'Näring' },
		micros: { en: 'Nutrition facts', fi: 'Ravintosisältö', hu: 'Tápértékek', sv: 'Näringsvärden' },
		kcal: { en: 'Calories', fi: 'Kalorit', hu: 'Kalória', sv: 'Kalorier' },
		energy: { en: 'Energy', fi: 'Energia', hu: 'Energia', sv: 'Energi' },
		protein: { en: 'Protein', fi: 'Proteiini', hu: 'Fehérje', sv: 'Protein' },
		carbs: { en: 'Carbohydrate', fi: 'Hiilihydraatti', hu: 'Szénhidrát', sv: 'Kolhydrater' },
		sugars: { en: 'of which sugars', fi: 'josta sokereita', hu: 'amelyből cukrok', sv: 'varav sockerarter' },
		fat: { en: 'Fat', fi: 'Rasva', hu: 'Zsír', sv: 'Fett' },
		fibre: { en: 'Fibre', fi: 'Kuitu', hu: 'Rost', sv: 'Fiber' },
		salt: { en: 'Salt', fi: 'Suola', hu: 'Só', sv: 'Salt' },
		potassium_mg: { en: 'Potassium', fi: 'Kalium', hu: 'Kálium', sv: 'Kalium' },
		calcium_mg: { en: 'Calcium', fi: 'Kalsium', hu: 'Kalcium', sv: 'Kalcium' },
		iron_mg: { en: 'Iron', fi: 'Rauta', hu: 'Vas', sv: 'Järn' },
		magnesium_mg: { en: 'Magnesium', fi: 'Magnesium', hu: 'Magnézium', sv: 'Magnesium' },
		zinc_mg: { en: 'Zinc', fi: 'Sinkki', hu: 'Cink', sv: 'Zink' },
		vitamin_c_mg: { en: 'Vitamin C', fi: 'C-vitamiini', hu: 'C-vitamin', sv: 'C-vitamin' },
		vitamin_d_ug: { en: 'Vitamin D', fi: 'D-vitamiini', hu: 'D-vitamin', sv: 'D-vitamin' },
		vitamin_b12_ug: { en: 'Vitamin B12', fi: 'B12-vitamiini', hu: 'B12-vitamin', sv: 'B12-vitamin' },
		folate_ug: { en: 'Folate', fi: 'Folaatti', hu: 'Folát', sv: 'Folat' },
		min: { en: 'min', fi: 'min', hu: 'perc', sv: 'min' },
		easy: { en: 'Easy', fi: 'Helppo', hu: 'Könnyű', sv: 'Lätt' },
		medium: { en: 'Medium', fi: 'Keskitaso', hu: 'Közepes', sv: 'Medel' },
		hard: { en: 'Hard', fi: 'Vaativa', hu: 'Nehéz', sv: 'Svår' },
		print: { en: 'Print', fi: 'Tulosta', hu: 'Nyomtatás', sv: 'Skriv ut' },
		swap: { en: 'Swap ingredient', fi: 'Vaihda raaka-aine', hu: 'Hozzávaló cseréje', sv: 'Byt ingrediens' },
		remove: { en: 'Remove', fi: 'Poista', hu: 'Eltávolítás', sv: 'Ta bort' },
		noAlt: { en: 'No suitable alternative', fi: 'Ei sopivaa vaihtoehtoa', hu: 'Nincs megfelelő alternatíva', sv: 'Inget passande alternativ' },
		close: { en: 'Close', fi: 'Sulje', hu: 'Bezárás', sv: 'Stäng' },
		viewRecipe: { en: 'recipe', fi: 'resepti', hu: 'recept', sv: 'recept' },
		veganNote: { en: 'A plant-only diet needs a reliable B12 source and often added vitamin D.', fi: 'Pelkkä kasviruokavalio tarvitsee luotettavan B12-lähteen ja usein lisättyä D-vitamiinia.', hu: 'A tisztán növényi étrendhez megbízható B12-forrás és gyakran D-vitamin-pótlás kell.', sv: 'En helt växtbaserad kost behöver en pålitlig B12-källa och ofta tillsatt D-vitamin.' },
		disclaimer: { en: 'Nutrition values are approximate and depend on exact ingredients and portions. General wellness information, not medical or dietary advice. Check allergens against the products you use.', fi: 'Ravintoarvot ovat likimääräisiä ja riippuvat tarkoista raaka-aineista ja annoksista. Yleistä hyvinvointitietoa, ei lääketieteellistä tai ravitsemusneuvontaa. Tarkista allergeenit käyttämistäsi tuotteista.', hu: 'A tápértékek hozzávetőlegesek, és a pontos hozzávalóktól és adagoktól függenek. Általános egészségmegőrzési információ, nem orvosi vagy táplálkozási tanács. Ellenőrizd az allergéneket a használt termékeken.', sv: 'Näringsvärdena är ungefärliga och beror på exakta ingredienser och portioner. Allmän hälsoinformation, inte medicinsk eller kostrådgivning. Kontrollera allergener mot produkterna du använder.' }
	};
	const diffName = (d: string) => L(lbl[d] ?? lbl.medium, lang);
	const courseName = (c: string) => courseLabel(c, lang);
	const ingName = (id: string) => { const d = getIngredient(id); return d ? L(d.name, lang) : id; };
	// Theme 9: localized "(gluten free)" / "(lactose-free)" annotation under the active diet filters.
	const ingAnn = (id: string) => {
		const d = getIngredient(id);
		if (!d) return '';
		const a = dietAnnotations(d, profile.dietaryFilters).map((x) => L(x, lang));
		return a.length ? `(${a.join(', ')})` : '';
	};
	const ingRole = (id: string) => getIngredient(id)?.role;
	// An ingredient that is itself a small prepared component (e.g. bechamel) has a recipe sharing its id.
	// Clicking it opens that sub-recipe in a popup instead of the plain ingredient-info card.
	const subRecipeOf = (id: string): Recipe | null => getRecipe(id) ?? null;
	function openIngredient(id: string) {
		const sub = subRecipeOf(id);
		if (sub) subRecipe = sub;
		else infoIng = getIngredient(id) ?? null;
	}

	function swap(i: number) {
		// Anchor the cycle on the ORIGINAL ingredient (stable list), exclude the other rows' originals and the
		// avoided foods, and step the per-origin index. No re-base, no immediate repeat (planning/43 E).
		const anchor = ings[i].origId;
		const others = ings.filter((_, j) => j !== i).map((x) => x.origId);
		const opts = ingredientSwapOptions(anchor, others, profile.dislikedIngredientIds);
		if (!opts.length) return;
		const next = (swapState[anchor] ?? -1) + 1;
		swapState = { ...swapState, [anchor]: next };
		// Calorie-preserving: scale the new ingredient's grams so the dish calories stay consistent.
		const toId = opts[next % opts.length].id;
		const from = getIngredient(ings[i].ingredientId);
		const to = getIngredient(toId);
		const origKcal = ((from?.per100g.energy_kcal ?? 0) * ings[i].grams) / 100;
		const grams = from && to ? kcalMatchedGrams(origKcal, to.per100g.energy_kcal, ings[i].grams) : ings[i].grams;
		ings[i] = { ...ings[i], ingredientId: toId, grams, preparation: undefined };
	}
	function hasSwap(i: number) {
		return ingredientSwapOptions(ings[i].origId, ings.filter((_, j) => j !== i).map((x) => x.origId), profile.dislikedIngredientIds).length > 0;
	}
	function remove(i: number) {
		if (ings.length <= 1) return;
		ings = ings.filter((_, j) => j !== i);
	}

	// Ingredient info modal.
	let infoIng = $state<Ingredient | null>(null);
	let subRecipe = $state<Recipe | null>(null);
	const dietLineOf = (d: Ingredient): string => {
		const tags: string[] = [];
		if (d.dietary.vegan) tags.push('vegan'); else if (d.dietary.vegetarian) tags.push('vegetarian');
		if (d.dietary.glutenFree) tags.push('gluten-free');
		if (d.dietary.lactoseFree) tags.push('lactose-free');
		return tags.join(' . ');
	};

	// Recipe JSON-LD uses the ORIGINAL recipe (stable for prerender/SEO).
	const recipeLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Recipe',
		name: L(r.name, lang),
		// Use the resolved scene art (the `image` field is unused; art comes from the manifest), absolute for
		// SEO; omit when only a placeholder exists so no generic image is claimed as the dish.
		image: hasRecipeImage(r) ? `${SITE_URL}${recipeImage(r)}` : undefined,
		recipeCategory: r.course.map((c) => courseName(c)).join(', '),
		recipeYield: `${baseServings} servings`,
		totalTime: `PT${r.prepMinutes + r.cookMinutes}M`,
		recipeIngredient: r.ingredients.map((ing) => `${ing.grams} g ${ingName(ing.ingredientId)}`),
		recipeInstructions: r.instructions.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: L(s, lang) })),
		nutrition: {
			'@type': 'NutritionInformation',
			calories: `${Math.round(r.nutritionPerServing.energy_kcal)} kcal`,
			proteinContent: `${Math.round(r.nutritionPerServing.protein_g)} g`,
			carbohydrateContent: `${Math.round(r.nutritionPerServing.carbohydrates_g)} g`,
			fatContent: `${Math.round(r.nutritionPerServing.fat_g)} g`,
			fiberContent: `${Math.round(r.nutritionPerServing.fiber_g)} g`
		}
	}));

	// Richer, localized meta description (course + time + per-serving energy/protein) instead of just the
	// recipe name, so search snippets are informative. A real recipe photo (not the generic hero) is passed
	// to Seo as the social image when the recipe has scene art.
	const metaDesc = $derived(
		`${r.course.map(courseName).join(', ')} . ${r.prepMinutes + r.cookMinutes} ${L(lbl.min, lang)} . ` +
		`${nf(r.nutritionPerServing.energy_kcal)} ${L(lbl.kcal, lang)}, ${nf(r.nutritionPerServing.protein_g)} g ${L(lbl.protein, lang)} (${L(lbl.perServing, lang)}).`
	);
	const ogImg = $derived(hasRecipeImage(r) ? `${SITE_URL}${recipeImage(r)}` : undefined);
</script>

<Seo {lang} path={`/recipes/${r.id}`} title={`${L(r.name, lang)} - Voimareitti`} description={metaDesc} image={ogImg} />
<svelte:head>
	{@html `<script type="application/ld+json">${recipeLd}</script>`}
</svelte:head>

<SiteHeader {lang} />

<main id="main-content" class="container">
	<a class="back" href={`/${lang}/recipes`}>&larr; {L(lbl.back, lang)}</a>
	<h1>{L(r.name, lang)}</h1>

	<div class="badges">
		{#each r.course as c (c)}<span class="badge">{courseName(c)}</span>{/each}
		{#each goalBucketsOf(r) as gb (gb)}<span class="badge alt">{gb}</span>{/each}
		{#if r.dietary.vegan}<span class="badge diet">vegan</span>{:else if r.dietary.vegetarian}<span class="badge diet">vegetarian</span>{/if}
		{#if r.dietary.glutenFree}<span class="badge diet">gluten-free</span>{/if}
	</div>

	<div class="hero">
		<FoodImage src={recipeImage(r)} alt="" klass="heroimg" />
		<div class="quick">
			<div><b>{r.prepMinutes + r.cookMinutes}</b> {L(lbl.min, lang)}</div>
			<div>{diffName(r.difficulty)}</div>
			<button type="button" class="printbtn no-print" onclick={() => window.print()}>{L(lbl.print, lang)}</button>
		</div>
	</div>

	<div class="servings no-print">
		<span>{L(lbl.servings, lang)}</span>
		<button type="button" onclick={dec} aria-label={L(lbl.fewerServings, lang)}>-</button>
		<output aria-live="polite">{servings}</output>
		<button type="button" onclick={inc} aria-label={L(lbl.moreServings, lang)}>+</button>
	</div>

	<section class="panel">
		<h2>{L(lbl.nutrition, lang)} <span class="muted small">({L(lbl.perServing, lang)})</span></h2>
		<div class="macros">
			<div><b>{nf(per.energy_kcal)}</b><span>{L(lbl.kcal, lang)}</span></div>
			<div><b>{nf(per.protein_g)} g</b><span>{L(lbl.protein, lang)}</span></div>
			<div><b>{nf(per.carbohydrates_g)} g</b><span>{L(lbl.carbs, lang)}</span></div>
			<div><b>{nf(per.fat_g)} g</b><span>{L(lbl.fat, lang)}</span></div>
			<div><b>{nf(per.fiber_g)} g</b><span>{L(lbl.fibre, lang)}</span></div>
		</div>
		<p class="total" aria-live="polite">{L(lbl.totalFor, lang)} {servings}: {nf(per.energy_kcal * servings)} {L(lbl.kcal, lang)} . {nf(per.protein_g * servings)} g {L(lbl.protein, lang)}</p>
	</section>

	<section>
		<h2>{L(lbl.ingredients, lang)}</h2>
		<ul class="ings">
			{#each ings as ing, i (i + '-' + ing.ingredientId)}
				<li>
					<button type="button" class="ithumb" onclick={() => openIngredient(ing.ingredientId)} aria-label={ingName(ing.ingredientId)}>
						<FoodImage src={ingredientImage(ing.ingredientId, ingRole(ing.ingredientId))} alt="" klass="iimg" />
					</button>
					<button type="button" class="iname" onclick={() => openIngredient(ing.ingredientId)}>{ingName(ing.ingredientId)}{#if subRecipeOf(ing.ingredientId)}<span class="isub" title={L(lbl.viewRecipe, lang)}>{L(lbl.viewRecipe, lang)}</span>{/if}</button>
					{#if ingAnn(ing.ingredientId)}<span class="iann">{ingAnn(ing.ingredientId)}</span>{/if}
					<span class="igrams">{nf(ing.grams * servScale)} g{hhLabel(ing.ingredientId, ing.grams * servScale)}</span>
					{#if ing.preparation}<span class="iprep muted">{L(ing.preparation, lang)}</span>{/if}
					<span class="iactions no-print">
						{#if hasSwap(i)}
							<button type="button" class="iswap" title={L(lbl.swap, lang)} aria-label={L(lbl.swap, lang)} onclick={() => swap(i)}>
								<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
							</button>
						{:else}
							<button type="button" class="iswap" disabled title={L(lbl.noAlt, lang)} aria-label={L(lbl.noAlt, lang)}>
								<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
							</button>
						{/if}
						{#if ings.length > 1}
							<button type="button" class="iremove" title={L(lbl.remove, lang)} aria-label={L(lbl.remove, lang)} onclick={() => remove(i)}>&times;</button>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>{L(lbl.instructions, lang)}</h2>
		<ol class="steps">
			{#each r.instructions as s, i (i)}<li>{L(s, lang)}</li>{/each}
		</ol>
	</section>

	<section class="facts-wrap">
		<div class="facts">
			<div class="facts-head">{L(lbl.micros, lang)}</div>
			<div class="facts-sub">{L(lbl.perServing, lang)}</div>
			<div class="facts-row big"><span>{L(lbl.energy, lang)}</span><b>{nf(per.energy_kcal)} {L(lbl.kcal, lang)}</b></div>
			<div class="facts-row big"><span>{L(lbl.fat, lang)}</span><b>{nf1(per.fat_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.carbs, lang)}</span><b>{nf1(per.carbohydrates_g)} g</b></div>
			<div class="facts-row sub"><span>{L(lbl.sugars, lang)}</span><b>{nf1(per.sugars_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.fibre, lang)}</span><b>{nf1(per.fiber_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.protein, lang)}</span><b>{nf1(per.protein_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.salt, lang)}</span><b>{nf1(per.salt_g)} g</b></div>
			<div class="facts-divider"></div>
			{#each MIC as k (k)}
				<div class="facts-row"><span>{L(lbl[k], lang)}</span><b>{nf1(microPer[k])} {k.endsWith('_ug') ? 'µg' : 'mg'}</b></div>
			{/each}
		</div>
	</section>

	{#if r.dietary.vegan}<p class="note">{L(lbl.veganNote, lang)}</p>{/if}
	<p class="disclaimer muted small">{L(lbl.disclaimer, lang)}</p>
</main>

{#if infoIng}
	<Modal open={true} title={L(infoIng.name, lang)} closeLabel={L(lbl.close, lang)} onclose={() => (infoIng = null)}>
		<div class="ii">
			<FoodImage src={ingredientImage(infoIng.id, infoIng.role)} alt="" klass="ii-img" />
			<div class="ii-body">
				{#if dietLineOf(infoIng)}<p class="ii-diet">{dietLineOf(infoIng)}</p>{/if}
				{#if infoIng.note}<p class="ii-desc">{infoIng.note}</p>{/if}
			</div>
		</div>
		<div class="facts in-modal">
			<div class="facts-sub">{L(lbl.per100g, lang)}</div>
			<div class="facts-row big"><span>{L(lbl.energy, lang)}</span><b>{nf(infoIng.per100g.energy_kcal)} {L(lbl.kcal, lang)}</b></div>
			<div class="facts-row big"><span>{L(lbl.fat, lang)}</span><b>{nf1(infoIng.per100g.fat_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.carbs, lang)}</span><b>{nf1(infoIng.per100g.carbohydrates_g)} g</b></div>
			<div class="facts-row sub"><span>{L(lbl.sugars, lang)}</span><b>{nf1(infoIng.per100g.sugars_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.fibre, lang)}</span><b>{nf1(infoIng.per100g.fiber_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.protein, lang)}</span><b>{nf1(infoIng.per100g.protein_g)} g</b></div>
			<div class="facts-row big"><span>{L(lbl.salt, lang)}</span><b>{nf1(infoIng.per100g.salt_g)} g</b></div>
			<div class="facts-head sub-head">{L(lbl.micros, lang)}</div>
			{#each MIC as k (k)}
				<div class="facts-row"><span>{L(lbl[k], lang)}</span><b>{nf1((infoIng.micros_per100g as unknown as Record<string, number>)[k] ?? 0)} {k.endsWith('_ug') ? 'µg' : 'mg'}</b></div>
			{/each}
		</div>
	</Modal>
{/if}

{#if subRecipe}
	<Modal open={true} title={L(subRecipe.name, lang)} closeLabel={L(lbl.close, lang)} onclose={() => (subRecipe = null)}>
		<div class="sub-recipe">
			<h3>{L(lbl.ingredients, lang)}</h3>
			<ul class="sub-ings">
				{#each subRecipe.ingredients as si (si.ingredientId)}
					<li><span>{ingName(si.ingredientId)}</span><b>{nf(si.grams)} g</b></li>
				{/each}
			</ul>
			<h3>{L(lbl.instructions, lang)}</h3>
			<ol class="sub-steps">
				{#each subRecipe.instructions as s, i (i)}<li>{L(s, lang)}</li>{/each}
			</ol>
		</div>
	</Modal>
{/if}

<style>
	.back { display: inline-block; margin-top: 1rem; color: var(--accent); text-decoration: none; font-size: 0.85rem; }
	h1 { margin: 0.5rem 0 0.5rem; }
	.muted { color: var(--muted); }
	.small { font-size: 0.8rem; }
	.badges { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.8rem; }
	.badge { font-size: 0.72rem; border: 1px solid var(--line); border-radius: 999px; padding: 0.1rem 0.55rem; color: var(--muted); }
	.badge.alt { color: var(--accent); border-color: var(--accent); }
	.badge.diet { color: var(--primary); background: var(--accent-soft); border-color: var(--accent-soft); }
	.hero { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
	.hero :global(.heroimg) { width: min(320px, 100%); aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius); background: var(--accent-soft); }
	.quick { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; }
	.printbtn { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 0.4rem 0.9rem; min-height: 44px; cursor: pointer; }
	.servings { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 1rem; font-size: 0.9rem; }
	.servings button { width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 1.2rem; cursor: pointer; }
	.servings output { min-width: 1.5rem; text-align: center; font-weight: 600; }
	.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.9rem 1rem; margin: 0 0 1.25rem; }
	h2 { margin: 0 0 0.6rem; font-size: 1.05rem; }
	.macros { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.6rem; }
	.macros div { display: flex; flex-direction: column; }
	.macros b { color: var(--primary); }
	.macros span { font-size: 0.75rem; color: var(--muted); }
	.total { font-size: 0.85rem; color: var(--accent); margin: 0.6rem 0 0; }

	.ings { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.ings li { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; padding: 0.25rem 0; border-bottom: 1px solid var(--line); }
	.ithumb { padding: 0; border: none; background: none; cursor: pointer; flex: none; }
	.ings :global(.iimg) { width: 40px; height: 40px; object-fit: contain; border-radius: 0.4rem; flex: none; background: transparent; }
	.iname { font-weight: 600; background: none; border: none; padding: 0; font: inherit; color: var(--primary); cursor: pointer; text-align: left; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 2px; }
	.iname:hover { text-decoration-color: var(--accent); }
	.iann { font-size: 0.75rem; color: var(--accent); font-weight: 600; }
	.isub { margin-left: 0.4rem; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--accent); border: 1px solid var(--line); border-radius: 999px; padding: 0.05rem 0.4rem; text-decoration: none; vertical-align: middle; }
	.sub-recipe h3 { font-size: 0.95rem; margin: 0.6rem 0 0.3rem; }
	.sub-ings { list-style: none; padding: 0; margin: 0 0 0.4rem; }
	.sub-ings li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.2rem 0; border-bottom: 1px solid var(--line); }
	.sub-steps { margin: 0; padding-left: 1.2rem; display: grid; gap: 0.3rem; }
	.igrams { color: var(--accent); font-weight: 600; font-size: 0.9rem; }
	.iprep { font-size: 0.82rem; }
	.iactions { margin-left: auto; display: inline-flex; gap: 0.3rem; }
	.iswap, .iremove { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--primary); cursor: pointer; }
	.iswap:hover, .iremove:hover { border-color: var(--accent); }
	.iswap:disabled { opacity: 0.35; cursor: default; }
	.iremove { font-size: 1.1rem; line-height: 1; color: var(--muted); }
	.steps { padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; }

	/* Nutrition-facts label (shop-style) */
	.facts-wrap { margin: 0 0 1.25rem; }
	.facts { border: 1.5px solid var(--text); border-radius: 6px; padding: 0.6rem 0.8rem; max-width: 360px; background: var(--surface); }
	.facts.in-modal { max-width: none; margin-top: 0.8rem; }
	.facts-head { font-size: 1.05rem; font-weight: 800; border-bottom: 4px solid var(--text); padding-bottom: 0.3rem; }
	.facts-head.sub-head { font-size: 0.85rem; margin-top: 0.6rem; border-bottom-width: 2px; }
	.facts-sub { font-size: 0.75rem; color: var(--muted); padding: 0.25rem 0; border-bottom: 1px solid var(--text); }
	.facts-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.28rem 0; border-bottom: 1px solid var(--line); font-size: 0.9rem; }
	.facts-row.big { font-weight: 600; }
	.facts-row.sub { padding-left: 1rem; font-weight: 400; color: var(--muted); font-size: 0.84rem; }
	.facts-row b { font-variant-numeric: tabular-nums; }
	.facts-divider { height: 4px; background: var(--text); margin: 0.2rem 0; }
	.facts-row:last-child { border-bottom: none; }

	.ii { display: flex; gap: 1rem; align-items: flex-start; }
	.ii :global(.ii-img) { width: 96px; height: 96px; object-fit: contain; flex: none; background: transparent; }
	.ii-diet { font-size: 0.8rem; color: var(--accent); font-weight: 600; margin: 0 0 0.4rem; text-transform: capitalize; }
	.ii-desc { margin: 0; line-height: 1.5; font-size: 0.92rem; }

	.note { background: var(--accent-soft); color: var(--primary); border-radius: var(--radius); padding: 0.6rem 0.9rem; font-size: 0.85rem; }
	.disclaimer { margin: 1.5rem 0 2rem; line-height: 1.5; }
</style>
