<script lang="ts">
	// Dedicated A4 print handout. Hidden on screen, shown only when printing, so the website
	// layout is untouched and the PDF is purpose-built (not a screenshot of the web app).
	import { t, type Locale } from '$lib/i18n';
	import {
		L, muscle, goals, nutritionGoals, splits, pregnancyBodyNote
	} from '$lib/content/data';
	import type { Plan, Profile } from '$lib/engine/engine';
	import { exerciseImageSrc } from '$lib/content/exercise-images';

	let { plan, profile, owner, lang, density = 'full' }: { plan: Plan; profile: Profile; owner?: { name: string; phone: string; email: string }; lang: Locale; density?: 'compact' | 'full' } = $props();
	const T = (k: string) => t(lang, k);
	const fmt1 = (n: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
	const ownerLine = $derived([owner?.name, owner?.phone, owner?.email].filter(Boolean).join('  ·  '));

	const nameOf = (arr: { id: string; name: { en: string } }[], id: string) => {
		const it = arr.find((x) => x.id === id);
		return it ? L(it.name, lang) : id;
	};

	function splitLabel(titleKey: string): string {
		const map: Record<string, string> = {
			session: 's_fullbody', upper: 's_upper', lower: 's_lower',
			push: 's_push', pull: 's_pull', legs: 's_legs'
		};
		return map[titleKey] ? T(map[titleKey]) : titleKey;
	}
	function sess(s: { titleKey: string; day: number }): string {
		return `${T('day_label')} ${s.day} - ${splitLabel(s.titleKey)}`;
	}

	const today = $derived(new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : lang));
	const proteinPerKg = $derived(
		profile.weightKg
			? `${fmt1(plan.energy.proteinLow / profile.weightKg)}-${fmt1(plan.energy.proteinHigh / profile.weightKg)} g/kg`
			: ''
	);
	const projChange = $derived(`${plan.body.weeklyChangeKg > 0 ? '+' : ''}${plan.body.weeklyChangeKg} kg`);
</script>

<div class="pg" aria-hidden="true">
	<!-- Cover / header band -->
	<header class="pg-cover">
		<img class="pg-logo" src="/img/brand/logo-horizontal.png" alt="Voimareitti" />
		<div class="pg-meta">
			<div class="pg-title">{T('pdf_subtitle')}</div>
			{#if ownerLine}<div class="pg-owner">{ownerLine}</div>{/if}
			<div class="pg-sub">{today}</div>
		</div>
	</header>

	<!-- Compact profile summary: the goal + constraints that shaped this plan -->
	<section class="pg-profile">
		<span class="pg-plabel">{T('pdf_profile')}:</span>
		<span class="pg-pill">{nameOf(goals, plan.trainingGoal)}</span>
		<span class="pg-pill">{nameOf(nutritionGoals, plan.nutritionGoal)}</span>
		<span class="pg-pill">{nameOf(splits, plan.resolvedSplit)}</span>
		<span class="pg-pill">{profile.days}&times;{profile.minutes} min</span>
		<span class="pg-pill">{T('exp_' + profile.experience)}</span>
		<span class="pg-pill">{T('f_age')} {profile.age}</span>
		<span class="pg-pill">{profile.weightKg} kg &middot; {profile.heightCm} cm</span>
		{#if profile.sex !== 'unspecified'}<span class="pg-pill">{T('sex_' + profile.sex)}</span>{/if}
		{#if plan.prenatal}<span class="pg-pill">{profile.pregnant ? T('ls_pregnant') : T('ls_postpartum')}</span>{/if}
	</section>

	<!-- Your body + Your daily targets as two clean cards (mirrors the web result) -->
	<section class="pg-cardrow">
		<div class="pg-card">
			<h3 class="pg-cardh">{T('r_body')}</h3>
			<div class="pg-statgrid">
				<div class="pg-stat alt"><b>{plan.body.bmi}</b><span>{T('m_bmi')}</span></div>
				<div class="pg-stat alt"><b>{plan.energy.bmr}</b><span>{T('m_bmr')}</span></div>
				<div class="pg-stat alt"><b>{plan.energy.tdee}</b><span>{T('m_tdee')}</span></div>
				{#if !plan.prenatal}
					<div class="pg-stat alt"><b>{projChange}</b><span>{T('m_proj')} {T('per_week_short')}</span></div>
				{/if}
			</div>
			{#if plan.prenatal}<p class="pg-cardnote">{L(pregnancyBodyNote, lang)}</p>{/if}
		</div>
		<div class="pg-card">
			<h3 class="pg-cardh">{T('energy_title')}</h3>
			<div class="pg-statgrid">
				<div class="pg-stat"><b>{plan.energy.target}</b><span>{T('kcal')}</span></div>
				<div class="pg-stat"><b>{plan.energy.proteinLow}-{plan.energy.proteinHigh} g</b><span>{T('protein')}{#if proteinPerKg} ({proteinPerKg}){/if}</span></div>
				<div class="pg-stat"><b>{plan.energy.carbG} g</b><span>{T('carbs')}</span></div>
				<div class="pg-stat"><b>{plan.energy.fatG} g</b><span>{T('fat')}</span></div>
				<div class="pg-stat"><b>{plan.energy.fiberG} g</b><span>{T('fiber')}</span></div>
				<div class="pg-stat"><b>{fmt1(plan.energy.waterMl / 1000)} l</b><span>{T('water')}</span></div>
			</div>
		</div>
	</section>

	<!-- Plain-language reference: what each number means (full detail only) -->
	{#if density === 'full'}
	<section class="pg-explain">
		<p class="pg-explainh">{T('why_intro')}</p>
		<ul class="pg-why">
			<li><b>{T('kcal')}.</b> {T('why_kcal')}</li>
			<li><b>{T('protein')}.</b> {T('why_protein')}</li>
			<li><b>{T('carbs')}.</b> {T('why_carbs')}</li>
			<li><b>{T('fat')}.</b> {T('why_fat')}</li>
			<li><b>{T('fiber')}.</b> {T('why_fiber')}</li>
			<li><b>{T('water')}.</b> {T('why_water')}</li>
			<li><b>{T('m_bmi')}.</b> {T('why_bmi')}</li>
			<li><b>{T('m_bmr')}.</b> {T('why_bmr')}</li>
			<li><b>{T('m_tdee')}.</b> {T('why_tdee')}</li>
			{#if !plan.prenatal}<li><b>{T('m_proj')}.</b> {T('why_proj')}</li>{/if}
		</ul>
	</section>
	{/if}

	<!-- Training -->
	<section class="pg-section">
		<h2 class="pg-h2">{T('r_training')}</h2>
		{#if plan.mobilityOnly}<p class="pg-warm"><b>{T('mobility_only_banner')}</b></p>{/if}
		{#if !plan.mobilityOnly}
		<div class="pg-guide">
			<span><b>{T('effort')}:</b> {L(plan.guidance.rir, lang)}</span>
			<span><b>{T('tempo')}:</b> {plan.guidance.tempo}</span>
			<span><b>{T('progression_label')}:</b> {L(plan.guidance.progression, lang)}</span>
			<span><b>{T('cardio_label')}:</b> {L(plan.guidance.cardio, lang)}</span>
		</div>
		{/if}

		{#if plan.warmup.items.length}
			<p class="pg-warm"><b>{T('r_warmup')}:</b> {plan.warmup.items.map((it) => L(it.exercise.name, lang)).join(' · ')}</p>
		{/if}
		{#if plan.birthPrep && plan.birthPrep.items.length}
			<p class="pg-warm"><b>{T('r_birthprep')}:</b> {plan.birthPrep.items.map((it) => L(it.exercise.name, lang)).join(' · ')} <span class="pg-cardnote">{T('birthprep_note')}</span></p>
		{/if}
		{#if plan.cooldown.items.length}
			<p class="pg-warm"><b>{T('r_cooldown')}:</b> {plan.cooldown.items.map((it) => L(it.exercise.name, lang)).join(' · ')}</p>
		{/if}

		{#if plan.pullGap}<p class="pg-warm">{T('pull_gap')}</p>{/if}

		{#each plan.sessions as s, i (s.titleKey + '-' + i)}
			<div class="pg-day">
				<h3 class="pg-h3">{sess(s)}</h3>
				{#if !s.items.length}<p class="pg-warm">{T('empty_session_hint')}</p>{/if}
				{#each s.items as it (it.exercise.id)}
					{@const exSrc = exerciseImageSrc(it.exercise.id, { prenatal: plan.prenatal, sex: profile.sex })}
					<div class="pg-ex">
						{#if exSrc}
							<img class="pg-eximg" src={exSrc} alt="" />
						{:else}
							<div class="pg-eximg ph"></div>
						{/if}
						<div class="pg-exbody">
							<div class="pg-exhead">
								<span class="pg-exname">{L(it.exercise.name, lang)}</span>
								<span class="pg-dose">{it.sets} &times; {it.reps} &middot; {T('rest')} {it.restSec}s</span>
							</div>
							<div class="pg-muscles">{it.exercise.primary.map((m) => muscle(m, lang)).join(' · ')}</div>
							{#if density === 'full'}
								<div class="pg-cue">{L(it.exercise.cue, lang)}</div>
								<div class="pg-tips"><b>{T('pdf_avoid')}:</b> {L(it.exercise.mistakes, lang)} &nbsp; <b>{T('ex_easier')}:</b> {L(it.exercise.easier, lang)} &nbsp; <b>{T('ex_harder')}:</b> {L(it.exercise.harder, lang)}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</section>

	<footer class="pg-foot">{T('disclaimer')}</footer>
</div>

<style>
	.pg { display: none; }

	@media print {
		.pg {
			display: block;
			color: #1b2024;
			font-size: 10.5pt;
			line-height: 1.42;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		/* Cover */
		.pg-cover { display: flex; align-items: center; justify-content: space-between; gap: 12pt; border-bottom: 2pt solid var(--accent); padding-bottom: 7pt; margin-bottom: 12pt; }
		.pg-logo { height: 34px; width: auto; }
		.pg-meta { text-align: right; }
		.pg-title { font-size: 15pt; font-weight: 700; color: var(--primary); }
		.pg-sub { font-size: 8.5pt; color: #5b6670; margin-top: 2pt; }

		/* Summary cards (Your body + Your daily targets) - mirrors the web result layout */
		.pg-cardrow { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; margin-bottom: 8pt; break-inside: avoid; }
		.pg-card { border: 1pt solid var(--line); border-radius: 6pt; padding: 7pt 8pt 8pt; break-inside: avoid; }
		.pg-cardh { font-size: 10pt; font-weight: 700; color: var(--primary); margin: 0 0 5pt; }
		.pg-statgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4pt; }
		.pg-stat { background: var(--accent-soft); border-radius: 4pt; padding: 5pt 3pt; text-align: center; }
		.pg-stat b { display: block; font-size: 11pt; color: var(--primary); line-height: 1.1; }
		.pg-stat span { font-size: 6.5pt; color: #5b6670; text-transform: uppercase; letter-spacing: 0.02em; }
		.pg-cardnote { font-size: 8pt; color: #5b6670; margin: 5pt 0 0; }
		.pg-stat.alt b { color: var(--accent); }
		.pg-owner { font-size: 8.5pt; color: #5b6670; margin-top: 3pt; }

		/* Profile summary chips */
		.pg-profile { display: flex; flex-wrap: wrap; align-items: center; gap: 4pt; margin-bottom: 10pt; }
		.pg-plabel { font-size: 8pt; font-weight: 700; color: #5b6670; text-transform: uppercase; letter-spacing: 0.04em; }
		.pg-pill { background: var(--accent-soft); color: var(--primary); border-radius: 9pt; padding: 1.5pt 6pt; font-size: 8.5pt; font-weight: 600; }

		/* Plain-language reference block (compact, secondary) */
		.pg-explain { margin-bottom: 10pt; break-inside: avoid; }
		.pg-explainh { font-size: 8.5pt; color: #5b6670; margin: 0 0 4pt; font-weight: 600; }
		.pg-why { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2pt 12pt; font-size: 8pt; color: #5b6670; }
		.pg-why li { break-inside: avoid; }
		.pg-why b { color: #1b2024; }

		/* Sections + hierarchy */
		.pg-section { margin-bottom: 12pt; }
		.pg-h2 { font-size: 13pt; color: var(--primary); border-left: 4pt solid var(--accent); padding-left: 7pt; margin: 0 0 7pt; break-after: avoid; }
		.pg-h3 { font-size: 11pt; color: #1b2024; margin: 9pt 0 4pt; padding-bottom: 2pt; border-bottom: 1pt solid var(--line); break-after: avoid; }
		.pg-guide { display: grid; gap: 2pt; background: var(--accent-soft); border-radius: 5pt; padding: 7pt 9pt; font-size: 9pt; margin-bottom: 8pt; break-inside: avoid; }
		.pg-warm { font-size: 9.5pt; margin: 0 0 6pt; }

		/* Exercise rows (paper-friendly cards) */
		.pg-day { margin-bottom: 4pt; }
		.pg-ex { display: flex; gap: 9pt; padding: 6pt 0; border-bottom: 1pt solid var(--line); break-inside: avoid; }
		.pg-eximg { width: 54px; height: 72px; object-fit: contain; background: var(--accent-soft); border-radius: 4pt; flex: none; }
		.pg-eximg.ph { background: #f0efea; }
		.pg-exbody { flex: 1; min-width: 0; }
		.pg-exhead { display: flex; align-items: baseline; justify-content: space-between; gap: 8pt; }
		.pg-exname { font-size: 11pt; font-weight: 700; }
		.pg-dose { font-size: 9.5pt; font-weight: 600; color: var(--accent); white-space: nowrap; }
		.pg-muscles { font-size: 8.5pt; color: var(--accent); margin-top: 1pt; }
		.pg-cue { font-size: 9.5pt; margin-top: 2pt; }
		.pg-tips { font-size: 8.5pt; color: #5b6670; margin-top: 2pt; }
		.pg-tips b { color: #1b2024; }

		.pg-foot { margin-top: 12pt; border-top: 1pt solid var(--line); padding-top: 5pt; font-size: 7.5pt; color: #5b6670; }
	}
</style>
