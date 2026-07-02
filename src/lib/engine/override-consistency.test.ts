// 2026-07 audit M-A: an override must yield an INTERNALLY CONSISTENT target set. Before the fix, a kcal
// override replaced only the calorie target while fat/carb/fibre stayed derived from the OLD automatic
// target - the overview showed macros summing to ~3000 kcal against an 1800 kcal plan, and the scorer's
// soft fat/fibre terms chased unreachable values. Only override profiles are affected; the frozen
// energy fixtures (no overrides) are untouched by construction.
import { describe, it, expect } from 'vitest';
import { estimateEnergy, type Profile } from './engine';

const base: Profile = {
	age: 30, sex: 'unspecified', weightKg: 75, heightCm: 175,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['chair'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};

describe('estimateEnergy - override target consistency (audit M-A)', () => {
	it('a kcal override recomputes fat, carb and fibre from the effective target', () => {
		const auto = estimateEnergy(base);
		const r = estimateEnergy({ ...base, kcalOverride: 1800 });
		expect(r.target).toBe(1800);
		// fat = max(25% of kcal / 9, 0.6 g/kg) from the EFFECTIVE 1800, not the automatic target
		expect(r.fatG).toBe(Math.max(Math.round((1800 * 0.25) / 9), Math.round(75 * 0.6)));
		expect(r.fatG).toBeLessThan(auto.fatG);
		// carbs fill the remaining calories of the EFFECTIVE target
		expect(r.carbG).toBe(Math.max(0, Math.round((1800 - r.proteinHigh * 4 - r.fatG * 9) / 4)));
		// fibre follows the 14 g / 1000 kcal rule on the effective target
		expect(r.fiberG).toBe(Math.round((1800 / 1000) * 14));
		// sanity: the macro targets now fit inside the calorie target (within rounding)
		const macroKcal = r.proteinHigh * 4 + r.fatG * 9 + r.carbG * 4;
		expect(macroKcal).toBeLessThanOrEqual(1800 + 10);
	});

	it('a protein override recomputes carbs (the remaining-calorie fill)', () => {
		const r = estimateEnergy({ ...base, proteinOverride: 100 });
		expect(r.proteinHigh).toBe(100);
		expect(r.carbG).toBe(Math.max(0, Math.round((r.target - 100 * 4 - r.fatG * 9) / 4)));
	});

	it('an explicit fat/carb override is never overwritten by the recompute', () => {
		const r = estimateEnergy({ ...base, kcalOverride: 1800, fatOverride: 90, carbOverride: 120 });
		expect(r.fatG).toBe(90);
		expect(r.carbG).toBe(120);
	});

	it('no override -> byte-identical to the automatic result (frozen-fixture safety)', () => {
		expect(estimateEnergy(base)).toEqual(estimateEnergy({ ...base }));
	});
});
