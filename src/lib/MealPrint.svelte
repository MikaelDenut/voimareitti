<script lang="ts">
	// Printable A4 meal-plan / shopping handout (planning section 14). Same approach as PrintGuide:
	// display:none on screen, display:block only in print; the host page hides main.container in print.
	// Branded, grayscale-safe, no background images, break-inside avoid so days/meals/aisles don't split.
	import { t, type Locale } from '$lib/i18n';
	import { L, type Loc } from '$lib/content/data';
	import { getRecipe } from '$lib/content/recipes';
	import { getIngredient } from '$lib/content/ingredients';
	import type { WeekPlan } from '$lib/engine/meal-planner';
	import type { FullProfile } from '$lib/profile-core';
	import { estimateEnergy } from '$lib/engine/engine';
	import { shoppingList, shopUnit, formatQuantity } from '$lib/shopping';
	import { mealMacros, mealWeight, dayTotals, dayMicros, weekMicros, dayCalorieStatus, effectiveIngredients, TRACKED_MICROS } from '$lib/nutrition/day-totals';
	import { microLimits, weeklyMicroBand } from '$lib/nutrition/micro-limits';
	import { householdAmount, householdBuyAmount, UNIT_LABELS } from '$lib/nutrition/household-units';

	let {
		mode,
		lang,
		week,
		profile,
		density = 'full',
		owner
	}: {
		mode: 'plan' | 'shopping';
		lang: Locale;
		week: WeekPlan | null;
		profile: FullProfile;
		density?: 'compact' | 'full';
		owner?: { name: string; phone: string; email: string };
	} = $props();

	const nf = (n: number) => new Intl.NumberFormat(lang).format(Math.round(n));
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
	const today = $derived(new Date().toLocaleDateString(lang));
	const ownerLine = $derived([owner?.name, owner?.phone, owner?.email].filter(Boolean).join('  ·  '));

	const lbl: Record<string, Loc> = {
		planTitle: { en: 'Weekly meal plan', fi: 'Viikon ateriasuunnitelma', hu: 'Heti étrend', sv: 'Veckans matplan' },
		shopTitle: { en: 'Shopping list', fi: 'Ostoslista', hu: 'Bevásárlólista', sv: 'Inköpslista' },
		sub: { en: 'Voimareitti - your personal plan', fi: 'Voimareitti - henkilökohtainen suunnitelmasi', hu: 'Voimareitti - a személyes terved', sv: 'Voimareitti - din personliga plan' },
		goal: { en: 'Goal', fi: 'Tavoite', hu: 'Cél', sv: 'Mål' },
		kcal: { en: 'kcal/day', fi: 'kcal/pv', hu: 'kcal/nap', sv: 'kcal/dag' },
		protein: { en: 'protein', fi: 'proteiini', hu: 'fehérje', sv: 'protein' },
		meals: { en: 'meals/day', fi: 'ateriaa/pv', hu: 'étkezés/nap', sv: 'måltider/dag' },
		water: { en: 'water/day', fi: 'vettä/pv', hu: 'víz/nap', sv: 'vatten/dag' },
		targetsTitle: { en: 'Your daily targets', fi: 'Päivittäiset tavoitteesi', hu: 'Napi céljaid', sv: 'Dina dagliga mål' },
		kcalUnit: { en: 'kcal', fi: 'kcal', hu: 'kcal', sv: 'kcal' },
		carbsU: { en: 'carbs', fi: 'hiilihydr.', hu: 'szénhidrát', sv: 'kolhydrater' },
		fatU: { en: 'fat', fi: 'rasva', hu: 'zsír', sv: 'fett' },
		fibreU: { en: 'fibre', fi: 'kuitu', hu: 'rost', sv: 'fiber' },
		waterU: { en: 'water', fi: 'vesi', hu: 'víz', sv: 'vatten' },
		household: { en: 'household', fi: 'ruokakunta', hu: 'háztartás', sv: 'hushåll' },
		people: { en: 'people', fi: 'henkilöä', hu: 'fő', sv: 'personer' },
		dayTotal: { en: 'Total', fi: 'Yhteensä', hu: 'Összesen', sv: 'Totalt' },
		summary: { en: 'Week summary', fi: 'Viikon yhteenveto', hu: 'Heti összegzés', sv: 'Veckosammanfattning' },
		avgDay: { en: 'Average per day', fi: 'Keskimäärin/pv', hu: 'Átlag/nap', sv: 'Snitt/dag' },
		veganNote: { en: 'A plant-only diet needs a reliable B12 source and often added vitamin D.', fi: 'Pelkkä kasviruokavalio tarvitsee luotettavan B12-lähteen ja usein lisättyä D-vitamiinia.', hu: 'A tisztán növényi étrendhez megbízható B12-forrás és gyakran D-vitamin-pótlás kell.', sv: 'En helt växtbaserad kost behöver en pålitlig B12-källa och ofta tillsatt D-vitamin.' },
		disclaimer: { en: 'Values are approximate and depend on exact ingredients and portions. General wellness information, not medical or dietary advice. Check allergens against the products you use.', fi: 'Arvot ovat likimääräisiä ja riippuvat tarkoista raaka-aineista ja annoksista. Yleistä hyvinvointitietoa, ei lääketieteellistä tai ravitsemusneuvontaa. Tarkista allergeenit käyttämistäsi tuotteista.', hu: 'Az értékek hozzávetőlegesek, és a pontos hozzávalóktól és adagoktól függenek. Általános egészségmegőrzési információ, nem orvosi vagy táplálkozási tanács. Ellenőrizd az allergéneket a használt termékeken.', sv: 'Värdena är ungefärliga och beror på exakta ingredienser och portioner. Allmän hälsoinformation, inte medicinsk eller kostrådgivning. Kontrollera allergener mot produkterna du använder.' },
		ingredients: { en: 'Ingredients', fi: 'Ainekset', hu: 'Hozzávalók', sv: 'Ingredienser' },
		steps: { en: 'Steps', fi: 'Vaiheet', hu: 'Lépések', sv: 'Steg' },
		added: { en: 'Added', fi: 'Lisätty', hu: 'Hozzáadva', sv: 'Tillagt' },
		supplement: { en: 'Supplement', fi: 'Lisäravinne', hu: 'Étrend-kiegészítő', sv: 'Kosttillskott' },
		microsTitle: { en: 'Vitamins and minerals', fi: 'Vitamiinit ja kivennäisaineet', hu: 'Vitaminok és ásványi anyagok', sv: 'Vitaminer och mineraler' },
		microsWeek: { en: 'Vitamins and minerals (this week)', fi: 'Vitamiinit ja kivennäisaineet (tällä viikolla)', hu: 'Vitaminok és ásványi anyagok (ezen a héten)', sv: 'Vitaminer och mineraler (denna vecka)' },
		bandLow: { en: 'low', fi: 'vähän', hu: 'kevés', sv: 'lågt' },
		bandOk: { en: 'ok', fi: 'ok', hu: 'ok', sv: 'ok' },
		bandHigh: { en: 'high', fi: 'paljon', hu: 'sok', sv: 'högt' },
		calLow: { en: 'This day is well under your calorie target.', fi: 'Tämä päivä jää selvästi alle kaloritavoitteesi.', hu: 'Ez a nap jóval a kalóriacélod alatt van.', sv: 'Den här dagen ligger klart under ditt kalorimål.' },
		calOver: { en: 'This is over your set calorie target.', fi: 'Tämä ylittää asettamasi kaloritavoitteen.', hu: 'Ez meghaladja a beállított kalóriacélodat.', sv: 'Detta överstiger ditt inställda kalorimål.' }
	};
	const dayNames: Loc[] = [
		{ en: 'Monday', fi: 'Maanantai', hu: 'Hétfő', sv: 'Måndag' },
		{ en: 'Tuesday', fi: 'Tiistai', hu: 'Kedd', sv: 'Tisdag' },
		{ en: 'Wednesday', fi: 'Keskiviikko', hu: 'Szerda', sv: 'Onsdag' },
		{ en: 'Thursday', fi: 'Torstai', hu: 'Csütörtök', sv: 'Torsdag' },
		{ en: 'Friday', fi: 'Perjantai', hu: 'Péntek', sv: 'Fredag' },
		{ en: 'Saturday', fi: 'Lauantai', hu: 'Szombat', sv: 'Lördag' },
		{ en: 'Sunday', fi: 'Sunnuntai', hu: 'Vasárnap', sv: 'Söndag' }
	];
	const aisleName: Record<string, Loc> = {
		produce: { en: 'Produce', fi: 'Hedelmät ja vihannekset', hu: 'Zöldség-gyümölcs', sv: 'Frukt och grönt' },
		'meat-fish-protein': { en: 'Meat, fish & protein', fi: 'Liha, kala ja proteiini', hu: 'Hús, hal, fehérje', sv: 'Kött, fisk och protein' },
		'dairy-eggs': { en: 'Dairy & eggs', fi: 'Maito ja munat', hu: 'Tejtermék és tojás', sv: 'Mejeri och ägg' },
		'dry-goods-pantry': { en: 'Dry goods & pantry', fi: 'Kuivatuotteet', hu: 'Szárazáru', sv: 'Torrvaror' },
		frozen: { en: 'Frozen', fi: 'Pakasteet', hu: 'Fagyasztott', sv: 'Fryst' },
		condiments: { en: 'Condiments & oils', fi: 'Mausteet ja öljyt', hu: 'Fűszerek és olajok', sv: 'Tillbehör och oljor' },
		other: { en: 'Other', fi: 'Muut', hu: 'Egyéb', sv: 'Övrigt' }
	};

	const recipeName = (id: string | null) => (id ? L(getRecipe(id)?.name ?? { en: id, fi: id, hu: id, sv: id }, lang) : '-');
	const ingName = (id: string) => { const d = getIngredient(id); return d ? L(d.name, lang) : id; };
	const mealName = (meal: { recipeId: string | null; additions?: { kind: string; ingredientId?: string; recipeId?: string; micro?: string }[] }) => {
		if (meal.recipeId) return recipeName(meal.recipeId);
		const names = (meal.additions ?? []).map((a) =>
			a.kind === 'ingredient' ? ingName(a.ingredientId!)
				: a.kind === 'recipe' ? recipeName(a.recipeId!)
					: L(lbl.supplement, lang));
		return names.length ? names.join(', ') : L(lbl.added, lang);
	};
	const qty = (id: string, grams: number) => {
		const ing = getIngredient(id);
		const u = ing ? shopUnit(ing, grams) : { value: grams, unit: 'g' as const };
		return formatQuantity(u.value, u.unit, lang);
	};
	// Household-unit strings (no grams - the caller already shows grams nearby). hhAmt = exact (recipe rows),
	// hhBuy = whole units rounded up (shopping). '' when no sensible unit.
	const hhAmt = (id: string, grams: number): string => {
		const a = householdAmount(id, grams);
		return a ? `${a.count} ${L(UNIT_LABELS[a.unit] ?? { en: a.unit }, lang)}` : '';
	};
	const hhBuy = (id: string, grams: number): string => {
		const a = householdBuyAmount(id, grams);
		return a ? `${a.count} ${L(UNIT_LABELS[a.unit] ?? { en: a.unit }, lang)}` : '';
	};

	const energy = $derived(estimateEnergy(profile));
	const waterTargetMl = $derived(energy.waterTargetMl);
	const shop = $derived(week && mode === 'shopping' ? shoppingList(week) : null);
	const weekAvg = $derived.by(() => {
		if (!week) return { kcal: 0, protein: 0 };
		const k = week.days.reduce((s, d) => s + d.totals.kcal, 0) / week.days.length;
		const p = week.days.reduce((s, d) => s + d.totals.protein, 0) / week.days.length;
		return { kcal: k, protein: p };
	});

	// Micronutrients for the PDF.
	const MIC = ['potassium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'zinc_mg', 'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_b12_ug', 'folate_ug'] as const;
	const microUnit = (k: string) => (k.endsWith('_ug') ? 'µg' : 'mg');
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
	const micLim = $derived(microLimits(profile.age, profile.sex, profile.pregnant));
	const wkMic = $derived(week ? weekMicros(week.days) : null);
	const bandWord = (k: string) => {
		if (!wkMic) return '';
		const b = weeklyMicroBand((wkMic as Record<string, number>)[k], (micLim.target as Record<string, number>)[k], micLim.ul[k as keyof typeof micLim.ul]);
		return b === 'low' || b === 'low-bad' ? L(lbl.bandLow, lang) : b === 'high' || b === 'high-bad' ? L(lbl.bandHigh, lang) : L(lbl.bandOk, lang);
	};
</script>

{#if week}
	<div class="mp" data-mode={mode}>
		<div class="mp-cover">
			<img class="mp-logo" src="/img/brand/logo-horizontal.png" alt="Voimareitti" />
			<div class="mp-meta">
				<div class="mp-title">{mode === 'shopping' ? L(lbl.shopTitle, lang) : L(lbl.planTitle, lang)}</div>
				{#if ownerLine}<div class="mp-owner">{ownerLine}</div>{/if}
				<div class="mp-sub">{L(lbl.sub, lang)} - {today}</div>
			</div>
		</div>

		<div class="mp-pills">
			<span class="mp-pill">{L(lbl.kcal, lang)}: ~{nf(week.meta.targetKcal)}</span>
			<span class="mp-pill">{L(lbl.protein, lang)}: {nf(week.meta.proteinBand[0])}-{nf(week.meta.proteinBand[1])} g</span>
			{#if mode === 'plan'}<span class="mp-pill">{week.days[0]?.meals.filter((m) => m.recipeId).length ?? 0} {L(lbl.meals, lang)}</span>{/if}
			<span class="mp-pill">{L(lbl.water, lang)}: ~{fmt1(waterTargetMl / 1000)} l</span>
			{#each week.meta.activeFilters.diet as f (f)}<span class="mp-pill">{f}</span>{/each}
			{#if week.meta.activeFilters.alcoholFree}<span class="mp-pill">alcohol-free</span>{/if}
			{#if week.meta.activeFilters.fodmap !== 'off'}<span class="mp-pill">FODMAP {week.meta.activeFilters.fodmap}</span>{/if}
			{#if profile.household.length}<span class="mp-pill">{L(lbl.household, lang)}: {profile.household.length + 1} {L(lbl.people, lang)}</span>{/if}
		</div>

		<!-- Your daily targets info box (mirrors the workout PDF) -->
		<section class="mp-targets">
			<h3 class="mp-th">{L(lbl.targetsTitle, lang)}</h3>
			<div class="mp-statgrid">
				<div class="mp-stat"><b>{nf(energy.target)}</b><span>{L(lbl.kcalUnit, lang)}</span></div>
				<div class="mp-stat"><b>{nf(energy.proteinBand[0])}-{nf(energy.proteinBand[1])} g</b><span>{L(lbl.protein, lang)}</span></div>
				<div class="mp-stat"><b>{energy.carbG} g</b><span>{L(lbl.carbsU, lang)}</span></div>
				<div class="mp-stat"><b>{energy.fatG} g</b><span>{L(lbl.fatU, lang)}</span></div>
				<div class="mp-stat"><b>{energy.fiberG} g</b><span>{L(lbl.fibreU, lang)}</span></div>
				<div class="mp-stat"><b>{fmt1(energy.waterTargetMl / 1000)} l</b><span>{L(lbl.waterU, lang)}</span></div>
			</div>
		</section>

		{#if mode === 'plan'}
			{#each week.days as day, i (day.day)}
				{@const dt = dayTotals(day)}
				{@const status = dayCalorieStatus(dt.kcal, week.meta.targetKcal)}
					{@const dm = dayMicros(day)}
				<section class="mp-day">
					<div class="mp-dayh">
						<b>{L(dayNames[i], lang)}</b>
						<span>{L(lbl.dayTotal, lang)}: {nf(dt.kcal)} kcal . {nf(dt.protein)} g {L(lbl.protein, lang)}</span>
					</div>
					{#each day.meals as meal, mi (meal.slotKey + mi)}
						{@const mm = mealMacros(meal)}
						{@const slotName = meal.slotKey.startsWith('meal_') ? t(lang, meal.slotKey) : L(lbl.added, lang)}
						<div class="mp-meal">
							<div class="mp-mealh">
								<span class="mp-slot">{slotName}</span>
								<span class="mp-mealname">{mealName(meal)}</span>
								<span class="mp-mealmac">{#if meal.recipeId}{meal.servings}x . {/if}{nf(mm.kcal)} kcal . {nf(mm.protein)} g . {nf(mealWeight(meal))} g</span>
							</div>
							{#if density === 'full'}
								{@const r = meal.recipeId ? getRecipe(meal.recipeId) : null}
								<div class="mp-ings">{L(lbl.ingredients, lang)}: {effectiveIngredients(meal).map((e) => { const h = hhAmt(e.ingredientId, e.grams); return qty(e.ingredientId, e.grams) + (h ? ' (' + h + ')' : '') + ' ' + ingName(e.ingredientId); }).join(', ')}</div>
								{#if r}<ol class="mp-steps">{#each r.instructions as s, si (si)}<li>{L(s, lang)}</li>{/each}</ol>{/if}
							{/if}
						</div>
					{/each}
					{#if status.state !== 'ok'}
						<div class="mp-calnote" class:over={status.state === 'over'}>{status.state === 'low' ? L(lbl.calLow, lang) : L(lbl.calOver, lang)}</div>
					{/if}
					<div class="mp-micros">
						<span class="mp-micros-h">{L(lbl.microsTitle, lang)}:</span>
						{#each MIC as k (k)}<span class="mp-micro">{L(micL[k], lang)} {fmt1(dm[k])} {microUnit(k)}</span>{/each}
					</div>
				</section>
			{/each}

			<section class="mp-summary">
				<b>{L(lbl.summary, lang)}</b>
				<div>{L(lbl.avgDay, lang)}: {nf(weekAvg.kcal)} kcal . {nf(weekAvg.protein)} g {L(lbl.protein, lang)}</div>
			</section>
		{#if wkMic}
					<section class="mp-microweek">
						<b>{L(lbl.microsWeek, lang)}</b>
						<div class="mp-microweek-grid">
							{#each MIC as k (k)}
								<div class="mp-microweek-cell"><span>{L(micL[k], lang)}</span><b>{nf(wkMic[k])} {microUnit(k)} <span class="mp-band">({bandWord(k)})</span></b></div>
							{/each}
						</div>
					</section>
				{/if}
			{:else if shop}
			{#each shop.byAisle as group (group.aisle)}
				<section class="mp-aisle">
					<h3>{L(aisleName[group.aisle] ?? { en: group.aisle, fi: group.aisle, hu: group.aisle, sv: group.aisle }, lang)}</h3>
					<ul class="mp-shop">
						{#each group.lines as line (line.ingredientId)}
							<li class:pantry={line.pantry}><span class="mp-box"></span><span class="mp-it">{ingName(line.ingredientId)}</span><span class="mp-qt">{hhBuy(line.ingredientId, line.grams) || qty(line.ingredientId, line.grams)} <span class="mp-exact">({nf(line.grams)} g)</span></span></li>
						{/each}
					</ul>
				</section>
			{/each}
		{/if}

		{#if profile.dietaryFilters.includes('vegan')}<p class="mp-note">{L(lbl.veganNote, lang)}</p>{/if}
		<p class="mp-disc">{L(lbl.disclaimer, lang)}</p>
	</div>
{/if}

<style>
	.mp { display: none; }
	@media print {
		.mp { display: block; color: #1b2024; font-size: 10pt; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		.mp-cover { display: flex; align-items: center; justify-content: space-between; gap: 12pt; border-bottom: 2pt solid var(--accent); padding-bottom: 7pt; margin-bottom: 10pt; }
		.mp-logo { height: 30px; width: auto; }
		.mp-meta { text-align: right; }
		.mp-title { font-size: 15pt; font-weight: 700; color: var(--primary); }
		.mp-owner { font-size: 9pt; font-weight: 600; color: #1b2024; margin-top: 1pt; }
		.mp-sub { font-size: 8.5pt; color: #5b6670; margin-top: 2pt; }
		.mp-pills { display: flex; flex-wrap: wrap; gap: 4pt; margin-bottom: 8pt; }
		.mp-pill { background: var(--accent-soft); color: var(--primary); border-radius: 9pt; padding: 1.5pt 6pt; font-size: 8.5pt; font-weight: 600; }
		.mp-targets { border: 1pt solid var(--line); border-radius: 5pt; padding: 6pt 8pt; margin-bottom: 10pt; break-inside: avoid; }
		.mp-th { font-size: 11pt; color: #1b2024; margin: 0 0 5pt; }
		.mp-statgrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5pt; }
		.mp-stat { display: flex; flex-direction: column; align-items: center; gap: 1pt; border: 1pt solid var(--line); border-radius: 4pt; padding: 4pt 2pt; text-align: center; }
		.mp-stat b { font-size: 10.5pt; color: var(--primary); line-height: 1; }
		.mp-stat span { font-size: 7.5pt; color: #5b6670; }

		.mp-day { break-inside: avoid; margin-bottom: 9pt; border: 1pt solid var(--line); border-radius: 6pt; padding: 6pt 8pt; }
		.mp-dayh { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1pt solid var(--line); padding-bottom: 3pt; margin-bottom: 4pt; }
		.mp-dayh b { font-size: 11pt; color: var(--primary); }
		.mp-dayh span { font-size: 8.5pt; color: #5b6670; }
		.mp-meal { break-inside: avoid; margin: 4pt 0; }
		.mp-mealh { display: flex; gap: 6pt; align-items: baseline; }
		.mp-slot { font-size: 8pt; font-weight: 700; color: #5b6670; min-width: 70pt; }
		.mp-mealname { font-weight: 600; flex: 1; }
		.mp-mealmac { font-size: 8.5pt; color: var(--accent); }
		.mp-ings { font-size: 8.5pt; color: #3a444c; margin: 2pt 0 0 70pt; }
		.mp-steps { font-size: 8.5pt; color: #3a444c; margin: 2pt 0 0 70pt; padding-left: 12pt; }
		.mp-steps li { break-inside: avoid; margin-bottom: 1pt; }
		.mp-micros { font-size: 8pt; color: #3a444c; margin-top: 3pt; display: flex; flex-wrap: wrap; gap: 1pt 8pt; }
		.mp-micros-h { font-weight: 700; color: #5b6670; }
		.mp-microweek { break-inside: avoid; margin-top: 8pt; border-top: 1pt solid var(--line); padding-top: 5pt; }
		.mp-microweek b { color: var(--primary); }
		.mp-microweek-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2pt 12pt; margin-top: 4pt; }
		.mp-microweek-cell { display: flex; justify-content: space-between; gap: 6pt; font-size: 8.5pt; }
		.mp-microweek-cell span { color: #3a444c; }
		.mp-microweek-cell b { font-weight: 600; color: #1b2024; }
		.mp-band { color: #5b6670; font-weight: 400; }
		.mp-calnote { font-size: 8.5pt; font-weight: 700; color: #8a5a12; margin-top: 3pt; }
		.mp-calnote.over { color: #9a2a2a; }
		.mp-summary { break-inside: avoid; margin-top: 8pt; border-top: 1.5pt solid var(--accent); padding-top: 5pt; }
		.mp-summary b { color: var(--primary); }

		.mp-aisle { break-inside: avoid; margin-bottom: 8pt; }
		.mp-aisle h3 { font-size: 10.5pt; color: var(--primary); margin: 0 0 3pt; border-bottom: 1pt solid var(--line); padding-bottom: 2pt; }
		.mp-shop { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 16pt; }
		.mp-shop li { display: flex; align-items: center; gap: 5pt; break-inside: avoid; margin-bottom: 2.5pt; font-size: 9pt; }
		.mp-shop li.pantry { color: #8a929a; }
		.mp-box { width: 9pt; height: 9pt; border: 1pt solid #5b6670; border-radius: 2pt; flex: none; }
		.mp-it { flex: 1; }
		.mp-qt { font-weight: 600; }
		.mp-exact { font-weight: 400; color: #8a929a; font-size: 7.5pt; }

		.mp-note { background: var(--accent-soft); color: var(--primary); border-radius: 5pt; padding: 4pt 7pt; font-size: 8.5pt; margin-top: 8pt; }
		.mp-disc { font-size: 7.5pt; color: #8a929a; margin-top: 8pt; line-height: 1.4; }
	}
</style>
