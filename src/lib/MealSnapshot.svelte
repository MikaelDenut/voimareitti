<script lang="ts">
	// Read-only snapshot of a saved meal plan (Theme: saved-plan snapshot views). Mirrors the Nutrition
	// result page (day tabs, meal cards, day totals, micros) but without any edit affordances, plus an
	// in-page shopping list for THIS snapshot. Back returns to the Saved tab; "Use as my plan" loads the
	// snapshot into the live planner. Pure rendering over the stored WeekPlan - no engine, no mutation.
	import { t, type Locale } from '$lib/i18n';
	import FoodImage from '$lib/FoodImage.svelte';
	import { L, type Loc } from '$lib/content/data';
	import { getRecipe } from '$lib/content/recipes';
	import { getIngredient } from '$lib/content/ingredients';
	import { recipeImage, ingredientImage } from '$lib/recipe-images';
	import type { WeekPlan, PlanMeal, PlanDay } from '$lib/engine/meal-planner';
	import {
		dayTotals, dayMicros, weekMicros, mealMacros, mealFacts, mealMicros, mealWeight,
		dayCalorieStatus, TRACKED_MICROS, type MicroKey
	} from '$lib/nutrition/day-totals';
	import { microLimits, weeklyMicroBand } from '$lib/nutrition/micro-limits';
	import { householdAmount, householdBuyAmount, UNIT_LABELS } from '$lib/nutrition/household-units';
	import { shoppingList, formatQuantity, shopUnit, type Aisle } from '$lib/shopping';
	import { profile } from '$lib/profile.svelte';

	let { week, lang, onBack, onUse }: {
		week: WeekPlan; lang: Locale; onBack: () => void; onUse: () => void;
	} = $props();

	const T = (k: string) => t(lang, k);
	const nf = (n: number) => new Intl.NumberFormat(lang).format(Math.round(n));
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

	let activeDay = $state(0);
	let showShop = $state(false);
	let checked = $state<Record<string, boolean>>({});

	const dayNames: Loc[] = [
		{ en: 'Mon', fi: 'Ma', hu: 'Hét', sv: 'Mån' }, { en: 'Tue', fi: 'Ti', hu: 'Kedd', sv: 'Tis' },
		{ en: 'Wed', fi: 'Ke', hu: 'Sze', sv: 'Ons' }, { en: 'Thu', fi: 'To', hu: 'Csüt', sv: 'Tor' },
		{ en: 'Fri', fi: 'Pe', hu: 'Pén', sv: 'Fre' }, { en: 'Sat', fi: 'La', hu: 'Szo', sv: 'Lör' },
		{ en: 'Sun', fi: 'Su', hu: 'Vas', sv: 'Sön' }
	];
	const lbl: Record<string, Loc> = {
		back: { en: 'Back', fi: 'Takaisin', hu: 'Vissza', sv: 'Tillbaka' },
		use: { en: 'Use as my plan', fi: 'Käytä suunnitelmanani', hu: 'Beállítom tervemnek', sv: 'Använd som min plan' },
		shopping: { en: 'Shopping list', fi: 'Ostoslista', hu: 'Bevásárlólista', sv: 'Inköpslista' },
		hideShop: { en: 'Hide shopping list', fi: 'Piilota ostoslista', hu: 'Lista elrejtése', sv: 'Dölj listan' },
		resultTitle: { en: 'Your week', fi: 'Viikkosi', hu: 'A heted', sv: 'Din vecka' },
		targetsTitle: { en: 'Daily targets', fi: 'Päivätavoitteet', hu: 'Napi célok', sv: 'Dagliga mål' },
		servings: { en: 'servings', fi: 'annosta', hu: 'adag', sv: 'portioner' },
		dayTotal: { en: 'Day total', fi: 'Päivän yhteensä', hu: 'Napi összesen', sv: 'Dagens totalt' },
		target: { en: 'Target', fi: 'Tavoite', hu: 'Cél', sv: 'Mål' },
		dayFacts: { en: 'Day nutrition facts', fi: 'Päivän ravintosisältö', hu: 'Napi tápérték', sv: 'Dagens näringsvärde' },
		factsHead: { en: 'Nutrition facts', fi: 'Ravintosisältö', hu: 'Tápérték', sv: 'Näringsvärde' },
		micros: { en: 'Micronutrients', fi: 'Hivenaineet', hu: 'Mikrotápanyagok', sv: 'Mikronäring' },
		energy: { en: 'Energy', fi: 'Energia', hu: 'Energia', sv: 'Energi' },
		lfFat: { en: 'Fat', fi: 'Rasva', hu: 'Zsír', sv: 'Fett' },
		lfCarbs: { en: 'Carbs', fi: 'Hiilihydraatit', hu: 'Szénhidrát', sv: 'Kolhydrater' },
		sugars: { en: 'of which sugars', fi: 'josta sokereita', hu: 'amelyből cukrok', sv: 'varav sockerarter' },
		lfFibre: { en: 'Fibre', fi: 'Kuitu', hu: 'Rost', sv: 'Fiber' },
		lfProtein: { en: 'Protein', fi: 'Proteiini', hu: 'Fehérje', sv: 'Protein' },
		salt: { en: 'Salt', fi: 'Suola', hu: 'Só', sv: 'Salt' },
		ingredients: { en: 'Ingredients', fi: 'Ainekset', hu: 'Hozzávalók', sv: 'Ingredienser' },
		steps: { en: 'Steps', fi: 'Vaiheet', hu: 'Lépések', sv: 'Steg' },
		addedTag: { en: 'added', fi: 'lisätty', hu: 'hozzáadva', sv: 'tillagt' },
		supplement: { en: 'Supplement', fi: 'Lisäravinne', hu: 'Étrend-kiegészítő', sv: 'Kosttillskott' },
		addedMeal: { en: 'Added', fi: 'Lisätty', hu: 'Hozzáadva', sv: 'Tillagt' },
		calLow: { en: 'This day is well under your calorie target.', fi: 'Tämä päivä jää selvästi alle kaloritavoitteesi.', hu: 'Ez a nap jóval a kalóriacélod alatt van.', sv: 'Den här dagen ligger klart under ditt kalorimål.' },
		calOver: { en: 'This is over your set calorie target.', fi: 'Tämä ylittää asettamasi kaloritavoitteen.', hu: 'Ez meghaladja a beállított kalóriacélodat.', sv: 'Detta överstiger ditt inställda kalorimål.' },
		tooLow: { en: 'too low', fi: 'liian vähän', hu: 'túl kevés', sv: 'för lågt' },
		tooHigh: { en: 'too high', fi: 'liikaa', hu: 'túl sok', sv: 'för högt' },
		got: { en: 'Got it', fi: 'Hankittu', hu: 'Megvan', sv: 'Klart' }
	};
	const micL: Record<string, Loc> = {
		potassium_mg: { en: 'Potassium', fi: 'Kalium', hu: 'Kálium', sv: 'Kalium' },
		calcium_mg: { en: 'Calcium', fi: 'Kalsium', hu: 'Kalcium', sv: 'Kalcium' },
		iron_mg: { en: 'Iron', fi: 'Rauta', hu: 'Vas', sv: 'Järn' },
		magnesium_mg: { en: 'Magnesium', fi: 'Magnesium', hu: 'Magnézium', sv: 'Magnesium' },
		zinc_mg: { en: 'Zinc', fi: 'Sinkki', hu: 'Cink', sv: 'Zink' },
		vitamin_c_mg: { en: 'Vitamin C', fi: 'C-vitamiini', hu: 'C-vitamin', sv: 'C-vitamin' },
		vitamin_d_ug: { en: 'Vitamin D', fi: 'D-vitamiini', hu: 'D-vitamin', sv: 'D-vitamin' },
		vitamin_b12_ug: { en: 'Vitamin B12', fi: 'B12-vitamiini', hu: 'B12-vitamin', sv: 'B12-vitamin' },
		folate_ug: { en: 'Folate', fi: 'Folaatti', hu: 'Folát', sv: 'Folat' }
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
	const MIC = TRACKED_MICROS;
	const MICRO_IMG: Record<string, string> = {
		potassium_mg: 'potassium', calcium_mg: 'calcium', iron_mg: 'iron', magnesium_mg: 'magnesium',
		zinc_mg: 'zinc', vitamin_c_mg: 'vitamin-c', vitamin_d_ug: 'vitamin-d', vitamin_b12_ug: 'vitamin-b12', folate_ug: 'folate'
	};
	const microUnit = (k: string) => (k.endsWith('_ug') ? 'µg' : 'mg');
	const microImg = (k: string) => `/img/supplements/${MICRO_IMG[k] ?? 'vitamin-d'}.webp`;

	const microLim = $derived(microLimits(profile.age, profile.sex, !!profile.pregnant));
	const wkMicros = $derived(weekMicros(week.days));
	const microBandOf = (k: MicroKey) => weeklyMicroBand(wkMicros[k], microLim.target[k], microLim.ul[k]);

	const recipeName = (id: string | null) => (id ? L(getRecipe(id)?.name ?? { en: id, fi: id, hu: id, sv: id }, lang) : '');
	const ingName = (id: string) => { const d = getIngredient(id); return d ? L(d.name, lang) : id; };
	const ingImg = (id: string) => { const d = getIngredient(id); return ingredientImage(id, d?.role ?? 'other'); };
	// A meal that is a whole RECIPE added as a snack (recipeId null, single addition of kind 'recipe') must
	// render AS a recipe (ingredients + steps), not as a facts-only "single food" card.
	const addedRecipeOf = (meal: PlanMeal) => {
		if (meal.recipeId) return null;
		const adds = meal.additions ?? [];
		if (adds.length !== 1 || adds[0].kind !== 'recipe') return null;
		const rec = getRecipe(adds[0].recipeId);
		return rec ? { rec, servings: adds[0].servings ?? 1 } : null;
	};
	const supOf = (meal: PlanMeal) => (meal.additions ?? []).find((a) => a.kind === 'supplement') as Extract<NonNullable<PlanMeal['additions']>[number], { kind: 'supplement' }> | undefined;
	const slotLabel = (meal: PlanMeal) => (meal.slotKey === 'supplement' ? L(lbl.supplement, lang) : meal.slotKey.startsWith('meal_') ? T(meal.slotKey) : L(lbl.addedMeal, lang));
	const addedMealName = (meal: PlanMeal) => {
		const names = (meal.additions ?? []).map((a) =>
			a.kind === 'ingredient' ? ingName(a.ingredientId)
				: a.kind === 'recipe' ? recipeName(a.recipeId)
					: L(micL[a.micro] ?? { en: a.micro, fi: a.micro, hu: a.micro, sv: a.micro }, lang));
		return names.length ? names.join(', ') : L(lbl.addedMeal, lang);
	};
	const cardImg = (meal: PlanMeal) => {
		if (meal.recipeId) { const rr = getRecipe(meal.recipeId); return rr ? recipeImage(rr) : ''; }
		const a = (meal.additions ?? [])[0];
		if (!a) return '';
		if (a.kind === 'ingredient') return ingImg(a.ingredientId);
		if (a.kind === 'supplement') return microImg(a.micro);
		const ar = getRecipe(a.recipeId); return ar ? recipeImage(ar) : '';
	};
	const singleServing = (meal: PlanMeal) => {
		const a = (meal.additions ?? [])[0];
		return a && a.kind === 'ingredient' && a.pieces ? a.pieces : 1;
	};
	function recipeRows(meal: PlanMeal) {
		if (!meal.recipeId) return [] as { displayId: string; grams: number }[];
		const r = getRecipe(meal.recipeId);
		if (!r) return [];
		const scale = meal.servings / (r.base_servings || 1);
		const edits = meal.ingredientEdits ?? [];
		const rows: { displayId: string; grams: number }[] = [];
		for (const ing of r.ingredients) {
			const e = edits.find((x) => x.originalId === ing.ingredientId);
			if (e?.removed) continue;
			rows.push({ displayId: e?.swapToId ?? ing.ingredientId, grams: (e?.grams ?? ing.grams) * scale });
		}
		return rows;
	}

	const shop = $derived(shoppingList(week));
	const ingRole = (id: string) => getIngredient(id)?.role;
	const qty = (id: string, grams: number) => {
		const ing = getIngredient(id);
		const u = ing ? shopUnit(ing, grams) : { value: grams, unit: 'g' as const };
		const g = formatQuantity(u.value, u.unit, lang);
		const h = householdBuyAmount(id, grams); // whole units for shopping ("6 pc (550 g)")
		return h ? `${h.count} ${L(UNIT_LABELS[h.unit] ?? { en: h.unit }, lang)} (${g})` : g;
	};
	// Friendly household hint next to recipe-row grams ("(0.5 pc)"); '' when none sensible.
	const hhLabel = (id: string, grams: number): string => {
		const a = householdAmount(id, grams);
		return a ? ` (${a.count} ${L(UNIT_LABELS[a.unit] ?? { en: a.unit }, lang)})` : '';
	};
	function toggleCheck(id: string) { checked = { ...checked, [id]: !checked[id] }; }
</script>

<div class="snap">
	<div class="actions">
		<button type="button" class="back" onclick={onBack}>&larr; {L(lbl.back, lang)}</button>
		<button type="button" class="ghost" onclick={onUse}>{L(lbl.use, lang)}</button>
		<button type="button" class="ghost" onclick={() => (showShop = !showShop)}>{showShop ? L(lbl.hideShop, lang) : L(lbl.shopping, lang)}</button>
	</div>

	{#if showShop}
		<div class="shopview">
			<h3>{L(lbl.shopping, lang)}</h3>
			{#each shop.byAisle as group (group.aisle)}
				<section class="aisle">
					<h4>{L(aisleName[group.aisle], lang)}</h4>
					<ul>
						{#each group.lines as line (line.ingredientId)}
							<li class:done={checked[line.ingredientId]}>
								<button type="button" class="row" aria-pressed={!!checked[line.ingredientId]} onclick={() => toggleCheck(line.ingredientId)}>
									<span class="box" aria-hidden="true">{checked[line.ingredientId] ? '✓' : ''}</span>
									<FoodImage src={ingredientImage(line.ingredientId, ingRole(line.ingredientId))} alt="" klass="iimg" />
									<span class="nm">{ingName(line.ingredientId)}</span>
									<span class="qt">{qty(line.ingredientId, line.grams)}</span>
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{:else}
		<h2 class="result-h">{L(lbl.resultTitle, lang)}</h2>

		<section class="overview">
			<h2>{L(lbl.targetsTitle, lang)}</h2>
			<div class="stats">
				<div class="stat accent"><b>{nf(week.meta.targetKcal)}</b><span>{T('kcal')}</span></div>
				<div class="stat"><b>{week.meta.proteinBand[0]}-{week.meta.proteinBand[1]} g</b><span>{T('protein')}</span></div>
				{#if week.meta.carbCeilingG != null}<div class="stat"><b>{week.meta.carbCeilingG} g</b><span>{T('carbs')}</span></div>{/if}
			</div>
		</section>

		<div class="daytabs" role="tablist" aria-label={L(lbl.resultTitle, lang)}>
			{#each week.days as d, i (d.day)}
				<button type="button" role="tab" aria-selected={activeDay === i} class="daytab" class:on={activeDay === i} onclick={() => (activeDay = i)}>{L(dayNames[i] ?? dayNames[0], lang)}</button>
			{/each}
		</div>

		{#key activeDay}
			{@const day = week.days[activeDay]}
			{@const dt = dayTotals(day)}
			{@const status = dayCalorieStatus(dt.kcal, week.meta.targetKcal)}
			{@const dmic = dayMicros(day)}
			<div class="day" role="tabpanel">
				<div class="meals">
					{#each day.meals as meal, si (meal.slotKey + si)}
						{@const r = meal.recipeId ? getRecipe(meal.recipeId) : null}
						{@const sup = supOf(meal)}
						{@const mm = mealMacros(meal)}
						{@const mf = mealFacts(meal)}
						{@const micros = mealMicros(meal)}
						<details class="meal">
							<summary class="mealhead">
								<span class="slot">{slotLabel(meal)}</span>
								{#if r}<FoodImage src={recipeImage(r)} alt="" klass="mimg" />{:else if cardImg(meal)}<FoodImage src={cardImg(meal)} alt="" klass="mimg mimg-food" />{/if}
								<span class="mname">{meal.recipeId ? recipeName(meal.recipeId) : addedMealName(meal)}</span>
								<span class="mmeta">{#if sup}{sup.amount} {microUnit(sup.micro)}{:else}{meal.recipeId ? meal.servings : singleServing(meal)} {L(lbl.servings, lang)} . {nf(mm.kcal)} kcal . {nf(mealWeight(meal))} g{/if}</span>
							</summary>
							<div class="mealbody">
								{#snippet factsLabel()}
									<div class="facts-wrap">
										<div class="facts">
											<div class="facts-head">{L(lbl.factsHead, lang)}</div>
											<div class="facts-row big"><span>{L(lbl.energy, lang)}</span><b>{nf(mf.kcal)} kcal</b></div>
											<div class="facts-row big"><span>{L(lbl.lfFat, lang)}</span><b>{fmt1(mf.fat)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfCarbs, lang)}</span><b>{fmt1(mf.carbs)} g</b></div>
											<div class="facts-row sub"><span>{L(lbl.sugars, lang)}</span><b>{fmt1(mf.sugars)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfFibre, lang)}</span><b>{fmt1(mf.fiber)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfProtein, lang)}</span><b>{fmt1(mf.protein)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.salt, lang)}</span><b>{fmt1(mf.salt)} g</b></div>
											<div class="facts-divider"></div>
											<div class="facts-head sub-head">{L(lbl.micros, lang)}</div>
											{#each MIC as k (k)}
												<div class="facts-row sub"><span>{L(micL[k], lang)}</span><b>{fmt1(micros[k])} {microUnit(k)}</b></div>
											{/each}
										</div>
									</div>
								{/snippet}

								{#if sup}
									<div class="facts-wrap">
										<div class="facts">
											<div class="facts-head">{L(lbl.factsHead, lang)}</div>
											<div class="facts-row big"><span>{L(micL[sup.micro] ?? { en: sup.micro, fi: sup.micro, hu: sup.micro, sv: sup.micro }, lang)}</span><b>{sup.amount} {microUnit(sup.micro)}</b></div>
											<div class="facts-row sub"><span>{L(lbl.energy, lang)}</span><b>0 kcal</b></div>
										</div>
									</div>
								{:else if r}
									<h4 class="mb-h">{L(lbl.ingredients, lang)}</h4>
									<ul class="ings">
										{#each recipeRows(meal) as row, ri (ri)}
											<li>
												<FoodImage src={ingImg(row.displayId)} alt="" klass="ingthumb" />
												<span class="iname plain">{ingName(row.displayId)}</span>
												<span class="igrams">{nf(row.grams)} g{hhLabel(row.displayId, row.grams)}</span>
											</li>
										{/each}
										{#each meal.additions ?? [] as a, ai (ai)}
											<li class="added">
												{#if a.kind === 'ingredient'}
													<FoodImage src={ingImg(a.ingredientId)} alt="" klass="ingthumb" />
													<span class="iname plain">{ingName(a.ingredientId)}</span>
													<span class="addtag">{L(lbl.addedTag, lang)}</span>
													<span class="igrams">{#if a.pieces}{a.pieces} . {/if}{nf(a.grams)} g{#if !a.pieces}{hhLabel(a.ingredientId, a.grams)}{/if}</span>
												{:else if a.kind === 'recipe'}
													{@const ar = getRecipe(a.recipeId)}
													{#if ar}<FoodImage src={recipeImage(ar)} alt="" klass="ingthumb" />{/if}
													<span class="iname plain">{recipeName(a.recipeId)}</span>
													<span class="addtag">{L(lbl.addedTag, lang)}</span>
													<span class="igrams">{a.servings} {L(lbl.servings, lang)}</span>
												{/if}
											</li>
										{/each}
									</ul>
									<h4 class="mb-h">{L(lbl.steps, lang)}</h4>
									<ol class="steps">
										{#each r.instructions as step, i (i)}<li>{L(step, lang)}</li>{/each}
									</ol>
									{@render factsLabel()}
								{:else if addedRecipeOf(meal)}
									{@const ar = addedRecipeOf(meal)!}
									<!-- A whole recipe added as a snack: render it AS a recipe, not a bare facts card. -->
									<h4 class="mb-h">{L(lbl.ingredients, lang)}</h4>
									<ul class="ings">
										{#each ar.rec.ingredients as ring, ri (ri)}
											<li>
												<FoodImage src={ingImg(ring.ingredientId)} alt="" klass="ingthumb" />
												<span class="iname plain">{ingName(ring.ingredientId)}</span>
												<span class="igrams">{nf(ring.grams * ar.servings)} g{hhLabel(ring.ingredientId, ring.grams * ar.servings)}</span>
											</li>
										{/each}
									</ul>
									<h4 class="mb-h">{L(lbl.steps, lang)}</h4>
									<ol class="steps">
										{#each ar.rec.instructions as step, i (i)}<li>{L(step, lang)}</li>{/each}
									</ol>
									{@render factsLabel()}
								{:else if (meal.additions ?? []).length}
									{@render factsLabel()}
								{/if}
							</div>
						</details>
					{/each}
				</div>

				{#if status.state !== 'ok'}
					<p class="calnote" class:low={status.state === 'low'} class:over={status.state === 'over'}>{status.state === 'low' ? L(lbl.calLow, lang) : L(lbl.calOver, lang)}</p>
				{/if}

				<div class="totals">
					<b>{L(lbl.dayTotal, lang)}:</b>
					{nf(dt.kcal)} kcal . {nf(dt.protein)} g protein . {nf(dt.carbs)} g carbs . {nf(dt.fat)} g fat . {nf(dt.fiber)} g fibre
					<span class="muted small"> ({L(lbl.target, lang)} ~{nf(week.meta.targetKcal)} kcal)</span>
				</div>

				<details class="daymicros" open>
					<summary>{L(lbl.dayFacts, lang)}</summary>
					<div class="micgrid">
						{#each MIC as k (k)}
							{@const band = microBandOf(k)}
							<div class="miccell band-{band}"><b>{fmt1(dmic[k])} {microUnit(k)}</b><span>{L(micL[k], lang)}</span>{#if band === 'low-bad'}<span class="micflag">{L(lbl.tooLow, lang)}</span>{:else if band === 'high-bad'}<span class="micflag">{L(lbl.tooHigh, lang)}</span>{/if}</div>
						{/each}
					</div>
				</details>
			</div>
		{/key}
	{/if}
</div>

<style>
	.snap { display: flex; flex-direction: column; gap: 1rem; margin: 0 0 2rem; }
	.actions { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
	.back { font: inherit; background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600; padding: 0; }
	.ghost { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.5rem 1rem; min-height: 44px; cursor: pointer; }
	.ghost:hover { border-color: var(--accent); }
	.result-h { margin: 0; font-size: 2em; }
	.muted { color: var(--muted); }
	.small { font-size: 0.8rem; }
	.overview { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.8rem 1rem; }
	.overview h2 { margin: 0 0 0.6rem; font-size: 1.05rem; }
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.6rem; }
	.stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); padding: 0.6rem 0.4rem; }
	.stat b { font-size: 1.15rem; color: var(--text); line-height: 1; }
	.stat.accent b { color: var(--primary); }
	.stat span { font-size: 0.75rem; color: var(--muted); text-align: center; }
	.daytabs { display: flex; gap: 0.3rem; flex-wrap: wrap; }
	.daytab { min-width: 44px; min-height: 44px; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
	.daytab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); }
	.day { display: flex; flex-direction: column; gap: 0.8rem; }
	.meals { display: flex; flex-direction: column; gap: 0.6rem; }
	.meal { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); }
	.mealhead { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.8rem; cursor: pointer; list-style: none; }
	.mealhead::-webkit-details-marker { display: none; }
	.slot { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted); font-weight: 700; flex: none; min-width: 4.5rem; }
	.meal :global(.mimg) { width: 48px; height: 48px; object-fit: cover; border-radius: 0.4rem; flex: none; background: var(--accent-soft); }
	.meal :global(.mimg-food) { object-fit: contain; background: transparent; }
	.mname { font-weight: 700; min-width: 0; overflow-wrap: anywhere; flex: 1; }
	.mmeta { font-size: 0.8rem; color: var(--muted); flex: none; }
	.mealbody { padding: 0 0.8rem 0.8rem; }
	.mb-h { margin: 0.6rem 0 0.3rem; font-size: 0.9rem; }
	.ings { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.ings li { display: flex; align-items: center; gap: 0.5rem; }
	.ings :global(.ingthumb) { width: 30px; height: 30px; object-fit: contain; border-radius: 0.3rem; flex: none; background: transparent; }
	.iname.plain { font-weight: 500; }
	.addtag { font-size: 0.68rem; color: var(--accent); border: 1px solid var(--accent); border-radius: 999px; padding: 0 0.4rem; }
	.igrams { margin-left: auto; color: var(--muted); font-size: 0.85rem; }
	.steps { margin: 0.3rem 0 0; padding-left: 1.2rem; font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.2rem; }
	.facts-wrap { margin-top: 0.6rem; }
	.facts { max-width: 320px; border: 2px solid var(--text); border-radius: 0.4rem; padding: 0.5rem 0.7rem; background: var(--bg); }
	.facts-head { font-size: 1.1rem; font-weight: 800; border-bottom: 6px solid var(--text); padding-bottom: 0.2rem; margin-bottom: 0.2rem; }
	.facts-head.sub-head { font-size: 0.85rem; font-weight: 700; border-bottom-width: 2px; }
	.facts-row { display: flex; justify-content: space-between; gap: 0.5rem; border-bottom: 1px solid var(--line); padding: 0.12rem 0; font-size: 0.85rem; }
	.facts-row.big { font-weight: 700; }
	.facts-row.sub { padding-left: 1rem; font-weight: 400; font-size: 0.8rem; }
	.facts-divider { height: 0.4rem; }
	.calnote { border-radius: var(--radius); padding: 0.5rem 0.8rem; font-size: 0.9rem; font-weight: 700; margin: 0; }
	.calnote.low { background: #fff4d6; color: #7a5a00; }
	.calnote.over { background: #fdecec; color: #9a2c2c; }
	.totals { font-size: 0.9rem; }
	.daymicros { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.5rem 0.8rem; }
	.daymicros summary { cursor: pointer; font-weight: 600; }
	.micgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 0.4rem; margin-top: 0.5rem; }
	.miccell { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; border: 1px solid var(--line); border-radius: 0.4rem; padding: 0.4rem 0.3rem; text-align: center; }
	.miccell b { font-size: 0.9rem; }
	.miccell span { font-size: 0.7rem; color: var(--muted); }
	.micflag { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; }
	.band-good { background: #eef7ed; border-color: #bcdcb6; }
	.band-low { background: #fff4d6; border-color: #ecd9a0; }
	.band-high { background: #fff4d6; border-color: #ecd9a0; }
	.band-low-bad { background: #fdecec; border-color: #e2b3b3; }
	.band-low-bad .micflag, .band-high-bad .micflag { color: #9a2c2c; }
	.band-high-bad { background: #fdecec; border-color: #e2b3b3; }
	/* Shopping */
	.shopview { display: flex; flex-direction: column; gap: 0.4rem; }
	.shopview h3 { margin: 0; }
	.aisle { margin: 0.4rem 0; }
	.aisle h4 { font-size: 1rem; margin: 0 0 0.4rem; color: var(--primary); }
	.aisle ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.aisle li { display: flex; }
	.row { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.7rem; min-height: 52px; padding: 0.4rem 0.6rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); font: inherit; color: var(--text); text-align: left; cursor: pointer; }
	.row:hover { border-color: var(--accent); }
	.box { width: 26px; height: 26px; flex: none; border: 2px solid var(--accent); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: var(--accent); font-weight: 700; }
	.row :global(.iimg) { width: 40px; height: 40px; object-fit: contain; border-radius: 0.4rem; flex: none; background: transparent; }
	.nm { flex: 1; min-width: 0; font-weight: 500; }
	.qt { color: var(--accent); font-weight: 700; font-size: 0.9rem; }
	li.done .row { opacity: 0.5; }
	li.done .nm { text-decoration: line-through; }
</style>
