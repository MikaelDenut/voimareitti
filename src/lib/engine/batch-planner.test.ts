// B2-S3: the batch ("Smart cooking") generator. Verifies it is deterministic, shape-identical, delivers the
// batch win (fewer distinct cooked dishes, repeated as leftovers), and produces a week the batch-aware
// optimizer accepts with zero safety violations (within-day/cross-day leftovers are allowed in batch).

import { describe, it, expect } from 'vitest';
import { planWeek, batchPlanWeek, type WeekPlan } from './meal-planner';
import { estimateEnergy } from './engine';
import { optimizeWeek, validateWeek } from './optimizer';
import { defaultProfile, type FullProfile } from '../profile-core';
import { getRecipe } from '../content/recipes';

function mk(over: Partial<FullProfile> = {}): FullProfile {
	return { ...defaultProfile(), cookingMode: 'batch', ...over };
}
const isCook = (id: string | null) => !!id && getRecipe(id)?.cookEffort === 'cook';
const distinctCooks = (w: WeekPlan) =>
	new Set(w.days.flatMap((d) => d.meals.filter((m) => isCook(m.recipeId)).map((m) => m.recipeId))).size;

describe('batchPlanWeek (B2-S3)', () => {
	it('is deterministic and shape-identical (7 days + meta + planHash)', () => {
		const p = mk();
		const e = estimateEnergy(p);
		const a = batchPlanWeek({ profile: p, energy: e, seed: 7 });
		const b = batchPlanWeek({ profile: p, energy: e, seed: 7 });
		expect(a).toEqual(b);
		expect(a.days.length).toBe(7);
		expect(a.days.every((d) => d.meals.length >= 1)).toBe(true);
		expect(typeof a.meta.planHash).toBe('string');
		expect(a.meta.planHash.length).toBeGreaterThan(0);
	});

	it('delivers the batch win: fewer distinct cooked dishes than precise, repeated as leftovers', () => {
		const p = mk({ cookSessionsPerWeek: 4 });
		const e = estimateEnergy(p);
		const batch = batchPlanWeek({ profile: p, energy: e, seed: 7 });
		const precise = planWeek({ profile: { ...p, cookingMode: 'precise' }, energy: e, seed: 7 });
		expect(distinctCooks(batch)).toBeLessThanOrEqual(distinctCooks(precise));
		// At least one cooked dish appears on more than one day (a leftover).
		const counts: Record<string, number> = {};
		for (const d of batch.days) for (const m of d.meals) if (isCook(m.recipeId)) counts[m.recipeId!] = (counts[m.recipeId!] ?? 0) + 1;
		expect(Object.values(counts).some((c) => c >= 2)).toBe(true);
	});

	it('more cooking sessions => at least as many distinct cooked dishes', () => {
		const e = estimateEnergy(mk());
		const few = distinctCooks(batchPlanWeek({ profile: mk({ cookSessionsPerWeek: 2 }), energy: e, seed: 3 }));
		const many = distinctCooks(batchPlanWeek({ profile: mk({ cookSessionsPerWeek: 6 }), energy: e, seed: 3 }));
		expect(many).toBeGreaterThanOrEqual(few);
	});

	it('optimizeWeek accepts a batch week with ZERO safety violations (leftovers allowed)', () => {
		for (const seed of [1, 3, 42]) {
			const p = mk();
			const e = estimateEnergy(p);
			const opt = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed }), p, e).week;
			expect(validateWeek(opt, p, e).safety, `seed ${seed}`).toEqual([]);
			expect(opt.days.length).toBe(7);
		}
	});

	it('omnivore batch never serves a substitute-protein dish (tofu/tempeh/seitan/edamame)', () => {
		const SUB = ['tofu', 'tempeh', 'seitan', 'edamame'];
		const p = mk({ includePlantProteins: false }); // omnivore default (mk pins batch)
		const e = estimateEnergy(p);
		for (let seed = 1; seed <= 30; seed++) {
			const w = batchPlanWeek({ profile: p, energy: e, seed });
			for (const d of w.days) for (const m of d.meals) {
				if (!m.recipeId) continue;
				const r = getRecipe(m.recipeId)!;
				const isSub = r.ingredients.some((i) => SUB.some((t) => i.ingredientId.includes(t)));
				expect(isSub, `seed ${seed}: ${m.recipeId}`).toBe(false);
			}
		}
	});

	it('works across diets without crashing (vegan / dairy-free)', () => {
		for (const diet of [['vegan'], ['dairyFree']] as const) {
			const p = mk({ dietaryFilters: [...diet] as FullProfile['dietaryFilters'] });
			const e = estimateEnergy(p);
			const w = batchPlanWeek({ profile: p, energy: e, seed: 5 });
			expect(w.days.length).toBe(7);
			expect(validateWeek(optimizeWeek(w, p, e).week, p, e).safety).toEqual([]);
		}
	});
});
