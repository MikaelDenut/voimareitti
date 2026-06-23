// PR-6/PR-7: aggressive ease-in (age/BMI/experience/pregnancy) + nutrition safety guard.
// The pinned reference profile is ease level 0, so its plan is unchanged (the determinism contract).
import { describe, it, expect } from 'vitest';
import { generate, estimateEnergy, easeScore, type Profile } from './engine';

const base: Profile = {
	age: 30, sex: 'male', weightKg: 80, heightCm: 180,
	trainingGoal: 'hypertrophy', nutritionGoal: 'maintain', experience: 'intermediate',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['dumbbell'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};
const slots1 = (p: Profile) => generate(p).sessions[0]?.items.length ?? 0;

describe('easeScore', () => {
	it('is 0 for a fit younger adult (the pinned reference)', () => {
		expect(easeScore(base)).toBe(0);
	});
	it('grades age aggressively (60 < 70 < 80)', () => {
		const at = (age: number) => easeScore({ ...base, age });
		expect(at(60)).toBeLessThan(at(70));
		expect(at(70)).toBeLessThan(at(80));
	});
	it('rises with BMI, beginner status and pregnancy', () => {
		expect(easeScore({ ...base, weightKg: 140, heightCm: 175 })).toBeGreaterThan(0); // obese
		expect(easeScore({ ...base, experience: 'beginner' })).toBeGreaterThan(0);
		expect(easeScore({ ...base, sex: 'female', pregnant: true })).toBeGreaterThan(0);
	});
});

describe('ease-in does not touch the level-0 reference profile', () => {
	it('is deterministic and unchanged in volume/rest', () => {
		expect(generate(base)).toEqual(generate(base));
		const g = generate(base).guidance;
		expect(g.setsPerExercise).toBe(4); // hypertrophy intermediate balanced
		expect(g.restSec).toBe(90); // goal rest, no ease bump
	});
});

describe('a lighter start scales with body state', () => {
	const beginner = (age: number): Profile => ({ ...base, age, experience: 'beginner', equipment: ['none'] });
	it('an 80-year-old gets a lighter program than a 60-year-old', () => {
		const a = generate(beginner(60)).guidance;
		const b = generate(beginner(80)).guidance;
		expect(b.setsPerExercise).toBeLessThanOrEqual(a.setsPerExercise);
		expect(b.restSec).toBeGreaterThanOrEqual(a.restSec);
		expect(slots1(beginner(80))).toBeLessThanOrEqual(slots1(beginner(60)));
		expect(generate(beginner(80))).not.toEqual(generate(beginner(60)));
	});
	it('a high-BMI beginner rests more and trains no harder than the reference', () => {
		const obese = generate({ ...base, weightKg: 140, heightCm: 175, experience: 'beginner', equipment: ['none'] }).guidance;
		expect(obese.restSec).toBeGreaterThan(generate(base).guidance.restSec);
		expect(obese.setsPerExercise).toBeLessThanOrEqual(generate(base).guidance.setsPerExercise);
	});
	it('keeps floors: never below 2 sets and a short session still has at least 3 slots worth', () => {
		const g = generate({ ...base, age: 80, experience: 'beginner', equipment: ['none'] }).guidance;
		expect(g.setsPerExercise).toBeGreaterThanOrEqual(2);
	});
	it('fixes the inversion: pregnant and obese-beginner sessions are short, not 6-8 long', () => {
		expect(slots1({ ...base, sex: 'female', pregnant: true, trimester: 1, experience: 'beginner', equipment: ['none'] })).toBeLessThanOrEqual(6);
		expect(slots1({ ...base, weightKg: 140, heightCm: 175, experience: 'beginner', trainingGoal: 'fat-loss', nutritionGoal: 'lose', equipment: ['none'] })).toBeLessThanOrEqual(6);
	});
});

describe('nutrition safety guard', () => {
	it('does not put an underweight user in a deficit', () => {
		const u = estimateEnergy({ ...base, sex: 'female', weightKg: 45, heightCm: 168, nutritionGoal: 'lose' }); // BMI ~16
		expect(u.nutritionAdjusted).toBe('underweight');
		expect(u.target).toBeGreaterThanOrEqual(u.tdee);
	});
	it('does not put a young teen in a deficit', () => {
		const m = estimateEnergy({ ...base, age: 15, weightKg: 60, heightCm: 165, nutritionGoal: 'lose' });
		expect(m.nutritionAdjusted).toBeTruthy();
		expect(m.target).toBeGreaterThanOrEqual(m.tdee);
	});
	it('still gives an overweight user a real deficit and a sane protein target', () => {
		const o = estimateEnergy({ ...base, weightKg: 160, heightCm: 165, nutritionGoal: 'lose' }); // BMI ~58
		expect(o.nutritionAdjusted).toBeUndefined();
		expect(o.target).toBeLessThan(o.tdee); // a genuine deficit
		expect(o.proteinHigh).toBeLessThan(250); // reference-weight, not ~380 g
	});
	it('keeps a deficit above a safe floor and BMR', () => {
		const t = estimateEnergy({ ...base, sex: 'female', weightKg: 50, heightCm: 170, nutritionGoal: 'lose' }); // not underweight (BMI 17.3 -> actually underweight)
		expect(t.target).toBeGreaterThanOrEqual(1200);
	});
	it('leaves a healthy adult unchanged (lose < maintain < gain)', () => {
		expect(estimateEnergy({ ...base, nutritionGoal: 'lose' }).target)
			.toBeLessThan(estimateEnergy({ ...base, nutritionGoal: 'maintain' }).target);
		expect(estimateEnergy({ ...base, nutritionGoal: 'maintain' }).target)
			.toBeLessThan(estimateEnergy({ ...base, nutritionGoal: 'gain' }).target);
	});
});
