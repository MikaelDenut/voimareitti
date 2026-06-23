import { describe, it, expect } from 'vitest';
import { planWeek, eligibleRecipes } from './meal-planner';
import { estimateEnergy } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { getRecipe } from '../content/recipes';
import { matchesDiet, matchesFodmap, isAlcoholFree } from '../recipe-filters';
import { MEAL_SLOT_KEYS } from '../nutrition/constants';

function mk(over: Partial<FullProfile> = {}): FullProfile {
	return { ...defaultProfile(), ...over };
}
function plan(over: Partial<FullProfile> = {}, opts = {}) {
	const p = mk(over);
	return planWeek({ profile: p, energy: estimateEnergy(p), ...opts });
}
function selectedRecipeIds(w: ReturnType<typeof planWeek>): string[] {
	return w.days.flatMap((d) => d.meals.map((m) => m.recipeId).filter((x): x is string => !!x));
}

// Every recipe id the plan references: slot recipes AND recipe-kind additions (the protein-snack lever).
function allPlanRecipeIds(w: ReturnType<typeof planWeek>): string[] {
	const ids: string[] = [];
	for (const d of w.days) {
		for (const m of d.meals) {
			if (m.recipeId) ids.push(m.recipeId);
			for (const a of m.additions ?? []) if (a.kind === 'recipe') ids.push(a.recipeId);
		}
	}
	return ids;
}

describe('component sub-recipes never enter the plan', () => {
	it('eligibleRecipes excludes every component recipe', () => {
		expect(eligibleRecipes(mk()).some((r) => r.component)).toBe(false);
	});
	it('no slot meal OR recipe-addition is a component, across varied profiles + seeds', () => {
		const overrides: Partial<FullProfile>[] = [
			{}, { mealsPerDay: 6 }, { dietaryFilters: ['vegetarian'] }, { weightKg: 120 }
		];
		for (const seed of [1, 3, 7, 42, 123]) {
			for (const over of overrides) {
				const w = plan(over, { seed });
				for (const id of allPlanRecipeIds(w)) {
					expect(getRecipe(id)?.component ?? false, `${id} (component) reached the plan`).toBe(false);
				}
			}
		}
	});
});

describe('meal planner - shape + determinism', () => {
	// Slot meals = the recipe/placeholder meals from the templates; round-out single-foods (recipeId null
	// WITH additions) are extra editable items added on top, so they are excluded from the slot count.
	const slotMeals = (d: { meals: { recipeId: string | null; additions?: unknown[] }[] }) =>
		d.meals.filter((m) => m.recipeId !== null || !(m.additions?.length)).length;

	it('produces 7 days with mealsPerDay slot meals each', () => {
		const w = plan({ mealsPerDay: 3 });
		expect(w.days.length).toBe(7);
		for (const d of w.days) expect(slotMeals(d)).toBe(3);
	});

	it('handles mealsPerDay 1..8', () => {
		for (let n = 1; n <= 8; n++) {
			const w = plan({ mealsPerDay: n });
			for (const d of w.days) expect(slotMeals(d), `n=${n}`).toBe(n);
		}
	});

	it('is deterministic for the same profile + seed', () => {
		expect(plan({}, { seed: 42 })).toEqual(plan({}, { seed: 42 }));
	});

	it('different seeds can produce different plans', () => {
		const a = plan({}, { seed: 1 }).meta.planHash;
		const b = plan({}, { seed: 999 }).meta.planHash;
		// Not a hard guarantee, but with a large pool these should differ.
		expect(a === b).toBe(false);
	});
});

describe('meal planner - safety filters never relax', () => {
	it('vegan profile yields only vegan recipes', () => {
		const w = plan({ dietaryFilters: ['vegan'] });
		for (const id of selectedRecipeIds(w)) {
			const r = getRecipe(id)!;
			expect(matchesDiet(r, 'vegan'), id).toBe(true);
		}
	});

	it('soy-free profile excludes soy recipes', () => {
		const w = plan({ dietaryFilters: ['soyFree'] });
		for (const id of selectedRecipeIds(w)) expect(getRecipe(id)!.dietary.soyFree, id).toBe(true);
	});

	it('FODMAP strict yields only low-FODMAP recipes', () => {
		const w = plan({ fodmap: 'strict' });
		for (const id of selectedRecipeIds(w)) expect(getRecipe(id)!.dietary.fodmap, id).toBe('low');
	});

	it('alcohol-free profile yields only alcohol-free recipes', () => {
		const w = plan({ alcoholFree: true });
		for (const id of selectedRecipeIds(w)) expect(isAlcoholFree(getRecipe(id)!), id).toBe(true);
	});

	it('pregnancy excludes unsafe recipes (high-mercury fish / liver / raw / alcohol)', () => {
		const w = plan({ sex: 'female', pregnant: true, trimester: 2 });
		const UNSAFE = ['swordfish', 'shark', 'marlin', 'liver', 'tartare', 'sushi', 'unpasteur'];
		for (const id of selectedRecipeIds(w)) {
			const r = getRecipe(id)!;
			expect(isAlcoholFree(r), id).toBe(true);
			for (const ing of r.ingredients) for (const tok of UNSAFE) expect(ing.ingredientId.includes(tok), `${id}/${ing.ingredientId}`).toBe(false);
		}
	});
});

describe('meal planner - targets in meta', () => {
	it('carb ceiling is set for cut/maintain and null for bulk', () => {
		expect(plan({ nutritionGoal: 'lose' }).meta.carbCeilingG).not.toBeNull();
		expect(plan({ nutritionGoal: 'maintain' }).meta.carbCeilingG).not.toBeNull();
		expect(plan({ nutritionGoal: 'gain' }).meta.carbCeilingG).toBeNull();
	});

	it('protein band is carried into meta', () => {
		const w = plan({});
		expect(w.meta.proteinBand[0]).toBeGreaterThan(0);
		expect(w.meta.proteinBand[1]).toBeGreaterThanOrEqual(w.meta.proteinBand[0]);
	});

	it('every day has finite positive totals', () => {
		for (const d of plan({}).days) {
			expect(Number.isFinite(d.totals.kcal)).toBe(true);
			expect(d.totals.kcal).toBeGreaterThan(0);
		}
	});
});

describe('meal planner - soft nutrient relaxation (safety stays)', () => {
	it('over-constrained nutrient filters relax (recorded), diet still applied', () => {
		const w = plan({ dietaryFilters: ['vegan'] }, { nutrientFilters: ['high-protein', 'low-cal', 'low-carb', 'high-fibre'] });
		// Plan still fills with vegan recipes; some nutrient filters were relaxed and recorded.
		expect(Array.isArray(w.meta.relaxedNutrients)).toBe(true);
		for (const id of selectedRecipeIds(w)) expect(getRecipe(id)!.dietary.vegan, id).toBe(true);
	});
});

describe('meal planner - variety + non-looping', () => {
	it('no recipe repeats within a single day', () => {
		for (const d of plan({}).days) {
			const ids = d.meals.map((m) => m.recipeId).filter(Boolean);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it('uses a variety of recipes across the week', () => {
		const ids = selectedRecipeIds(plan({}));
		expect(new Set(ids).size).toBeGreaterThan(5);
	});

	it('a hard / impossible profile returns best-effort placeholders without looping', () => {
		const allIds = plan({}).days.flatMap((d) => d.meals.map((m) => m.recipeId)).filter(Boolean) as string[];
		const w = plan({ dislikedRecipeIds: [...new Set(allIds)], mealsPerDay: 3 });
		// With everything excluded the pool may collapse; the plan must still return 7 days and warn.
		expect(w.days.length).toBe(7);
	});

	it('a vegan high-protein low-kcal fixture completes (no infinite loop)', () => {
		const w = plan({ dietaryFilters: ['vegan'], nutritionGoal: 'lose', weightKg: 60 }, { nutrientFilters: ['high-protein'] });
		expect(w.days.length).toBe(7);
	});
});

describe('meal planner - household', () => {
	it('adding members raises the household target and scale', () => {
		const solo = plan({});
		const fam = plan({ household: [{ id: 'k', label: 'Kid', age: 8 }, { id: 'a', label: 'Partner', age: 35, sex: 'male' }] });
		expect(fam.meta.targetKcal).toBeGreaterThan(solo.meta.targetKcal);
		expect(fam.meta.householdScale).toBeGreaterThan(1);
	});

	it('same household + seed = same plan; removing a member replans', () => {
		const h = [{ id: 'a', label: 'Partner', age: 35, sex: 'male' as const }];
		const a = planWeek({ profile: mk({ household: h }), energy: estimateEnergy(mk({ household: h })), seed: 7 });
		const b = planWeek({ profile: mk({ household: h }), energy: estimateEnergy(mk({ household: h })), seed: 7 });
		expect(a.meta.planHash).toBe(b.meta.planHash);
		const c = planWeek({ profile: mk({ household: [] }), energy: estimateEnergy(mk({})), seed: 7 });
		expect(c.meta.targetKcal).not.toBe(a.meta.targetKcal);
	});
});

describe('meal planner - appropriateness (Theme 8)', () => {
	const BKEY = MEAL_SLOT_KEYS[0]; // breakfast slot key (mealsPerDay >= 2)

	it('breakfast slots never serve a dinner-only recipe, across seeds + profiles', () => {
		const overrides: Partial<FullProfile>[] = [
			{ mealsPerDay: 3 }, { mealsPerDay: 5 }, { mealsPerDay: 8 },
			{ dietaryFilters: ['vegetarian'] }, { dietaryFilters: ['vegan'] }
		];
		for (const seed of [1, 2, 3, 7, 42, 99, 123, 500, 777]) {
			for (const over of overrides) {
				const w = plan(over, { seed });
				for (const d of w.days) {
					for (const m of d.meals) {
						if (m.slotKey === BKEY && m.recipeId) {
							const r = getRecipe(m.recipeId)!;
							const ok = r.mealtimes.includes('breakfast') || r.mealtimes.includes('snack');
							expect(ok, `${m.recipeId} (${r.mealtimes.join('/')}) in breakfast slot seed ${seed}`).toBe(true);
						}
					}
				}
			}
		}
	});

	it('every recipe carries a non-empty mealtimes tag', () => {
		const w = plan({ mealsPerDay: 6 }, { seed: 7 });
		for (const id of selectedRecipeIds(w)) {
			expect(getRecipe(id)!.mealtimes.length).toBeGreaterThan(0);
		}
	});
});
