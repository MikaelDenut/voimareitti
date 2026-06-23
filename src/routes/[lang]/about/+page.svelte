<script lang="ts">
	// Help page (route stays /about; nav label "Help"). Reimagined (2026-06-18) from a flat scroll into a
	// searchable, sectioned knowledge base: a subject search over a 4-language help-content module, a
	// table-of-contents section nav, concrete how-to-use-the-app guides, plus the existing nutrition and
	// supplement reference widgets (kept, reorganized). Personal credit block + disclaimer kept. No health
	// claims (Hard Rule 15).
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import Modal from '$lib/Modal.svelte';
	import { L, aboutLead, aboutSteps } from '$lib/content/site-copy';
	import {
		dietPrinciples, supplements, supplementIntro, supplementsTierB, supplementsTierBIntro,
		foodGroups, fibreNote, hydrationNote, highVolumeFoods, type Loc
	} from '$lib/content/data';
	import { nutritionTopics } from '$lib/content/nutrition-content';
	import { FG_INFO, focusKeyFromImage, DIET_INFO } from '$lib/food-groups';
	import { ingredients, getIngredient } from '$lib/content/ingredients';
	import { recipes } from '$lib/content/recipes';
	import { HELP_SECTIONS, helpEntries, searchHelp, type HelpSectionId } from '$lib/content/help-content';

	const MICRO_IMG: Record<string, string> = {
		potassium_mg: 'potassium', calcium_mg: 'calcium', iron_mg: 'iron', magnesium_mg: 'magnesium',
		zinc_mg: 'zinc', vitamin_c_mg: 'vitamin-c', vitamin_d_ug: 'vitamin-d', vitamin_b12_ug: 'vitamin-b12', folate_ug: 'folate'
	};
	const microEntries = helpEntries.filter((e) => e.micro);
	const microsLbl = { en: 'Micronutrients', fi: 'Hivenravinteet', hu: 'Mikrotápanyagok', sv: 'Mikronäringsämnen' };

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);

	// --- Subject search over the help knowledge base ---
	let q = $state('');
	const searching = $derived(q.trim().length > 0);
	const results = $derived(searchHelp(q, lang));
	// Sections whose how-to text is shown as cards in the normal (non-search) view. Nutrition + supplements
	// render their richer interactive widgets instead (their entries still surface in search).
	const CARD_SECTIONS: HelpSectionId[] = ['using', 'workouts', 'recipes', 'safety'];
	const entriesOf = (id: HelpSectionId) => results.filter((e) => e.section === id);
	const sectionTitle = (id: HelpSectionId) => {
		const s = HELP_SECTIONS.find((x) => x.id === id);
		return s ? L(s.title, lang) : id;
	};

	const ui: Record<string, Loc> = {
		searchPh: { en: 'Search help by subject...', fi: 'Hae ohjeista aiheen mukaan...', hu: 'Keresés a súgóban téma szerint...', sv: 'Sök i hjälpen efter ämne...' },
		searchAria: { en: 'Search help', fi: 'Hae ohjeista', hu: 'Keresés a súgóban', sv: 'Sök i hjälpen' },
		clear: { en: 'Clear search', fi: 'Tyhjennä haku', hu: 'Keresés törlése', sv: 'Rensa sökning' },
		toc: { en: 'Jump to a section', fi: 'Siirry osioon', hu: 'Ugrás egy szakaszhoz', sv: 'Hoppa till ett avsnitt' },
		results: { en: 'Matching topics', fi: 'Osumia', hu: 'Találatok', sv: 'Träffar' },
		none: { en: 'No help topics match that search. Try another word.', fi: 'Mikään ohjeaihe ei vastaa hakua. Kokeile toista sanaa.', hu: 'Egyetlen súgótéma sem felel meg a keresésnek. Próbálj másik szót.', sv: 'Inga hjälpämnen matchar den sökningen. Prova ett annat ord.' }
	};

	// --- Existing interactive reference widgets (food groups + diet guides, relocated from Nutrition) ---
	type FG = { name: Loc; examples: Loc; image?: string };
	let openGroup = $state<FG | null>(null);
	let openDiet = $state<(typeof DIET_INFO)[number] | null>(null);
	const focusOf = (g: FG) => focusKeyFromImage(g.image);
	const FOCUS_ROLE: Record<string, string[]> = {
		protein: ['protein'], carbs: ['carb'], vegetables: ['vegetable'],
		fruit: ['fruit'], fats: ['fat'], fibre: ['legume']
	};
	const foodsFor = (focus: string) =>
		ingredients.filter((i) => (FOCUS_ROLE[focus] ?? []).includes(i.role))
			.map((i) => L(i.name, lang)).sort((a, b) => a.localeCompare(b, lang)).slice(0, 14);
	const recipesFor = (focus: string) =>
		recipes.filter((r) => r.ingredients.some((ri) => {
			const d = getIngredient(ri.ingredientId); return !!d && (FOCUS_ROLE[focus] ?? []).includes(d.role);
		})).sort((a, b) => L(a.name, lang).localeCompare(L(b.name, lang), lang)).slice(0, 6);
	const foodsLbl = { en: 'Foods in this group', fi: 'Tämän ryhmän ruoat', hu: 'Ételek ebben a csoportban', sv: 'Mat i denna grupp' };
	const recipesLbl = { en: 'Recipes to try', fi: 'Kokeile näitä reseptejä', hu: 'Kipróbálható receptek', sv: 'Recept att prova' };
	const ctaRecipes = { en: 'See recipes', fi: 'Katso reseptit', hu: 'Receptek', sv: 'Se recept' };
	const ctaClose = { en: 'Close', fi: 'Sulje', hu: 'Bezárás', sv: 'Stäng' };
	const dietInfoTitle = { en: 'Diet guides', fi: 'Ruokavalio-oppaat', hu: 'Étrendi útmutatók', sv: 'Kostguider' };
	const foodGroupsLbl = { en: 'Food groups', fi: 'Ruokaryhmät', hu: 'Élelmiszer-csoportok', sv: 'Matgrupper' };

	const basicsLbl: Record<string, Loc> = {
		title: { en: 'Nutrition basics', fi: 'Ravitsemuksen perusteet', hu: 'Táplálkozási alapok', sv: 'Näringsgrunder' },
		intro: { en: 'How many calories each gram provides (kcal per gram):', fi: 'Kuinka monta kaloria gramma sisältää (kcal per gramma):', hu: 'Hány kalóriát ad grammonként (kcal/gramm):', sv: 'Hur många kalorier varje gram ger (kcal per gram):' },
		protein: { en: 'Protein', fi: 'Proteiini', hu: 'Fehérje', sv: 'Protein' },
		carbs: { en: 'Carbs', fi: 'Hiilihydraatit', hu: 'Szénhidrát', sv: 'Kolhydrater' },
		fat: { en: 'Fat', fi: 'Rasva', hu: 'Zsír', sv: 'Fett' },
		alcohol: { en: 'Alcohol', fi: 'Alkoholi', hu: 'Alkohol', sv: 'Alkohol' },
		fibre: { en: 'Fibre', fi: 'Kuitu', hu: 'Rost', sv: 'Fiber' }
	};
</script>

<Seo {lang} path="/about" title={`${T('about_title')} - Voimareitti`} description={T('about_intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<h1>{T('about_title')}</h1>
	<p class="lead">{L(aboutLead, lang)}</p>

	<div class="searchbar">
		<input
			type="search"
			bind:value={q}
			placeholder={L(ui.searchPh, lang)}
			aria-label={L(ui.searchAria, lang)}
		/>
		{#if searching}
			<button type="button" class="clear" onclick={() => (q = '')} aria-label={L(ui.clear, lang)}>&times;</button>
		{/if}
	</div>

	{#if searching}
		<p class="rescount">{L(ui.results, lang)}: {results.length}</p>
		{#if results.length}
			<div class="help-cards">
				{#each results as e (e.id)}
					<article class="help-card">
						<span class="sectlabel">{sectionTitle(e.section)}</span>
						<h2>{L(e.title, lang)}</h2>
						{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}
					</article>
				{/each}
			</div>
		{:else}
			<p class="noresults">{L(ui.none, lang)}</p>
		{/if}
	{:else}
		<nav class="toc" aria-label={L(ui.toc, lang)}>
			<span class="toc-label">{L(ui.toc, lang)}</span>
			<div class="toc-chips">
				{#each HELP_SECTIONS as s (s.id)}
					<a class="toc-chip" href={`#help-${s.id}`}>{L(s.title, lang)}</a>
				{/each}
			</div>
		</nav>

		<!-- USING THE APP -->
		<section class="help-sect" id="help-using">
			<h2>{sectionTitle('using')}</h2>
			<p class="muted">{L(HELP_SECTIONS[0].intro, lang)}</p>
			<ol class="steps">
				{#each aboutSteps as s, i (i)}
					<li><span class="num">{i + 1}</span><div><b>{L(s.title, lang)}</b><span class="muted">{L(s.body, lang)}</span></div></li>
				{/each}
			</ol>
			<div class="help-cards">
				{#each entriesOf('using') as e (e.id)}
					<article class="help-card"><h3>{L(e.title, lang)}</h3>{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}</article>
				{/each}
			</div>
			<p class="cta-row"><a class="go" href={`/${lang}/generate`}>{T('cta_make')}</a></p>
		</section>

		<!-- WORKOUTS -->
		<section class="help-sect" id="help-workouts">
			<h2>{sectionTitle('workouts')}</h2>
			<p class="muted">{L(HELP_SECTIONS[1].intro, lang)}</p>
			<div class="help-cards">
				{#each entriesOf('workouts') as e (e.id)}
					<article class="help-card"><h3>{L(e.title, lang)}</h3>{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}</article>
				{/each}
			</div>
		</section>

		<!-- NUTRITION AND MEAL PLANNER (reference widgets) -->
		<section class="help-sect" id="help-nutrition">
			<h2>{sectionTitle('nutrition')}</h2>
			<p class="muted">{L(HELP_SECTIONS[2].intro, lang)}</p>

			<div class="help-cards">
				{#each entriesOf('nutrition').filter((e) => !e.micro) as e (e.id)}
					<article class="help-card"><h3>{L(e.title, lang)}</h3>{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}</article>
				{/each}
			</div>

			<div class="basics">
				<h3>{L(basicsLbl.title, lang)}</h3>
				<p class="muted small">{L(basicsLbl.intro, lang)}</p>
				<div class="basicsgrid">
					<div class="bcard"><b>4</b><span>{L(basicsLbl.protein, lang)}</span></div>
					<div class="bcard"><b>4</b><span>{L(basicsLbl.carbs, lang)}</span></div>
					<div class="bcard"><b>9</b><span>{L(basicsLbl.fat, lang)}</span></div>
					<div class="bcard"><b>7</b><span>{L(basicsLbl.alcohol, lang)}</span></div>
					<div class="bcard"><b>~2</b><span>{L(basicsLbl.fibre, lang)}</span></div>
				</div>
			</div>

			<div class="subblock">
				<h3>{T('r_diet')}</h3>
				<div class="dietwrap">
					<ul class="plist">
						{#each dietPrinciples as p (p.title.en)}
							<li><b>{L(p.title, lang)}.</b> {L(p.body, lang)}</li>
						{/each}
					</ul>
					<img class="plate" src="/img/diet/plate.webp" alt="" loading="lazy" />
				</div>
			</div>

			<div class="subblock">
				<h3>{L(foodGroupsLbl, lang)}</h3>
				<div class="foods">
					{#each foodGroups as g (g.name.en)}
						<button type="button" class="fg fg-click" onclick={() => (openGroup = g)}>
							{#if g.image}<img class="fg-img" src={`/img/diet/${g.image}.webp`} alt="" loading="lazy" />{/if}
							<div class="fg-txt"><b>{L(g.name, lang)}</b><span class="muted small">{L(g.examples, lang)}</span></div>
						</button>
					{/each}
				</div>
				<div class="dietinfo">
					<span class="dietinfo-label">{L(dietInfoTitle, lang)}</span>
					<div class="dietinfo-chips">
						{#each DIET_INFO as d (d.key)}
							<button type="button" class="dichip" onclick={() => (openDiet = d)}>{L(d.title, lang)}</button>
						{/each}
					</div>
				</div>
				<div class="subgrid">
					<div class="sub"><b>{T('diet_fibre')}</b><span class="muted small">{L(fibreNote, lang)}</span></div>
					<div class="sub"><b>{T('diet_hydration')}</b><span class="muted small">{L(hydrationNote, lang)}</span></div>
				</div>
				<div class="highvol">
					<img class="highvol-img" src="/img/diet/high-volume.webp" alt="" loading="lazy" />
					<div class="sub"><b>{T('diet_highvol')}</b><span class="muted small">{L(highVolumeFoods, lang)}</span></div>
				</div>
			</div>

			<div class="subblock">
				<h3>{T('nutr_deep_title')}</h3>
				<div class="topics">
					{#each nutritionTopics as topic (topic.id)}
						<details class="topic">
							<summary>
								<span class="tsum"><b>{L(topic.title, lang)}</b><span class="muted small">{L(topic.summary, lang)}</span></span>
								<span class="more">{T('nutr_learn')}</span>
							</summary>
							<div class="tbody">
								{#each topic.body as para, i (i)}<p>{L(para, lang)}</p>{/each}
							</div>
						</details>
					{/each}
				</div>
			</div>
		</section>

		<section class="help-sect" id="help-micronutrients">
			<h2>{L(microsLbl, lang)}</h2>
			<div class="topics">
				{#each microEntries as e (e.id)}
					<details class="topic micro-topic">
						<summary>
							<img class="micro-ic" src={`/img/supplements/${MICRO_IMG[e.micro ?? ''] ?? 'vitamin-d'}.webp`} alt="" loading="lazy" />
							<span class="tsum"><b>{L(e.title, lang)}</b></span>
							<span class="more">{T('nutr_learn')}</span>
						</summary>
						<div class="tbody">
							{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}
						</div>
					</details>
				{/each}
			</div>
		</section>

		<!-- RECIPES -->
		<section class="help-sect" id="help-recipes">
			<h2>{sectionTitle('recipes')}</h2>
			<p class="muted">{L(HELP_SECTIONS[3].intro, lang)}</p>
			<div class="help-cards">
				{#each entriesOf('recipes') as e (e.id)}
					<article class="help-card"><h3>{L(e.title, lang)}</h3>{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}</article>
				{/each}
			</div>
		</section>

		<!-- SUPPLEMENTS -->
		<section class="help-sect" id="help-supplements">
			<img class="pagebanner" src="/img/banners/supplements.webp" alt="" />
			<h2>{sectionTitle('supplements')}</h2>
			<p class="muted">{L(HELP_SECTIONS[4].intro, lang)}</p>
			<div class="subblock">
				<h3>{T('r_supplements')}</h3>
				<p class="muted small">{L(supplementIntro, lang)}</p>
				<div class="supps">
					{#each supplements as s (s.id)}
						<article class="supp">
							<img class="supp-ic" src={`/img/supplements/${s.id}.webp`} alt="" loading="lazy" />
							<div class="cbody">
								<b>{L(s.name, lang)}</b>
								<span class="dose">{L(s.dose, lang)}</span>
								<span class="muted small">{L(s.use, lang)} {L(s.caution, lang)}</span>
							</div>
						</article>
					{/each}
				</div>
			</div>
			<div class="subblock">
				<h3>{T('tierb_title')}</h3>
				<p class="muted small">{L(supplementsTierBIntro, lang)}</p>
				<ul class="plist tierb">
					{#each supplementsTierB as s (s.id)}
						<li><b>{L(s.name, lang)}.</b> <span class="muted">{L(s.note, lang)}</span></li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- SAFETY AND DISCLAIMERS -->
		<section class="help-sect" id="help-safety">
			<h2>{sectionTitle('safety')}</h2>
			<p class="muted">{L(HELP_SECTIONS[5].intro, lang)}</p>
			<div class="help-cards">
				{#each entriesOf('safety') as e (e.id)}
					<article class="help-card"><h3>{L(e.title, lang)}</h3>{#each e.body as para, i (i)}<p>{L(para, lang)}</p>{/each}</article>
				{/each}
			</div>
		</section>
	{/if}

	<section class="credit">
		<p>{T('about_made_by')}</p>
		<p class="credit-links">
			<span>{T('about_website')}: <a href="https://denut.fi/" target="_blank" rel="noopener noreferrer">denut.fi</a></span>
			<span>{T('about_contact')}: <a href="mailto:mikael@denut.fi">mikael@denut.fi</a></span>
		</p>
	</section>

	<p class="disc">{T('disclaimer')}</p>
</main>

{#if openGroup}
	<Modal open={true} title={L(openGroup.name, lang)} closeLabel={L(ctaClose, lang)} onclose={() => (openGroup = null)}>
		<p class="fg-info">{L(FG_INFO[focusOf(openGroup)], lang)}</p>
		<div class="fg-list">
			<span class="fg-list-label">{L(foodsLbl, lang)}</span>
			<div class="fg-foods">
				{#each foodsFor(focusOf(openGroup)) as name (name)}<span class="fg-food">{name}</span>{/each}
			</div>
		</div>
		<div class="fg-list">
			<span class="fg-list-label">{L(recipesLbl, lang)}</span>
			<ul class="fg-recipes">
				{#each recipesFor(focusOf(openGroup)) as r (r.id)}
					<li><a href={`/${lang}/recipes/${r.id}`}>{L(r.name, lang)}</a></li>
				{/each}
			</ul>
		</div>
		<div class="fg-ctas">
			<a class="fg-cta primary" href={`/${lang}/recipes?focus=${focusOf(openGroup)}`}>{L(ctaRecipes, lang)}</a>
			<button type="button" class="fg-cta" onclick={() => (openGroup = null)}>{L(ctaClose, lang)}</button>
		</div>
	</Modal>
{/if}
{#if openDiet}
	<Modal open={true} title={L(openDiet.title, lang)} closeLabel={L(ctaClose, lang)} onclose={() => (openDiet = null)}>
		<p class="fg-info">{L(openDiet.body, lang)}</p>
	</Modal>
{/if}

<style>
	h1 { margin-top: 1.5rem; }
	.lead { max-width: 60ch; font-size: 1.05rem; }

	/* Search */
	.searchbar { position: relative; max-width: 32rem; margin: 1.25rem 0 0.5rem; }
	.searchbar input { width: 100%; min-height: 44px; padding-right: 2.4rem; }
	.clear { position: absolute; right: 0.4rem; top: 50%; transform: translateY(-50%); width: 2rem; height: 2rem; border: none; background: none; color: var(--muted); font-size: 1.4rem; line-height: 1; cursor: pointer; border-radius: 50%; }
	.clear:hover { color: var(--text); background: var(--bg); }
	.rescount { color: var(--muted); font-size: 0.9rem; margin: 0.25rem 0 0.75rem; }
	.noresults { color: var(--muted); padding: 1rem 0; }

	/* Table of contents */
	.toc { margin: 0.5rem 0 0.5rem; }
	.toc-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.4rem; }
	.toc-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.toc-chip { min-height: 40px; display: inline-flex; align-items: center; padding: 0.35rem 0.85rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--primary); font-weight: 600; font-size: 0.85rem; text-decoration: none; }
	.toc-chip:hover { border-color: var(--accent); }

	/* Sections + how-to cards */
	.help-sect { margin: 1.75rem 0 0; padding-top: 1.25rem; border-top: 1px solid var(--line); scroll-margin-top: 1rem; }
	.help-sect > .muted { max-width: 60ch; margin-top: 0.25rem; }
	.help-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.7rem; margin-top: 0.9rem; }
	.help-card { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.8rem 1rem; }
	.help-card h2, .help-card h3 { margin: 0 0 0.35rem; font-size: 1.02rem; }
	.help-card p { margin: 0 0 0.4rem; font-size: 0.9rem; line-height: 1.5; color: var(--text); }
	.help-card p:last-child { margin-bottom: 0; }
	.sectlabel { display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.3rem; }

	.subblock { margin-top: 1.5rem; }
	.subblock h3 { margin: 0 0 0.5rem; }

	.foods { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.7rem; }
	.fg { display: flex; flex-direction: column; gap: 0.2rem; border: 1px solid var(--line); border-radius: 0.4rem; padding: 0.6rem 0.8rem; }
	.fg-click { font: inherit; color: var(--text); text-align: left; background: var(--surface); cursor: pointer; }
	.fg-click:hover { border-color: var(--accent); }
	.fg-img { width: 100%; height: auto; display: block; border-radius: 0.3rem; background: var(--bg); }
	.fg-txt { display: flex; flex-direction: column; gap: 0.2rem; }
	.dietinfo { margin-top: 1rem; }
	.dietinfo-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.4rem; }
	.dietinfo-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.dichip { min-height: 40px; padding: 0.4rem 0.8rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--primary); font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
	.dichip:hover { border-color: var(--accent); }
	.fg-info { margin: 0 0 1rem; line-height: 1.5; }
	.fg-list { margin: 0 0 1rem; }
	.fg-list-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.4rem; }
	.fg-foods { display: flex; flex-wrap: wrap; gap: 0.35rem; }
	.fg-food { font-size: 0.8rem; border: 1px solid var(--line); border-radius: 999px; padding: 0.15rem 0.6rem; background: var(--bg); }
	.fg-recipes { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
	.fg-recipes a { color: var(--primary); font-weight: 600; text-decoration: none; }
	.fg-recipes a:hover { text-decoration: underline; }
	.fg-ctas { display: flex; gap: 0.6rem; flex-wrap: wrap; }
	.fg-cta { display: inline-flex; align-items: center; min-height: 44px; padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; text-decoration: none; color: var(--primary); font-weight: 600; font: inherit; background: var(--surface); cursor: pointer; }
	.fg-cta.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
	.fg-cta:hover { border-color: var(--accent); }
	.highvol { margin-top: 0.9rem; }
	.highvol-img { width: 100%; border-radius: var(--radius); display: block; margin-bottom: 0.4rem; }
	.subgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.7rem; margin-top: 0.9rem; }
	.sub { display: flex; flex-direction: column; gap: 0.2rem; border-left: 3px solid var(--accent); padding: 0.1rem 0 0.1rem 0.7rem; }
	.small { font-size: 0.85rem; }
	.steps { list-style: none; padding: 0; margin: 0.9rem 0 0; display: flex; flex-direction: column; gap: 0.9rem; max-width: 60ch; }
	.steps li { display: flex; gap: 0.8rem; align-items: flex-start; }
	.num { flex: none; width: 1.7rem; height: 1.7rem; border-radius: 50%; background: var(--accent-soft); color: var(--primary); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
	.steps div { display: flex; flex-direction: column; gap: 0.15rem; }
	.cta-row { margin: 1.5rem 0 0; }
	.go { display: inline-block; background: var(--accent); color: #fff; text-decoration: none; padding: 0.7rem 1.5rem; border-radius: 0.5rem; font-weight: 600; }
	.go:hover { filter: brightness(0.95); }
	.muted { color: var(--muted); }
	.pagebanner { display: block; width: 100%; height: auto; border-radius: var(--radius); margin: 0 0 0.75rem; }
	.basicsgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.6rem; margin-top: 0.6rem; }
	.bcard { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.7rem 0.4rem; }
	.bcard b { font-size: 1.5rem; color: var(--primary); line-height: 1; }
	.bcard span { font-size: 0.78rem; color: var(--muted); text-align: center; }
	.dietwrap { display: flex; gap: 1rem; align-items: flex-start; }
	.plist { flex: 1; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; }
	.plate { width: 200px; max-width: 35%; border-radius: var(--radius); }
	.topics { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.6rem; }
	.micro-topic summary { align-items: center; }
	.micro-ic { width: 36px; height: 36px; object-fit: contain; flex: none; }
	.topic { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.7rem 0.9rem; }
	.topic summary { display: flex; align-items: baseline; justify-content: space-between; gap: 0.8rem; cursor: pointer; list-style: none; }
	.topic summary::-webkit-details-marker { display: none; }
	.tsum { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
	.more { flex: none; font-size: 0.82rem; font-weight: 600; color: var(--accent); }
	.topic[open] .more { opacity: 0.5; }
	.tbody { margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid var(--line); padding-top: 0.6rem; }
	.tbody p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--text); }
	.supps { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.7rem; margin-top: 0.6rem; }
	.supp { display: flex; gap: 0.7rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.6rem; }
	.supp-ic { width: 48px; height: 48px; object-fit: contain; flex: none; }
	.cbody { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
	.dose { font-size: 0.85rem; }
	.tierb { padding-left: 1.1rem; }
	.disc { font-size: 0.78rem; color: var(--muted); margin-top: 1.5rem; max-width: 60ch; }
	.credit { margin: 1.75rem 0 0; padding-top: 1.25rem; border-top: 1px solid var(--line); max-width: 60ch; color: var(--muted); font-size: 0.9rem; }
	.credit p { margin: 0 0 0.45rem; }
	.credit-links { display: flex; flex-direction: column; gap: 0.2rem; }
	.credit a { color: var(--primary); font-weight: 600; text-decoration: none; }
	.credit a:hover { text-decoration: underline; }
</style>
