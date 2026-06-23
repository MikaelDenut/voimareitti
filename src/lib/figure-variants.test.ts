import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
	exerciseImages, maleImages, prenatalImages, exerciseImageSrc
} from '$lib/content/exercise-images';
import { generate, type Profile } from '$lib/engine/engine';
import { foodGroups } from '$lib/content/data';

// Project root, resolved from this file (src/lib/...), independent of the test runner's cwd.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const imgPath = (rel: string) => path.join(ROOT, 'static', 'img', rel);
const exerciseFiles = new Set(readdirSync(path.join(ROOT, 'static', 'img', 'exercises')));

describe('variant set invariants', () => {
	it('the general set is still 100/100 (regression guard)', () => {
		expect(exerciseImages.size).toBe(135);
	});

	it('maleImages and prenatalImages are subsets of exerciseImages', () => {
		for (const id of maleImages) expect(exerciseImages.has(id), `male orphan: ${id}`).toBe(true);
		for (const id of prenatalImages) expect(exerciseImages.has(id), `prenatal orphan: ${id}`).toBe(true);
	});

	it('maleImages covers all 100; prenatalImages is the curated 24', () => {
		expect(maleImages.size).toBe(135);
		expect(prenatalImages.size).toBe(52);
	});
});

describe('variant files exist on disk', () => {
	it('every male slug has <slug>.male.webp', () => {
		for (const id of maleImages) {
			expect(exerciseFiles.has(`${id}.male.webp`), `missing ${id}.male.webp`).toBe(true);
		}
	});

	it('every prenatal slug has <slug>.prenatal.webp', () => {
		for (const id of prenatalImages) {
			expect(exerciseFiles.has(`${id}.prenatal.webp`), `missing ${id}.prenatal.webp`).toBe(true);
		}
	});
});

describe('exerciseImageSrc precedence', () => {
	// band-row exists as general + male + prenatal.
	const both = 'band-row';
	// pushup exists as general + male, but NOT prenatal.
	const maleOnly = 'pushup';

	it('prenatal wins over male and general when prenatal is set', () => {
		expect(exerciseImageSrc(both, { prenatal: true, sex: 'male' })).toBe(`/img/exercises/${both}.prenatal.webp`);
		expect(exerciseImageSrc(both, { prenatal: true })).toBe(`/img/exercises/${both}.prenatal.webp`);
	});

	it('male is used only when sex === male', () => {
		expect(exerciseImageSrc(maleOnly, { sex: 'male' })).toBe(`/img/exercises/${maleOnly}.male.webp`);
		expect(exerciseImageSrc(maleOnly, { sex: 'female' })).toBe(`/img/exercises/${maleOnly}.webp`);
		expect(exerciseImageSrc(maleOnly, { sex: 'unspecified' })).toBe(`/img/exercises/${maleOnly}.webp`);
		expect(exerciseImageSrc(maleOnly, {})).toBe(`/img/exercises/${maleOnly}.webp`);
	});

	it('falls back to the general path when the requested variant is absent', () => {
		// pushup has no prenatal variant -> general, never a broken prenatal path.
		expect(exerciseImageSrc(maleOnly, { prenatal: true })).toBe(`/img/exercises/${maleOnly}.webp`);
	});

	it('returns undefined for an unknown id', () => {
		expect(exerciseImageSrc('not-a-real-exercise')).toBeUndefined();
		expect(exerciseImageSrc('not-a-real-exercise', { prenatal: true, sex: 'male' })).toBeUndefined();
	});
});

describe('engine: prenatal selection bias', () => {
	const base: Profile = {
		age: 30, sex: 'female', weightKg: 68, heightCm: 168,
		trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
		emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
		days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
	};

	it('a non-prenatal plan is deterministic (identical across runs)', () => {
		// The bias only activates when prenatal === true, so non-prenatal output is unchanged and stable.
		expect(generate(base)).toEqual(generate(base));
	});

	it('a prenatal plan surfaces at least one prenatal-illustrated move', () => {
		const preg: Profile = { ...base, pregnant: true, trimester: 2 };
		const ids = generate(preg).sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		const illustrated = ids.filter((id) => prenatalImages.has(id));
		expect(illustrated.length).toBeGreaterThanOrEqual(1);
	});

	it('a prenatal plan is also deterministic', () => {
		const preg: Profile = { ...base, pregnant: true, trimester: 2 };
		expect(generate(preg)).toEqual(generate(preg));
	});
});

describe('non-exercise images referenced in code exist on disk', () => {
	it('food-group tiles for every foodGroups image exist', () => {
		for (const g of foodGroups) {
			if (g.image) expect(existsSync(imgPath(`diet/${g.image}.webp`)), `missing diet/${g.image}.webp`).toBe(true);
		}
	});

	it('the high-volume comparison panel exists', () => {
		expect(existsSync(imgPath('diet/high-volume.webp'))).toBe(true);
	});

	it('section banners exist', () => {
		for (const b of ['training', 'nutrition', 'supplements']) {
			expect(existsSync(imgPath(`banners/${b}.webp`)), `missing banners/${b}.webp`).toBe(true);
		}
	});

	it('lifestyle hero scenes exist (rotation + postpartum + OG default)', () => {
		for (const h of ['hero-apartment', 'hero-garden', 'hero-desk', 'hero-postpartum', 'hero-home']) {
			expect(existsSync(imgPath(`hero/${h}.webp`)), `missing hero/${h}.webp`).toBe(true);
		}
	});

	it('the ab-wheel equipment icon exists', () => {
		expect(existsSync(imgPath('equipment/ab-wheel.webp'))).toBe(true);
	});
});
