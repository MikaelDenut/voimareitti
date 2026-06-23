// Top-up safety (planning/43+): any food added OUTSIDE a recipe must pass ingredientAllowed, so a calorie
// round-out or micro top-up can never slip in a food the user's diet / FODMAP / avoid list excludes.
import { describe, it, expect } from 'vitest';
import { ingredientAllowed } from './recipe-filters';
import { getIngredient, ingredients } from './content/ingredients';
import type { DietaryFilter } from './profile-core';

const prof = (over: Partial<{ dietaryFilters: DietaryFilter[]; fodmap: 'off' | 'gentle' | 'strict'; dislikedIngredientIds: string[] }> = {}) =>
	({ dietaryFilters: [] as DietaryFilter[], fodmap: 'off' as const, dislikedIngredientIds: [] as string[], ...over });

describe('ingredientAllowed', () => {
	it('milk is blocked for dairy-free / lactose-free / vegan', () => {
		const milk = getIngredient('milk')!;
		expect(ingredientAllowed(milk, prof())).toBe(true);
		for (const f of ['dairyFree', 'lactoseFree', 'vegan'] as DietaryFilter[]) {
			expect(ingredientAllowed(milk, prof({ dietaryFilters: [f] })), f).toBe(false);
		}
	});

	it('respects no-fish / no-pork / no-red-meat at the ingredient level', () => {
		const checks: [string, DietaryFilter][] = [['salmon', 'noFish'], ['bacon', 'noPork'], ['lean-beef', 'noRedMeat']];
		for (const [id, f] of checks) {
			const ing = getIngredient(id);
			if (ing) expect(ingredientAllowed(ing, prof({ dietaryFilters: [f] })), `${id}/${f}`).toBe(false);
		}
	});

	it('blocks every high-FODMAP food on a strict-FODMAP profile', () => {
		const highs = ingredients.filter((i) => i.dietary.fodmap === 'high');
		expect(highs.length).toBeGreaterThan(0);
		for (const i of highs) expect(ingredientAllowed(i, prof({ fodmap: 'strict' })), i.id).toBe(false);
	});

	it('respects the avoid list', () => {
		const milk = getIngredient('milk')!;
		expect(ingredientAllowed(milk, prof({ dislikedIngredientIds: ['milk'] }))).toBe(false);
	});
});
