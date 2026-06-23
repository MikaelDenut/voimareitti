import { describe, it, expect } from 'vitest';
import { estimateEnergy, type Profile } from './engine';

// Reference snapshot pinning estimateEnergy's EXISTING fields, captured from the engine BEFORE the
// Phase 3 additive fields (carbCeilingG / proteinBand / microTargets) were added. New fields may be
// added, but these nine values must never change - if they do, an energy regression has crept in.

const base: Profile = {
	age: 30, sex: 'unspecified', weightKg: 75, heightCm: 175,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['chair'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};

const cases: Record<string, { profile: Profile; expect: Record<string, number | string> }> = {
	default: {
		profile: base,
		expect: { bmr: 1616, tdee: 2391, target: 2391, proteinLow: 120, proteinHigh: 165, fatG: 66, carbG: 284, fiberG: 33, waterMl: 2475 }
	},
	maleGain: {
		profile: { ...base, sex: 'male', weightKg: 80, heightCm: 180, trainingGoal: 'hypertrophy', nutritionGoal: 'gain', days: 4 },
		expect: { bmr: 1780, tdee: 2741, target: 3015, proteinLow: 128, proteinHigh: 160, fatG: 84, carbG: 405, fiberG: 42, waterMl: 2640 }
	},
	femaleLose: {
		profile: { ...base, sex: 'female', age: 41, weightKg: 62, heightCm: 168, trainingGoal: 'fat-loss', nutritionGoal: 'lose', days: 4 },
		expect: { bmr: 1304, tdee: 2073, target: 1700, proteinLow: 112, proteinHigh: 149, fatG: 47, carbG: 170, fiberG: 24, waterMl: 2046 }
	},
	underweightLose: {
		profile: { ...base, sex: 'female', weightKg: 50, heightCm: 175, nutritionGoal: 'lose' },
		expect: { bmr: 1283, tdee: 1898, target: 1898, proteinLow: 90, proteinHigh: 120, fatG: 53, carbG: 235, fiberG: 27, waterMl: 1650, nutritionAdjusted: 'underweight' }
	},
	olderMale: {
		profile: { ...base, sex: 'male', age: 70, weightKg: 80, heightCm: 175 },
		expect: { bmr: 1549, tdee: 2292, target: 2292, proteinLow: 128, proteinHigh: 176, fatG: 64, carbG: 253, fiberG: 32, waterMl: 2640 }
	},
	pregnantT3: {
		profile: { ...base, sex: 'female', weightKg: 70, heightCm: 168, pregnant: true, trimester: 3 },
		expect: { bmr: 1439, tdee: 2130, target: 2580, proteinLow: 112, proteinHigh: 154, fatG: 72, carbG: 329, fiberG: 36, waterMl: 2310 }
	}
};

describe('estimateEnergy reference (existing fields are frozen)', () => {
	for (const [name, c] of Object.entries(cases)) {
		it(name, () => {
			const r = estimateEnergy(c.profile) as unknown as Record<string, number | string>;
			for (const [k, v] of Object.entries(c.expect)) {
				expect(r[k], `${name}.${k}`).toBe(v);
			}
		});
	}

	it('underweight + minor deficit guards still hold (no deficit applied)', () => {
		const r = estimateEnergy(cases.underweightLose.profile);
		expect(r.nutritionAdjusted).toBe('underweight');
		expect(r.target).toBe(r.tdee); // deficit withheld -> maintenance
	});
});
