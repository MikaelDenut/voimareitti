// PR-D: warm-up preference + mobility-only mode. Locks backward-compat (undefined === stretch),
// the active pool, and the no-strength routine.
import { describe, it, expect } from 'vitest';
import { generate, type Profile } from './engine';

const base: Profile = {
	age: 30, sex: 'female', weightKg: 68, heightCm: 168,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};
const warmIds = (p: Profile) => generate(p).warmup.items.map((it) => it.exercise.id);

describe('warm-up preference', () => {
	it('undefined === stretch (backward-compatible warm-up)', () => {
		expect(warmIds(base)).toEqual(warmIds({ ...base, warmupStyle: 'stretch' }));
	});

	it('active style draws from the dynamic drill pool', () => {
		const ids = warmIds({ ...base, warmupStyle: 'active' });
		const active = new Set(['marching-in-place', 'arm-circles', 'hip-circles', 'leg-swings', 'torso-rotations',
			'shoulder-rolls', 'side-bends', 'ankle-circles', 'step-touch', 'standing-forward-bend', 'low-impact-jacks', 'inchworm-walkout',
			'outdoor-walk', 'treadmill-walk', 'walking-pad-walk', 'stationary-bike-warmup', 'rowing-warmup']);
		expect(ids.length).toBeGreaterThan(0);
		expect(ids.every((id) => active.has(id))).toBe(true);
	});

	it('is deterministic for any style', () => {
		for (const warmupStyle of ['stretch', 'active', 'both', 'mobility-only'] as const) {
			expect(generate({ ...base, warmupStyle })).toEqual(generate({ ...base, warmupStyle }));
		}
	});
});

describe('mobility-only mode', () => {
	const mob = generate({ ...base, warmupStyle: 'mobility-only' });

	it('drops the strength sessions and weekly volume', () => {
		expect(mob.mobilityOnly).toBe(true);
		expect(mob.sessions).toEqual([]);
		expect(mob.weeklyVolume).toEqual([]);
		expect(mob.guidance.weeklySets).toBe(0);
	});

	it('still delivers a movement routine and no supplements', () => {
		expect(mob.warmup.items.length).toBeGreaterThan(0);
		expect(mob.supplements).toBeUndefined();
	});

	it('still computes energy targets (shown as general guidance)', () => {
		expect(Number.isFinite(mob.energy.target)).toBe(true);
	});

	it('normal styles keep their strength sessions', () => {
		expect(generate({ ...base, warmupStyle: 'both' }).sessions.length).toBeGreaterThan(0);
		expect(generate(base).mobilityOnly).toBe(false);
	});
});
