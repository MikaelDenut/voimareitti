// PR-H: trimester-weighted birth-preparation block.
import { describe, it, expect } from 'vitest';
import { generate, type Profile } from './engine';

const base: Profile = {
	age: 31, sex: 'female', weightKg: 70, heightCm: 168,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};
const preg = (trimester: 1 | 2 | 3): Profile => ({ ...base, pregnant: true, trimester });

describe('birth-prep block', () => {
	it('is absent for non-pregnant users', () => {
		expect(generate(base).birthPrep).toBeUndefined();
		expect(generate({ ...base, postpartum: true }).birthPrep).toBeUndefined();
	});

	it('scales with the trimester (T1=1, T2=2, T3=3 moves)', () => {
		expect(generate(preg(1)).birthPrep?.items.length).toBe(1);
		expect(generate(preg(2)).birthPrep?.items.length).toBe(2);
		expect(generate(preg(3)).birthPrep?.items.length).toBe(3);
	});

	it('only selects tagged birth-prep moves, weighted for the trimester', () => {
		const items = generate(preg(3)).birthPrep!.items;
		for (const it of items) {
			expect(it.exercise.prenatalWeight, it.exercise.id).toBeTruthy();
			// every chosen move is relevant in T3 (weight >= 2)
			expect(it.exercise.prenatalWeight![2]).toBeGreaterThanOrEqual(2);
		}
	});

	it('a ball owner can get birth-ball moves; a non-owner never does', () => {
		const withBall = generate({ ...preg(2), equipment: ['exercise-ball'] }).birthPrep!.items.map((i) => i.exercise.id);
		const noBall = generate(preg(2)).birthPrep!.items.map((i) => i.exercise.id);
		expect(noBall.some((id) => id.startsWith('birth-ball'))).toBe(false);
		expect(withBall.length).toBeGreaterThan(0);
	});

	it('is deterministic', () => {
		expect(generate(preg(3))).toEqual(generate(preg(3)));
	});
});
