<script lang="ts">
	// Read-only snapshot of a saved workout program (saved-plan snapshot views). Mirrors the workout
	// result page (body + energy stat cards, settings pills, warm-up / training / cool-down day cards)
	// without any edit affordances. Back returns to the Saved tab; "Use as my plan" loads the exact
	// snapshot into the live workout page. Pure rendering over the stored Plan - no engine, no mutation.
	import { t, type Locale } from '$lib/i18n';
	import InfoTip from '$lib/InfoTip.svelte';
	import { glossary } from '$lib/content/glossary';
	import {
		L, muscle, goals, nutritionGoals, emphases, splits,
		bmiNote, paceNote, pregnancyBodyNote, waistNote, type Loc
	} from '$lib/content/data';
	import { exerciseImageSrc, maleImages, prenatalImages } from '$lib/content/exercise-images';
	import type { Plan, Profile } from '$lib/engine/engine';

	let { plan, used, lang, onBack, onUse }: {
		plan: Plan; used: Profile; lang: Locale; onBack: () => void; onUse: () => void;
	} = $props();

	const T = (k: string) => t(lang, k);
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
	const g = (k: string) => ({ title: L(glossary[k].title, lang), body: L(glossary[k].body, lang) });

	const lbl: Record<string, Loc> = {
		back: { en: 'Back', fi: 'Takaisin', hu: 'Vissza', sv: 'Tillbaka' },
		use: { en: 'Use as my plan', fi: 'Käytä suunnitelmanani', hu: 'Beállítom tervemnek', sv: 'Använd som min plan' }
	};

	function figLabelFor(id: string): string | null {
		if (plan.prenatal && prenatalImages.has(id)) return T('figure_pregnant');
		if (used.sex === 'male' && maleImages.has(id)) return T('figure_male');
		if (used.sex === 'female') return T('figure_female');
		return null;
	}
	const nameOf = (arr: { id: string; name: { en: string } }[], id: string) => {
		const it = arr.find((x) => x.id === id);
		return it ? L(it.name, lang) : id;
	};
	const trainingGoalName = $derived(nameOf(goals, used.trainingGoal ?? 'general'));
	const nutritionGoalName = $derived(nameOf(nutritionGoals, used.nutritionGoal ?? 'maintain'));
	const emphasisName = $derived(nameOf(emphases, used.emphasis ?? 'balanced'));
	const splitName = $derived(nameOf(splits, plan.resolvedSplit));
	function splitLabel(titleKey: string): string {
		const map: Record<string, string> = {
			session: 's_fullbody', upper: 's_upper', lower: 's_lower',
			push: 's_push', pull: 's_pull', legs: 's_legs'
		};
		return map[titleKey] ? T(map[titleKey]) : titleKey;
	}
	const warmMin = $derived(Math.round(plan.warmup.items.length * 1.5));
	function dayMinutes(s: { items: { sets: number; restSec: number }[] }): number {
		const work = s.items.reduce((t, it) => t + it.sets * (45 + it.restSec), 0);
		return Math.round(work / 60) + warmMin;
	}
	const liveVolume = $derived.by(() => {
		const vol: Record<string, number> = {};
		for (const s of plan.sessions) for (const it of s.items) for (const m of it.exercise.primary) vol[m] = (vol[m] ?? 0) + it.sets;
		return Object.entries(vol)
			.map(([m, sets]) => ({ muscle: m, sets }))
			.sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle))
			.slice(0, 8);
	});
	const weeklySets = $derived(plan.sessions.reduce((t, s) => t + s.items.reduce((u, it) => u + it.sets, 0), 0));
	const volMax = $derived(Math.max(1, ...liveVolume.map((v) => v.sets)));
	const meals = $derived(used.days >= 5 ? 4 : 3);
	const proteinPerKg = $derived(
		used.weightKg ? `${fmt1(plan.energy.proteinLow / used.weightKg)}-${fmt1(plan.energy.proteinHigh / used.weightKg)} g/kg` : ''
	);
</script>

<div class="snap">
	<div class="actions">
		<button type="button" class="back" onclick={onBack}>&larr; {L(lbl.back, lang)}</button>
		<button type="button" class="ghost" onclick={onUse}>{L(lbl.use, lang)}</button>
	</div>

	<h2 class="result-title">{T('result_title')}</h2>

	<div class="cardrow">
		<section class="statcard">
			<h2>{T('r_body')}</h2>
			<div class="stats">
				<div class="stat"><b>{plan.body.bmi}</b><span>{T('m_bmi')}{#if !plan.prenatal} . {T('bmi_' + plan.body.bmiCategory)}{/if}</span></div>
				<div class="stat"><b>{plan.energy.bmr}</b><span>{T('m_bmr')}</span></div>
				<div class="stat"><b>{plan.energy.tdee}</b><span>{T('m_tdee')}</span></div>
				{#if plan.body.waistRatio}<div class="stat"><b>{plan.body.waistRatio}</b><span>{T('m_waist')}</span></div>{/if}
				{#if !plan.prenatal}
					<div class="stat accent"><b>{plan.body.weeklyChangeKg > 0 ? '+' : ''}{plan.body.weeklyChangeKg} kg</b><span>{T('m_proj')} {T('per_week_short')}</span></div>
				{/if}
			</div>
			{#if plan.prenatal}
				<p class="muted small">{L(pregnancyBodyNote, lang)}</p>
			{:else}
				<p class="muted small">{L(bmiNote, lang)}</p>
				{#if plan.body.waistRatio}<p class="muted small">{L(waistNote, lang)}</p>{/if}
				{#if plan.body.fastPace}<p class="tip">{L(paceNote, lang)}</p>{/if}
			{/if}
		</section>

		<section class="statcard">
			<h2>{T('energy_title')}</h2>
			<div class="stats">
				<div class="stat accent"><b>{plan.energy.target}</b><span>{T('kcal')}</span></div>
				<div class="stat"><b>{plan.energy.proteinLow}-{plan.energy.proteinHigh} g</b><span>{T('protein')}{#if proteinPerKg} <span class="pk">({proteinPerKg})</span>{/if}</span></div>
				<div class="stat"><b>{plan.energy.carbG} g</b><span>{T('carbs')}</span></div>
				<div class="stat"><b>{plan.energy.fatG} g</b><span>{T('fat')}</span></div>
				<div class="stat"><b>{plan.energy.fiberG} g</b><span>{T('fiber')}</span></div>
				<div class="stat"><b>{fmt1(plan.energy.waterMl / 1000)} l</b><span>{T('water')}</span></div>
			</div>
			<p class="muted small">{T('feeler')}</p>
		</section>
	</div>

	<section class="overview">
		<span class="pill">{trainingGoalName}</span>
		<span class="pill">{nutritionGoalName}</span>
		<span class="pill">{emphasisName}</span>
		<span class="pill">{splitName}</span>
		<span class="pill">{used.days}&times;{used.minutes} min</span>
		<span class="pill">{T('exp_' + (used.experience ?? 'beginner'))}</span>
		<span class="pill">{used.location === 'gym' ? T('where_gym') : T('where_home')}</span>
	</section>

	{#if plan.warmup.items.length}
		<section class="block">
			<h2>{T('r_warmup')}</h2>
			<p class="muted small">{T('warmup_each')}</p>
			<div class="cards">
				{#each plan.warmup.items as it (it.uid ?? it.exercise.id)}
					{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: plan.prenatal, sex: used.sex })}
					<article class="card">
						{#if exSrc}
							{@const figL = figLabelFor(it.exercise.id)}
							<div class="figcell"><img class="eximg" src={exSrc} alt="" loading="lazy" />{#if figL}<span class="figchip">{figL}</span>{/if}</div>
						{/if}
						<div class="cbody"><b>{L(it.exercise.name, lang)}</b><span class="muted small">{L(it.exercise.cue, lang)}</span></div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	{#if plan.birthPrep && plan.birthPrep.items.length}
		<section class="block">
			<h2>{T('r_birthprep')}</h2>
			<p class="tip">{T('birthprep_note')}</p>
			<div class="cards">
				{#each plan.birthPrep.items as it (it.uid ?? it.exercise.id)}
					{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: plan.prenatal, sex: used.sex })}
					<article class="card">
						{#if exSrc}<img class="eximg" src={exSrc} alt="" loading="lazy" />{/if}
						<div class="cbody"><b>{L(it.exercise.name, lang)}</b><span class="muted small">{L(it.exercise.cue, lang)}</span></div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	{#if !plan.mobilityOnly}
		<section class="block">
			<h2>{T('r_training')}</h2>
			<p class="weekline">{used.days} {T('days_word')} &middot; {splitName}</p>

			<div class="guide">
				<span><b>{T('effort')}:</b> {L(plan.guidance.rir, lang)} <InfoTip {...g('effort')} /></span>
				<span><b>{T('tempo')}:</b> {plan.guidance.tempo} <InfoTip {...g('tempo')} /></span>
				<span><b>{T('progression_label')}:</b> {L(plan.guidance.progression, lang)} <InfoTip {...g('progression')} /></span>
				<span><b>{T('cardio_label')}:</b> {L(plan.guidance.cardio, lang)} <InfoTip {...g('cardio')} /></span>
			</div>

			{#if liveVolume.length}
				<div class="vol">
					<h3>{T('r_volume')} <span class="muted small">({weeklySets} {T('weekly_sets')})</span></h3>
					{#each liveVolume as v (v.muscle)}
						<div class="volrow">
							<span class="vlabel">{muscle(v.muscle, lang)}</span>
							<span class="vbar"><span class="vfill" style={`width:${(v.sets / volMax) * 100}%`}></span></span>
							<span class="vnum">{v.sets}</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if plan.pullGap}<p class="tip">{T('pull_gap')}</p>{/if}

			{#each plan.sessions as s, i (s.titleKey + '-' + i)}
				<h3 class="sess"><span>{T('day_label')} {s.day} &middot; {splitLabel(s.titleKey)} <span class="daymin">~{dayMinutes(s)} min</span></span></h3>
				{#if !s.items.length}<p class="tip">{T('empty_session_hint')}</p>{/if}
				<div class="cards">
					{#each s.items as it (it.uid ?? it.exercise.id)}
						{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: plan.prenatal, sex: used.sex })}
						<article class="card">
							{#if exSrc}
								{@const figL = figLabelFor(it.exercise.id)}
								<div class="figcell"><img class="eximg" src={exSrc} alt="" loading="lazy" />{#if figL}<span class="figchip">{figL}</span>{/if}</div>
							{/if}
							<div class="cbody">
								<a class="exname" href={`/${lang}/exercises/${it.exercise.id}`}>{L(it.exercise.name, lang)}</a>
								<span class="muscles">{it.exercise.primary.map((m) => muscle(m, lang)).join(' . ')}</span>
								<span class="dose">{it.sets} {T('sets')} . {it.reps} {T('reps')} . {T('rest')} {it.restSec} s</span>
								<span class="muted small">{L(it.exercise.cue, lang)}</span>
								<details class="exd">
									<summary>{T('ex_details')}</summary>
									<dl>
										<dt>{T('ex_purpose')}</dt><dd>{L(it.exercise.purpose, lang)}</dd>
										<dt>{T('ex_setup')}</dt><dd>{L(it.exercise.setup, lang)}</dd>
										<dt>{T('ex_mistakes')}</dt><dd>{L(it.exercise.mistakes, lang)}</dd>
										<!-- Easier/Harder mirror the live result (2026-07 parity audit M10: read-only means
										     no buttons, not less information). -->
										<dt>{T('ex_easier')}</dt><dd>{L(it.exercise.easier, lang)}</dd>
										<dt>{T('ex_harder')}</dt><dd>{L(it.exercise.harder, lang)}</dd>
										{#if it.exercise.safety}<dt class="warn">{T('ex_safety')}</dt><dd>{L(it.exercise.safety, lang)}</dd>{/if}
									</dl>
								</details>
							</div>
						</article>
					{/each}
				</div>
			{/each}
		</section>
	{/if}

	{#if plan.cooldown.items.length}
		<section class="block">
			<h2>{T('r_cooldown')}</h2>
			<p class="muted small">{T('cooldown_note')}</p>
			<div class="cards">
				{#each plan.cooldown.items as it (it.uid ?? it.exercise.id)}
					{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: plan.prenatal, sex: used.sex })}
					<article class="card">
						{#if exSrc}
							{@const figL = figLabelFor(it.exercise.id)}
							<div class="figcell"><img class="eximg" src={exSrc} alt="" loading="lazy" />{#if figL}<span class="figchip">{figL}</span>{/if}</div>
						{/if}
						<div class="cbody"><b>{L(it.exercise.name, lang)}</b><span class="muted small">{L(it.exercise.cue, lang)}</span></div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	<p class="disc">{T('disclaimer')}</p>
</div>

<style>
	.snap { display: flex; flex-direction: column; gap: 1rem; margin: 0 0 2rem; }
	.actions { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
	.back { font: inherit; background: none; border: none; color: var(--accent); cursor: pointer; padding: 0; font-weight: 600; }
	.ghost { font: inherit; font-weight: 600; color: var(--primary); background: var(--surface); border: 1px solid var(--line); border-radius: 0.6rem; padding: 0.5rem 1rem; min-height: 44px; cursor: pointer; }
	.ghost:hover { border-color: var(--accent); }
	.result-title { margin: 0; font-size: 2em; }
	.muted { color: var(--muted); }
	.small { font-size: 0.8rem; }
	.cardrow { display: flex; flex-direction: column; gap: 1rem; }
	.statcard { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.8rem 1rem; }
	.statcard h2 { margin: 0 0 0.6rem; font-size: 1.05rem; }
	.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.6rem; }
	.stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); padding: 0.6rem 0.4rem; text-align: center; }
	.stat b { font-size: 1.15rem; color: var(--text); line-height: 1; }
	.stat span { font-size: 0.76rem; color: var(--muted); line-height: 1.18; }
	.stat.accent b { color: var(--primary); }
	.pk { display: block; font-size: 0.62rem; color: var(--accent); font-weight: 600; }
	.overview { display: flex; flex-wrap: wrap; gap: 0.4rem; }
	.pill { background: var(--accent-soft); color: var(--primary); border-radius: 2rem; padding: 0.2rem 0.7rem; font-size: 0.8rem; font-weight: 600; }
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
	.exname { font-weight: 700; color: var(--text); text-decoration: none; }
	.exname:hover { color: var(--primary); text-decoration: underline; }
	.eximg { width: 72px; height: 96px; object-fit: contain; background: var(--accent-soft); border-radius: 0.4rem; flex: none; display: block; }
	.figcell { position: relative; flex: none; }
	.figchip { position: absolute; left: 0.25rem; bottom: 0.25rem; background: rgba(40,74,99,0.82); color: #fff; font-size: 0.68rem; font-weight: 700; padding: 0.05rem 0.35rem; border-radius: 1rem; line-height: 1.4; }
	.cbody { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; overflow-wrap: anywhere; }
	.muscles { font-size: 0.78rem; color: var(--accent); }
	.dose { font-size: 0.85rem; }
	.exd { margin-top: 0.35rem; }
	.exd summary { cursor: pointer; font-size: 0.8rem; color: var(--primary); }
	.exd dl { margin: 0.4rem 0 0; font-size: 0.82rem; }
	.exd dt { font-weight: 600; margin-top: 0.35rem; }
	.exd dt.warn { color: #9a4a13; }
	.exd dd { margin: 0 0 0.1rem; color: var(--muted); }
	.tip { background: var(--accent-soft); border-radius: 0.4rem; padding: 0.5rem 0.8rem; font-size: 0.85rem; }
	.disc { font-size: 0.78rem; color: var(--muted); margin: 0.5rem 0 0; max-width: 60ch; }
	h3 { margin-top: 0.6rem; }
</style>
