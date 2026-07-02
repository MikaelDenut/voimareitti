<script lang="ts">
	// Shared profile editor (planning section 6; reorganised in the Theme 1 round). ONE form definition,
	// bound to the shared store ($lib/profile), reused on Nutrition, Recipes, and Exercises so the inputs
	// never drift. Three groups: About you (global: age/sex/weight/height + primary Goal), Training, and
	// Food. About you is always visible; Training and Food are independently collapsible, with a per-page
	// initial collapse context (Nutrition -> Training collapsed; Exercises -> Food collapsed; Recipes ->
	// Food open + Training collapsed; Workout -> both open). 44px touch targets, aria-expanded,
	// reduced-motion safe, 4-language labels (correct diacritics, plain hyphens).
	// NOTE: panel-only label strings live in `lbl` below as an interim 4-language map; the i18n sweep
	// (Theme 10) folds them into $lib/i18n. Option labels already come from the localized data in $lib/content.

	import type { Locale } from '$lib/i18n';
	import {
		L, goals, nutritionGoals, splits, equipment, type Sex, type Loc
	} from '$lib/content/data';
	import {
		profile, type DietaryFilter, type FodmapLevel, type MealLabelStyle,
		type MemberType, MEMBER_TYPE_AGE
	} from '$lib/profile.svelte';
	import type { Ingredient } from '$lib/content/ingredients';
	import { owner } from '$lib/owner.svelte';
	import { estimateEnergy } from '$lib/engine/engine';

	// Live energy result for the panel, used to flag an INFEASIBLE custom-target combo right where the user
	// types it (the meal-plan Generate is also blocked on the same flag). Recomputes as the profile changes.
	const energy = $derived(estimateEnergy(profile));
	const nf = (n: number) => new Intl.NumberFormat(lang).format(n);
	// Localized "your targets don't fit" message with the computed numbers folded in.
	function conflictMsg(): string {
		const tc = energy.targetConflict;
		if (!tc) return '';
		const tpl: Record<Locale, string> = {
			en: `These targets don't fit together: they need about {req} kcal, but your calorie target is {tgt}. Raise your calories, or lower protein, carbs or fat.`,
			fi: `Nämä tavoitteet eivät sovi yhteen: ne vaativat noin {req} kcal, mutta kaloritavoitteesi on {tgt}. Nosta kaloreita tai laske proteiinia, hiilihydraatteja tai rasvaa.`,
			hu: `Ezek a célok nem illenek össze: körülbelül {req} kcal-t igényelnek, de a kalóriacélod {tgt}. Növeld a kalóriát, vagy csökkentsd a fehérjét, szénhidrátot vagy zsírt.`,
			sv: `Dessa mål går inte ihop: de kräver cirka {req} kcal, men ditt kalorimål är {tgt}. Höj kalorierna, eller sänk protein, kolhydrater eller fett.`
		};
		return tpl[lang].replace('{req}', nf(tc.requiredKcal)).replace('{tgt}', nf(tc.targetKcal));
	}

	let {
		lang,
		sections = ['about', 'training', 'food'] as ('about' | 'training' | 'food')[],
		collapsed = {} as { training?: boolean; food?: boolean },
		startCollapsed = false
	}: {
		lang: Locale;
		sections?: ('about' | 'training' | 'food')[];
		collapsed?: { training?: boolean; food?: boolean };
		startCollapsed?: boolean;
	} = $props();

	// Whole-panel collapse: the "Your profile" header toggles the entire block. Initial state from
	// startCollapsed (Exercises + Recipes start collapsed); once the user toggles, the override wins.
	let panelOverride = $state<boolean | undefined>(undefined);
	const panelOpen = $derived(panelOverride ?? !startCollapsed);
	function togglePanel() { panelOverride = !panelOpen; }
	const panelBody = 'pp-panel-' + Math.random().toString(36).slice(2, 8);

	// Per-section collapse. `collapsed.*` is the initial context; once the user toggles, the override wins
	// (initial-only, like the legacy `open` pattern, so no "captures initial value" warning).
	let trainingOverride = $state<boolean | undefined>(undefined);
	let foodOverride = $state<boolean | undefined>(undefined);
	const trainingOpen = $derived(trainingOverride ?? !(collapsed.training ?? false));
	const foodOpen = $derived(foodOverride ?? !(collapsed.food ?? false));
	function toggleTraining() { trainingOverride = !trainingOpen; }
	function toggleFood() { foodOverride = !foodOpen; }
	const tBody = 'pp-train-' + Math.random().toString(36).slice(2, 8);
	const fBody = 'pp-food-' + Math.random().toString(36).slice(2, 8);

	const show = (s: 'about' | 'training' | 'food') => sections.includes(s);

	// Interim panel labels (4-language). Consolidated into i18n.ts in the Theme 10 sweep.
	const lbl: Record<string, Loc> = {
		title: { en: 'Your profile', fi: 'Profiilisi', hu: 'A profilod', sv: 'Din profil' },
		about: { en: 'About you', fi: 'Tietoja sinusta', hu: 'Rólad', sv: 'Om dig' },
		training: { en: 'Training', fi: 'Harjoittelu', hu: 'Edzés', sv: 'Träning' },
		food: { en: 'Food', fi: 'Ruoka', hu: 'Étkezés', sv: 'Mat' },
		age: { en: 'Age', fi: 'Ikä', hu: 'Kor', sv: 'Ålder' },
		sex: { en: 'Sex', fi: 'Sukupuoli', hu: 'Nem', sv: 'Kön' },
		weight: { en: 'Weight (kg)', fi: 'Paino (kg)', hu: 'Testsúly (kg)', sv: 'Vikt (kg)' },
		height: { en: 'Height (cm)', fi: 'Pituus (cm)', hu: 'Magasság (cm)', sv: 'Längd (cm)' },
		male: { en: 'Male', fi: 'Mies', hu: 'Férfi', sv: 'Man' },
		female: { en: 'Female', fi: 'Nainen', hu: 'Nő', sv: 'Kvinna' },
		unspecified: { en: 'Prefer not to say', fi: 'En halua kertoa', hu: 'Nem mondom meg', sv: 'Vill inte uppge' },
		goal: { en: 'Goal', fi: 'Tavoite', hu: 'Cél', sv: 'Mål' },
		trainingGoal: { en: 'Training goal', fi: 'Harjoittelun tavoite', hu: 'Edzéscél', sv: 'Träningsmål' },
		experience: { en: 'Experience', fi: 'Kokemus', hu: 'Tapasztalat', sv: 'Erfarenhet' },
		beginner: { en: 'Beginner', fi: 'Aloittelija', hu: 'Kezdő', sv: 'Nybörjare' },
		intermediate: { en: 'Intermediate', fi: 'Keskitaso', hu: 'Középhaladó', sv: 'Medel' },
		advanced: { en: 'Advanced', fi: 'Edistynyt', hu: 'Haladó', sv: 'Avancerad' },
		emphasis: { en: 'Emphasis', fi: 'Painotus', hu: 'Hangsúly', sv: 'Betoning' },
		split: { en: 'Split', fi: 'Jako', hu: 'Felosztás', sv: 'Uppdelning' },
		location: { en: 'Where do you train?', fi: 'Missä treenaat?', hu: 'Hol edzel?', sv: 'Var tränar du?' },
		home: { en: 'Home', fi: 'Kotona', hu: 'Otthon', sv: 'Hemma' },
		gym: { en: 'Gym', fi: 'Salilla', hu: 'Edzőteremben', sv: 'Gym' },
		days: { en: 'Days per week', fi: 'Päiviä viikossa', hu: 'Nap hetente', sv: 'Dagar per vecka' },
		minutes: { en: 'Minutes per session', fi: 'Minuuttia per kerta', hu: 'Perc alkalmanként', sv: 'Minuter per pass' },
		waist: { en: 'Waist (cm, optional)', fi: 'Vyötärö (cm, valinnainen)', hu: 'Derék (cm, opcionális)', sv: 'Midja (cm, valfritt)' },
		warmup: { en: 'Warm-up style', fi: 'Lämmittelytyyli', hu: 'Bemelegítés stílusa', sv: 'Uppvärmningsstil' },
		wsStretch: { en: 'Stretching', fi: 'Venyttely', hu: 'Nyújtás', sv: 'Stretching' },
		wsActive: { en: 'Active drills', fi: 'Aktiiviset liikkeet', hu: 'Aktív gyakorlatok', sv: 'Aktiva övningar' },
		wsBoth: { en: 'Both', fi: 'Molemmat', hu: 'Mindkettő', sv: 'Båda' },
		wsMobilityOnly: { en: 'Mobility only', fi: 'Vain liikkuvuus', hu: 'Csak mobilitás', sv: 'Endast rörlighet' },
		easierOptions: { en: 'Show easier options', fi: 'Näytä helpommat vaihtoehdot', hu: 'Könnyebb változatok', sv: 'Visa lättare alternativ' },
		equipment: { en: 'Equipment you have', fi: 'Välineet joita sinulla on', hu: 'Elérhető eszközök', sv: 'Utrustning du har' },
		lifeStage: { en: 'Life stage', fi: 'Elämänvaihe', hu: 'Életszakasz', sv: 'Livsfas' },
		notPregnant: { en: 'Not pregnant', fi: 'Ei raskaana', hu: 'Nem várandós', sv: 'Inte gravid' },
		pregnant: { en: 'Pregnant', fi: 'Raskaana', hu: 'Várandós', sv: 'Gravid' },
		postpartum: { en: 'Recently gave birth', fi: 'Synnyttänyt äskettäin', hu: 'Nemrég szült', sv: 'Nyligen fött barn' },
		trimester: { en: 'Trimester', fi: 'Raskauskolmannes', hu: 'Trimeszter', sv: 'Trimester' },
		breastfeeding: { en: 'Breastfeeding', fi: 'Imetys', hu: 'Szoptatás', sv: 'Ammar' },
		mealsPerDay: { en: 'Meals per day', fi: 'Aterioita päivässä', hu: 'Étkezés naponta', sv: 'Måltider per dag' },
		dietaryFilters: { en: 'Dietary choices', fi: 'Ruokavalinnat', hu: 'Étrendi választások', sv: 'Kostval' },
		fodmap: { en: 'FODMAP (IBS-friendly)', fi: 'FODMAP (IBS-ystävällinen)', hu: 'FODMAP (IBS-barát)', sv: 'FODMAP (IBS-vänlig)' },
		fodmapOff: { en: 'Off', fi: 'Pois', hu: 'Ki', sv: 'Av' },
		fodmapGentle: { en: 'Gentle', fi: 'Kevyt', hu: 'Enyhe', sv: 'Mild' },
		fodmapStrict: { en: 'Strict', fi: 'Tiukka', hu: 'Szigorú', sv: 'Strikt' },
		alcoholFree: { en: 'Alcohol-free cooking', fi: 'Alkoholiton ruoanlaitto', hu: 'Alkoholmentes főzés', sv: 'Alkoholfri matlagning' },
		plantProteins: { en: 'Include plant proteins (tofu, tempeh, seitan)', fi: 'Sisällytä kasviproteiinit (tofu, tempeh, seitan)', hu: 'Növényi fehérjék engedélyezése (tofu, tempeh, szejtán)', sv: 'Inkludera växtproteiner (tofu, tempeh, seitan)' },
		plantProteinsHint: { en: 'Off by default for omnivores; turn it on to let tofu and meat substitutes appear in your plan.', fi: 'Oletuksena pois sekasyöjillä; laita päälle, jos haluat tofun ja lihankorvikkeet mukaan suunnitelmaan.', hu: 'Mindenevőknél alapból kikapcsolva; kapcsold be, hogy a tofu és a húshelyettesítők megjelenjenek a tervedben.', sv: 'Av som standard för allätare; slå på för att låta tofu och köttsubstitut visas i din plan.' },
		ironFood: { en: 'Get iron from food, skip iron supplements', fi: 'Hanki rauta ruoasta, ohita rautalisät', hu: 'Vasat ételből, vas-kiegészítő nélkül', sv: 'Få järn från maten, hoppa över järntillskott' },
		ironFoodHint: { en: 'Menstruating women need more iron (about 18 mg a day, more in pregnancy), which is hard to reach from food alone. Left off, the planner adds an iron supplement when the week falls short. Turned on, it instead works harder to pick iron-rich meals and never adds an iron pill - some people find iron supplements hard on the stomach (heartburn, constipation). General information, not medical advice.', fi: 'Kuukautisia saavat naiset tarvitsevat enemmän rautaa (noin 18 mg päivässä, raskaana enemmän), mitä on vaikea saada pelkästä ruoasta. Jos tämä on pois päältä, suunnittelija lisää rautalisän, kun viikko jää vajaaksi. Jos laitat sen päälle, se valitsee tarkemmin rautapitoisia aterioita eikä koskaan lisää rautatablettia - osalle rautalisät ovat raskaita vatsalle (närästys, ummetus). Yleistä tietoa, ei lääketieteellistä neuvontaa.', hu: 'A menstruáló nőknek több vasra van szükségük (kb. 18 mg naponta, terhesség alatt többre), amit nehéz pusztán ételből fedezni. Kikapcsolva a tervező vas-kiegészítőt ad hozzá, ha a hét elmarad. Bekapcsolva inkább vasban gazdag étkezéseket választ, és soha nem ad vastablettát - egyeseknek a vas-kiegészítők megterhelik a gyomrot (gyomorégés, székrekedés). Általános információ, nem orvosi tanács.', sv: 'Menstruerande kvinnor behöver mer järn (cirka 18 mg om dagen, mer under graviditet), vilket är svårt att nå enbart från maten. Avstängt lägger planeraren till ett järntillskott när veckan blir för låg. Påslaget väljer den istället järnrika måltider mer noggrant och lägger aldrig till en järntablett - för vissa är järntillskott jobbiga för magen (halsbränna, förstoppning). Allmän information, inte medicinsk rådgivning.' },
		avoid: { en: 'Foods to avoid', fi: 'Vältettävät ruoat', hu: 'Kerülendő ételek', sv: 'Mat att undvika' },
		avoidSearch: { en: 'Search a food to avoid...', fi: 'Hae vältettävää ruokaa...', hu: 'Keress kerülendő ételt...', sv: 'Sök mat att undvika...' },
		avoidHint: { en: 'Recipes containing these are never used.', fi: 'Reseptejä, joissa näitä on, ei koskaan käytetä.', hu: 'Az ezeket tartalmazó recepteket sosem használjuk.', sv: 'Recept som innehåller dessa används aldrig.' },
		remove2: { en: 'Remove', fi: 'Poista', hu: 'Eltávolítás', sv: 'Ta bort' },
		mealLabels: { en: 'Meal names', fi: 'Aterioiden nimet', hu: 'Étkezések nevei', sv: 'Måltidsnamn' },
		named: { en: 'Named', fi: 'Nimetyt', hu: 'Nevesített', sv: 'Namngivna' },
		numbered: { en: 'Numbered', fi: 'Numeroidut', hu: 'Számozott', sv: 'Numrerade' },
		// Household (relocated from the Nutrition planner; add-by-type)
		household: { en: 'Who else is eating?', fi: 'Ketkä muut syövät?', hu: 'Ki más étkezik?', sv: 'Vem mer äter?' },
		householdNote: {
			en: 'Add the people you cook for. Babies are left out - they do not eat the same food.',
			fi: 'Lisää henkilöt joille kokkaat. Vauvat jätetään pois - he eivät syö samaa ruokaa.',
			hu: 'Add hozzá azokat, akiknek főzöl. A babák kimaradnak - nem ugyanazt eszik.',
			sv: 'Lägg till personerna du lagar mat åt. Bebisar utelämnas - de äter inte samma mat.'
		},
		addAdult: { en: '+ Adult', fi: '+ Aikuinen', hu: '+ Felnőtt', sv: '+ Vuxen' },
		addTeen: { en: '+ Teenager', fi: '+ Teini', hu: '+ Tinédzser', sv: '+ Tonåring' },
		addChild: { en: '+ Child', fi: '+ Lapsi', hu: '+ Gyerek', sv: '+ Barn' },
		adult: { en: 'Adult', fi: 'Aikuinen', hu: 'Felnőtt', sv: 'Vuxen' },
		teen: { en: 'Teenager', fi: 'Teini', hu: 'Tinédzser', sv: 'Tonåring' },
		child: { en: 'Child', fi: 'Lapsi', hu: 'Gyerek', sv: 'Barn' },
		remove: { en: 'Remove', fi: 'Poista', hu: 'Eltávolítás', sv: 'Ta bort' },
		// Manual override targets (advanced)
		overrides: { en: 'Advanced: set your own targets', fi: 'Lisäasetukset: omat tavoitteet', hu: 'Haladó: saját célok', sv: 'Avancerat: egna mål' },
		overridesNote: {
			en: 'Leave blank for automatic. Set a number to use your own daily target.',
			fi: 'Jätä tyhjäksi automaattista varten. Anna luku käyttääksesi omaa päivätavoitettasi.',
			hu: 'Hagyd üresen az automatikushoz. Adj meg számot a saját napi célodhoz.',
			sv: 'Lämna tomt för automatiskt. Ange en siffra för ditt eget dagsmål.'
		},
		ovKcal: { en: 'Calories (kcal)', fi: 'Kalorit (kcal)', hu: 'Kalória (kcal)', sv: 'Kalorier (kcal)' },
		ovProtein: { en: 'Protein (g)', fi: 'Proteiini (g)', hu: 'Fehérje (g)', sv: 'Protein (g)' },
		ovCarb: { en: 'Carbs (g)', fi: 'Hiilihydraatit (g)', hu: 'Szénhidrát (g)', sv: 'Kolhydrater (g)' },
		ovFat: { en: 'Fat (g)', fi: 'Rasva (g)', hu: 'Zsír (g)', sv: 'Fett (g)' },
		ovWater: { en: 'Water (ml)', fi: 'Vesi (ml)', hu: 'Víz (ml)', sv: 'Vatten (ml)' },
		ownerName: { en: 'Name', fi: 'Nimi', hu: 'Név', sv: 'Namn' },
		ownerPhone: { en: 'Phone', fi: 'Puhelin', hu: 'Telefon', sv: 'Telefon' },
		ownerEmail: { en: 'Email', fi: 'Sähköposti', hu: 'E-mail', sv: 'E-post' },
		ownerNote: {
			en: 'Optional. Stored only on this device. Used on your printable guide.',
			fi: 'Valinnainen. Tallennetaan vain tälle laitteelle. Näytetään tulostettavassa oppaassasi.',
			hu: 'Opcionális. Csak ezen az eszközön tárolva. A nyomtatható útmutatódon jelenik meg.',
			sv: 'Valfritt. Lagras endast på denna enhet. Visas i din utskrivbara guide.'
		}
	};

	// Dietary filter labels (4-language). Keys are the DietaryFilter union values.
	const dietLbl: Record<DietaryFilter, Loc> = {
		vegetarian: { en: 'Vegetarian', fi: 'Kasvisruoka', hu: 'Vegetáriánus', sv: 'Vegetarisk' },
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
	const dietOrder: DietaryFilter[] = [
		'vegetarian', 'vegan', 'noRedMeat', 'noPork', 'noFish', 'glutenFree', 'lactoseFree', 'dairyFree', 'nutFree', 'soyFree'
	];

	const lifeStage = $derived(profile.pregnant ? 'pregnant' : profile.postpartum ? 'postpartum' : 'none');
	function setLifeStage(v: string) {
		profile.pregnant = v === 'pregnant';
		profile.postpartum = v === 'postpartum';
	}

	function toggleEquip(id: string) {
		if (id === 'none') { profile.equipment = ['none']; return; }
		const has = profile.equipment.includes(id);
		profile.equipment = has
			? profile.equipment.filter((e) => e !== id)
			: [...profile.equipment.filter((e) => e !== 'none'), id];
	}
	function toggleDiet(id: DietaryFilter) {
		profile.dietaryFilters = profile.dietaryFilters.includes(id)
			? profile.dietaryFilters.filter((d) => d !== id)
			: [...profile.dietaryFilters, id];
	}

	// Foods to avoid: a searchable exclude list bound to profile.dislikedIngredientIds (the planner already
	// drops any recipe containing one). Type to filter; tick to add; chip x to remove.
	// The ingredient DB (the largest content module) is loaded LAZILY (2026-07 audit H2): a static import
	// here shipped it transitively into every page that renders the ProfilePanel - including the "light"
	// workout/exercises pages the bundle test protects. The dynamic import splits it into its own chunk,
	// fetched only when the Food section is actually on screen.
	let excludeQuery = $state('');
	let ingDb = $state<{ all: readonly Ingredient[]; get: (id: string) => Ingredient | undefined } | null>(null);
	let ingDbLoading = false;
	function loadIngredients() {
		if (ingDb || ingDbLoading) return;
		ingDbLoading = true;
		import('$lib/content/ingredients')
			.then((m) => { ingDb = { all: m.ingredients, get: m.getIngredient }; })
			.finally(() => { ingDbLoading = false; });
	}
	$effect(() => {
		if (panelOpen && show('food')) loadIngredients();
	});
	const normEx = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	const excludeResults = $derived.by(() => {
		const q = normEx(excludeQuery.trim());
		if (!q || !ingDb) return [] as { id: string; name: string }[];
		return ingDb.all
			.filter((i) => !profile.dislikedIngredientIds.includes(i.id))
			.filter((i) => normEx(L(i.name, lang)).includes(q) || normEx(i.id).includes(q))
			.slice(0, 8)
			.map((i) => ({ id: i.id, name: L(i.name, lang) }));
	});
	function addExclude(id: string) {
		if (!profile.dislikedIngredientIds.includes(id)) profile.dislikedIngredientIds = [...profile.dislikedIngredientIds, id];
		excludeQuery = '';
	}
	function removeExclude(id: string) {
		profile.dislikedIngredientIds = profile.dislikedIngredientIds.filter((x) => x !== id);
	}
	const excludeName = (id: string) => { const d = ingDb?.get(id); return d ? L(d.name, lang) : id; };

	// Household add-by-type. Maps the type to a representative age (engine memberKcal stays age-based).
	// The id counter is seeded from the PERSISTED members' highest numeric suffix (2026-07 audit H1):
	// a component-local counter starting at 1 collided with stored ids after a reload - duplicate keyed-each
	// keys, and removeMember('h1') silently deleted BOTH members (user data loss).
	let nextMemberId = $state(
		profile.household.reduce((max, m) => {
			const n = /^h(\d+)$/.exec(m.id);
			return n ? Math.max(max, Number(n[1]) + 1) : max;
		}, 1)
	);
	function addMember(type: MemberType) {
		const label = L(lbl[type], lang) + ' ' + (profile.household.length + 1);
		profile.household = [
			...profile.household,
			{ id: 'h' + nextMemberId++, label, age: MEMBER_TYPE_AGE[type], type }
		];
	}
	function removeMember(id: string) {
		profile.household = profile.household.filter((x) => x.id !== id);
	}

	type OverrideKey = 'kcalOverride' | 'proteinOverride' | 'carbOverride' | 'fatOverride' | 'waterOverride';
	function setOverride(key: OverrideKey, raw: string) {
		const n = Number(raw);
		profile[key] = raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : undefined;
	}
	const showBreastfeeding = $derived(profile.sex === 'female' && !profile.pregnant);

	const T = (k: string) => L(lbl[k], lang);
</script>

<section class="pp">
	<button type="button" class="pp-title" aria-expanded={panelOpen} aria-controls={panelBody} onclick={togglePanel}>
		<span>{T('title')}</span>
		<span class="pp-chev" class:open={panelOpen} aria-hidden="true">▾</span>
	</button>

	{#if panelOpen}
	<div id={panelBody} class="pp-panelbody">
	{#if show('about')}
		<fieldset class="pp-group">
			<legend>{T('about')}</legend>
			<div class="pp-grid">
				<label class="pp-field">
					<span>{T('ownerName')}</span>
					<input type="text" autocomplete="name" bind:value={owner.name} />
				</label>
				<label class="pp-field">
					<span>{T('ownerPhone')}</span>
					<input type="tel" autocomplete="tel" bind:value={owner.phone} />
				</label>
				<label class="pp-field">
					<span>{T('ownerEmail')}</span>
					<input type="email" autocomplete="email" bind:value={owner.email} />
				</label>
			</div>
			<p class="pp-note">{T('ownerNote')}</p>
			<div class="pp-grid">
				<label class="pp-field">
					<span>{T('age')}</span>
					<input type="number" min="12" max="100" bind:value={profile.age} />
				</label>
				<label class="pp-field">
					<span>{T('sex')}</span>
					<select value={profile.sex} onchange={(e) => (profile.sex = e.currentTarget.value as Sex)}>
						<option value="male">{T('male')}</option>
						<option value="female">{T('female')}</option>
						<option value="unspecified">{T('unspecified')}</option>
					</select>
				</label>
				<label class="pp-field">
					<span>{T('weight')}</span>
					<input type="number" min="30" max="300" bind:value={profile.weightKg} />
				</label>
				<label class="pp-field">
					<span>{T('height')}</span>
					<input type="number" min="120" max="230" bind:value={profile.heightCm} />
				</label>
				{#if !profile.pregnant}
					<label class="pp-field">
						<span>{T('waist')}</span>
						<input type="number" min="40" max="200" bind:value={profile.waistCm} />
					</label>
				{/if}
				<label class="pp-field">
					<span>{T('goal')}</span>
					<select value={profile.nutritionGoal} onchange={(e) => (profile.nutritionGoal = e.currentTarget.value as typeof profile.nutritionGoal)}>
						{#each nutritionGoals as g (g.id)}<option value={g.id}>{L(g.name, lang)}</option>{/each}
					</select>
				</label>
			</div>
			{#if profile.sex === 'female'}
				<div class="pp-grid">
					<label class="pp-field">
						<span>{T('lifeStage')}</span>
						<select value={lifeStage} onchange={(e) => setLifeStage(e.currentTarget.value)}>
							<option value="none">{T('notPregnant')}</option>
							<option value="pregnant">{T('pregnant')}</option>
							<option value="postpartum">{T('postpartum')}</option>
						</select>
					</label>
					{#if profile.pregnant}
						<label class="pp-field">
							<span>{T('trimester')}</span>
							<select value={String(profile.trimester)} onchange={(e) => (profile.trimester = Number(e.currentTarget.value) as 1 | 2 | 3)}>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
							</select>
						</label>
					{/if}
				</div>
				{#if showBreastfeeding}
					<label class="pp-check">
						<input type="checkbox" checked={!!profile.breastfeeding} onchange={(e) => (profile.breastfeeding = e.currentTarget.checked)} />
						<span>{T('breastfeeding')}</span>
					</label>
				{/if}
			{/if}
		</fieldset>
	{/if}

	{#if show('training')}
		<fieldset class="pp-group">
			<button type="button" class="pp-sechead" aria-expanded={trainingOpen} aria-controls={tBody} onclick={toggleTraining}>
				<span>{T('training')}</span>
				<span class="pp-chev" class:open={trainingOpen} aria-hidden="true">▾</span>
			</button>
			{#if trainingOpen}
				<div id={tBody}>
					<div class="pp-grid">
						<label class="pp-field">
							<span>{T('trainingGoal')}</span>
							<select value={profile.trainingGoal} onchange={(e) => (profile.trainingGoal = e.currentTarget.value as typeof profile.trainingGoal)}>
								{#each goals as g (g.id)}<option value={g.id}>{L(g.name, lang)}</option>{/each}
							</select>
						</label>
						<label class="pp-field">
							<span>{T('experience')}</span>
							<select value={profile.experience} onchange={(e) => (profile.experience = e.currentTarget.value as typeof profile.experience)}>
								<option value="beginner">{T('beginner')}</option>
								<option value="intermediate">{T('intermediate')}</option>
								<option value="advanced">{T('advanced')}</option>
							</select>
						</label>
						<label class="pp-field">
							<span>{T('split')}</span>
							<select value={profile.split} onchange={(e) => (profile.split = e.currentTarget.value as typeof profile.split)}>
								{#each splits as s (s.id)}<option value={s.id}>{L(s.name, lang)}</option>{/each}
							</select>
						</label>
						<label class="pp-field">
							<span>{T('location')}</span>
							<select value={profile.location} onchange={(e) => (profile.location = e.currentTarget.value as 'home' | 'gym')}>
								<option value="home">{T('home')}</option>
								<option value="gym">{T('gym')}</option>
							</select>
						</label>
						<label class="pp-field">
							<span>{T('days')}</span>
							<input type="number" min="1" max="7" bind:value={profile.days} />
						</label>
						<label class="pp-field">
							<span>{T('minutes')}</span>
							<input type="number" min="10" max="180" step="5" bind:value={profile.minutes} />
						</label>
						<label class="pp-field">
							<span>{T('warmup')}</span>
							<select value={profile.warmupStyle ?? 'stretch'} onchange={(e) => (profile.warmupStyle = e.currentTarget.value as typeof profile.warmupStyle)}>
								<option value="stretch">{T('wsStretch')}</option>
								<option value="active">{T('wsActive')}</option>
								<option value="both">{T('wsBoth')}</option>
								<option value="mobility-only">{T('wsMobilityOnly')}</option>
							</select>
						</label>
					</div>

					<label class="pp-check">
						<input type="checkbox" checked={!!profile.easierOptions} onchange={(e) => (profile.easierOptions = e.currentTarget.checked)} />
						<span>{T('easierOptions')}</span>
					</label>

					{#if profile.location === 'home'}
						<div class="pp-chips" role="group" aria-label={T('equipment')}>
							<span class="pp-chips-label">{T('equipment')}</span>
							<div class="pp-chiprow">
								{#each equipment as eq (eq.id)}
									<button
										type="button"
										class="pp-chip"
										class:on={profile.equipment.includes(eq.id)}
										aria-pressed={profile.equipment.includes(eq.id)}
										onclick={() => toggleEquip(eq.id)}
									>{#if eq.image}<img class="pp-eqic" src={`/img/equipment/${eq.image}.webp`} alt="" />{/if}{L(eq.name, lang)}</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</fieldset>
	{/if}

	{#if show('food')}
		<fieldset class="pp-group">
			<button type="button" class="pp-sechead" aria-expanded={foodOpen} aria-controls={fBody} onclick={toggleFood}>
				<span>{T('food')}</span>
				<span class="pp-chev" class:open={foodOpen} aria-hidden="true">▾</span>
			</button>
			{#if foodOpen}
				<div id={fBody}>
					<div class="pp-grid">
						<label class="pp-field">
							<span>{T('mealsPerDay')}</span>
							<input type="number" min="1" max="8" bind:value={profile.mealsPerDay} />
						</label>
						<label class="pp-field">
							<span>{T('fodmap')}</span>
							<select value={profile.fodmap} onchange={(e) => (profile.fodmap = e.currentTarget.value as FodmapLevel)}>
								<option value="off">{T('fodmapOff')}</option>
								<option value="gentle">{T('fodmapGentle')}</option>
								<option value="strict">{T('fodmapStrict')}</option>
							</select>
						</label>
						<label class="pp-field">
							<span>{T('mealLabels')}</span>
							<select value={profile.mealLabels} onchange={(e) => (profile.mealLabels = e.currentTarget.value as MealLabelStyle)}>
								<option value="named">{T('named')}</option>
								<option value="numbered">{T('numbered')}</option>
							</select>
						</label>
					</div>

					<div class="pp-chips" role="group" aria-label={T('dietaryFilters')}>
						<span class="pp-chips-label">{T('dietaryFilters')}</span>
						<div class="pp-chiprow">
							{#each dietOrder as d (d)}
								<button
									type="button"
									class="pp-chip"
									class:on={profile.dietaryFilters.includes(d)}
									aria-pressed={profile.dietaryFilters.includes(d)}
									onclick={() => toggleDiet(d)}
								>{L(dietLbl[d], lang)}</button>
							{/each}
						</div>
					</div>

					<div class="pp-exclude">
						<span class="pp-chips-label">{T('avoid')}</span>
						{#if profile.dislikedIngredientIds.length}
							<div class="pp-exclude-chips">
								{#each profile.dislikedIngredientIds as id (id)}
									<span class="pp-exclude-chip">{excludeName(id)}<button type="button" class="pp-exclude-x" title={T('remove2')} aria-label={`${T('remove2')}: ${excludeName(id)}`} onclick={() => removeExclude(id)}>&times;</button></span>
								{/each}
							</div>
						{/if}
						<div class="pp-exclude-search">
							<input type="search" bind:value={excludeQuery} placeholder={T('avoidSearch')} aria-label={T('avoid')} />
							{#if excludeResults.length}
								<ul class="pp-exclude-results">
									{#each excludeResults as r (r.id)}
										<li><button type="button" onclick={() => addExclude(r.id)}>{r.name}</button></li>
									{/each}
								</ul>
							{/if}
						</div>
						<span class="pp-hint">{T('avoidHint')}</span>
					</div>

					<label class="pp-check">
						<input type="checkbox" bind:checked={profile.alcoholFree} />
						<span>{T('alcoholFree')}</span>
					</label>

					{#if !profile.dietaryFilters.includes('vegetarian') && !profile.dietaryFilters.includes('vegan')}
						<label class="pp-check">
							<input type="checkbox" bind:checked={profile.includePlantProteins} />
							<span>{T('plantProteins')}</span>
						</label>
						<span class="pp-hint">{T('plantProteinsHint')}</span>
					{/if}

					{#if profile.sex === 'female'}
						<label class="pp-check">
							<input type="checkbox" bind:checked={profile.preferIronFromFood} />
							<span>{T('ironFood')}</span>
						</label>
						<span class="pp-hint">{T('ironFoodHint')}</span>
					{/if}

					<!-- Household: who else is eating (add-by-type; babies excluded) -->
					<div class="pp-house">
						<span class="pp-chips-label">{T('household')}</span>
						<p class="pp-note">{T('householdNote')}</p>
						<div class="pp-chiprow">
							<button type="button" class="pp-add" onclick={() => addMember('adult')}>{T('addAdult')}</button>
							<button type="button" class="pp-add" onclick={() => addMember('teen')}>{T('addTeen')}</button>
							<button type="button" class="pp-add" onclick={() => addMember('child')}>{T('addChild')}</button>
						</div>
						{#if profile.household.length}
							<ul class="pp-members">
								{#each profile.household as m (m.id)}
									<li class="pp-member">
										<span class="pp-mtype">{L(lbl[m.type ?? 'adult'], lang)}</span>
										<input class="pp-mlabel" type="text" bind:value={m.label} aria-label={T('household')} />
										<button type="button" class="pp-mrm" onclick={() => removeMember(m.id)}>{T('remove')}</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<!-- Advanced: manual override targets -->
					<details class="pp-adv">
						<summary>{T('overrides')}</summary>
						<p class="pp-note">{T('overridesNote')}</p>
						<div class="pp-grid">
							<label class="pp-field">
								<span>{T('ovKcal')}</span>
								<input type="number" min="0" step="10" value={profile.kcalOverride ?? ''} oninput={(e) => setOverride('kcalOverride', e.currentTarget.value)} />
							</label>
							<label class="pp-field">
								<span>{T('ovProtein')}</span>
								<input type="number" min="0" step="1" value={profile.proteinOverride ?? ''} oninput={(e) => setOverride('proteinOverride', e.currentTarget.value)} />
							</label>
							<label class="pp-field">
								<span>{T('ovCarb')}</span>
								<input type="number" min="0" step="1" value={profile.carbOverride ?? ''} oninput={(e) => setOverride('carbOverride', e.currentTarget.value)} />
							</label>
							<label class="pp-field">
								<span>{T('ovFat')}</span>
								<input type="number" min="0" step="1" value={profile.fatOverride ?? ''} oninput={(e) => setOverride('fatOverride', e.currentTarget.value)} />
							</label>
							<label class="pp-field">
								<span>{T('ovWater')}</span>
								<input type="number" min="0" step="50" value={profile.waterOverride ?? ''} oninput={(e) => setOverride('waterOverride', e.currentTarget.value)} />
							</label>
						</div>
						{#if energy.targetConflict}
							<p class="pp-conflict" role="alert">{conflictMsg()}</p>
						{/if}
					</details>
				</div>
			{/if}
		</fieldset>
	{/if}
	</div>
	{/if}
</section>

<style>
	.pp {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		margin-bottom: 1rem;
		padding: 0.75rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.pp-title {
		width: 100%;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
		background: none;
		border: none;
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
		cursor: pointer;
	}
	.pp-panelbody {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.pp-sechead {
		width: 100%;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0;
		background: none;
		border: none;
		font: inherit;
		font-weight: 600;
		color: var(--text);
		cursor: pointer;
	}
	.pp-chev {
		transition: transform 0.15s ease;
	}
	.pp-chev.open {
		transform: rotate(180deg);
	}
	.pp-group {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.75rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.pp-group legend {
		font-weight: 600;
		padding: 0 0.4rem;
	}
	.pp-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.75rem;
	}
	.pp-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}
	.pp-field :global(input),
	.pp-field :global(select) {
		min-height: 44px;
	}
	.pp-chips-label {
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.4rem;
		font-weight: 600;
	}
	.pp-chiprow {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.pp-chip {
		min-height: 44px;
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.pp-eqic {
		width: 22px;
		height: 22px;
		object-fit: contain;
		flex: none;
	}
	.pp-chip.on {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--primary);
		font-weight: 600;
	}
	.pp-exclude { display: flex; flex-direction: column; gap: 0.4rem; }
	.pp-exclude-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
	.pp-exclude-chip { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.82rem; background: var(--accent-soft); color: var(--primary); border-radius: 999px; padding: 0.2rem 0.3rem 0.2rem 0.6rem; font-weight: 600; }
	.pp-exclude-x { width: 1.3rem; height: 1.3rem; border: none; background: none; color: var(--primary); cursor: pointer; font-size: 1rem; line-height: 1; border-radius: 50%; }
	.pp-exclude-x:hover { background: rgba(40,74,99,0.12); }
	.pp-exclude-search { position: relative; }
	.pp-exclude-search input { width: 100%; min-height: 44px; }
	.pp-exclude-results { list-style: none; margin: 0.25rem 0 0; padding: 0; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); max-height: 200px; overflow-y: auto; }
	.pp-exclude-results li button { width: 100%; text-align: left; font: inherit; background: none; border: none; padding: 0.5rem 0.7rem; min-height: 40px; cursor: pointer; color: var(--text); }
	.pp-exclude-results li button:hover { background: var(--accent-soft); color: var(--primary); }
	.pp-hint { font-size: 0.75rem; color: var(--muted); }
	.pp-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		font-size: 0.9rem;
	}
	.pp-note {
		font-size: 0.78rem;
		color: var(--muted);
		margin: 0 0 0.5rem;
	}
	/* Calm caution note for an infeasible custom-target combo (planning/54 D3). Terracotta, not alarm-red. */
	.pp-conflict {
		margin: 0.5rem 0 0;
		padding: 0.5rem 0.7rem;
		font-size: 0.82rem;
		line-height: 1.4;
		color: #8a3b2e;
		background: #fbeae5;
		border: 1px solid #e7c3b8;
		border-radius: 0.4rem;
	}
	.pp-add {
		min-height: 44px;
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--line);
		border-radius: 0.6rem;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}
	.pp-members {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.pp-member {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.pp-mtype {
		font-size: 0.78rem;
		color: var(--primary);
		background: var(--accent-soft);
		border-radius: 999px;
		padding: 0.15rem 0.6rem;
		font-weight: 600;
		flex: none;
	}
	.pp-mlabel {
		flex: 1;
		min-width: 120px;
		min-height: 40px;
	}
	.pp-mrm {
		font: inherit;
		font-size: 0.8rem;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		background: var(--bg);
		color: var(--text);
		padding: 0.3rem 0.7rem;
		min-height: 40px;
		cursor: pointer;
		flex: none;
	}
	.pp-adv summary {
		cursor: pointer;
		font-size: 0.88rem;
		font-weight: 600;
		min-height: 44px;
		display: flex;
		align-items: center;
	}
	@media (prefers-reduced-motion: reduce) {
		.pp-chev {
			transition: none;
		}
	}
</style>
