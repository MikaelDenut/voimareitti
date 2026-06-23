import { describe, it, expect } from 'vitest';
import { planWeek } from '../engine/meal-planner';
import { estimateEnergy } from '../engine/engine';
import { optimizeWeek } from '../engine/optimizer';
import { defaultProfile, type FullProfile } from '../profile-core';
import { KCAL_TOLERANCE } from './constants';

// The production meal pipeline (NutritionPlanner.generate): planWeek then optimizeWeek. This is the invariant
// that was missing when the calcium-milk overshoot regressed silently: AFTER all micro coverage, every day
// must stay inside the HARD calorie band. Stage 0 originally asserted this against the OLD planWeek +
// applyMicroTopUps pipeline and it FAILED (it.fails), proving the bug; now it guards the LIVE optimizer
// pipeline and must PASS. Do not relax it - a failure means the band guarantee has regressed.

function mk(over: Partial<FullProfile> = {}): FullProfile {
	return { ...defaultProfile(), cookingMode: 'precise', ...over };
}

// Exactly what the UI runs in NutritionPlanner.generate().
function fullPipeline(p: FullProfile, seed: number) {
	const e = estimateEnergy(p);
	return optimizeWeek(planWeek({ profile: p, energy: e, seed }), p, e).week;
}

// The profiles that most stressed the old overshoot: omnivore, dairy-OK, smaller / older / cutting (smaller
// targets + higher calcium target made the forced milk glass tip the day over).
const PROFILES: Partial<FullProfile>[] = [
	{},
	{ sex: 'female', age: 30, weightKg: 52, heightCm: 160, nutritionGoal: 'lose' },
	{ sex: 'female', age: 55, weightKg: 60, heightCm: 165 },
	{ sex: 'female', age: 70, weightKg: 58, heightCm: 162, nutritionGoal: 'lose' },
	{ sex: 'female', age: 65, weightKg: 62, heightCm: 163, mealsPerDay: 4 },
	{ sex: 'male', age: 25, weightKg: 100, nutritionGoal: 'lose' },
	{ mealsPerDay: 4, nutritionGoal: 'lose', weightKg: 70 },
	{ mealsPerDay: 5, weightKg: 80 }
];
const SEEDS = [1, 7, 42, 99, 123, 500];

describe('production pipeline per-day calorie band (planWeek + optimizeWeek)', () => {
	it('no day ends OVER the calorie band, across profiles + seeds', () => {
		const violations: string[] = [];
		for (const over of PROFILES) {
			const p = mk(over);
			for (const seed of SEEDS) {
				const w = fullPipeline(p, seed);
				const ceil = w.meta.targetKcal * (1 + KCAL_TOLERANCE);
				for (const d of w.days) {
					if (d.totals.kcal > ceil + 0.5) {
						const pct = Math.round(((d.totals.kcal - w.meta.targetKcal) / w.meta.targetKcal) * 1000) / 10;
						violations.push(`${JSON.stringify(over)} seed ${seed} day ${d.day}: ${d.totals.kcal} > ceil ${Math.round(ceil)} (+${pct}%)`);
					}
				}
			}
		}
		expect(violations, `over-band days (${violations.length}):\n${violations.join('\n')}`).toEqual([]);
	});
});
