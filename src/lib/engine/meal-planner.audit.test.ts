// Tests for the 2026-06-18 food audit fixes (planning/43): avoid filtering on the round-out, default-
// omnivore weighting, fresh-generation variety, the dominant-ingredient throttle, and protein enforcement.
import { describe, it, expect } from 'vitest';
import { planWeek, eligibleRecipes } from './meal-planner';
import { optimizeWeek } from './optimizer';
import { estimateEnergy } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { recipes, getRecipe } from '../content/recipes';
import { getIngredient } from '../content/ingredients';

function mk(over: Partial<FullProfile> = {}): FullProfile { return { ...defaultProfile(), ...over }; }
function plan(over: Partial<FullProfile> = {}, opts = {}) {
	const p = mk(over);
	return planWeek({ profile: p, energy: estimateEnergy(p), ...opts });
}
function slotRecipeIds(w: ReturnType<typeof planWeek>): string[] {
	return w.days.flatMap((d) => d.meals.map((m) => m.recipeId).filter((x): x is string => !!x));
}

// Mirror of the engine's substitute-protein detection.
const SUB_TOKENS = ['tofu', 'tempeh', 'seitan', 'edamame'];
const SUBSTITUTE_IDS = new Set(
	recipes.filter((r) => (r.dietary.vegetarian || r.dietary.vegan) &&
		r.ingredients.some((i) => SUB_TOKENS.some((t) => i.ingredientId.includes(t)))).map((r) => r.id)
);
function substituteShare(w: ReturnType<typeof planWeek>): number {
	const ids = slotRecipeIds(w);
	return ids.filter((id) => SUBSTITUTE_IDS.has(id)).length / Math.max(1, ids.length);
}

describe('audit A - avoided foods never appear (plan + round-out)', () => {
	it('avoiding green-beans removes every green-bean recipe from the plan', () => {
		const beanRecipes = recipes.filter((r) => r.ingredients.some((i) => i.ingredientId === 'green-beans'));
		expect(beanRecipes.length).toBeGreaterThan(0);
		for (const seed of [1, 7, 42, 99, 500]) {
			const w = plan({ dislikedIngredientIds: ['green-beans'] }, { seed });
			for (const id of slotRecipeIds(w)) {
				expect(getRecipe(id)!.ingredients.some((i) => i.ingredientId === 'green-beans'), `${id} seed ${seed}`).toBe(false);
			}
		}
	});

	it('avoiding an eat-alone food keeps it out of the round-out additions', () => {
		// banana is an eat-alone round-out food; avoiding it must drop it from every day's additions.
		for (const seed of [1, 7, 42, 123]) {
			const w = plan({ dislikedIngredientIds: ['banana'], weightKg: 110, nutritionGoal: 'gain' }, { seed });
			for (const d of w.days) {
				for (const m of d.meals) {
					for (const a of m.additions ?? []) {
						if (a.kind === 'ingredient') expect(a.ingredientId, `seed ${seed}`).not.toBe('banana');
					}
				}
			}
		}
	});

	it('eligibleRecipes excludes avoided ingredients (regression guard)', () => {
		const w = eligibleRecipes(mk({ dislikedIngredientIds: ['green-beans'] }));
		expect(w.some((r) => r.ingredients.some((i) => i.ingredientId === 'green-beans'))).toBe(false);
	});

	it('the calorie round-out never adds a food the diet / FODMAP excludes', () => {
		// strict FODMAP + a gain goal (under target -> round-out fires): every eat-alone ingredient added must
		// be low-FODMAP. (The recipe pool is filtered separately; this guards the OUTSIDE-recipe additions.)
		for (const seed of [1, 7, 42, 99]) {
			const w = plan({ fodmap: 'strict', nutritionGoal: 'gain', weightKg: 110 }, { seed });
			for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) {
				if (a.kind === 'ingredient') {
					const ing = getIngredient(a.ingredientId)!;
					expect(ing.dietary.fodmap, `${a.ingredientId} seed ${seed}`).toBe('low');
				}
			}
		}
	});
});

describe('audit F - default plan is omnivore (substitute proteins down-weighted)', () => {
	it('omnivore default NEVER serves a vegan substitute-protein dish - planWeek AND optimizeWeek (audit H1)', () => {
		// 2026-06-20: the soft down-weight still let tofu/tempeh/seitan surface in PRECISE mode (audit H1 found
		// 45/105 cases). The REAL precise path is planWeek + optimizeWeek, and the optimizer's swaps drew from
		// the full eligible set, so a swap re-introduced tofu (the "Double-tofu noodle bowl" leak) even after the
		// pool was fixed. Both the warm start AND the optimized week must serve zero substitutes to an omnivore.
		for (const seed of [1, 2, 3, 7, 11, 42, 99, 123, 500, 777]) {
			const p = mk({ cookingMode: 'precise' });
			const e = estimateEnergy(p);
			const warm = planWeek({ profile: p, energy: e, seed });
			expect(substituteShare(warm), `planWeek seed ${seed}`).toBe(0);
			expect(substituteShare(optimizeWeek(warm, p, e).week), `optimizeWeek seed ${seed}`).toBe(0);
		}
	});

	it('the opt-in restores plant proteins (clearly higher share than the omnivore default)', () => {
		const seeds = [1, 2, 3, 7, 11, 42, 99, 123, 500, 777];
		const omni = seeds.reduce((s, seed) => s + substituteShare(plan({}, { seed })), 0) / seeds.length;
		const opt = seeds.reduce((s, seed) => s + substituteShare(plan({ includePlantProteins: true }, { seed })), 0) / seeds.length;
		expect(opt).toBeGreaterThan(omni);
	});

	it('vegan profile is unaffected by the omnivore down-weight (only vegan recipes, plan still fills)', () => {
		const w = plan({ dietaryFilters: ['vegan'] }, { seed: 7 });
		for (const id of slotRecipeIds(w)) expect(getRecipe(id)!.dietary.vegan, id).toBe(true);
		expect(slotRecipeIds(w).length).toBeGreaterThan(0);
	});
});

describe('audit D - variety: fresh generation differs, no single ingredient dominates', () => {
	it('two different seeds produce substantially different recipes', () => {
		const a = new Set(slotRecipeIds(plan({}, { seed: 12345 })));
		const b = new Set(slotRecipeIds(plan({}, { seed: 67890 })));
		let inter = 0; for (const x of a) if (b.has(x)) inter++;
		const jaccard = inter / (a.size + b.size - inter);
		expect(jaccard).toBeLessThan(0.4);
	});

	it('a week uses a broad spread of primary proteins (no tiny-subset fallback)', () => {
		const w = plan({}, { seed: 42 });
		const proteins = new Set<string>();
		for (const id of slotRecipeIds(w)) {
			const r = getRecipe(id)!;
			let best = '', bestG = 0;
			for (const ing of r.ingredients) {
				const d = getIngredient(ing.ingredientId);
				if (d?.role !== 'protein') continue;
				const c = ing.grams * (d.per100g.protein_g || 0);
				if (c > bestG) { bestG = c; best = ing.ingredientId; }
			}
			if (best) proteins.add(best);
		}
		expect(proteins.size).toBeGreaterThanOrEqual(4);
	});

	it('no single primary-protein ingredient overwhelms the week', () => {
		for (const seed of [1, 7, 42, 99]) {
			const counts: Record<string, number> = {};
			for (const id of slotRecipeIds(plan({}, { seed }))) {
				const r = getRecipe(id)!;
				let best = '', bestG = 0;
				for (const ing of r.ingredients) {
					const d = getIngredient(ing.ingredientId);
					if (d?.role !== 'protein') continue;
					const c = ing.grams * (d.per100g.protein_g || 0);
					if (c > bestG) { bestG = c; best = ing.ingredientId; }
				}
				if (best) counts[best] = (counts[best] ?? 0) + 1;
			}
			const max = Math.max(0, ...Object.values(counts));
			expect(max, `seed ${seed}`).toBeLessThanOrEqual(6);
		}
	});
});

describe('audit G - calorie + protein land near target', () => {
	it('a fat-loss plan does not systematically overshoot calories', () => {
		for (const seed of [1, 7, 42, 99, 123]) {
			const w = plan({ nutritionGoal: 'lose', mealsPerDay: 4, weightKg: 70 }, { seed });
			const t = w.meta.targetKcal;
			const avg = w.days.reduce((s, d) => s + d.totals.kcal, 0) / w.days.length;
			expect(avg, `seed ${seed} avg`).toBeLessThanOrEqual(t * 1.05); // leans at/under, never systematically over
			const grossOver = w.days.filter((d) => d.totals.kcal > t * 1.10).length;
			expect(grossOver, `seed ${seed} gross-over days`).toBeLessThanOrEqual(1); // the reported bug was ~1.11x every day
		}
	});

	it('most days are within ~10% of the kcal target', () => {
		const w = plan({}, { seed: 42 });
		const t = w.meta.targetKcal;
		const within = w.days.filter((d) => Math.abs(d.totals.kcal - t) <= t * 0.10).length;
		expect(within).toBeGreaterThanOrEqual(5); // at least 5 of 7 days
	});

	it('daily protein is at least close to the band floor across the week', () => {
		const p = mk({});
		const e = estimateEnergy(p);
		const w = planWeek({ profile: p, energy: e, seed: 42 });
		const avg = w.days.reduce((s, d) => s + d.totals.protein, 0) / w.days.length;
		expect(avg).toBeGreaterThanOrEqual(e.proteinBand[0] * 0.9);
	});

	it('still deterministic for a fixed seed (engine unchanged by the component reseed)', () => {
		expect(plan({}, { seed: 42 })).toEqual(plan({}, { seed: 42 }));
	});
});

describe('dairy-free selector + high-protein snack lever', () => {
	it('dairy-free profile yields only dairy-free recipes (slots + recipe additions)', () => {
		const w = plan({ dietaryFilters: ['dairyFree'] }, { seed: 7 });
		for (const id of slotRecipeIds(w)) expect(getRecipe(id)!.dietary.dairyFree, id).toBe(true);
		for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) {
			if (a.kind === 'recipe') expect(getRecipe(a.recipeId)!.dietary.dairyFree, a.recipeId).toBe(true);
		}
	});

	it('the protein-snack round-out only adds qualifying high-protein, low-calorie snacks', () => {
		// high body mass + cut goal => high protein target on limited calories => the snack lever should engage.
		for (const seed of [1, 3, 7, 42]) {
			const w = plan({ nutritionGoal: 'lose', weightKg: 100 }, { seed });
			for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) {
				if (a.kind !== 'recipe') continue;
				const r = getRecipe(a.recipeId)!;
				expect(r.mealtimes.includes('snack'), a.recipeId).toBe(true);
				expect(r.nutritionPerServing.protein_g, a.recipeId).toBeGreaterThanOrEqual(15);
				expect(r.nutritionPerServing.energy_kcal, a.recipeId).toBeLessThanOrEqual(250);
				expect(SUBSTITUTE_IDS.has(a.recipeId), `${a.recipeId} substitute for omnivore`).toBe(false);
			}
		}
	});

	it('preferIronFromFood raises the week\'s iron from meals vs the default', () => {
		const ironOf = (w: ReturnType<typeof planWeek>) => w.days.flatMap((d) => d.meals)
			.filter((m) => m.recipeId).reduce((s, m) => { const r = getRecipe(m.recipeId!); return s + (r ? r.microsPerServing.iron_mg * m.servings : 0); }, 0);
		let bias = 0, base = 0, n = 0;
		for (const seed of [1, 2, 3, 7, 11, 42, 99, 123, 500, 777]) {
			bias += ironOf(plan({ sex: 'female', age: 30, preferIronFromFood: true }, { seed }));
			base += ironOf(plan({ sex: 'female', age: 30 }, { seed }));
			n++;
		}
		expect(bias / n).toBeGreaterThan(base / n);
	});

	it('new Finnish protein snacks exist and are reachable in the snack pool', () => {
		const ids = ['skyr-blueberry-protein-cup', 'rahka-raspberry-protein-cup', 'turkey-cucumber-roll-ups', 'tuna-pickle-snack', 'cottage-cheese-tomato-pepper-snack'];
		for (const id of ids) {
			const r = getRecipe(id);
			expect(r, id).toBeTruthy();
			expect(r!.mealtimes.includes('snack'), id).toBe(true);
			expect(r!.nutritionPerServing.protein_g, id).toBeGreaterThanOrEqual(15);
			expect(r!.nutritionPerServing.energy_kcal, id).toBeLessThanOrEqual(250);
		}
	});
});
