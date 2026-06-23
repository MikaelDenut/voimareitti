// PR-G: easier swaps + push-up regressions + difficulty bias.
import { describe, it, expect } from 'vitest';
import { swapOptions, prefersEasier, type Profile } from './engine';
import { exercises } from '$lib/content/data';

const base: Profile = {
	age: 30, sex: 'male', weightKg: 80, heightCm: 180,
	trainingGoal: 'hypertrophy', nutritionGoal: 'maintain', experience: 'intermediate',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['chair'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};
const pushup = exercises.find((e) => e.id === 'pushup')!;

describe('push-up regressions exist and are reachable', () => {
	it('knee-pushup and elevated-pushup are in the library', () => {
		expect(exercises.some((e) => e.id === 'knee-pushup')).toBe(true);
		expect(exercises.some((e) => e.id === 'elevated-pushup')).toBe(true);
	});

	it('a chair user swapping a push-up is offered easier variations', () => {
		const ids = swapOptions(base, pushup, []).map((e) => e.id);
		expect(ids).toContain('knee-pushup');
		expect(ids).toContain('incline-pushup');
		expect(ids).toContain('elevated-pushup');
		expect(ids).toContain('wall-pushup');
	});
});

describe('easierFirst ranking', () => {
	it('puts a beginner-level option first when easierFirst is set', () => {
		const easy = swapOptions(base, pushup, [], true);
		expect(easy[0].experienceMin).toBe('beginner');
	});

	it('default ordering is unchanged (no easierFirst arg)', () => {
		expect(swapOptions(base, pushup, [])).toEqual(swapOptions(base, pushup, [], false));
	});
});

describe('prefersEasier cohort', () => {
	it('true for beginner, female, pregnant, postpartum, or explicit toggle', () => {
		expect(prefersEasier({ ...base, experience: 'beginner' })).toBe(true);
		expect(prefersEasier({ ...base, sex: 'female' })).toBe(true);
		expect(prefersEasier({ ...base, pregnant: true })).toBe(true);
		expect(prefersEasier({ ...base, postpartum: true })).toBe(true);
		expect(prefersEasier({ ...base, easierOptions: true })).toBe(true);
	});

	it('false for an intermediate male with no flags', () => {
		expect(prefersEasier(base)).toBe(false);
	});
});

describe('modification tips are present on hard push-ups', () => {
	it('pushup and close-grip-pushup carry modTips', () => {
		expect(exercises.find((e) => e.id === 'pushup')!.modTips?.en).toBeTruthy();
		expect(exercises.find((e) => e.id === 'close-grip-pushup')!.modTips?.en).toBeTruthy();
	});
});
