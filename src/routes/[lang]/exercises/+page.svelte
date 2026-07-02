<script lang="ts">
	import { goto } from '$app/navigation';
	import { t, type Locale } from '$lib/i18n';
	import Seo from '$lib/Seo.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import {
		exercises, equipment, L, muscle, categoryKey, categoryKeys, equipmentNeed, muscleKeys,
		intensityTechniques, type Loc, type Experience
	} from '$lib/content/data';
	import { exerciseImageSrc } from '$lib/content/exercise-images';
	import { hasEquipment, suitable, type Profile } from '$lib/engine/engine';
	import { profile } from '$lib/profile.svelte';
	import { saved, deleteWorkout, isWorkoutSnapshot, type SavedPlan, type WorkoutPayload } from '$lib/saved.svelte';
	import ProfilePanel from '$lib/ProfilePanel.svelte';
	import WorkoutSnapshot from '$lib/WorkoutSnapshot.svelte';

	let { data }: { data: { lang: Locale } } = $props();
	const lang = $derived(data.lang);
	const T = (k: string) => t(lang, k);

	let search = $state('');
	let category = $state('all');
	let musc = $state('all');
	let level = $state<'all' | Experience>('all');
	let selectedEquip = $state<string[]>([]);
	let onlyDoable = $state(false);
	// Client-only figure preview for the catalogue. Prerendered/canonical images stay general (SEO).
	let figVariant = $state<'default' | 'male' | 'pregnant'>('default');
	// Theme 3: Browse / Saved tab.
	let tab = $state<'browse' | 'saved'>('browse');
	// Saved-plan snapshot: opening a saved program shows a read-only result-style view in-page. Back
	// returns here to the Saved tab. Old profile-only entries (pre-snapshot) cannot show a true snapshot,
	// so they prompt a one-time re-save instead.
	let viewing = $state<SavedPlan<WorkoutPayload> | null>(null);
	function openWorkout(s: SavedPlan<WorkoutPayload>) { viewing = s; }
	function useWorkout() {
		if (!viewing) return;
		if (isWorkoutSnapshot(viewing.payload)) {
			Object.assign(profile, viewing.payload.used); // keep the live profile in sync
			try { localStorage.setItem('voimareitti.workout.live', JSON.stringify(viewing.payload)); } catch { /* quota */ }
		} else {
			Object.assign(profile, viewing.payload); // old entry: regenerate from the saved profile, then re-save
			try { localStorage.setItem('vr-generated', '1'); } catch { /* quota */ }
		}
		// goto (not window.location) keeps the SPA session + in-memory stores alive; the generate page's
		// onMount consumes the handoff key exactly as before (2026-07 audit L3).
		goto(`/${lang}/generate`);
	}

	// New, page-local labels (4-language). Consolidated into i18n.ts in the Phase 12 sweep.
	const lbl: Record<string, Loc> = {
		level: { en: 'Level', fi: 'Taso', hu: 'Szint', sv: 'Nivå' },
		beginner: { en: 'Beginner', fi: 'Aloittelija', hu: 'Kezdő', sv: 'Nybörjare' },
		intermediate: { en: 'Intermediate', fi: 'Keskitaso', hu: 'Középhaladó', sv: 'Medel' },
		advanced: { en: 'Advanced', fi: 'Edistynyt', hu: 'Haladó', sv: 'Avancerad' },
		equip: { en: 'Equipment you have', fi: 'Välineet joita sinulla on', hu: 'Elérhető eszközök', sv: 'Utrustning du har' },
		onlyDoable: { en: 'Show only what I can do', fi: 'Näytä vain mihin pystyn', hu: 'Csak amit meg tudok csinálni', sv: 'Visa bara vad jag klarar' },
		results: { en: 'results', fi: 'tulosta', hu: 'találat', sv: 'resultat' },
		reset: { en: 'Reset filters', fi: 'Tyhjennä suodattimet', hu: 'Szűrők törlése', sv: 'Rensa filter' },
		tabBrowse: { en: 'Browse', fi: 'Selaa', hu: 'Böngészés', sv: 'Bläddra' },
		tabSaved: { en: 'Saved', fi: 'Tallennetut', hu: 'Mentett', sv: 'Sparade' },
		open: { en: 'Open', fi: 'Avaa', hu: 'Megnyitás', sv: 'Öppna' },
		delete: { en: 'Delete', fi: 'Poista', hu: 'Törlés', sv: 'Radera' },
		noSaved: { en: 'No saved programs yet. Create a program and tap "Save program".', fi: 'Ei tallennettuja ohjelmia. Luo ohjelma ja paina "Tallenna ohjelma".', hu: 'Még nincs mentett program. Készíts programot, és nyomd meg a "Program mentése" gombot.', sv: 'Inga sparade program än. Skapa ett program och tryck "Spara program".' },
		back: { en: 'Back', fi: 'Takaisin', hu: 'Vissza', sv: 'Tillbaka' },
		use: { en: 'Use as my plan', fi: 'Käytä suunnitelmanani', hu: 'Beállítom tervemnek', sv: 'Använd som min plan' },
		resaveTitle: { en: 'Saved in an older version', fi: 'Tallennettu vanhemmassa versiossa', hu: 'Régebbi verzióban mentve', sv: 'Sparad i en äldre version' },
		resaveNote: { en: 'This program was saved before snapshots existed, so only your settings were kept. Open it to rebuild the program from those settings, then tap "Save program" again to store a full snapshot.', fi: 'Tämä ohjelma tallennettiin ennen tilannevedoksia, joten vain asetuksesi säilyivät. Avaa se rakentaaksesi ohjelman uudelleen näistä asetuksista ja tallenna sitten uudelleen täysi tilannevedos.', hu: 'Ezt a programot a pillanatképek előtt mentetted, így csak a beállításaid maradtak meg. Nyisd meg, hogy a beállításokból újraépüljön a program, majd mentsd el újra a teljes pillanatképet.', sv: 'Det här programmet sparades innan ögonblicksbilder fanns, så bara dina inställningar bevarades. Öppna det för att bygga om programmet från inställningarna och spara sedan en fullständig ögonblicksbild igen.' },
		emptyHelp: {
			en: 'No exercises match these filters. Try removing one, or reset.',
			fi: 'Mikään liike ei vastaa näitä suodattimia. Poista yksi tai tyhjennä.',
			hu: 'Egy gyakorlat sem felel meg ezeknek a szűrőknek. Vegyél el egyet, vagy töröld.',
			sv: 'Inga övningar matchar dessa filter. Ta bort ett, eller rensa.'
		}
	};
	const levelLabel = (e: Experience) => L(lbl[e], lang);

	// Equipment that can be toggled (everything beyond bodyweight; wall/floor are always available).
	const equipChips = equipment.filter((eq) => eq.tier > 0);

	function toggleEquip(id: string) {
		selectedEquip = selectedEquip.includes(id)
			? selectedEquip.filter((x) => x !== id)
			: [...selectedEquip, id];
	}

	function resetFilters() {
		search = '';
		category = 'all';
		musc = 'all';
		level = 'all';
		selectedEquip = [];
		onlyDoable = false;
	}

	const anyFilter = $derived(
		!!search.trim() || category !== 'all' || musc !== 'all' || level !== 'all' ||
		selectedEquip.length > 0 || onlyDoable
	);

	const filtered = $derived(
		exercises.filter((e) => {
			if (category !== 'all' && categoryKey(e.pattern) !== category) return false;
			if (musc !== 'all' && !e.primary.includes(musc)) return false;
			if (level !== 'all' && e.experienceMin !== level) return false;
			// "Show only what I can do" uses the shared profile (equipment + suitability). Otherwise the
			// manual equipment chips apply (shared token logic -> a single dumbbell does NOT unlock pairs).
			if (onlyDoable) {
				if (!hasEquipment(profile, e.id) || !suitable(profile, e.id)) return false;
			} else if (selectedEquip.length) {
				const probe = { ...profile, location: 'home', equipment: selectedEquip } as Profile;
				if (!hasEquipment(probe, e.id)) return false;
			}
			if (search.trim()) {
				const q = search.trim().toLowerCase();
				const hay = (L(e.name, lang) + ' ' + e.primary.map((m) => muscle(m, lang)).join(' ')).toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		})
	);
	const training = $derived(filtered.filter((e) => e.pattern !== 'mobility'));
	const mobility = $derived(filtered.filter((e) => e.pattern === 'mobility'));

	const figOptions = $derived([
		{ value: 'default', label: T('figure_default') },
		{ value: 'male', label: T('figure_male') },
		{ value: 'pregnant', label: T('figure_pregnant') }
	]);
</script>

<Seo {lang} path="/exercises" title={`${T('lib_title')} - Voimareitti`} description={T('lib_intro')} />

<SiteHeader {lang} />

<main id="main-content" class="container">
	<img class="pagebanner" src="/img/banners/training.webp" alt="" />
	<h1>{T('lib_title')}</h1>
	<p class="muted intro">{T('lib_intro')}</p>

	{#if viewing}
		{#if isWorkoutSnapshot(viewing.payload)}
			<WorkoutSnapshot plan={viewing.payload.plan} used={viewing.payload.used} {lang} onBack={() => (viewing = null)} onUse={useWorkout} />
		{:else}
			<div class="resave">
				<button type="button" class="back" onclick={() => (viewing = null)}>&larr; {L(lbl.back, lang)}</button>
				<h2>{L(lbl.resaveTitle, lang)}</h2>
				<p class="muted">{L(lbl.resaveNote, lang)}</p>
				<button type="button" class="ghost" onclick={useWorkout}>{L(lbl.use, lang)}</button>
			</div>
		{/if}
	{:else}
	<ProfilePanel {lang} startCollapsed collapsed={{ food: true }} />

	<div class="tabs" role="tablist" aria-label={T('lib_title')}>
		<button type="button" role="tab" class="tab" class:on={tab === 'browse'} aria-selected={tab === 'browse'} onclick={() => (tab = 'browse')}>{L(lbl.tabBrowse, lang)}</button>
		<button type="button" role="tab" class="tab" class:on={tab === 'saved'} aria-selected={tab === 'saved'} onclick={() => (tab = 'saved')}>{L(lbl.tabSaved, lang)} ({saved.workouts.length})</button>
	</div>

	{#if tab === 'saved'}
		{#if saved.workouts.length === 0}
			<p class="muted">{L(lbl.noSaved, lang)}</p>
		{:else}
			<ul class="savedlist">
				{#each saved.workouts as s (s.id)}
					<li class="saveditem">
						<span class="sv-name">{s.name}</span>
						<span class="sv-date muted">{new Date(s.savedAt).toLocaleDateString(lang)}</span>
						<button type="button" class="chip" onclick={() => openWorkout(s)}>{L(lbl.open, lang)}</button>
						<button type="button" class="chip" onclick={() => deleteWorkout(s.id)}>{L(lbl.delete, lang)}</button>
					</li>
				{/each}
			</ul>
		{/if}
	{:else}

	<div class="filters">
		<input class="search" type="search" placeholder={T('lib_search')} bind:value={search} aria-label={T('lib_search')} />
		<label>{T('f_category')}
			<select value={category} onchange={(e) => (category = e.currentTarget.value)}>
				<option value="all">{T('lib_all')}</option>
				{#each categoryKeys as c (c)}<option value={c}>{T('cat_' + c)}</option>{/each}
			</select>
		</label>
		<label>{T('f_muscle')}
			<select value={musc} onchange={(e) => (musc = e.currentTarget.value)}>
				<option value="all">{T('lib_all')}</option>
				{#each muscleKeys as m (m)}<option value={m}>{muscle(m, lang)}</option>{/each}
			</select>
		</label>
		<label>{L(lbl.level, lang)}
			<select value={level} onchange={(e) => (level = e.currentTarget.value as 'all' | Experience)}>
				<option value="all">{T('lib_all')}</option>
				<option value="beginner">{L(lbl.beginner, lang)}</option>
				<option value="intermediate">{L(lbl.intermediate, lang)}</option>
				<option value="advanced">{L(lbl.advanced, lang)}</option>
			</select>
		</label>
	</div>

	<div class="equiprow">
		<label class="doable">
			<input type="checkbox" bind:checked={onlyDoable} />
			<span>{L(lbl.onlyDoable, lang)}</span>
		</label>
		{#if !onlyDoable}
			<div class="chips" role="group" aria-label={L(lbl.equip, lang)}>
				<span class="chips-label">{L(lbl.equip, lang)}</span>
				<div class="chiprow">
					{#each equipChips as eq (eq.id)}
						<button
							type="button"
							class="chip"
							class:on={selectedEquip.includes(eq.id)}
							aria-pressed={selectedEquip.includes(eq.id)}
							onclick={() => toggleEquip(eq.id)}
						>{L(eq.name, lang)}</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="resultbar">
		<span class="count">{filtered.length} {L(lbl.results, lang)}</span>
		{#if anyFilter}
			<button type="button" class="reset" onclick={resetFilters}>{L(lbl.reset, lang)}</button>
		{/if}
	</div>

	<div class="figbar no-print">
		<span class="figlabel">{T('figure_shown_as')}:</span>
		<SegmentedControl
			options={figOptions}
			value={figVariant}
			ariaLabel={T('figure_shown_as')}
			onchange={(v) => (figVariant = v as 'default' | 'male' | 'pregnant')}
		/>
	</div>

	{#if !filtered.length}
		<div class="empty">
			<p class="muted">{L(lbl.emptyHelp, lang)}</p>
			<button type="button" class="reset" onclick={resetFilters}>{L(lbl.reset, lang)}</button>
		</div>
	{/if}

	{#snippet card(e: (typeof exercises)[number])}
		{@const eSrc = exerciseImageSrc(e.id, { prenatal: figVariant === 'pregnant', sex: figVariant === 'male' ? 'male' : 'unspecified' })}
		{@const thumb = figVariant === 'default' ? `/img/exercises/${e.id}.thumb.webp` : null}
		<a class="card" href={`/${lang}/exercises/${e.id}`}>
			{#if eSrc}
				<img class="eximg" src={eSrc} srcset={thumb ? `${thumb} 200w, ${eSrc} 600w` : undefined} sizes="(max-width: 760px) 28vw, 120px" alt="" loading="lazy" />
			{:else}
				<div class="eximg ph"></div>
			{/if}
			<div class="cbody">
				<b>{L(e.name, lang)}</b>
				<span class="muscles">{e.primary.map((m) => muscle(m, lang)).join(' . ')}</span>
				<span class="cat">{T('cat_' + categoryKey(e.pattern))} . {T('eq_' + equipmentNeed(e.minTier))}</span>
				<span class="lvl">{levelLabel(e.experienceMin)}</span>
			</div>
		</a>
	{/snippet}

	{#if training.length}
		<h2>{T('lib_training')}</h2>
		<div class="grid">{#each training as e (e.id)}{@render card(e)}{/each}</div>
	{/if}
	{#if mobility.length}
		<h2>{T('lib_mobility')}</h2>
		<div class="grid">{#each mobility as e (e.id)}{@render card(e)}{/each}</div>
	{/if}

	<section class="intensity">
		<h2>{T('intensity_title')}</h2>
		<p class="muted">{T('intensity_intro')}</p>
		<div class="techs">
			{#each intensityTechniques as it (it.name.en)}
				<div class="tech"><b>{L(it.name, lang)}</b><span class="muted small">{L(it.how, lang)}</span></div>
			{/each}
		</div>
	</section>
	{/if}
	{/if}
</main>

<style>
	h2 { margin-top: 1.75rem; }
	.pagebanner { display: block; width: 100%; height: auto; border-radius: var(--radius); margin: 1rem 0 0.25rem; }
	.intro { margin: 0 0 1rem; }
	.tabs { display: flex; gap: 0.4rem; margin: 0.5rem 0 0.8rem; }
	.tab { min-height: 40px; padding: 0.4rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
	.tab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); }
	.resave { display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; max-width: 60ch; }
	.resave h2 { margin: 0; }
	.back { font: inherit; background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600; padding: 0; }
	.ghost { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.5rem 1rem; min-height: 44px; cursor: pointer; }
	.ghost:hover { border-color: var(--accent); }
	.savedlist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
	.saveditem { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.6rem 0.8rem; }
	.sv-name { font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
	.sv-date { font-size: 0.8rem; margin-right: auto; color: var(--muted); }
	.savedlist .chip { min-height: 40px; padding: 0.3rem 0.8rem; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--text); font: inherit; font-size: 0.82rem; cursor: pointer; }
	.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.65rem 0.8rem; align-items: end; margin: 1rem 0 0.6rem; }
	.filters .search { grid-column: 1 / -1; width: 100%; }
	.filters label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; color: var(--muted); }
	.filters label select { width: 100%; }
	.equiprow { display: flex; flex-direction: column; gap: 0.6rem; margin: 0 0 0.6rem; }
	.doable { display: flex; align-items: center; gap: 0.5rem; min-height: 44px; font-size: 0.9rem; }
	.chips-label { display: block; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.35rem; }
	.chiprow { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.chip { min-height: 36px; padding: 0.3rem 0.7rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--text); font: inherit; font-size: 0.8rem; cursor: pointer; }
	.chip.on { background: var(--accent-soft); border-color: var(--accent); color: var(--primary); font-weight: 600; }
	.chip:hover { border-color: var(--accent); }
	.resultbar { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin: 0 0 0.6rem; }
	.count { font-size: 0.85rem; color: var(--muted); font-weight: 600; }
	.reset { font: inherit; font-size: 0.82rem; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 0.35rem 0.8rem; min-height: 36px; cursor: pointer; }
	.reset:hover { border-color: var(--accent); }
	.figbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 0 0 0.8rem; }
	.figlabel { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
	.empty { margin: 1.5rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.8rem; margin: 0.6rem 0 0.5rem; }
	.card { display: flex; gap: 0.7rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0.7rem; text-decoration: none; color: var(--text); }
	.card:hover { border-color: var(--accent); }
	.eximg { width: 74px; height: 98px; object-fit: contain; background: var(--accent-soft); border-radius: 0.4rem; flex: none; }
	.eximg.ph { background: #f0efea; }
	.cbody { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
	.muscles { font-size: 0.78rem; color: var(--accent); }
	.cat { font-size: 0.75rem; color: var(--muted); }
	.lvl { font-size: 0.72rem; color: var(--muted); align-self: flex-start; border: 1px solid var(--line); border-radius: 999px; padding: 0.05rem 0.5rem; margin-top: 0.1rem; }
	.intensity { margin-top: 2rem; border-top: 1px solid var(--line); padding-top: 1.25rem; }
	.techs { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.7rem; margin-top: 0.6rem; }
	.tech { display: flex; flex-direction: column; gap: 0.2rem; border-left: 3px solid var(--accent); padding: 0.1rem 0 0.1rem 0.7rem; }
	.tech b { color: var(--primary); }
	.small { font-size: 0.8rem; }
	@media (max-width: 760px) {
		.filters { position: sticky; top: 0; z-index: 5; background: var(--bg); padding-top: 0.4rem; }
	}
</style>
