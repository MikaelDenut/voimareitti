// PR-I: metadata-driven prenatal/postpartum safety predicate + supine/prone exclusion fix.
import { describe, it, expect } from 'vitest';
import { generate, prenatalUnsafe, type Profile } from './engine';
import { exercises } from '$lib/content/data';

const base: Profile = {
	age: 30, sex: 'female', weightKg: 70, heightCm: 168,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};
const ex = (id: string) => exercises.find((e) => e.id === id)!;

describe('prenatalUnsafe predicate', () => {
	it('no effect for non-pregnant, non-postpartum users', () => {
		expect(prenatalUnsafe(base, ex('glute-bridge'))).toBe(false);
		expect(prenatalUnsafe(base, ex('pushup'))).toBe(false);
	});

	it('excludes supine/prone moves from the second trimester (the fixed bug)', () => {
		const t2: Profile = { ...base, pregnant: true, trimester: 2 };
		expect(prenatalUnsafe(t2, ex('glute-bridge'))).toBe(true); // supine
		expect(prenatalUnsafe(t2, ex('crunch'))).toBe(true); // supine
		expect(prenatalUnsafe(t2, ex('close-grip-pushup'))).toBe(true); // prone
	});

	it('allows supine in the first trimester', () => {
		const t1: Profile = { ...base, pregnant: true, trimester: 1 };
		expect(prenatalUnsafe(t1, ex('glute-bridge'))).toBe(false);
	});

	it('excludes high-balance moves in the third trimester only', () => {
		expect(prenatalUnsafe({ ...base, pregnant: true, trimester: 2 }, ex('bulgarian-split-squat'))).toBe(false);
		expect(prenatalUnsafe({ ...base, pregnant: true, trimester: 3 }, ex('bulgarian-split-squat'))).toBe(true);
	});

	it('postpartum excludes diastasis-caution core but not plain supine', () => {
		const pp: Profile = { ...base, postpartum: true };
		expect(prenatalUnsafe(pp, ex('crunch'))).toBe(true); // diastasisCaution
		expect(prenatalUnsafe(pp, ex('glute-bridge'))).toBe(false); // supine but safe postpartum
	});

	it('still honours the legacy avoid set', () => {
		expect(prenatalUnsafe({ ...base, pregnant: true, trimester: 1 }, ex('pushup'))).toBe(true);
		expect(prenatalUnsafe({ ...base, pregnant: true, trimester: 1 }, ex('plank'))).toBe(true);
	});
});

describe('generated pregnant plan never contains supine/prone bodyweight moves', () => {
	it('a T2 pregnant bodyweight plan excludes glute-bridge and crunch', () => {
		const p = generate({ ...base, pregnant: true, trimester: 2, equipment: ['none'] });
		const ids = p.sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		expect(ids).not.toContain('glute-bridge');
		expect(ids).not.toContain('crunch');
		expect(ids).not.toContain('pushup');
	});

	it('stays deterministic with the easier-bias active (female)', () => {
		expect(generate(base)).toEqual(generate(base));
	});
});
