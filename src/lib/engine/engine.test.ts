import { describe, it, expect } from 'vitest';
import { generate, estimateEnergy, maxTier, hasEquipment, suitable, type Profile } from '$lib/engine/engine';
import { exercises } from '$lib/content/data';

const base: Profile = {
	age: 30,
	sex: 'male',
	weightKg: 80,
	heightCm: 180,
	trainingGoal: 'hypertrophy',
	nutritionGoal: 'maintain',
	experience: 'intermediate',
	emphasis: 'balanced',
	split: 'auto',
	location: 'home',
	equipment: ['dumbbell'],
	days: 3,
	minutes: 45,
	pregnant: false,
	postpartum: false,
	trimester: 2
};

const totalItems = (p: Profile) => generate(p).sessions.reduce((n, s) => n + s.items.length, 0);

describe('determinism', () => {
	it('same profile produces an identical plan', () => {
		expect(generate(base)).toEqual(generate(base));
	});
});

describe('program structure', () => {
	it('auto split at <=3 days is full-body, one session per day', () => {
		const p = generate(base);
		expect(p.resolvedSplit).toBe('full-body');
		expect(p.sessions.length).toBe(3);
		expect(p.sessions.every((s) => s.titleKey === 'session')).toBe(true);
		expect(p.warmup.items.length).toBeGreaterThanOrEqual(2);
	});

	it('auto split at 4 days is upper/lower', () => {
		const p = generate({ ...base, days: 4 });
		expect(p.resolvedSplit).toBe('upper-lower');
		expect(p.sessions.map((s) => s.titleKey)).toEqual(['upper', 'lower', 'upper', 'lower']);
	});

	it('a manual PPL split is honoured', () => {
		const p = generate({ ...base, split: 'ppl', days: 3 });
		expect(p.sessions.map((s) => s.titleKey)).toEqual(['push', 'pull', 'legs']);
	});

	it('numbers each day and varies repeated split days', () => {
		const p = generate({ ...base, location: 'gym', split: 'ppl', days: 6, minutes: 60 });
		expect(p.sessions.map((s) => s.day)).toEqual([1, 2, 3, 4, 5, 6]);
		const push = p.sessions.filter((s) => s.titleKey === 'push');
		expect(push.length).toBe(2);
		const first = push[0].items.map((i) => i.exercise.id).join(',');
		const second = push[1].items.map((i) => i.exercise.id).join(',');
		expect(first).not.toBe(second); // week rotation gives different exercises
	});
});

describe('inputs change the output meaningfully', () => {
	it('more minutes -> more total exercises', () => {
		expect(totalItems({ ...base, minutes: 75 })).toBeGreaterThan(totalItems({ ...base, minutes: 20 }));
	});

	it('emphasis changes sets per exercise', () => {
		const lo = generate({ ...base, emphasis: 'minimalist' }).guidance.setsPerExercise;
		const hi = generate({ ...base, emphasis: 'high-volume' }).guidance.setsPerExercise;
		expect(hi).toBeGreaterThan(lo);
	});

	it('training goal changes rep scheme and rest', () => {
		const str = generate({ ...base, trainingGoal: 'strength' }).guidance;
		const hyp = generate({ ...base, trainingGoal: 'hypertrophy' }).guidance;
		expect(str.reps).not.toBe(hyp.reps);
		expect(str.restSec).toBeGreaterThan(hyp.restSec);
	});

	it('experience gates exercise difficulty (no above-level lifts for a beginner)', () => {
		const ids = generate({ ...base, experience: 'beginner', equipment: ['none'] }).sessions
			.flatMap((s) => s.items.map((i) => i.exercise.id));
		const chosen = ids.map((id) => exercises.find((e) => e.id === id)!);
		expect(chosen.every((e) => e.experienceMin === 'beginner')).toBe(true);
		expect(ids).not.toContain('pushup'); // the intermediate floor push-up is excluded
	});

	it('weekly volume is reported and scales with emphasis', () => {
		const lo = generate({ ...base, emphasis: 'minimalist' }).guidance.weeklySets;
		const hi = generate({ ...base, emphasis: 'high-volume' }).guidance.weeklySets;
		expect(hi).toBeGreaterThan(lo);
		expect(generate(base).weeklyVolume.length).toBeGreaterThan(0);
	});
});

describe('nutrition goals (decoupled from training goal)', () => {
	it('lose < maintain < gain for the calorie target', () => {
		const lose = estimateEnergy({ ...base, nutritionGoal: 'lose' }).target;
		const maintain = estimateEnergy({ ...base, nutritionGoal: 'maintain' }).target;
		const gain = estimateEnergy({ ...base, nutritionGoal: 'gain' }).target;
		expect(lose).toBeLessThan(maintain);
		expect(maintain).toBeLessThan(gain);
	});

	it('cutting raises the protein floor vs gaining', () => {
		const lose = estimateEnergy({ ...base, nutritionGoal: 'lose' });
		const gain = estimateEnergy({ ...base, nutritionGoal: 'gain' });
		expect(lose.proteinLow).toBeGreaterThan(gain.proteinLow);
	});

	it('reports fibre and water targets', () => {
		const e = estimateEnergy(base);
		expect(e.fiberG).toBeGreaterThan(0);
		expect(e.waterMl).toBeGreaterThan(0);
	});
});

describe('pregnancy personalization (not a block)', () => {
	const preg: Profile = { ...base, sex: 'female', pregnant: true, trimester: 3 };
	it('flags prenatal, hides auto supplements, never a deficit', () => {
		const p = generate(preg);
		expect(p.prenatal).toBe(true);
		expect(p.supplements).toBeUndefined();
		expect(p.energy.target).toBeGreaterThanOrEqual(p.energy.tdee);
	});
	it('excludes supine/prone moves', () => {
		const ids = generate(preg).sessions.flatMap((s) => s.items.map((i) => i.exercise.id));
		expect(ids).not.toContain('pushup');
		expect(ids).not.toContain('db-bench-press');
		expect(ids).not.toContain('plank');
	});
	it('postpartum is also prenatal-safe, no deficit, no auto supplements', () => {
		const pp: Profile = { ...base, sex: 'female', pregnant: false, postpartum: true };
		const p = generate(pp);
		expect(p.prenatal).toBe(true);
		expect(p.supplements).toBeUndefined();
		expect(p.energy.target).toBeGreaterThanOrEqual(p.energy.tdee);
	});
});

describe('warm-up and cool-down', () => {
	it('provides distinct warm-up and cool-down mobility blocks', () => {
		const p = generate(base);
		expect(p.warmup.items.length).toBeGreaterThan(0);
		expect(p.cooldown.items.length).toBeGreaterThan(0);
		const warmIds = p.warmup.items.map((i) => i.exercise.id);
		const coolIds = p.cooldown.items.map((i) => i.exercise.id);
		expect(warmIds.some((id) => coolIds.includes(id))).toBe(false);
	});
});

describe('body metrics', () => {
	it('computes BMI and its category', () => {
		const b = generate(base).body; // 80 kg / 1.8 m^2
		expect(b.bmi).toBeCloseTo(24.7, 1);
		expect(b.bmiCategory).toBe('healthy');
	});
	it('categorises a high BMI as the higher range', () => {
		expect(generate({ ...base, weightKg: 110 }).body.bmiCategory).toBe('obese');
	});
	it('projects weight loss on a deficit and gain on a surplus', () => {
		expect(generate({ ...base, nutritionGoal: 'lose' }).body.weeklyChangeKg).toBeLessThan(0);
		expect(generate({ ...base, nutritionGoal: 'gain' }).body.weeklyChangeKg).toBeGreaterThan(0);
	});
	it('computes waist-to-height only when waist is provided', () => {
		expect(generate(base).body.waistRatio).toBeUndefined();
		const b = generate({ ...base, waistCm: 81 }).body; // 81 / 180 = 0.45
		expect(b.waistRatio).toBeCloseTo(0.45, 2);
		expect(b.waistHigh).toBe(false);
		expect(generate({ ...base, waistCm: 99 }).body.waistHigh).toBe(true);
	});
});

describe('equipment ownership gates selection', () => {
	it('home users need the actual equipment a move requires', () => {
		const home: Profile = { ...base, location: 'home', equipment: ['none'] };
		expect(hasEquipment(home, 'barbell-back-squat')).toBe(false);
		expect(hasEquipment({ ...home, equipment: ['barbell'] }, 'barbell-back-squat')).toBe(true);
		expect(hasEquipment({ ...base, location: 'gym' }, 'barbell-back-squat')).toBe(true);
	});
	it('a wall / the floor is always available', () => {
		expect(hasEquipment({ ...base, location: 'home', equipment: ['none'] }, 'wall-pushup')).toBe(true);
	});
	it('owning a bench does NOT unlock band exercises (no tier over-unlock)', () => {
		const benchOnly: Profile = { ...base, location: 'home', equipment: ['bench'] };
		expect(hasEquipment(benchOnly, 'band-row')).toBe(false);
	});
});

describe('profile suitability is enforced', () => {
	it('excludes by age minimum', () => {
		expect(suitable({ ...base, age: 13 }, 'barbell-back-squat')).toBe(false);
		expect(suitable(base, 'barbell-back-squat')).toBe(true);
	});
	it('excludes a deep-ROM move for a very high BMI', () => {
		const highBmi: Profile = { ...base, weightKg: 140, heightCm: 175 }; // BMI ~45
		expect(suitable(highBmi, 'sissy-squat')).toBe(false);
		expect(suitable(base, 'sissy-squat')).toBe(true);
	});
});

describe('equipment tiers', () => {
	it('gym is the maximum tier', () => {
		expect(maxTier({ ...base, location: 'gym' })).toBe(5);
	});
	it('bodyweight-only is tier 0 and flags a pull gap', () => {
		const p = generate({ ...base, equipment: ['none'] });
		expect(p.maxTier).toBe(0);
		expect(p.pullGap).toBe(true);
	});
});

describe('regenerate seed (workout)', () => {
	const ids = (p: ReturnType<typeof generate>) => p.sessions.flatMap((s) => s.items.map((i) => i.exercise.id)).join(',');
	it('seed 0 is byte-identical to the no-seed default (frozen)', () => {
		expect(generate(base, 0)).toEqual(generate(base));
	});
	it('the same seed yields the same program (deterministic)', () => {
		expect(ids(generate(base, 7))).toBe(ids(generate(base, 7)));
	});
	it('at least one seed changes the program selection vs the default', () => {
		const d0 = ids(generate(base));
		const differs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some((s) => ids(generate(base, s)) !== d0);
		expect(differs).toBe(true);
	});
});
