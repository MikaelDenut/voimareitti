// Regression net (backlog B): locks the behaviours most likely to silently break -
// asset coverage, route/detail data, swap + mobility reachability, equipment + life-stage
// gating, PDF-critical fields, and the no-dash / diacritics hard rules across ALL content.
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	generate, swapOptions, mobilityOptions, estimateEnergy, type Profile
} from '$lib/engine/engine';
import { exercises } from '$lib/content/data';
import { exerciseImages } from '$lib/content/exercise-images';
import { profiles } from '$lib/content/profiles';
import { nutritionTopics } from '$lib/content/nutrition-content';
import { glossary } from '$lib/content/glossary';
import { messages, locales } from '$lib/i18n';

const imgDir = fileURLToPath(new URL('../../static/img/exercises', import.meta.url));
const files = readdirSync(imgDir);

const base: Profile = {
	age: 30, sex: 'male', weightKg: 80, heightCm: 180,
	trainingGoal: 'hypertrophy', nutritionGoal: 'maintain', experience: 'intermediate',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};

describe('exercise library coverage', () => {
	it('has the full 100-exercise library, all illustrated and on disk', () => {
		expect(exercises.length).toBe(135);
		expect(exerciseImages.size).toBe(135);
		for (const e of exercises) {
			expect(exerciseImages.has(e.id), `no image flag for ${e.id}`).toBe(true);
			expect(files, `no webp on disk for ${e.id}`).toContain(`${e.id}.webp`);
		}
	});

	it('every exercise carries the fields its detail page renders', () => {
		for (const e of exercises) {
			const rec = e as unknown as Record<string, { en?: string }>;
			for (const f of ['name', 'cue', 'purpose', 'setup', 'mistakes', 'easier', 'harder'] as const) {
				expect(rec[f]?.en, `${e.id}.${f} missing en`).toBeTruthy();
			}
			expect(profiles[e.id], `${e.id} has no profile`).toBeTruthy();
		}
	});

	it('no image-set id is an orphan without a webp file', () => {
		for (const id of exerciseImages) expect(files).toContain(`${id}.webp`);
	});
});

describe('no orphan exercises (every move is reachable across the profile grid)', () => {
	it('each training exercise is auto-picked or swap-reachable somewhere', () => {
		const reachable = new Set<string>();
		const goalsG = ['strength', 'hypertrophy', 'fat-loss', 'general'] as const;
		const expG = ['beginner', 'intermediate', 'advanced'] as const;
		const splitG = ['full-body', 'upper-lower', 'ppl'] as const;
		for (const trainingGoal of goalsG)
			for (const experience of expG)
				for (const split of splitG)
					for (const location of ['home', 'gym'] as const)
						for (const equipment of [['none'], ['dumbbell'], ['exercise-ball'], ['treadmill', 'walking-pad', 'exercise-bike', 'rowing-machine'], ['barbell', 'bench', 'pull-up-bar', 'resistance-band']]) {
							const p: Profile = { ...base, trainingGoal, experience, split, location, equipment, days: 6, minutes: 75 };
							const plan = generate(p);
							const chosen: string[] = [];
							for (const s of [plan.warmup, plan.cooldown, ...plan.sessions])
								for (const it of s.items) { reachable.add(it.exercise.id); chosen.push(it.exercise.id); }
							for (const s of plan.sessions)
								for (const it of s.items)
									for (const o of swapOptions(p, it.exercise, chosen)) reachable.add(o.id);
							for (const o of mobilityOptions(p, [])) reachable.add(o.id);
						}
		const orphans = exercises.map((e) => e.id).filter((id) => !reachable.has(id));
		expect(orphans, `orphan exercises: ${orphans.join(', ')}`).toEqual([]);
	});
});

describe('swap controls stay usable', () => {
	it('every generated exercise in a gym plan has at least one alternative', () => {
		const gym: Profile = { ...base, location: 'gym', days: 4, minutes: 60 };
		const plan = generate(gym);
		for (const s of plan.sessions) {
			const ids = s.items.map((i) => i.exercise.id);
			for (const it of s.items) {
				expect(swapOptions(gym, it.exercise, ids).length, `no swap for ${it.exercise.id}`).toBeGreaterThan(0);
			}
		}
	});
});

describe('life-stage gating', () => {
	it('pregnancy applies a later-trimester bump, postpartum stays at maintenance', () => {
		const tdee = estimateEnergy({ ...base, sex: 'female' }).tdee;
		const pp = estimateEnergy({ ...base, sex: 'female', postpartum: true });
		expect(pp.target).toBe(tdee); // maintenance, no bump
		const t3 = estimateEnergy({ ...base, sex: 'female', pregnant: true, trimester: 3 });
		expect(t3.target).toBeGreaterThan(tdee);
	});

	it('waist-to-height is computed normally but never during pregnancy', () => {
		expect(generate({ ...base, waistCm: 85 }).body.waistRatio).toBeCloseTo(0.47, 2);
		// postpartum still gets a ratio (no longer pregnant)
		expect(generate({ ...base, sex: 'female', postpartum: true, waistCm: 85 }).body.waistRatio).toBeCloseTo(0.47, 2);
		// pregnancy: nonsensical, so it is omitted even if a waist value lingers
		expect(generate({ ...base, sex: 'female', pregnant: true, waistCm: 85 }).body.waistRatio).toBeUndefined();
	});
});

describe('equipment ownership stays honest', () => {
	it('bodyweight-only never selects equipment-dependent moves', () => {
		const ids = generate({ ...base, equipment: ['none'] }).sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		expect(ids).not.toContain('barbell-back-squat');
		expect(ids).not.toContain('dumbbell-row');
	});
});

describe('PDF-critical Plan fields are present', () => {
	it('every value the printable guide reads exists and is finite', () => {
		const p = generate({ ...base, days: 6, minutes: 60, split: 'ppl', location: 'gym' });
		for (const k of ['target', 'proteinLow', 'proteinHigh', 'carbG', 'fatG', 'fiberG', 'waterMl', 'bmr', 'tdee'] as const) {
			expect(Number.isFinite(p.energy[k]), `energy.${k}`).toBe(true);
		}
		expect(Number.isFinite(p.body.bmi)).toBe(true);
		expect(Number.isFinite(p.body.weeklyChangeKg)).toBe(true);
		expect(p.warmup.items.length).toBeGreaterThan(0);
		expect(p.cooldown.items.length).toBeGreaterThan(0);
		expect(p.sessions.map((s) => s.day)).toEqual([1, 2, 3, 4, 5, 6]);
		for (const s of p.sessions) for (const it of s.items) {
			expect(it.sets).toBeGreaterThan(0);
			expect(it.reps).toBeTruthy();
		}
	});
});

describe('hard rules across ALL content modules', () => {
	const blob = JSON.stringify({ messages, exercises, profiles, nutritionTopics, glossary });
	it('no em or en dashes anywhere', () => {
		expect(blob.includes('—'), 'em dash found').toBe(false);
		expect(blob.includes('–'), 'en dash found').toBe(false);
	});

	it('Finnish, Swedish and Hungarian keep their diacritics (no ASCII transliteration)', () => {
		// Characteristic letters must survive in each locale's message set.
		expect(JSON.stringify(messages.fi)).toMatch(/[äöå]/);
		expect(JSON.stringify(messages.sv)).toMatch(/[åäö]/);
		expect(JSON.stringify(messages.hu)).toMatch(/[áéíóöőúüű]/);
		// Spot-check known strings that previously risked transliteration.
		expect(messages.fi.energy_title).toBe('Päivittäiset tavoitteesi');
		expect(messages.fi.why_fiber).toContain('ä');
	});

	it('every locale defines the new explanation + contact keys', () => {
		const need = ['why_intro', 'why_kcal', 'why_proj', 'why_bmi', 'contact_optional', 'owner_note_form', 'pdf_profile'];
		for (const l of locales) for (const k of need) expect(messages[l][k], `${l} missing ${k}`).toBeTruthy();
	});
});
