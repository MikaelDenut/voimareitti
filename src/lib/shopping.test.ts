import { describe, it, expect } from 'vitest';
import { planWeek, computePlanHash } from './engine/meal-planner';
import { estimateEnergy } from './engine/engine';
import { defaultProfile, type FullProfile } from './profile-core';
import { shoppingList, aisleOf, isPantry, shopUnit, formatQuantity, AISLE_ORDER } from './shopping';
import { getIngredient } from './content/ingredients';
import { getRecipe } from './content/recipes';

function mk(over: Partial<FullProfile> = {}): FullProfile {
	return { ...defaultProfile(), ...over };
}
function week(over: Partial<FullProfile> = {}, seed = 5) {
	const p = mk(over);
	return planWeek({ profile: p, energy: estimateEnergy(p), seed });
}

describe('shopping rollup', () => {
	it('aggregates a canonical ingredient id into ONE line summed across the week', () => {
		const w = week();
		const list = shoppingList(w);
		const ids = list.lines.map((l) => l.ingredientId);
		expect(new Set(ids).size).toBe(ids.length); // one line per id

		// manually sum one ingredient's grams across the plan and compare
		const target = list.lines[0].ingredientId;
		let sum = 0;
		for (const d of w.days) for (const m of d.meals) {
			if (!m.recipeId) continue;
			const r = getRecipe(m.recipeId)!;
			for (const ing of r.ingredients) if (ing.ingredientId === target) sum += ing.grams * m.servings;
		}
		for (const d of w.days) for (const ro of d.roundOut) if (ro.ingredientId === target) sum += ro.grams;
		expect(list.lines[0].grams).toBe(Math.round(sum));
	});

	it('keeps different products separate (no merging across ids)', () => {
		const w = week();
		const list = shoppingList(w);
		// every line maps to a real, distinct ingredient
		for (const l of list.lines) expect(getIngredient(l.ingredientId)).toBeDefined();
	});

	it('drops water', () => {
		const w = week();
		const list = shoppingList(w);
		expect(list.lines.find((l) => l.ingredientId === 'water')).toBeUndefined();
	});

	it('groups by aisle in canonical order with non-empty groups only', () => {
		const list = shoppingList(week());
		const order = list.byAisle.map((g) => g.aisle);
		const sorted = [...order].sort((a, b) => AISLE_ORDER.indexOf(a) - AISLE_ORDER.indexOf(b));
		expect(order).toEqual(sorted);
		for (const g of list.byAisle) expect(g.lines.length).toBeGreaterThan(0);
	});

	it('household scaling increases total grams', () => {
		const solo = shoppingList(week());
		const fam = shoppingList(week({ household: [{ id: 'a', label: 'P', age: 35, sex: 'male' }] }));
		const sum = (l: ReturnType<typeof shoppingList>) => l.lines.reduce((s, x) => s + x.grams, 0);
		expect(sum(fam)).toBeGreaterThan(sum(solo));
	});

	it('planHash is stable for the same plan', () => {
		expect(shoppingList(week()).planHash).toBe(shoppingList(week()).planHash);
	});
});

describe('shopping reflects meal edits + additions (planning/37)', () => {
	it('an ingredient addition adds its grams and changes the plan hash', () => {
		const p = mk();
		const w = planWeek({ profile: p, energy: estimateEnergy(p), seed: 5 });
		const before = shoppingList(w);
		const beforeApple = before.lines.find((l) => l.ingredientId === 'apple')?.grams ?? 0;
		const meal = w.days.flatMap((d) => d.meals).find((m) => m.recipeId)!;
		meal.additions = [{ kind: 'ingredient', ingredientId: 'apple', grams: 150 }];
		w.meta.planHash = computePlanHash(w.meta.seed, p, w.days); // UI recomputes after an edit
		const after = shoppingList(w);
		const afterApple = after.lines.find((l) => l.ingredientId === 'apple')?.grams ?? 0;
		expect(afterApple).toBe(beforeApple + 150);
		expect(after.planHash).not.toBe(before.planHash);
	});

	it('removing a recipe ingredient drops its grams from the list', () => {
		const p = mk();
		const w = planWeek({ profile: p, energy: estimateEnergy(p), seed: 5 });
		const meal = w.days.flatMap((d) => d.meals).find((m) => m.recipeId)!;
		const target = getRecipe(meal.recipeId!)!.ingredients[0].ingredientId;
		const before = shoppingList(w).lines.find((l) => l.ingredientId === target)?.grams ?? 0;
		meal.ingredientEdits = [{ originalId: target, removed: true }];
		const after = shoppingList(w).lines.find((l) => l.ingredientId === target)?.grams ?? 0;
		expect(after).toBeLessThan(before);
	});
});

describe('aisle mapping + pantry', () => {
	it('maps sample ingredients to the right aisle', () => {
		const apple = getIngredient('apple');
		if (apple) expect(aisleOf(apple)).toBe('produce');
		const salt = getIngredient('salt');
		if (salt) expect(isPantry(salt)).toBe(true);
	});
});

describe('shop units + formatting', () => {
	it('rounds grams UP and switches to kg above 1 kg', () => {
		const ing = getIngredient('apple')!;
		expect(shopUnit(ing, 123).unit).toBe('g');
		expect(shopUnit(ing, 123).value).toBeGreaterThanOrEqual(123);
		const kg = shopUnit(ing, 1450);
		expect(kg.unit).toBe('kg');
		expect(kg.value).toBeGreaterThanOrEqual(1.45);
	});

	it('formats with a decimal comma for fi/hu/sv and a point for en', () => {
		expect(formatQuantity(1.5, 'kg', 'en')).toBe('1.5 kg');
		expect(formatQuantity(1.5, 'kg', 'fi')).toBe('1,5 kg');
		expect(formatQuantity(1.5, 'kg', 'sv')).toBe('1,5 kg');
		expect(formatQuantity(1.5, 'kg', 'hu')).toBe('1,5 kg');
	});
});
