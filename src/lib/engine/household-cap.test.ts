// planning/56 HH3: household-aware serving cap. A single shared menu used to plateau at the solo 4-serving
// cap and under-deliver large households down to ~50% of target. The cap now scales with householdScale, so
// the shared menu reaches the household calorie target while keeping per-person servings realistic. Solo is
// byte-identical. These tests guard the fix + the invariants.

import { describe, it, expect } from 'vitest';
import { planWeek, batchPlanWeek, memberKcal, type WeekPlan } from './meal-planner';
import { estimateEnergy } from './engine';
import { defaultProfile, type FullProfile, type HouseholdMember } from '../profile-core';
import { dayTotals, weekMicros } from '../nutrition/day-totals';
import { optimizeWeek } from './optimizer';
import { householdServingCap, OPTIMIZER, SUPPLEMENTABLE_MICROS } from '../nutrition/constants';

const hasAnySupplement = (w: WeekPlan) =>
	w.days.some((d) => d.meals.some((m) => (m.additions ?? []).some((a) => a.kind === 'supplement')));

const mk = (over: Partial<FullProfile> = {}): FullProfile => ({ ...defaultProfile(), ...over });
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const maxServings = (w: WeekPlan) => Math.max(...w.days.flatMap((d) => d.meals.map((m) => m.servings)));
const SEEDS = [1, 42, 500];

// The symptom household: default primary (~2391) + 6 more eaters -> targetKcal ~14791, scale ~6.19.
const BIG: HouseholdMember[] = [
	{ id: 'ad1', label: 'A1', age: 35, sex: 'unspecified' }, { id: 'ad2', label: 'A2', age: 35, sex: 'unspecified' },
	{ id: 'te3', label: 'T3', age: 15 }, { id: 'la4', label: 'L4', age: 9 }, { id: 'la5', label: 'L5', age: 9 }, { id: 'la6', label: 'L6', age: 9 }
];

describe('planning/56 HH3 household-aware serving cap', () => {
	it('helper: solo cap is the base servingMax, household cap scales, never below base', () => {
		expect(householdServingCap(1)).toBe(OPTIMIZER.servingMax);
		expect(householdServingCap(0)).toBe(OPTIMIZER.servingMax); // guard: scale 0 -> base
		expect(householdServingCap(6.19)).toBeCloseTo(OPTIMIZER.servingMax * 6.19, 6);
	});

	it('FIX: a large (7-eater) household now reaches >= 90% of the household target (was ~52%)', () => {
		for (const mode of ['batch', 'precise'] as const) {
			const p = mk({ cookingMode: mode, household: BIG });
			const e = estimateEnergy(p);
			for (const seed of SEEDS) {
				const raw = mode === 'batch' ? batchPlanWeek({ profile: p, energy: e, seed }) : planWeek({ profile: p, energy: e, seed });
				const w = optimizeWeek(raw, p, e).week; // must NOT throw (validator allows scaled servings)
				const deliv = mean(w.days.map((d) => dayTotals(d).kcal)) / w.meta.targetKcal;
				expect(deliv).toBeGreaterThanOrEqual(0.9);
				expect(deliv).toBeLessThanOrEqual(1 + 0.07); // still inside the upper band
			}
		}
	});

	it('per-person servings stay realistic: max household servings / scale <= base cap', () => {
		const p = mk({ cookingMode: 'batch', household: BIG });
		const e = estimateEnergy(p);
		const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		const scale = w.meta.householdScale;
		// A shared dish may be many servings in total, but divided back per adult-equivalent it stays <= 4.
		expect(maxServings(w) / scale).toBeLessThanOrEqual(OPTIMIZER.servingMax + 1e-9);
		expect(maxServings(w)).toBeGreaterThan(OPTIMIZER.servingMax); // and it DID exceed the solo cap (proof the cap lifted)
	});

	it('SOLO byte-identical: no solo dish exceeds the base 4-serving cap (scale === 1)', () => {
		for (const mode of ['batch', 'precise'] as const) {
			const p = mk({ cookingMode: mode });
			const e = estimateEnergy(p);
			for (const seed of SEEDS) {
				const raw = mode === 'batch' ? batchPlanWeek({ profile: p, energy: e, seed }) : planWeek({ profile: p, energy: e, seed });
				const w = optimizeWeek(raw, p, e).week;
				expect(w.meta.householdScale).toBe(1);
				expect(maxServings(w)).toBeLessThanOrEqual(OPTIMIZER.servingMax + 1e-9);
			}
		}
	});

	it('HH4: a large household gets the same micro repair as solo (supplements fire; supplementable micros covered)', () => {
		const p = mk({ cookingMode: 'batch', household: BIG });
		const e = estimateEnergy(p);
		const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		const scale = w.meta.householdScale;
		const wk = weekMicros(w.days) as Record<string, number>;
		// The optimizer now repairs household micros: at least one supplement line exists (it added none before).
		expect(hasAnySupplement(w)).toBe(true);
		// Each supplementable micro reaches ~the household-scaled weekly target (target x 7 x scale), like solo.
		for (const k of SUPPLEMENTABLE_MICROS) {
			if (k === 'iron_mg' && p.preferIronFromFood) continue;
			const householdTarget7 = (e.microTargets as Record<string, number>)[k] * 7 * scale;
			expect(wk[k]).toBeGreaterThanOrEqual(householdTarget7 * OPTIMIZER.microCloseEnough);
		}
	});

	it('deterministic: same (profile, seed) yields the same plan hash for a household', () => {
		const p = mk({ cookingMode: 'batch', household: BIG });
		const e = estimateEnergy(p);
		const a = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 7 }), p, e).week;
		const b = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 7 }), p, e).week;
		expect(a.meta.planHash).toBe(b.meta.planHash);
	});
});
