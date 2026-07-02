<script lang="ts">
	// Weekly meal-planner UI. LANDING view (shared ProfilePanel + nutrient focus + Generate) and an
	// EDITABLE RESULT view: each meal is a card (mirrors the workout cards) with corner swap + delete icons;
	// opening it shows the meal's full nutrition facts (macros + micros) and the ingredient rows, each with a
	// FoodImage icon + per-row swap + delete; added foods sit in the same list. A picker adds single
	// ingredients (by piece, with the approximate grams) or whole recipes to a meal or as a new meal. Dish +
	// ingredient swaps are calorie-preserving. The deterministic planWeek engine is untouched - all edits are
	// overlays on the persisted plan (planning/37). The week persists to localStorage and never auto-regens.

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { t, type Locale } from '$lib/i18n';
	import ProfilePanel from '$lib/ProfilePanel.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import FoodImage from '$lib/FoodImage.svelte';
	import Modal from '$lib/Modal.svelte';
	import { L, type Loc } from '$lib/content/data';
	import { recipes as ALL_RECIPES, getRecipe, type Mealtime } from '$lib/content/recipes';
	import { ingredients as ALL_INGREDIENTS, getIngredient, type Ingredient, type IngredientRole } from '$lib/content/ingredients';
	import { recipeImage, ingredientImage } from '$lib/recipe-images';
	import { estimateEnergy } from '$lib/engine/engine';
	import { planWeek, batchPlanWeek, eligibleRecipes, memberKcal, computePlanHash, isOmnivoreProfile, SUBSTITUTE_RECIPE_IDS, type WeekPlan, type PlanMeal, type AddedFood } from '$lib/engine/meal-planner';
	import { householdServingCap } from '$lib/nutrition/constants';
	import { dietAnnotations, type NutrientChip } from '$lib/recipe-filters';
	import { ingredientSwapOptions } from '$lib/ingredient-swap';
	import {
		mealMacros, mealFacts, mealMicros, mealWeight, dayTotals, dayMicros, dayCalorieStatus, weekMicros,
		kcalMatchedServings, kcalMatchedGrams, effectiveIngredients, microContributors, weekMicroContributors,
		isLeftoverMeal, TRACKED_MICROS, type MicroKey
	} from '$lib/nutrition/day-totals';
	import { microLimits, weeklyMicroBand } from '$lib/nutrition/micro-limits';
	import { optimizeWeek } from '$lib/engine/optimizer';
	import { PIECE_GRAMS, isCountable, piecesToGrams } from '$lib/nutrition/piece-weights';
	import { householdAmount, UNIT_LABELS } from '$lib/nutrition/household-units';
	import { profile } from '$lib/profile.svelte';
	import { saveMeal } from '$lib/saved.svelte';
	import { currentPlan, planSettingsSig } from '$lib/plan.svelte';
	import { DAY_NAMES, MICRO_LABELS, MIC, microUnit, microImg } from '$lib/nutrition-labels';

	let {
		lang,
		week = $bindable(null),
		density = $bindable('full')
	}: {
		lang: Locale;
		week?: WeekPlan | null;
		density?: 'compact' | 'full';
	} = $props();
	const T = (k: string) => t(lang, k);
	const nf = (n: number) => new Intl.NumberFormat(lang).format(Math.round(n));
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
	const nf1 = (n: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
	const energy = $derived(estimateEnergy(profile));

	let view = $state<'landing' | 'result'>('landing');
	let activeDay = $state(0);
	let seedOffset = $state(0);
	let nutrients = $state<NutrientChip[]>([]);
	let dishSwapIdx = $state<Record<string, number>>({});
	let ingSwapIdx = $state<Record<string, number>>({});
	let infoIng = $state<Ingredient | null>(null);
	let infoMicro = $state<MicroKey | null>(null);

	// Weekly micronutrient totals + per-nutrient band (low/good/high vs the official weekly range). The flag
	// reflects the WHOLE WEEK, so a single heavy or light day that balances out is not flagged.
	const wkMicros = $derived(week ? weekMicros(week.days) : null);
	const microLim = $derived(microLimits(profile.age, profile.sex, profile.pregnant));
	// `div` divides the weekly intake (per-person food micros / N); `tmul` multiplies the target/UL (whole-
	// household view, where the food is for N people so the target scales too). Both keep the % near 100%.
	const microBandOf = (k: MicroKey, div = 1, tmul = 1) => (wkMicros
		? weeklyMicroBand(wkMicros[k] / div, microLim.target[k] * tmul, microLim.ul[k] ? microLim.ul[k] * tmul : microLim.ul[k])
		: 'good');

	// Shared label maps (nutrition-labels.ts) - one source across planner / snapshot / PDF (audit M5).
	const dayNames = DAY_NAMES;
	const lbl: Record<string, Loc> = {
		title: { en: 'Weekly meal plan', fi: 'Viikon ateriasuunnitelma', hu: 'Heti étrend', sv: 'Veckans matplan' },
		resultTitle: { en: 'Your nutrition plan', fi: 'Ravitsemussuunnitelmasi', hu: 'A táplálkozási terved', sv: 'Din nutritionsplan' },
		generate: { en: 'Generate my nutrition plan', fi: 'Luo ravitsemussuunnitelmani', hu: 'Készítsd el a táplálkozási tervem', sv: 'Skapa min nutritionsplan' },
		targetConflictShort: {
			en: 'Your custom targets in "Advanced: set your own targets" do not fit together. Adjust them to continue.',
			fi: 'Omat tavoitteesi kohdassa "Lisäasetukset: omat tavoitteet" eivät sovi yhteen. Säädä niitä jatkaaksesi.',
			hu: 'A saját céljaid a "Haladó: saját célok" résznél nem illenek össze. Módosítsd őket a folytatáshoz.',
			sv: 'Dina egna mål under "Avancerat: egna mål" går inte ihop. Justera dem för att fortsätta.'
		},
		regenerate: { en: 'Regenerate', fi: 'Luo uudelleen', hu: 'Újragenerálás', sv: 'Skapa nytt' },
		cookMode: { en: 'Cooking style', fi: 'Ruoanlaiton tyyli', hu: 'Főzési stílus', sv: 'Matlagningsstil' },
		smartCooking: { en: 'Smart cooking', fi: 'Fiksu ruoanlaitto', hu: 'Okos főzés', sv: 'Smart matlagning' },
		precisePortions: { en: 'Precise portions', fi: 'Tarkat annokset', hu: 'Pontos adagok', sv: 'Exakta portioner' },
		smartHint: { en: 'Cook a few dishes, eat leftovers - less cooking, less waste.', fi: 'Valmista muutama ruoka, syö tähteet - vähemmän ruoanlaittoa ja hävikkiä.', hu: 'Főzz néhány ételt, edd a maradékot - kevesebb főzés és kevesebb hulladék.', sv: 'Laga några rätter, ät rester - mindre matlagning och svinn.' },
		cookSessions: { en: 'How often you cook', fi: 'Kuinka usein kokkaat', hu: 'Milyen gyakran főzöl', sv: 'Hur ofta du lagar mat' },
		sessMin: { en: 'Minimal', fi: 'Vähän', hu: 'Minimális', sv: 'Minimalt' },
		sessBal: { en: 'Balanced', fi: 'Tasapainoinen', hu: 'Kiegyensúlyozott', sv: 'Balanserat' },
		sessMax: { en: 'I enjoy cooking', fi: 'Pidän kokkaamisesta', hu: 'Szeretek főzni', sv: 'Jag gillar att laga mat' },
		leftover: { en: 'Leftover', fi: 'Tähteet', hu: 'Maradék', sv: 'Rester' },
		leftoverHint: { en: 'Cooked once and eaten across these days. Ingredient changes apply to the whole batch.', fi: 'Valmistettu kerran ja syöty näinä päivinä. Ainesosamuutokset koskevat koko satsia.', hu: 'Egyszer megfőzve, több napon át elfogyasztva. A hozzávalók módosítása az egész adagra érvényes.', sv: 'Lagad en gång och äts under dessa dagar. Ändringar av ingredienser gäller hela satsen.' },
		dailySupps: { en: 'Daily supplements', fi: 'Päivittäiset lisäravinteet', hu: 'Napi étrend-kiegészítők', sv: 'Dagliga tillskott' },
		backToPlan: { en: 'Back to your plan', fi: 'Takaisin suunnitelmaan', hu: 'Vissza a tervhez', sv: 'Tillbaka till planen' },
		save: { en: 'Save plan', fi: 'Tallenna suunnitelma', hu: 'Terv mentése', sv: 'Spara plan' },
		saved: { en: 'Saved', fi: 'Tallennettu', hu: 'Mentve', sv: 'Sparad' },
		print: { en: 'Save PDF', fi: 'Tallenna PDF', hu: 'PDF mentése', sv: 'Spara PDF' },
		shopping: { en: 'Shopping list', fi: 'Ostoslista', hu: 'Bevásárlólista', sv: 'Inköpslista' },
		back: { en: 'Back', fi: 'Takaisin', hu: 'Vissza', sv: 'Tillbaka' },
		compact: { en: 'Compact', fi: 'Tiivis', hu: 'Tömör', sv: 'Kompakt' },
		full: { en: 'Full', fi: 'Täysi', hu: 'Teljes', sv: 'Fullständig' },
		printStyle: { en: 'Print detail', fi: 'Tulosteen tarkkuus', hu: 'Nyomtatás részletei', sv: 'Utskriftsnivå' },
		nutrients: { en: 'Nutrient focus', fi: 'Ravintoainepainotus', hu: 'Tápanyag-fókusz', sv: 'Näringsfokus' },
		highProtein: { en: 'High protein', fi: 'Runsasproteiininen', hu: 'Magas fehérje', sv: 'Proteinrik' },
		highFibre: { en: 'High fibre', fi: 'Runsaskuituinen', hu: 'Magas rost', sv: 'Fiberrik' },
		lowCal: { en: 'Low calorie', fi: 'Vähäkalorinen', hu: 'Alacsony kalória', sv: 'Lågkalori' },
		lowCarb: { en: 'Low carb', fi: 'Vähähiilihydraattinen', hu: 'Alacsony szénhidrát', sv: 'Lågkolhydrat' },
		targetsTitle: { en: 'Your daily targets', fi: 'Päivittäiset tavoitteesi', hu: 'Napi céljaid', sv: 'Dina dagliga mål' },
		servings: { en: 'servings', fi: 'annosta', hu: 'adag', sv: 'portioner' },
		swap: { en: 'Swap', fi: 'Vaihda', hu: 'Csere', sv: 'Byt' },
		remove: { en: 'Remove', fi: 'Poista', hu: 'Eltávolítás', sv: 'Ta bort' },
		ingredients: { en: 'Ingredients', fi: 'Ainekset', hu: 'Hozzávalók', sv: 'Ingredienser' },
		steps: { en: 'Steps', fi: 'Vaiheet', hu: 'Lépések', sv: 'Steg' },
		per100g: { en: 'Per 100 g', fi: 'Per 100 g', hu: '100 g-onként', sv: 'Per 100 g' },
		mealFacts: { en: 'Meal nutrition', fi: 'Aterian ravinto', hu: 'Étkezés tápértéke', sv: 'Måltidens näring' },
		dayFacts: { en: 'Day nutrition facts', fi: 'Päivän ravintosisältö', hu: 'Napi tápérték', sv: 'Dagens näringsvärden' },
		tooLow: { en: 'too low', fi: 'liian vähän', hu: 'túl kevés', sv: 'för lågt' },
		tooHigh: { en: 'too high', fi: 'liian paljon', hu: 'túl sok', sv: 'för högt' },
		weekTotal: { en: 'This week', fi: 'Tällä viikolla', hu: 'Ezen a héten', sv: 'Denna vecka' },
		weekAbbr: { en: 'wk', fi: 'vko', hu: 'hét', sv: 'v' },
		dayWeekHint: { en: 'Big number = today. wk% = whole week vs target (the colour follows the week).', fi: 'Iso luku = tänään. vko% = koko viikko vs tavoite (väri seuraa viikkoa).', hu: 'A nagy szám = ma. hét% = az egész hét a célhoz képest (a szín a hetet követi).', sv: 'Stora siffran = idag. v% = hela veckan mot mål (färgen följer veckan).' },
		weekRange: { en: 'Recommended for the week', fi: 'Suositus viikolle', hu: 'Heti ajánlás', sv: 'Rekommenderat för veckan' },
		today: { en: 'Today', fi: 'Tänään', hu: 'Ma', sv: 'Idag' },
		sourcesToday: { en: "Today's sources", fi: 'Tämän päivän lähteet', hu: 'Mai források', sv: 'Dagens källor' },
		sourcesWeek: { en: "This week's sources", fi: 'Viikon lähteet', hu: 'A hét forrásai', sv: 'Veckans källor' },
		supplementLabel: { en: 'Supplement', fi: 'Lisäravinne', hu: 'Étrend-kiegészítő', sv: 'Kosttillskott' },
		microExplain: {
			en: 'Colors compare your whole week of intake to the recommended amount and the safe upper limit - not a single day. A high or low day is fine when the week balances out. Targets are general references for healthy adults, not medical advice.',
			fi: 'Värit vertaavat koko viikkosi saantia suositukseen ja turvalliseen ylärajaan - eivät yhtä päivää. Yksittäinen korkea tai matala päivä on ok, kun viikko tasoittuu. Tavoitteet ovat yleisiä viitearvoja terveille aikuisille, eivät lääketieteellistä neuvontaa.',
			hu: 'A színek a teljes heti beviteledet hasonlítják az ajánlott mennyiséghez és a biztonságos felső határhoz - nem egyetlen napot. Egy magas vagy alacsony nap rendben van, ha a hét kiegyenlítődik. A célok általános referenciaértékek egészséges felnőtteknek, nem orvosi tanács.',
			sv: 'Färgerna jämför hela veckans intag med rekommenderad mängd och den säkra övre gränsen - inte en enskild dag. En hög eller låg dag är okej när veckan jämnar ut sig. Målen är allmänna referensvärden för friska vuxna, inte medicinsk rådgivning.'
		},
		factsHead: { en: 'Nutrition facts', fi: 'Ravintosisältö', hu: 'Tápértékek', sv: 'Näringsvärden' },
		energy: { en: 'Energy', fi: 'Energia', hu: 'Energia', sv: 'Energi' },
		lfFat: { en: 'Fat', fi: 'Rasva', hu: 'Zsír', sv: 'Fett' },
		lfCarbs: { en: 'Carbohydrate', fi: 'Hiilihydraatti', hu: 'Szénhidrát', sv: 'Kolhydrater' },
		lfFibre: { en: 'Fibre', fi: 'Kuitu', hu: 'Rost', sv: 'Fiber' },
		lfProtein: { en: 'Protein', fi: 'Proteiini', hu: 'Fehérje', sv: 'Protein' },
		sugars: { en: 'of which sugars', fi: 'josta sokereita', hu: 'amelyből cukrok', sv: 'varav sockerarter' },
		salt: { en: 'Salt', fi: 'Suola', hu: 'Só', sv: 'Salt' },
		micros: { en: 'Vitamins and minerals', fi: 'Vitamiinit ja kivennäisaineet', hu: 'Vitaminok és ásványi anyagok', sv: 'Vitaminer och mineraler' },
		empty: { en: 'Empty slot. Add a food to fill it.', fi: 'Tyhjä paikka. Lisää ruoka täyttääksesi sen.', hu: 'Üres hely. Adj hozzá ételt.', sv: 'Tom plats. Lägg till mat för att fylla den.' },
		addedMeal: { en: 'Added', fi: 'Lisätty', hu: 'Hozzáadva', sv: 'Tillagt' },
		supplement: { en: 'Supplement', fi: 'Lisäravinne', hu: 'Étrend-kiegészítő', sv: 'Kosttillskott' },
		supplementNote: {
			en: 'Added to help reach the weekly reference intake, since the food in the plan falls short. General information, not medical advice.',
			fi: 'Lisätty auttamaan viikon viitesaannin saavuttamisessa, koska suunnitelman ruoka jää vajaaksi. Yleistä tietoa, ei lääketieteellistä neuvontaa.',
			hu: 'Azért került hozzáadásra, hogy segítsen elérni a heti referenciabevitelt, mivel a terv étele elmarad attól. Általános információ, nem orvosi tanács.',
			sv: 'Tillagt för att hjälpa till att nå veckans referensintag, eftersom maten i planen inte räcker. Allmän information, inte medicinsk rådgivning.'
		},
		calciumNote: {
			en: 'We do not suggest a calcium supplement. Calcium from food is well supported, but calcium in pill form has been linked in some research to a possible increase in cardiovascular risk (the evidence is debated), so a low-calcium day is topped up with a calcium-rich food such as a glass of milk, not a pill. General information, not medical advice.',
			fi: 'Emme suosittele kalsiumlisää. Ruoasta saatava kalsium on hyvin tuettua, mutta tablettimuotoinen kalsium on joissakin tutkimuksissa yhdistetty mahdolliseen sydän- ja verisuoniriskin kasvuun (näyttö on kiistanalaista), joten vähäkalsiuminen päivä täydennetään kalsiumpitoisella ruoalla, kuten lasillisella maitoa, ei tabletilla. Yleistä tietoa, ei lääketieteellistä neuvontaa.',
			hu: 'Nem javaslunk kalcium-kiegészítőt. Az ételből származó kalcium jól alátámasztott, de a tabletta formájú kalciumot egyes kutatások a szív- és érrendszeri kockázat lehetséges növekedésével hozták összefüggésbe (a bizonyíték vitatott), ezért az alacsony kalciumtartalmú napot kalciumban gazdag étellel, például egy pohár tejjel pótoljuk, nem tablettával. Általános információ, nem orvosi tanács.',
			sv: 'Vi föreslår inget kalciumtillskott. Kalcium från mat är väl underbyggt, men kalcium i tablettform har i viss forskning kopplats till en möjlig ökning av kardiovaskulär risk (bevisen är omdebatterade), så en kalciumfattig dag fylls på med en kalciumrik mat som ett glas mjölk, inte en tablett. Allmän information, inte medicinsk rådgivning.'
		},
		addedTag: { en: 'added', fi: 'lisätty', hu: 'hozzáadva', sv: 'tillagt' },
		addFood: { en: 'Add food', fi: 'Lisää ruoka', hu: 'Étel hozzáadása', sv: 'Lägg till mat' },
		addMeal: { en: 'Add a meal', fi: 'Lisää ateria', hu: 'Étkezés hozzáadása', sv: 'Lägg till måltid' },
		searchFood: { en: 'Search foods and recipes...', fi: 'Hae ruokia ja reseptejä...', hu: 'Keress ételeket és recepteket...', sv: 'Sök mat och recept...' },
		pieces: { en: 'Pieces', fi: 'Kappaletta', hu: 'Darab', sv: 'Stycken' },
		grams: { en: 'Grams', fi: 'Grammaa', hu: 'Gramm', sv: 'Gram' },
		add: { en: 'Add', fi: 'Lisää', hu: 'Hozzáad', sv: 'Lägg till' },
		noFoods: { en: 'No matches', fi: 'Ei osumia', hu: 'Nincs találat', sv: 'Inga träffar' },
		dayTotal: { en: 'Day total', fi: 'Päivän yhteensä', hu: 'Napi összesen', sv: 'Dagens totalt' },
		target: { en: 'Target', fi: 'Tavoite', hu: 'Cél', sv: 'Mål' },
		waterTarget: { en: 'water', fi: 'vesi', hu: 'víz', sv: 'vatten' },
		weight: { en: 'weight', fi: 'paino', hu: 'tömeg', sv: 'vikt' },
		roundOut: { en: 'Plus, to round out the day', fi: 'Lisäksi päivän täydennykseksi', hu: 'Ráadásként a nap kiegészítésére', sv: 'Plus, för att runda av dagen' },
		portionsStrip: { en: 'Daily share per person', fi: 'Päivittäinen osuus per henkilö', hu: 'Napi adag személyenként', sv: 'Daglig andel per person' },
		you: { en: 'You', fi: 'Sinä', hu: 'Te', sv: 'Du' },
		hhView: { en: 'Show amounts', fi: 'Näytä määrät', hu: 'Mennyiségek', sv: 'Visa mängder' },
		hhPerson: { en: 'Per person', fi: 'Per henkilö', hu: 'Személyenként', sv: 'Per person' },
		hhWhole: { en: 'Whole household', fi: 'Koko ruokakunta', hu: 'Egész háztartás', sv: 'Hela hushållet' },
		hhPersonNote: {
			en: 'Amounts shown per person. Your shopping list and recipes are scaled to feed your household ({n} people).',
			fi: 'Määrät näytetään per henkilö. Ostoslistasi ja reseptisi on skaalattu ruokakuntasi mukaan ({n} henkilöä).',
			hu: 'A mennyiségek személyenként jelennek meg. A bevásárlólistád és a receptek a háztartásodra ({n} fő) vannak méretezve.',
			sv: 'Mängderna visas per person. Din inköpslista och dina recept är skalade för ditt hushåll ({n} personer).'
		},
		hhWholeNote: {
			en: 'Amounts shown for your whole household ({n} people). Switch to per person for one plate.',
			fi: 'Määrät näytetään koko ruokakunnalle ({n} henkilöä). Vaihda per henkilö nähdäksesi yhden annoksen.',
			hu: 'A mennyiségek az egész háztartásra ({n} fő) jelennek meg. Válts a személyenkéntire egy adaghoz.',
			sv: 'Mängderna visas för hela hushållet ({n} personer). Byt till per person för en portion.'
		},
		calLow: { en: 'This day is well under your calorie target.', fi: 'Tämä päivä jää selvästi alle kaloritavoitteesi.', hu: 'Ez a nap jóval a kalóriacélod alatt van.', sv: 'Den här dagen ligger klart under ditt kalorimål.' },
		calOver: { en: 'This is over your set calorie target.', fi: 'Tämä ylittää asettamasi kaloritavoitteen.', hu: 'Ez meghaladja a beállított kalóriacélodat.', sv: 'Detta överstiger ditt inställda kalorimål.' },
		warnRelaxed: { en: 'Some nutrient filters were relaxed to fill the week.', fi: 'Joitakin ravintoainesuodattimia löysättiin viikon täyttämiseksi.', hu: 'Néhány tápanyagszűrőt lazítani kellett a hét kitöltéséhez.', sv: 'Vissa näringsfilter lättades för att fylla veckan.' },
		warnEmpty: { en: 'Some meal slots could not be filled.', fi: 'Joitakin aterioita ei voitu täyttää.', hu: 'Néhány étkezést nem sikerült kitölteni.', sv: 'Vissa måltider kunde inte fyllas.' },
		warnKcal: { en: 'Some days fall outside the calorie target band.', fi: 'Jotkin päivät jäävät kaloritavoitteen ulkopuolelle.', hu: 'Néhány nap a kalóriacél sávján kívül esik.', sv: 'Vissa dagar hamnar utanför kaloriintervallet.' },
		warnProtein: { en: 'Protein falls short on some days.', fi: 'Proteiini jää vajaaksi joinakin päivinä.', hu: 'A fehérje néhány napon elmarad.', sv: 'Proteinet är lågt vissa dagar.' },
		pickCategory: { en: 'Choose a category', fi: 'Valitse kategoria', hu: 'Válassz kategóriát', sv: 'Välj en kategori' },
		catCourses: { en: 'Meal courses', fi: 'Ateriat', hu: 'Fogások', sv: 'Måltider' },
		catGroups: { en: 'Food groups', fi: 'Ruokaryhmät', hu: 'Élelmiszercsoportok', sv: 'Livsmedelsgrupper' },
		catSupplements: { en: 'Supplements', fi: 'Lisäravinteet', hu: 'Étrend-kiegészítők', sv: 'Kosttillskott' },
		searchAll: { en: 'or search everything', fi: 'tai hae kaikkea', hu: 'vagy keress mindenben', sv: 'eller sök i allt' },
		amount: { en: 'Amount', fi: 'Määrä', hu: 'Mennyiség', sv: 'Mängd' }
	};
	// Add-a-meal category picker label maps.
	const courseLbl: Record<Mealtime, Loc> = {
		breakfast: { en: 'Breakfast', fi: 'Aamiainen', hu: 'Reggeli', sv: 'Frukost' },
		lunch: { en: 'Lunch', fi: 'Lounas', hu: 'Ebéd', sv: 'Lunch' },
		dinner: { en: 'Dinner', fi: 'Päivällinen', hu: 'Vacsora', sv: 'Middag' },
		snack: { en: 'Snack', fi: 'Välipala', hu: 'Nasi', sv: 'Mellanmål' }
	};
	const roleLbl: Record<string, Loc> = {
		fruit: { en: 'Fruits', fi: 'Hedelmät', hu: 'Gyümölcsök', sv: 'Frukter' },
		vegetable: { en: 'Vegetables', fi: 'Vihannekset', hu: 'Zöldségek', sv: 'Grönsaker' },
		protein: { en: 'Proteins', fi: 'Proteiinit', hu: 'Fehérjék', sv: 'Proteiner' },
		carb: { en: 'Grains & starches', fi: 'Viljat ja tärkkelys', hu: 'Gabonák és keményítők', sv: 'Spannmål och stärkelse' },
		dairy: { en: 'Dairy', fi: 'Maitotuotteet', hu: 'Tejtermékek', sv: 'Mejeri' },
		legume: { en: 'Legumes', fi: 'Palkokasvit', hu: 'Hüvelyesek', sv: 'Baljväxter' },
		fat: { en: 'Fats & oils', fi: 'Rasvat ja öljyt', hu: 'Zsírok és olajok', sv: 'Fetter och oljor' },
		liquid: { en: 'Drinks', fi: 'Juomat', hu: 'Italok', sv: 'Drycker' }
	};
	const COURSE_CATS: Mealtime[] = ['breakfast', 'lunch', 'dinner', 'snack'];
	const ROLE_CATS: IngredientRole[] = ['fruit', 'vegetable', 'protein', 'carb', 'dairy', 'legume', 'fat', 'liquid'];
	const micL = MICRO_LABELS; // shared (nutrition-labels.ts, audit M5)
	const supOf = (meal: PlanMeal) => (meal.additions ?? []).find((a) => a.kind === 'supplement') as Extract<AddedFood, { kind: 'supplement' }> | undefined;
	const warnLabel: Record<string, keyof typeof lbl> = {
		'relaxed-nutrients': 'warnRelaxed', 'empty-slot': 'warnEmpty', 'kcal-off': 'warnKcal', 'protein-low': 'warnProtein'
	};
	const nutrientChips: { v: NutrientChip; k: string }[] = [
		{ v: 'high-protein', k: 'highProtein' }, { v: 'high-fibre', k: 'highFibre' },
		{ v: 'low-cal', k: 'lowCal' }, { v: 'low-carb', k: 'lowCarb' }
	];

	// A2: friendly "(2 kpl)" / "(1.5 rkl)" hint next to grams; '' when no sensible household unit (grams only).
	function hhLabel(id: string, grams: number): string {
		const a = householdAmount(id, grams);
		if (!a) return '';
		return ` (${nf1(a.count)} ${L(UNIT_LABELS[a.unit] ?? { en: a.unit }, lang)})`;
	}

	// Leftover badge is computed inline in the result template (batch mode only) via isLeftoverMeal:
	// "same dish in the same slot on the previous day" (audit C1/P2). Replaces the old firstCookDay map.

	// Clamp numeric inputs to their valid ranges so a cleared or out-of-range field can never silently
	// produce a wrong plan (2026-07 audit M2: a cleared weight binds null, 10*null = 0, and the target
	// collapsed to the sex floor with no warning). Mirrors the workout page's clamp + migrate()'s ranges;
	// written back to the profile so the form shows the value the plan was actually built from.
	const clampN = (v: unknown, lo: number, hi: number, d: number) => {
		const n = Number(v);
		return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
	};
	let generating = $state(false);
	function generate() {
		if (generating) return;
		const run = () => {
			try {
				profile.age = clampN(profile.age, 14, 100, 30);
				profile.weightKg = clampN(profile.weightKg, 30, 300, 75);
				profile.heightCm = clampN(profile.heightCm, 100, 250, 175);
				const energy = estimateEnergy(profile);
				// Hard block (planning/54 D3): never build a plan from physically impossible custom targets (the
				// macros need more kcal than the calorie cap). The profile panel shows what to fix; the button is also
				// disabled, this is the belt-and-suspenders guard.
				if (energy.targetConflict) return;
				dishSwapIdx = {}; ingSwapIdx = {};
				// Fresh seed EVERY generate (planning/43): same settings keep the same calorie/nutrition target fit,
				// but the actual recipes differ each time. Variety is mandatory, so we do not reuse a fixed seed.
				seedOffset = (browser ? (Math.floor(Math.random() * 0x7fffffff) >>> 0) : seedOffset + 1);
				const seed = (profile.profileSeed * 31 + profile.planSeedOffset + seedOffset) >>> 0;
				// Smart cooking (batch) vs Precise portions. Batch cooks a few dishes + leftovers; precise is the
				// original one-dish-per-slot planner. Both yield the same WeekPlan shape; optimizeWeek then polishes
				// (calorie-aware micros + a HARD calorie band; never overshoots, flags micros it cannot fit in band).
				week = profile.cookingMode === 'batch'
					? batchPlanWeek({ profile, energy, seed })
					: planWeek({ profile, energy, nutrientFilters: nutrients, seed });
				week = optimizeWeek(week, profile, energy).week;
				// Hold the working plan in memory only (temporary by default); record the settings signature it was
				// generated under so a later settings change invalidates it. NOT written to localStorage.
				currentPlan.week = week;
				currentPlan.sig = planSettingsSig(profile);
				activeDay = 0;
				view = 'result';
			} finally {
				generating = false;
			}
		};
		// Busy state + a paint before the heavy synchronous work (audit M5): on a slow phone Generate can
		// take seconds; without this the button gives no feedback and looks dead (the old "does nothing" class).
		generating = true;
		if (browser && typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(run));
		else run();
	}
	function regenerate() { generate(); }
	function back() { view = 'landing'; }
	let justSaved = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	function savePlan() {
		if (!week) return;
		saveMeal(new Date().toLocaleDateString(lang), week);
		justSaved = true;
		clearTimeout(savedTimer); // repeated saves no longer race the reset
		savedTimer = setTimeout(() => (justSaved = false), 2000);
	}

	onMount(() => {
		if (!browser) return;
		// Restore the in-memory working plan across in-app navigation ONLY if it still matches the current
		// settings. A full page reload starts fresh on the landing (temporary by default). No localStorage.
		if (currentPlan.week && currentPlan.sig === planSettingsSig(profile)) {
			week = currentPlan.week;
			view = 'result';
		}
	});
	// Plan lifecycle (planning/43): the plan is TEMPORARY and lives only in memory. Settings are edited ONLY on
	// the landing view (the profile panel is not shown in the result view), and every Generate/Regenerate builds
	// a fresh plan from the CURRENT settings - so a stale plan can never be shown. We deliberately do NOT auto-
	// regenerate from a reactive $effect: an effect that calls generate() (which writes state it also reads)
	// destabilises Svelte's scheduler and made the Generate button fire only intermittently. onMount restores an
	// in-memory plan across in-app navigation only when its settings signature still matches.
	function toggleNutrient(c: NutrientChip) {
		nutrients = nutrients.includes(c) ? nutrients.filter((x) => x !== c) : [...nutrients, c];
	}

	// After any edit: recompute every day's totals from the (edited) meals + round-out, refresh the plan hash
	// so the shopping list + its check-off stay coherent, and reassign `week` to trigger reactivity + persist.
	function refresh() {
		if (!week) return;
		for (const day of week.days) day.totals = dayTotals(day);
		week.meta.planHash = computePlanHash(week.meta.seed, profile, week.days);
		week = week;
		currentPlan.week = week; // keep the in-memory store (used by shopping + print) in sync with edits
	}

	// --- dish swap (calorie-preserving) -------------------------------------
	function swapMeal(slotIdx: number) {
		if (!week) return;
		const meal = week.days[activeDay].meals[slotIdx];
		if (!meal.recipeId) return;
		const cur = getRecipe(meal.recipeId);
		if (!cur) return;
		// Mirror the optimizer's swap rules (2026-07 audit L3/H3): never create a same-day duplicate dish,
		// never cycle a vegan substitute-protein dish onto an omnivore's plan, and cap the kcal-matched
		// servings at the HOUSEHOLD cap (the solo cap of 3 silently dropped most of a household dish's kcal).
		const omnivore = isOmnivoreProfile(profile);
		const usedToday = new Set(
			week.days[activeDay].meals.flatMap((m, i) => (i !== slotIdx && m.recipeId ? [m.recipeId] : []))
		);
		const cands = eligibleRecipes(profile).filter((r) =>
			r.id !== cur.id && !usedToday.has(r.id) && !(omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id)) &&
			r.course.some((c) => cur.course.includes(c))
		);
		if (cands.length < 1) return;
		const key = `${activeDay}-${slotIdx}`;
		const next = ((dishSwapIdx[key] ?? -1) + 1) % cands.length;
		dishSwapIdx = { ...dishSwapIdx, [key]: next };
		const pick = cands[next];
		const s = kcalMatchedServings(meal.kcal, pick.nutritionPerServing.energy_kcal, householdServingCap(week.meta.householdScale));
		const n = pick.nutritionPerServing;
		week.days[activeDay].meals[slotIdx] = {
			slotKey: meal.slotKey, recipeId: pick.id, servings: s,
			kcal: Math.round(n.energy_kcal * s), protein: Math.round(n.protein_g * s),
			carbs: Math.round(n.carbohydrates_g * s), fat: Math.round(n.fat_g * s), fiber: Math.round(n.fiber_g * s),
			additions: meal.additions // keep added foods; ingredient edits belonged to the old recipe so are dropped
		};
		refresh();
	}
	function removeMeal(slotIdx: number) {
		if (!week) return;
		week.days[activeDay].meals.splice(slotIdx, 1);
		refresh();
	}

	// --- per-ingredient swap / remove (recipe ingredients) ------------------
	function recipeRows(meal: PlanMeal) {
		if (!meal.recipeId) return [] as { originalId: string; displayId: string; grams: number }[];
		const r = getRecipe(meal.recipeId);
		if (!r) return [];
		const base = r.base_servings || 1;
		const scale = meal.servings / base;
		const edits = meal.ingredientEdits ?? [];
		const rows: { originalId: string; displayId: string; grams: number }[] = [];
		for (const ing of r.ingredients) {
			const e = edits.find((x) => x.originalId === ing.ingredientId);
			if (e?.removed) continue;
			rows.push({ originalId: ing.ingredientId, displayId: e?.swapToId ?? ing.ingredientId, grams: (e?.grams ?? ing.grams) * scale });
		}
		return rows;
	}
	function swapIngredient(slotIdx: number, originalId: string) {
		if (!week) return;
		const meal = week.days[activeDay].meals[slotIdx];
		const r = meal.recipeId ? getRecipe(meal.recipeId) : null;
		const recIng = r?.ingredients.find((x) => x.ingredientId === originalId);
		if (!recIng) return;
		// Stable cycle (planning/43 E): exclude is the recipe's OTHER ORIGINAL ingredients (not the
		// swapped-to value), so the option list does not shift between clicks and the index cycles cleanly
		// through every alternative with no immediate repeat. Avoided foods are never offered.
		const others = (r?.ingredients ?? []).map((x) => x.ingredientId).filter((id) => id !== originalId);
		// profile passed so every offered swap respects diet/allergen/FODMAP settings (audit C1)
		const opts = ingredientSwapOptions(originalId, others, profile.dislikedIngredientIds, profile);
		if (!opts.length) return;
		const key = `${activeDay}-${slotIdx}-${originalId}`;
		const next = (ingSwapIdx[key] ?? -1) + 1;
		ingSwapIdx = { ...ingSwapIdx, [key]: next };
		const toId = opts[next % opts.length].id;
		const from = getIngredient(originalId), to = getIngredient(toId);
		const origKcal = ((from?.per100g.energy_kcal ?? 0) * recIng.grams) / 100; // per-base
		const grams = from && to ? kcalMatchedGrams(origKcal, to.per100g.energy_kcal, recIng.grams) : recIng.grams;
		meal.ingredientEdits = [...(meal.ingredientEdits ?? []).filter((e) => e.originalId !== originalId), { originalId, swapToId: toId, grams }];
		propagateLeftoverEdits(slotIdx);
		refresh();
	}
	function removeIngredient(slotIdx: number, originalId: string) {
		if (!week) return;
		const meal = week.days[activeDay].meals[slotIdx];
		meal.ingredientEdits = [...(meal.ingredientEdits ?? []).filter((e) => e.originalId !== originalId), { originalId, removed: true }];
		propagateLeftoverEdits(slotIdx);
		refresh();
	}

	// Batch mode (2026-07 audit M-C): a leftover run is ONE pot cooked once, so an ingredient edit on any
	// day of the run must apply to the whole consecutive same-dish/same-slot run - otherwise the shopping
	// list buys chicken for two days and turkey for one day of the same stew. Walks backward + forward from
	// the active day and copies the edits (they are per-base-serving, so differing servings are fine).
	function propagateLeftoverEdits(slotIdx: number) {
		if (!week || profile.cookingMode !== 'batch') return;
		const meal = week.days[activeDay].meals[slotIdx];
		if (!meal.recipeId) return;
		const edits = meal.ingredientEdits ? meal.ingredientEdits.map((e) => ({ ...e })) : undefined;
		const apply = (d: number): boolean => {
			const sib = week!.days[d]?.meals.find((m) => m.recipeId === meal.recipeId && m.slotKey === meal.slotKey);
			if (!sib) return false;
			sib.ingredientEdits = edits ? edits.map((e) => ({ ...e })) : undefined;
			return true;
		};
		for (let d = activeDay - 1; d >= 0 && apply(d); d--) { /* walk back */ }
		for (let d = activeDay + 1; d < week.days.length && apply(d); d++) { /* walk forward */ }
	}

	// --- added foods: swap / remove -----------------------------------------
	function swapAddition(slotIdx: number, addIdx: number) {
		if (!week) return;
		const meal = week.days[activeDay].meals[slotIdx];
		const a = (meal.additions ?? [])[addIdx];
		if (!a) return;
		const key = `add-${activeDay}-${slotIdx}-${addIdx}`;
		if (a.kind === 'ingredient') {
			const exclude = effectiveIngredients(meal).map((e) => e.ingredientId).filter((id) => id !== a.ingredientId);
			// profile passed so every offered swap respects diet/allergen/FODMAP settings (audit C1)
			const opts = ingredientSwapOptions(a.ingredientId, exclude, profile.dislikedIngredientIds, profile);
			if (!opts.length) return;
			const next = (ingSwapIdx[key] ?? -1) + 1;
			ingSwapIdx = { ...ingSwapIdx, [key]: next };
			const toId = opts[next % opts.length].id;
			const from = getIngredient(a.ingredientId), to = getIngredient(toId);
			const origKcal = ((from?.per100g.energy_kcal ?? 0) * a.grams) / 100;
			const grams = from && to ? kcalMatchedGrams(origKcal, to.per100g.energy_kcal, a.grams) : a.grams;
			meal.additions![addIdx] = { kind: 'ingredient', ingredientId: toId, grams };
		} else if (a.kind === 'recipe') {
			const cur = getRecipe(a.recipeId);
			// exclude the current recipe from its own swap cycle (audit L2: one click used to be a no-op)
			const cands = cur ? eligibleRecipes(profile).filter((r) => r.id !== cur.id && r.course.some((c) => cur.course.includes(c))) : [];
			if (cands.length < 1) return;
			const next = ((ingSwapIdx[key] ?? -1) + 1) % cands.length;
			ingSwapIdx = { ...ingSwapIdx, [key]: next };
			const pick = cands[next];
			const origKcal = (cur?.nutritionPerServing.energy_kcal ?? 0) * a.servings;
			meal.additions![addIdx] = { kind: 'recipe', recipeId: pick.id, servings: kcalMatchedServings(origKcal, pick.nutritionPerServing.energy_kcal, householdServingCap(week.meta.householdScale)) };
		}
		refresh();
	}
	function removeAddition(slotIdx: number, addIdx: number) {
		if (!week) return;
		const meal = week.days[activeDay].meals[slotIdx];
		meal.additions = (meal.additions ?? []).filter((_, i) => i !== addIdx);
		refresh();
	}

	// --- add-food picker -----------------------------------------------------
	// "+ Add a meal" opens a category step (meal courses / food groups / supplements) plus a free
	// search. Picking a course filters recipes by mealtime; a food group filters ingredients by role;
	// Supplements lists the tracked micros (calcium IS allowed here when added manually by the user).
	type PickCat = { type: 'course'; value: Mealtime } | { type: 'role'; value: IngredientRole } | { type: 'supplement' };
	let pickerTarget = $state<number | 'new' | null>(null); // number = slotIdx, 'new' = new meal, null = closed
	let pickCat = $state<PickCat | null>(null);
	let pickQuery = $state('');
	let pickSel = $state<{ kind: 'ingredient' | 'recipe' | 'supplement'; id: string } | null>(null);
	let pickPieces = $state(1);
	let pickGrams = $state(100);
	let pickServings = $state(1);
	let pickAmount = $state(0);

	const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	const pickResults = $derived.by(() => {
		const q = norm(pickQuery.trim());
		// Free search across everything overrides any chosen category.
		if (q) {
			const ings = ALL_INGREDIENTS
				.filter((i) => norm(L(i.name, lang)).includes(q) || norm(i.id).includes(q))
				.slice(0, 24)
				.map((i) => ({ kind: 'ingredient' as const, id: i.id, name: L(i.name, lang) }));
			const recs = ALL_RECIPES
				.filter((r) => !r.component && norm(L(r.name, lang)).includes(q))
				.slice(0, 12)
				.map((r) => ({ kind: 'recipe' as const, id: r.id, name: L(r.name, lang) }));
			return [...ings, ...recs];
		}
		const cat = pickCat;
		if (cat?.type === 'course') {
			return ALL_RECIPES
				.filter((r) => !r.component && r.mealtimes.includes(cat.value))
				.map((r) => ({ kind: 'recipe' as const, id: r.id, name: L(r.name, lang) }));
		}
		if (cat?.type === 'role') {
			return ALL_INGREDIENTS
				.filter((i) => i.role === cat.value)
				.map((i) => ({ kind: 'ingredient' as const, id: i.id, name: L(i.name, lang) }));
		}
		return [];
	});
	function openPicker(target: number | 'new') {
		pickerTarget = target; pickCat = null; pickQuery = ''; pickSel = null;
		pickPieces = 1; pickGrams = 100; pickServings = 1; pickAmount = 0;
	}
	function selectFood(kind: 'ingredient' | 'recipe', id: string) {
		pickSel = { kind, id };
		if (kind === 'ingredient') {
			pickPieces = 1;
			pickGrams = isCountable(id) ? (PIECE_GRAMS[id] ?? 100) : 100;
		} else {
			pickServings = 1;
		}
	}
	function selectSupplement(k: string) {
		pickSel = { kind: 'supplement', id: k };
		pickAmount = Math.round((microLim.target[k as MicroKey] ?? 0) * 10) / 10;
	}
	const pickGramsShown = $derived.by(() => {
		if (!pickSel || pickSel.kind !== 'ingredient') return 0;
		return isCountable(pickSel.id) ? (piecesToGrams(pickSel.id, pickPieces) ?? pickGrams) : pickGrams;
	});
	// A cleared numeric field binds null; never let NaN/0 into the plan (audit M2 follow-up).
	const posNum = (v: unknown, d: number) => {
		const n = Number(v);
		return Number.isFinite(n) && n > 0 ? n : d;
	};
	function confirmAdd() {
		if (!week || !pickSel || pickerTarget === null) return;
		let addition: AddedFood;
		if (pickSel.kind === 'ingredient') {
			const pieces = Math.max(0.5, posNum(pickPieces, 1));
			const grams = isCountable(pickSel.id) ? (piecesToGrams(pickSel.id, pieces) ?? posNum(pickGrams, 100)) : Math.max(1, Math.round(posNum(pickGrams, 100)));
			addition = { kind: 'ingredient', ingredientId: pickSel.id, grams, pieces: isCountable(pickSel.id) ? pieces : undefined };
		} else if (pickSel.kind === 'recipe') {
			addition = { kind: 'recipe', recipeId: pickSel.id, servings: Math.max(0.5, posNum(pickServings, 1)) };
		} else {
			// basis 'person' (audit M-D): a user-added supplement is a PERSONAL dose - the per-person
			// household view must not divide it (optimizer lines are household-aggregate and are divided).
			addition = { kind: 'supplement', micro: pickSel.id as MicroKey, amount: posNum(pickAmount, 0), basis: 'person' };
		}
		if (pickerTarget === 'new') {
			const day = week.days[activeDay];
			if (addition.kind === 'recipe') {
				const r = getRecipe(addition.recipeId)!; const n = r.nutritionPerServing; const s = addition.servings;
				day.meals.push({ slotKey: 'added', recipeId: r.id, servings: s,
					kcal: Math.round(n.energy_kcal * s), protein: Math.round(n.protein_g * s), carbs: Math.round(n.carbohydrates_g * s), fat: Math.round(n.fat_g * s), fiber: Math.round(n.fiber_g * s) });
			} else if (addition.kind === 'supplement') {
				day.meals.push({ slotKey: 'supplement', recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, additions: [addition] });
			} else {
				day.meals.push({ slotKey: 'added', recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, additions: [addition] });
			}
		} else {
			const meal = week.days[activeDay].meals[pickerTarget];
			meal.additions = [...(meal.additions ?? []), addition];
		}
		pickerTarget = null; pickSel = null;
		refresh();
	}

	const recipeName = (id: string | null) => (id ? L(getRecipe(id)?.name ?? { en: id, fi: id, hu: id, sv: id }, lang) : '');
	// A meal can be a whole RECIPE added as a snack (planner protein-snack lever / "+ add food" -> recipe):
	// the meal itself has no recipeId but its single addition is a recipe. It must render AS a recipe
	// (ingredients + steps), not as a facts-only "single food" card (that made shakes/mousses look like
	// plain ingredients). Returns the added recipe + its servings, or null.
	const addedRecipeOf = (meal: PlanMeal) => {
		if (meal.recipeId) return null;
		const adds = meal.additions ?? [];
		if (adds.length !== 1 || adds[0].kind !== 'recipe') return null;
		const rec = getRecipe(adds[0].recipeId);
		return rec ? { rec, servings: adds[0].servings ?? 1 } : null;
	};
	const ingName = (id: string) => { const d = getIngredient(id); return d ? L(d.name, lang) : id; };
	const ingImg = (id: string) => { const d = getIngredient(id); return ingredientImage(id, d?.role ?? 'other'); };
	const ingAnn = (id: string) => {
		const d = getIngredient(id);
		if (!d) return '';
		const a = dietAnnotations(d, profile.dietaryFilters).map((x) => L(x, lang));
		return a.length ? `(${a.join(', ')})` : '';
	};
	const slotLabel = (meal: PlanMeal) => (meal.slotKey === 'supplement' ? L(lbl.supplement, lang) : meal.slotKey.startsWith('meal_') ? T(meal.slotKey) : L(lbl.addedMeal, lang));
	// A meal with no recipe (built from + Add a meal / round-out) is named after the food in it, not "Added".
	const addedMealName = (meal: PlanMeal) => {
		const names = (meal.additions ?? []).map((a) =>
			a.kind === 'ingredient' ? ingName(a.ingredientId)
				: a.kind === 'recipe' ? recipeName(a.recipeId)
					: L(micL[a.micro] ?? { en: a.micro, fi: a.micro, hu: a.micro, sv: a.micro }, lang));
		return names.length ? names.join(', ') : L(lbl.addedMeal, lang);
	};
	// The card image: a recipe scene for a recipe meal, the food's own cutout for a single-food meal, or the
	// supplement illustration for a supplement.
	const cardImg = (meal: PlanMeal) => {
		if (meal.recipeId) { const rr = getRecipe(meal.recipeId); return rr ? recipeImage(rr) : ''; }
		const a = (meal.additions ?? [])[0];
		if (!a) return '';
		if (a.kind === 'ingredient') return ingImg(a.ingredientId);
		if (a.kind === 'supplement') return microImg(a.micro);
		const ar = getRecipe(a.recipeId); return ar ? recipeImage(ar) : '';
	};
	// Serving count for a single-food card: the piece count (1, 1.5...) of its one food, else 1.
	const singleServing = (meal: PlanMeal) => {
		const a = (meal.additions ?? [])[0];
		return a && a.kind === 'ingredient' && a.pieces ? a.pieces : 1;
	};
	const canSwapIng = (slotIdx: number, originalId: string) => {
		const meal = week?.days[activeDay].meals[slotIdx];
		if (!meal) return false;
		const exclude = effectiveIngredients(meal).map((e) => e.ingredientId).filter((id) => id !== originalId);
		return ingredientSwapOptions(originalId, exclude, profile.dislikedIngredientIds).length > 0;
	};

	const portions = $derived.by(() => {
		const you = { label: L(lbl.you, lang), kcal: energy.target };
		const members = profile.household.map((m) => ({ label: m.label, kcal: memberKcal(m) }));
		return [you, ...members];
	});

	// Household view (planning/54 D1/D2). The plan is generated scaled to feed everyone; the weekly menu
	// DEFAULTS to a per-person view (food numbers divided back to one eater, targets shown solo) so it reads
	// like a normal single-person plan, with an opt-in "Whole household" view for the full cooked amounts. The
	// shopping list + PDF stay household-scaled (you buy/cook for everyone) with a clear note. Households carry
	// ~no auto-supplements (the optimizer scores micros vs the solo target and sees them already covered), so
	// dividing the day's food micros by the household scale yields honest per-person micros.
	let householdView = $state<'person' | 'household'>('person');
	const hhActive = $derived(profile.household.length > 0);
	const hhScale = $derived(week ? (week.meta.householdScale || 1) : 1);
	const perPerson = $derived(householdView === 'person');
	const foodDiv = $derived(hhActive && perPerson ? hhScale : 1); // divide displayed FOOD numbers by this
	const tgtMul = $derived(hhActive && !perPerson ? hhScale : 1); // multiply displayed TARGETS by this
	const totalEaters = $derived(profile.household.length + 1);
	const hhNote = $derived((perPerson ? L(lbl.hhPersonNote, lang) : L(lbl.hhWholeNote, lang)).replace('{n}', String(totalEaters)));
</script>

<section class="np">
	{#if view === 'landing'}
		{#if week}
			<button type="button" class="ghost backtoplan no-print" onclick={() => (view = 'result')}>{L(lbl.backToPlan, lang)} &rarr;</button>
		{/if}
		<ProfilePanel {lang} collapsed={{ training: true }} />

		<section class="planopts">
			<h2 class="planopts-h">{L(lbl.title, lang)}</h2>
			<div class="chips" role="group" aria-label={L(lbl.nutrients, lang)}>
				<span class="chips-label">{L(lbl.nutrients, lang)}</span>
				<div class="chiprow">
					{#each nutrientChips as c (c.v)}
						<button type="button" class="chip" class:on={nutrients.includes(c.v)} aria-pressed={nutrients.includes(c.v)} onclick={() => toggleNutrient(c.v)}>{L(lbl[c.k], lang)}</button>
					{/each}
				</div>
			</div>
		</section>

		<section class="planopts">
			<div class="chips" role="group" aria-label={L(lbl.cookMode, lang)}>
				<span class="chips-label">{L(lbl.cookMode, lang)}</span>
				<div class="chiprow">
					<button type="button" class="chip" class:on={profile.cookingMode === 'batch'} aria-pressed={profile.cookingMode === 'batch'} onclick={() => (profile.cookingMode = 'batch')}>{L(lbl.smartCooking, lang)}</button>
					<button type="button" class="chip" class:on={profile.cookingMode === 'precise'} aria-pressed={profile.cookingMode === 'precise'} onclick={() => (profile.cookingMode = 'precise')}>{L(lbl.precisePortions, lang)}</button>
				</div>
				{#if profile.cookingMode === 'batch'}
					<p class="cookmode-hint">{L(lbl.smartHint, lang)}</p>
					<span class="chips-label">{L(lbl.cookSessions, lang)}</span>
					<div class="chiprow">
						<button type="button" class="chip" class:on={profile.cookSessionsPerWeek <= 2} aria-pressed={profile.cookSessionsPerWeek <= 2} onclick={() => (profile.cookSessionsPerWeek = 2)}>{L(lbl.sessMin, lang)}</button>
						<button type="button" class="chip" class:on={profile.cookSessionsPerWeek > 2 && profile.cookSessionsPerWeek < 6} aria-pressed={profile.cookSessionsPerWeek > 2 && profile.cookSessionsPerWeek < 6} onclick={() => (profile.cookSessionsPerWeek = 4)}>{L(lbl.sessBal, lang)}</button>
						<button type="button" class="chip" class:on={profile.cookSessionsPerWeek >= 6} aria-pressed={profile.cookSessionsPerWeek >= 6} onclick={() => (profile.cookSessionsPerWeek = 6)}>{L(lbl.sessMax, lang)}</button>
					</div>
				{/if}
			</div>
		</section>

		<button type="button" class="go" onclick={generate} disabled={!!energy.targetConflict || generating} aria-disabled={!!energy.targetConflict || generating} aria-busy={generating}>{L(lbl.generate, lang)}</button>
		{#if energy.targetConflict}
			<p class="gen-block" role="alert">{L(lbl.targetConflictShort, lang)}</p>
		{/if}
		<p class="disc gen-disc">{T('disclaimer')}</p>
	{:else if week}
		<div class="actions no-print">
			<button type="button" class="back" onclick={back}>&larr; {L(lbl.back, lang)}</button>
			<button type="button" class="ghost" onclick={() => window.print()}>{L(lbl.print, lang)}</button>
			<button type="button" class="ghost" onclick={savePlan}>{justSaved ? L(lbl.saved, lang) : L(lbl.save, lang)}</button>
			<a class="ghost" href={`/${lang}/nutrition/shopping`}>{L(lbl.shopping, lang)}</a>
			<button type="button" class="ghost" onclick={regenerate}>{L(lbl.regenerate, lang)}</button>
			<span class="pd">
				<span class="pd-label">{L(lbl.printStyle, lang)}</span>
				<SegmentedControl
					options={[{ value: 'compact', label: L(lbl.compact, lang) }, { value: 'full', label: L(lbl.full, lang) }]}
					value={density}
					ariaLabel={L(lbl.printStyle, lang)}
					onchange={(v) => (density = v as 'compact' | 'full')}
				/>
			</span>
		</div>

		<h2 class="result-h">{L(lbl.resultTitle, lang)}</h2>

		<section class="overview">
			<h2>{L(lbl.targetsTitle, lang)}</h2>
			<div class="stats">
				<div class="stat accent"><b>{nf(Math.round(energy.target * tgtMul))}</b><span>{T('kcal')}</span></div>
				<div class="stat"><b>{Math.round(energy.proteinBand[0] * tgtMul)}-{Math.round(energy.proteinBand[1] * tgtMul)} g</b><span>{T('protein')}</span></div>
				<div class="stat"><b>{Math.round(energy.carbG * tgtMul)} g</b><span>{T('carbs')}</span></div>
				<div class="stat"><b>{Math.round(energy.fatG * tgtMul)} g</b><span>{T('fat')}</span></div>
				<div class="stat"><b>{Math.round(energy.fiberG * tgtMul)} g</b><span>{T('fiber')}</span></div>
				<div class="stat"><b>{fmt1(energy.waterTargetMl / 1000)} l</b><span>{T('water')}</span></div>
			</div>
			{#if hhActive}
				<div class="hhview" role="group" aria-label={L(lbl.hhView, lang)}>
					<span class="hhview-label">{L(lbl.hhView, lang)}:</span>
					<button type="button" class="chip" class:on={perPerson} aria-pressed={perPerson} onclick={() => (householdView = 'person')}>{L(lbl.hhPerson, lang)}</button>
					<button type="button" class="chip" class:on={!perPerson} aria-pressed={!perPerson} onclick={() => (householdView = 'household')}>{L(lbl.hhWhole, lang)}</button>
				</div>
				<p class="hhview-note">{hhNote}</p>
			{/if}
		</section>

		{#if week.warnings.length}
			<div class="warns" role="status">
				{#each week.warnings as w (w.code)}<p class="warn">{L(lbl[warnLabel[w.code] ?? 'warnKcal'], lang)}</p>{/each}
			</div>
		{/if}

		{#if profile.household.length}
			<div class="portions">
				<span class="portions-label">{L(lbl.portionsStrip, lang)}:</span>
				{#each portions as p (p.label)}<span class="ppill">{p.label} ~{nf(p.kcal)} kcal</span>{/each}
			</div>
		{/if}

		<div class="daytabs" role="tablist" aria-label={L(lbl.resultTitle, lang)}>
			{#each week.days as d, i (d.day)}
				<button type="button" role="tab" aria-selected={activeDay === i} class="daytab" class:on={activeDay === i} onclick={() => (activeDay = i)}>{L(dayNames[i], lang)}</button>
			{/each}
		</div>

		{#key activeDay}
			{@const day = week.days[activeDay]}
			{@const dt = dayTotals(day)}
			{@const status = dayCalorieStatus(dt.kcal, week.meta.targetKcal)}
			{@const dmic = dayMicros(day)}
			<div class="day" role="tabpanel">
				<div class="meals">
					{#each day.meals.map((meal, si) => ({ meal, si })) as { meal, si } (meal.slotKey + si)}
						{@const r = meal.recipeId ? getRecipe(meal.recipeId) : null}
						{@const isLeftover = profile.cookingMode === 'batch' && isLeftoverMeal(week.days, activeDay, meal)}
						{@const sup = supOf(meal)}
						{@const mm = mealMacros(meal)}
						{@const mf = mealFacts(meal)}
						{@const micros = mealMicros(meal)}
						<details class="meal">
							<summary class="mealhead">
								<span class="slot">{slotLabel(meal)}</span>
								{#if r}<FoodImage src={recipeImage(r)} alt="" klass="mimg" />{:else if cardImg(meal)}<FoodImage src={cardImg(meal)} alt="" klass="mimg mimg-food" />{/if}
								<span class="mname">{meal.recipeId ? recipeName(meal.recipeId) : addedMealName(meal)}</span>{#if isLeftover}<span class="leftover-badge" title={L(lbl.leftoverHint, lang)}>{L(lbl.leftover, lang)}</span>{/if}
								<span class="mmeta">{#if sup}{hhActive && sup.basis !== 'person' ? nf1(sup.amount / foodDiv) : sup.amount} {microUnit(sup.micro)}{:else}{hhActive ? nf1((meal.recipeId ? meal.servings : singleServing(meal)) / foodDiv) : (meal.recipeId ? meal.servings : singleServing(meal))} {L(lbl.servings, lang)} . {nf(mm.kcal / foodDiv)} kcal . {nf(mealWeight(meal) / foodDiv)} g{/if}</span>
								<span class="cardicons no-print">
									{#if !sup && (meal.recipeId || (meal.additions ?? []).length)}
										<button type="button" class="micon swap" title={L(lbl.swap, lang)} aria-label={L(lbl.swap, lang)} onclick={(e) => { e.preventDefault(); e.stopPropagation(); meal.recipeId ? swapMeal(si) : swapAddition(si, 0); }}>
											<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
										</button>
									{/if}
									<button type="button" class="micon remove" title={L(lbl.remove, lang)} aria-label={L(lbl.remove, lang)} onclick={(e) => { e.preventDefault(); e.stopPropagation(); removeMeal(si); }}>&times;</button>
								</span>
							</summary>
							<div class="mealbody">
								{#snippet factsLabel()}
									<div class="facts-wrap">
										<div class="facts">
											<div class="facts-head">{L(lbl.factsHead, lang)}</div>
											<div class="facts-row big"><span>{L(lbl.energy, lang)}</span><b>{nf(mf.kcal / foodDiv)} kcal</b></div>
											<div class="facts-row big"><span>{L(lbl.lfFat, lang)}</span><b>{nf1(mf.fat / foodDiv)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfCarbs, lang)}</span><b>{nf1(mf.carbs / foodDiv)} g</b></div>
											<div class="facts-row sub"><span>{L(lbl.sugars, lang)}</span><b>{nf1(mf.sugars / foodDiv)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfFibre, lang)}</span><b>{nf1(mf.fiber / foodDiv)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.lfProtein, lang)}</span><b>{nf1(mf.protein / foodDiv)} g</b></div>
											<div class="facts-row big"><span>{L(lbl.salt, lang)}</span><b>{nf1(mf.salt / foodDiv)} g</b></div>
											<div class="facts-divider"></div>
											<div class="facts-head sub-head">{L(lbl.micros, lang)}</div>
											{#each MIC as k (k)}
												<div class="facts-row sub"><span>{L(micL[k], lang)}</span><b>{nf1(micros[k] / foodDiv)} {microUnit(k)}</b></div>
											{/each}
										</div>
									</div>
								{/snippet}

								{#if sup}
									<!-- Supplement: the drawer is just the nutrient amount + a neutral note. -->
									<div class="facts-wrap">
										<div class="facts">
											<div class="facts-head">{L(lbl.factsHead, lang)}</div>
											<div class="facts-row big"><span>{L(micL[sup.micro] ?? { en: sup.micro, fi: sup.micro, hu: sup.micro, sv: sup.micro }, lang)}</span><b>{hhActive && sup.basis !== 'person' ? nf1(sup.amount / foodDiv) : sup.amount} {microUnit(sup.micro)}</b></div>
											<div class="facts-row sub"><span>{L(lbl.energy, lang)}</span><b>0 kcal</b></div>
										</div>
									</div>
									<p class="suppnote muted small">{L(lbl.supplementNote, lang)}</p>
								{:else if r}
									<!-- Recipe meal: ingredients, then steps, then the nutrition facts label LAST. -->
									<h4 class="mb-h">{L(lbl.ingredients, lang)}</h4>
									<ul class="ings">
										{#each recipeRows(meal) as row (row.originalId)}
											<li>
												<FoodImage src={ingImg(row.displayId)} alt="" klass="ingthumb" />
												<button type="button" class="iname" onclick={() => (infoIng = getIngredient(row.displayId) ?? null)}>{ingName(row.displayId)}</button>
												{#if ingAnn(row.displayId)}<span class="iann">{ingAnn(row.displayId)}</span>{/if}
												<span class="igrams">{nf(row.grams)} g{hhLabel(row.displayId, row.grams)}</span>
												{#if canSwapIng(si, row.originalId)}
													<button type="button" class="rowicon swap no-print" title={L(lbl.swap, lang)} aria-label={`${L(lbl.swap, lang)}: ${ingName(row.displayId)}`} onclick={() => swapIngredient(si, row.originalId)}>
														<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
													</button>
												{/if}
												<button type="button" class="rowicon remove no-print" title={L(lbl.remove, lang)} aria-label={`${L(lbl.remove, lang)}: ${ingName(row.displayId)}`} onclick={() => removeIngredient(si, row.originalId)}>&times;</button>
											</li>
										{/each}
										{#each meal.additions ?? [] as a, ai (ai)}
											<li class="added">
												{#if a.kind === 'ingredient'}
													<FoodImage src={ingImg(a.ingredientId)} alt="" klass="ingthumb" />
													<button type="button" class="iname" onclick={() => (infoIng = getIngredient(a.ingredientId) ?? null)}>{ingName(a.ingredientId)}</button>
													<span class="addtag">{L(lbl.addedTag, lang)}</span>
													<span class="igrams">{#if a.pieces}{a.pieces} . {/if}{nf(a.grams)} g{#if !a.pieces}{hhLabel(a.ingredientId, a.grams)}{/if}</span>
												{:else if a.kind === 'recipe'}
													{@const ar = getRecipe(a.recipeId)}
													{#if ar}<FoodImage src={recipeImage(ar)} alt="" klass="ingthumb" />{/if}
													<span class="iname plain">{recipeName(a.recipeId)}</span>
													<span class="addtag">{L(lbl.addedTag, lang)}</span>
													<span class="igrams">{a.servings} {L(lbl.servings, lang)}</span>
												{/if}
												<button type="button" class="rowicon swap no-print" title={L(lbl.swap, lang)} aria-label={L(lbl.swap, lang)} onclick={() => swapAddition(si, ai)}>
													<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/></svg>
												</button>
												<button type="button" class="rowicon remove no-print" title={L(lbl.remove, lang)} aria-label={L(lbl.remove, lang)} onclick={() => removeAddition(si, ai)}>&times;</button>
											</li>
										{/each}
									</ul>
									<button type="button" class="addfood no-print" onclick={() => openPicker(si)}>+ {L(lbl.addFood, lang)}</button>
									<h4 class="mb-h">{L(lbl.steps, lang)}</h4>
									<ol class="steps">
										{#each r.instructions as step, i (i)}<li>{L(step, lang)}</li>{/each}
									</ol>
									{@render factsLabel()}
								{:else if addedRecipeOf(meal)}
									{@const ar = addedRecipeOf(meal)!}
									<!-- A whole recipe added as a snack: show it AS a recipe (ingredients + steps), not a bare facts card. -->
									<h4 class="mb-h">{L(lbl.ingredients, lang)}</h4>
									<ul class="ings">
										{#each ar.rec.ingredients as ring, ri (ri)}
											<li>
												<FoodImage src={ingImg(ring.ingredientId)} alt="" klass="ingthumb" />
												<button type="button" class="iname" onclick={() => (infoIng = getIngredient(ring.ingredientId) ?? null)}>{ingName(ring.ingredientId)}</button>
												{#if ingAnn(ring.ingredientId)}<span class="iann">{ingAnn(ring.ingredientId)}</span>{/if}
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
									<!-- Single food (an eat-alone ingredient): the card IS the food, so the drawer is its nutrition facts. -->
									{@render factsLabel()}
								{:else}
									<!-- Empty placeholder slot: let the user fill it. -->
									<p class="emptyrow muted">{L(lbl.empty, lang)}</p>
									<button type="button" class="addfood no-print" onclick={() => openPicker(si)}>+ {L(lbl.addFood, lang)}</button>
								{/if}
							</div>
						</details>
					{/each}
				</div>

					<button type="button" class="addmeal no-print" onclick={() => openPicker('new')}>+ {L(lbl.addMeal, lang)}</button>


				{#if status.state !== 'ok'}
					<p class="calnote" class:low={status.state === 'low'} class:over={status.state === 'over'}>{status.state === 'low' ? L(lbl.calLow, lang) : L(lbl.calOver, lang)}</p>
				{/if}

				<div class="totals">
					<b>{L(lbl.dayTotal, lang)}:</b>
					{nf(dt.kcal / foodDiv)} kcal . {nf(dt.protein / foodDiv)} g protein . {nf(dt.carbs / foodDiv)} g carbs . {nf(dt.fat / foodDiv)} g fat . {nf(dt.fiber / foodDiv)} g fibre
					<span class="muted small"> ({L(lbl.target, lang)} ~{nf(week.meta.targetKcal / foodDiv)} kcal . {L(lbl.waterTarget, lang)} ~{fmt1(energy.waterTargetMl / 1000)} l)</span>
				</div>

				<details class="daymicros" open>
					<summary>{L(lbl.dayFacts, lang)}</summary>
					<div class="micgrid">
						{#each MIC as k (k)}
							{@const band = microBandOf(k, foodDiv, tgtMul)}{@const wkPct = wkMicros ? Math.round((wkMicros[k] / foodDiv / (microLim.target[k] * tgtMul * 7)) * 100) : 0}<button type="button" class="miccell band-{band}" title={L(lbl.dayWeekHint, lang)} onclick={() => (infoMicro = k)}><b>{nf1(dmic[k] / foodDiv)} {microUnit(k)}</b><span>{L(micL[k], lang)}</span><span class="micweek">{L(lbl.weekAbbr, lang)} {wkPct}%</span>{#if band === 'low-bad'}<span class="micflag">{L(lbl.tooLow, lang)}</span>{:else if band === 'high-bad'}<span class="micflag">{L(lbl.tooHigh, lang)}</span>{/if}</button>
						{/each}
					</div>
				</details>
			</div>
		{/key}

		<p class="disc">{T('disclaimer')}</p>
	{/if}
</section>

{#if infoIng}
	<Modal open={true} title={L(infoIng.name, lang)} closeLabel={L(lbl.back, lang)} onclose={() => (infoIng = null)}>
		<div class="ii">
			<FoodImage src={ingredientImage(infoIng.id, infoIng.role)} alt="" klass="ii-img" />
			<div class="facts">
				<div class="facts-sub">{L(lbl.per100g, lang)}</div>
				<div class="facts-row"><span>{T('kcal')}</span><b>{nf(infoIng.per100g.energy_kcal)}</b></div>
				<div class="facts-row"><span>{T('protein')}</span><b>{nf1(infoIng.per100g.protein_g)} g</b></div>
				<div class="facts-row"><span>{T('carbs')}</span><b>{nf1(infoIng.per100g.carbohydrates_g)} g</b></div>
				<div class="facts-row"><span>{T('fat')}</span><b>{nf1(infoIng.per100g.fat_g)} g</b></div>
				<div class="facts-row"><span>{T('fiber')}</span><b>{nf1(infoIng.per100g.fiber_g)} g</b></div>
				{#each MIC as k (k)}
					<div class="facts-row sub"><span>{L(micL[k], lang)}</span><b>{nf1((infoIng.micros_per100g as unknown as Record<string, number>)[k] ?? 0)} {microUnit(k)}</b></div>
				{/each}
			</div>
		</div>
		{#if infoIng.note}<p class="ii-note muted small">{infoIng.note}</p>{/if}
	</Modal>
{/if}

{#if infoMicro && wkMicros && week}
	{@const mk = infoMicro}
	{@const todayVal = dayMicros(week.days[activeDay])[mk]}
	{@const srcToday = microContributors(week.days[activeDay], mk).slice(0, 6)}
	{@const srcWeek = weekMicroContributors(week.days, mk).slice(0, 6)}
	<Modal open={true} title={L(micL[mk], lang)} closeLabel={L(lbl.back, lang)} onclose={() => (infoMicro = null)}>
		<div class="micpop-head">
			<FoodImage src={microImg(mk)} alt="" klass="micpop-img" />
			<div>
				<p class="micpop-row"><b>{L(lbl.today, lang)}:</b> {nf1(todayVal / foodDiv)} {microUnit(mk)}</p>
				<p class="micpop-row"><b>{L(lbl.weekTotal, lang)}:</b> {nf1(wkMicros[mk] / foodDiv)} {microUnit(mk)}</p>
				<p class="micpop-row"><b>{L(lbl.weekRange, lang)}:</b> {nf1(microLim.target[mk] * 7 * tgtMul)}{microLim.ul[mk] ? ` - ${nf1((microLim.ul[mk] ?? 0) * 7 * tgtMul)}` : '+'} {microUnit(mk)}</p>
			</div>
		</div>
		{#if srcToday.length}
			<p class="micpop-srchead"><b>{L(lbl.sourcesToday, lang)}</b></p>
			<ul class="micpop-src">{#each srcToday as s (s.id)}<li>{s.id === 'supplement' ? L(lbl.supplementLabel, lang) : ingName(s.id)} - {nf1(s.amount / foodDiv)} {microUnit(mk)}</li>{/each}</ul>
		{/if}
		{#if srcWeek.length}
			<p class="micpop-srchead"><b>{L(lbl.sourcesWeek, lang)}</b></p>
			<ul class="micpop-src">{#each srcWeek as s (s.id)}<li>{s.id === 'supplement' ? L(lbl.supplementLabel, lang) : ingName(s.id)} - {nf1(s.amount / foodDiv)} {microUnit(mk)}</li>{/each}</ul>
		{/if}
		<p class="micpop-exp muted small">{L(lbl.microExplain, lang)}</p>
		{#if mk === 'calcium_mg'}<p class="micpop-exp muted small">{L(lbl.calciumNote, lang)}</p>{/if}
	</Modal>
{/if}

{#if pickerTarget !== null}
	<Modal open={true} title={L(lbl.addFood, lang)} closeLabel={L(lbl.back, lang)} onclose={() => (pickerTarget = null)}>
		{#if !pickSel}
			<input class="pick-search" type="search" bind:value={pickQuery} placeholder={L(lbl.searchFood, lang)} aria-label={L(lbl.searchFood, lang)} />
			{#if !pickQuery.trim() && !pickCat}
				<!-- Category step: meal courses, food groups, supplements (calcium allowed manually). -->
				<div class="catgroup">
					<h4 class="cath">{L(lbl.catCourses, lang)}</h4>
					<div class="catgrid">
						{#each COURSE_CATS as c (c)}
							<button type="button" class="catbtn" onclick={() => (pickCat = { type: 'course', value: c })}>{L(courseLbl[c], lang)}</button>
						{/each}
					</div>
				</div>
				<div class="catgroup">
					<h4 class="cath">{L(lbl.catGroups, lang)}</h4>
					<div class="catgrid">
						{#each ROLE_CATS as r (r)}
							<button type="button" class="catbtn" onclick={() => (pickCat = { type: 'role', value: r })}>{L(roleLbl[r], lang)}</button>
						{/each}
					</div>
				</div>
				<div class="catgroup">
					<h4 class="cath">{L(lbl.catSupplements, lang)}</h4>
					<div class="catgrid">
						{#each MIC as k (k)}
							<button type="button" class="catbtn cat-sup" onclick={() => selectSupplement(k)}>
								<FoodImage src={microImg(k)} alt="" klass="cat-supimg" />{L(micL[k], lang)}
							</button>
						{/each}
					</div>
				</div>
				<p class="muted small searchhint">{L(lbl.searchAll, lang)}</p>
			{:else}
				{#if pickCat && !pickQuery.trim()}
					<button type="button" class="ghost catback" onclick={() => (pickCat = null)}>&larr; {L(lbl.pickCategory, lang)}</button>
				{/if}
				<ul class="picklist">
					{#each pickResults as f (f.kind + f.id)}
						<li><button type="button" class="pickitem" onclick={() => selectFood(f.kind, f.id)}>
							<span class="pickname">{f.name}</span>
							{#if f.kind === 'recipe'}<span class="pickkind">{L(lbl.servings, lang)}</span>{/if}
						</button></li>
					{:else}
						<li class="muted small">{L(lbl.noFoods, lang)}</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<p class="picksel"><b>{pickSel.kind === 'ingredient' ? ingName(pickSel.id) : pickSel.kind === 'recipe' ? recipeName(pickSel.id) : L(micL[pickSel.id] ?? { en: pickSel.id, fi: pickSel.id, hu: pickSel.id, sv: pickSel.id }, lang)}</b></p>
			{#if pickSel.kind === 'ingredient'}
				{#if isCountable(pickSel.id)}
					<label class="pickqty">{L(lbl.pieces, lang)}
						<input type="number" min="1" step="1" bind:value={pickPieces} />
						<span class="muted">({nf(pickGramsShown)} g)</span>
					</label>
				{:else}
					<label class="pickqty">{L(lbl.grams, lang)}
						<input type="number" min="1" step="10" bind:value={pickGrams} />
					</label>
				{/if}
			{:else if pickSel.kind === 'recipe'}
				<label class="pickqty">{L(lbl.servings, lang)}
					<input type="number" min="0.5" step="0.5" bind:value={pickServings} />
				</label>
			{:else}
				<label class="pickqty">{L(lbl.amount, lang)}
					<input type="number" min="0" step="1" bind:value={pickAmount} />
					<span class="muted">{microUnit(pickSel.id)}</span>
				</label>
				{#if pickSel.id === 'calcium_mg'}<p class="suppnote muted small">{L(lbl.supplementNote, lang)}</p>{/if}
			{/if}
			<div class="pickactions">
				<button type="button" class="ghost" onclick={() => (pickSel = null)}>&larr; {L(lbl.back, lang)}</button>
				<button type="button" class="go small-go" onclick={confirmAdd}>{L(lbl.add, lang)}</button>
			</div>
		{/if}
	</Modal>
{/if}

<style>
	.np { margin: 0 0 2rem; display: flex; flex-direction: column; gap: 1rem; }
	.planopts { margin: 0; }
	.planopts-h { margin: 0 0 0.6rem; font-size: 1.15rem; font-weight: 700; }
	.chips { margin: 0; }
	.chips-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.4rem; }
	.chiprow { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.chip { min-height: 40px; padding: 0.4rem 0.9rem; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--text); font: inherit; font-size: 0.85rem; cursor: pointer; }
	.chip.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); font-weight: 600; }
	.go { align-self: flex-start; background: var(--accent); color: #fff; border: 0; border-radius: 0.5rem; padding: 0.7rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
	.go:disabled { background: var(--line); color: var(--muted); cursor: not-allowed; }
	.gen-block { margin: 0.4rem 0 0; padding: 0.5rem 0.7rem; font-size: 0.82rem; line-height: 1.4; color: #8a3b2e; background: #fbeae5; border: 1px solid #e7c3b8; border-radius: 0.4rem; max-width: 42rem; }
	.small-go { padding: 0.5rem 1.1rem; font-size: 0.9rem; }
	.gen-disc { margin: 0; }
	.disc { font-size: 0.78rem; color: var(--muted); max-width: 60ch; margin: 0.5rem 0 0; }
	.actions { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
	.back { font: inherit; background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600; }
	.ghost { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.5rem 1rem; min-height: 44px; cursor: pointer; display: inline-flex; align-items: center; text-decoration: none; }
	.ghost:hover { border-color: var(--accent); }
	.backtoplan { align-self: flex-start; color: var(--accent); margin-bottom: 0.6rem; }
	.pd { display: inline-flex; align-items: center; gap: 0.4rem; }
	.pd-label { font-size: 0.78rem; color: var(--muted); font-weight: 600; }
	.result-h { margin: 0; font-size: 2em; }
	.overview { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.8rem 1rem; }
	.overview h2 { margin: 0 0 0.6rem; font-size: 1.05rem; }
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.6rem; }
	.stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); padding: 0.6rem 0.4rem; }
	.stat b { font-size: 1.15rem; color: var(--text); line-height: 1; }
	.stat.accent b { color: var(--primary); }
	.stat span { font-size: 0.75rem; color: var(--muted); text-align: center; }
	.warns { margin: 0; }
	.warn { background: var(--accent-soft); color: var(--primary); border-radius: var(--radius); padding: 0.4rem 0.8rem; font-size: 0.85rem; margin: 0.25rem 0; }
	/* Household view toggle (planning/54 D1/D2) */
	.hhview { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin: 0.6rem 0 0; }
	.hhview-label { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
	.hhview-note { margin: 0.3rem 0 0; font-size: 0.78rem; color: var(--muted); line-height: 1.4; }
	.portions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin: 0; }
	.portions-label { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
	.ppill { font-size: 0.8rem; background: var(--accent-soft); color: var(--primary); border-radius: 999px; padding: 0.15rem 0.6rem; font-weight: 600; }
	.daytabs { display: flex; gap: 0.3rem; flex-wrap: wrap; margin: 0; }
	.daytab { min-width: 44px; min-height: 44px; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
	.daytab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); }
	.meals { display: flex; flex-direction: column; gap: 0.6rem; }
	.meal { position: relative; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); }
	/* Card action icons mirror the workout cards' look (square, 0.4rem radius, 1px border, swap=accent /
	   remove=muted) but are vertically centered - the nutrition cards are short single rows, so centering
	   reads better than the top-aligned workout placement (deliberate, justified deviation). */
	.cardicons { position: absolute; top: 50%; transform: translateY(-50%); right: 0.4rem; display: flex; gap: 0.5rem; z-index: 1; }
	.micon { width: 1.7rem; height: 1.7rem; display: flex; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); cursor: pointer; padding: 0; }
	.micon.swap { color: var(--accent); }
	.micon.swap:hover { background: var(--accent-soft); border-color: var(--accent); }
	.micon.remove { color: var(--muted); font-size: 1.15rem; line-height: 1; }
	.micon.remove:hover { background: #fdecec; border-color: #d98b8b; color: #9a4a13; }
	.leftover-badge { font-size: 0.68rem; font-weight: 600; padding: 0.08rem 0.45rem; border-radius: 999px; background: #e7f5ec; color: #1a7f4b; margin-left: 0.4rem; white-space: nowrap; cursor: help; }
	.mealhead { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 5rem 0.5rem 0.7rem; cursor: pointer; list-style: none; flex-wrap: wrap; }
	.mealhead::-webkit-details-marker { display: none; }
	.slot { width: 110px; font-size: 0.8rem; color: var(--muted); font-weight: 600; flex: none; }
	.mealhead :global(.mimg) { width: 48px; height: 48px; object-fit: cover; border-radius: 0.4rem; flex: none; background: var(--accent-soft); }
	/* Single-food card thumbnail = the transparent ingredient cutout, no background tint or crop. */
	.mealhead :global(.mimg-food) { object-fit: contain; background: none; }
	.mname { font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
	.mmeta { font-size: 0.78rem; color: var(--accent); margin-left: auto; }
	.mealbody { padding: 0 0.7rem 0.7rem; border-top: 1px solid var(--line); }
	.mealbody-actions { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; margin: 0.6rem 0; }
	.mealopen { font-size: 0.82rem; color: var(--accent); text-decoration: none; font-weight: 600; }
	.mb-h { margin: 0.6rem 0 0.3rem; font-size: 0.9rem; }
	.facts-wrap { margin: 0.7rem 0 0.3rem; }
	.facts-wrap .facts { max-width: 360px; background: var(--surface); }
	.ings { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.ings li { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
	/* Ingredient cutouts are transparent PNGs - never put them on a tinted background. */
	.ings :global(.ingthumb) { width: 28px; height: 28px; object-fit: contain; flex: none; }
	.iname { font: inherit; font-weight: 600; color: var(--primary); background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 2px; text-align: left; }
	.iname:hover { text-decoration-color: var(--accent); }
	.iname.plain { text-decoration: none; cursor: default; color: var(--text); }
	.iann { font-size: 0.75rem; color: var(--accent); font-weight: 600; }
	.addtag { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--accent); background: var(--accent-soft); border-radius: 999px; padding: 0.05rem 0.4rem; }
	.igrams { font-size: 0.82rem; color: var(--muted); margin-left: auto; }
	/* Row icons follow the contract color code like .micon: swap = accent, delete = muted with red hover
	   (2026-07 parity audit M2 - one style for both broke the code the card icons teach). */
	.rowicon { width: 1.7rem; height: 1.7rem; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); cursor: pointer; font-size: 1.05rem; line-height: 1; flex: none; padding: 0; }
	.rowicon.swap { color: var(--accent); }
	.rowicon.swap:hover { background: var(--accent-soft); border-color: var(--accent); }
	.rowicon.remove { color: var(--muted); }
	.rowicon.remove:hover { background: #fdecec; border-color: #d98b8b; color: #9a4a13; }
	.emptyrow { font-size: 0.85rem; padding: 0.3rem 0; }
	/* Add buttons mirror the workout "+ Add" button (dashed accent border, transparent bg). */
	.addfood, .addmeal { margin-top: 0.6rem; background: none; border: 1px dashed var(--accent); color: var(--accent); border-radius: 0.5rem; padding: 0.4rem 0.9rem; font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
	.addfood:hover, .addmeal:hover { background: var(--accent-soft); }
	.addmeal { align-self: flex-start; }
	.steps { padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; }
	/* Calorie status is a real alert: over target = bold red, under target = bold amber. */
	.calnote { border-radius: var(--radius); padding: 0.5rem 0.8rem; font-size: 0.88rem; font-weight: 700; margin: 0.2rem 0 0; }
	.calnote.over { background: #fbeaea; color: #9a2a2a; border: 1px solid #e6b3b3; }
	.calnote.low { background: #fdf2e3; color: #8a5a12; border: 1px solid #eccf9b; }
	.totals { margin-top: 0.2rem; padding-top: 0.6rem; border-top: 1px solid var(--line); font-size: 0.88rem; }
	.daymicros { margin-top: 0.4rem; }
	.daymicros summary { cursor: pointer; font-size: 0.85rem; font-weight: 600; color: var(--accent); }
	.micgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.5rem; margin-top: 0.5rem; }
	.miccell { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); padding: 0.45rem 0.3rem; font: inherit; cursor: pointer; text-align: center; }
	.miccell:hover { border-color: var(--accent); }
	.miccell b { font-size: 0.92rem; color: var(--text); }
	.miccell span { font-size: 0.7rem; color: var(--muted); text-align: center; }
	/* Weekly status bands: green good, yellow slightly off, red genuinely low/high vs the official range. */
	.miccell.band-good { background: #eef7ee; border-color: #cfe6cf; }
	.miccell.band-low, .miccell.band-high { background: #fdf7e3; border-color: #ecdca0; }
	.miccell.band-low-bad, .miccell.band-high-bad { background: #fbeaea; border-color: #e6b3b3; }
	.micflag { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; color: #9a2a2a; }
	/* M2: each per-day micro chip shows TODAY's value (big) plus an explicit weekly % so the two are never
	   conflated (the chip colour follows the WEEK; a high/low single day reads correctly against the week). */
	.micweek { font-size: 0.62rem; font-weight: 700; color: var(--muted); }
	.miccell.band-good .micweek { color: #2f7a3a; }
	.miccell.band-low .micweek, .miccell.band-high .micweek { color: #8a6d1a; }
	.miccell.band-low-bad .micweek, .miccell.band-high-bad .micweek { color: #9a2a2a; }
	.micpop-head { display: flex; gap: 0.8rem; align-items: center; }
	.micpop-head :global(.micpop-img) { width: 64px; height: 64px; object-fit: contain; flex: none; }
	.micpop-row { margin: 0 0 0.4rem; }
	.micpop-exp { margin: 0.6rem 0 0; line-height: 1.5; }
	.suppnote { margin: 0.6rem 0 0; line-height: 1.5; }
	.small { font-size: 0.8rem; }
	.muted { color: var(--muted); }
	.ii { display: flex; gap: 0.8rem; align-items: flex-start; flex-wrap: wrap; }
	.ii :global(.ii-img) { width: 72px; height: 72px; object-fit: contain; flex: none; }
	.ii-note { margin: 0.8rem 0 0; }
	.facts { flex: 1; min-width: 200px; border: 1.5px solid var(--text); border-radius: 6px; padding: 0.5rem 0.7rem; }
	.facts-sub { font-size: 0.75rem; color: var(--muted); padding-bottom: 0.25rem; border-bottom: 1px solid var(--text); }
	.facts-head { font-size: 1rem; font-weight: 800; border-bottom: 4px solid var(--text); padding-bottom: 0.25rem; }
	.facts-head.sub-head { font-size: 0.82rem; margin-top: 0.5rem; border-bottom-width: 2px; }
	.facts-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.22rem 0; font-size: 0.88rem; border-bottom: 1px solid var(--line); }
	.facts-row.big { font-weight: 600; }
	.facts-row.sub { padding-left: 1rem; font-size: 0.82rem; color: var(--muted); }
	.facts-row b { font-variant-numeric: tabular-nums; }
	.facts-divider { height: 4px; background: var(--text); margin: 0.2rem 0; }
	.facts-row:last-child { border-bottom: none; }
	.pick-search { width: 100%; min-height: 44px; margin-bottom: 0.6rem; }
	.catgroup { margin: 0 0 0.9rem; }
	.cath { margin: 0 0 0.4rem; font-size: 0.8rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
	.catgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: 0.4rem; }
	.catbtn { font: inherit; font-weight: 600; text-align: left; background: var(--surface); border: 1px solid var(--line); border-radius: 0.5rem; padding: 0.55rem 0.7rem; cursor: pointer; min-height: 44px; color: var(--text); }
	.catbtn:hover { border-color: var(--accent); }
	.cat-sup { display: flex; align-items: center; gap: 0.5rem; }
	.cat-sup :global(.cat-supimg) { width: 1.6rem; height: 1.6rem; object-fit: contain; flex: none; }
	.catback { margin-bottom: 0.6rem; }
	.searchhint { margin: 0.2rem 0 0; }
	.picklist { list-style: none; padding: 0; margin: 0; max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.25rem; }
	.pickitem { width: 100%; text-align: left; font: inherit; background: var(--surface); border: 1px solid var(--line); border-radius: 0.5rem; padding: 0.5rem 0.7rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; min-height: 40px; }
	.pickitem:hover { border-color: var(--accent); }
	.pickname { font-weight: 600; color: var(--primary); }
	.pickkind { font-size: 0.72rem; color: var(--muted); }
	.picksel { margin: 0 0 0.6rem; }
	.pickqty { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
	.pickqty input { width: 6rem; min-height: 44px; }
	.pickactions { display: flex; gap: 0.6rem; align-items: center; margin-top: 1rem; }
	@media (max-width: 620px) {
		.slot { width: 100%; }
		.mmeta { margin-left: 0; }
		.micon { width: 2.4rem; height: 2.4rem; }
		.rowicon { width: 2.4rem; height: 2.4rem; } /* touch targets on the most-edited surface (audit M2) */
		.mealhead { padding-right: 6rem; }
	}
</style>
