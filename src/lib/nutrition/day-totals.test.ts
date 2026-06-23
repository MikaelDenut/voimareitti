import { describe, it, expect } from 'vitest';
import { recipes } from '../content/recipes';
import { getIngredient } from '../content/ingredients';
import {
	effectiveIngredients, mealMacros, mealFacts, mealMicros, mealWeight, dayTotals, dayMicros,
	dayCalorieStatus, kcalMatchedServings, kcalMatchedGrams, TRACKED_MICROS, microContributors
} from './day-totals';
import type { PlanMeal, PlanDay } from '../engine/meal-planner';

const r = recipes[0];
const base = r.base_servings || 1;

function baseMeal(servings = 1): PlanMeal {
	const n = r.nutritionPerServing;
	return {
		slotKey: 'meal_lunch', recipeId: r.id, servings,
		kcal: Math.round(n.energy_kcal * servings), protein: Math.round(n.protein_g * servings),
		carbs: Math.round(n.carbohydrates_g * servings), fat: Math.round(n.fat_g * servings),
		fiber: Math.round(n.fiber_g * servings)
	};
}

describe('effectiveIngredients', () => {
	it('an unedited meal at base servings returns the recipe ingredients unchanged', () => {
		const eff = effectiveIngredients(baseMeal(base));
		expect(eff.length).toBe(r.ingredients.length);
		expect(eff[0].grams).toBeCloseTo(r.ingredients[0].grams, 5);
		expect(eff[0].ingredientId).toBe(r.ingredients[0].ingredientId);
	});
	it('a removed ingredient drops off the list', () => {
		const m = baseMeal(base);
		m.ingredientEdits = [{ originalId: r.ingredients[0].ingredientId, removed: true }];
		const eff = effectiveIngredients(m);
		expect(eff.some((e) => e.ingredientId === r.ingredients[0].ingredientId)).toBe(false);
	});
	it('a swap changes the ingredient id and grams', () => {
		const m = baseMeal(base);
		m.ingredientEdits = [{ originalId: r.ingredients[0].ingredientId, swapToId: 'apple', grams: 200 }];
		const eff = effectiveIngredients(m);
		const apple = eff.find((e) => e.ingredientId === 'apple');
		expect(apple).toBeTruthy();
		expect(apple!.grams).toBeCloseTo(200 * (base / base), 5);
	});
	it('an ingredient addition appears at its absolute grams', () => {
		const m = baseMeal(base);
		m.additions = [{ kind: 'ingredient', ingredientId: 'apple', grams: 150 }];
		const eff = effectiveIngredients(m);
		expect(eff.find((e) => e.ingredientId === 'apple')?.grams).toBe(150);
	});
});

describe('mealMacros', () => {
	it('equals the planner-stored values for an unedited meal (no drift on a fresh plan)', () => {
		const m = baseMeal(1);
		const mm = mealMacros(m);
		expect(mm.kcal).toBe(m.kcal);
		expect(mm.protein).toBe(m.protein);
		expect(mm.carbs).toBe(m.carbs);
		expect(mm.fat).toBe(m.fat);
	});
	it('adding an apple raises kcal by about the apple energy', () => {
		const apple = getIngredient('apple')!;
		const m = baseMeal(1);
		m.additions = [{ kind: 'ingredient', ingredientId: 'apple', grams: 150 }];
		const delta = mealMacros(m).kcal - baseMeal(1).kcal;
		const expected = Math.round(apple.per100g.energy_kcal * 1.5);
		expect(Math.abs(delta - expected)).toBeLessThanOrEqual(1);
	});
	it('removing the highest-energy ingredient lowers kcal', () => {
		const top = [...r.ingredients].sort((a, b) =>
			(getIngredient(b.ingredientId)?.per100g.energy_kcal ?? 0) - (getIngredient(a.ingredientId)?.per100g.energy_kcal ?? 0))[0];
		const noop = baseMeal(base); noop.ingredientEdits = [{ originalId: top.ingredientId }];
		const removed = baseMeal(base); removed.ingredientEdits = [{ originalId: top.ingredientId, removed: true }];
		expect(mealMacros(removed).kcal).toBeLessThan(mealMacros(noop).kcal);
	});
});

describe('mealFacts', () => {
	it('returns the macro set plus sugars and salt for the FDA-style label', () => {
		const f = mealFacts(baseMeal(1));
		expect(f.kcal).toBe(mealMacros(baseMeal(1)).kcal);
		expect(f.sugars).toBeGreaterThanOrEqual(0);
		expect(f.salt).toBeGreaterThanOrEqual(0);
	});
});

describe('mealMicros + mealWeight', () => {
	it('an unedited meal has non-negative micros and a positive weight', () => {
		const mic = mealMicros(baseMeal(1));
		for (const k of TRACKED_MICROS) expect(mic[k]).toBeGreaterThanOrEqual(0);
		expect(mealWeight(baseMeal(base))).toBeGreaterThan(0);
	});
});

describe('dayTotals + dayMicros', () => {
	it('a one-meal day with no round-out equals that meal', () => {
		const day: PlanDay = { day: 1, meals: [baseMeal(1)], roundOut: [], totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } };
		expect(dayTotals(day).kcal).toBe(mealMacros(baseMeal(1)).kcal);
		const dm = dayMicros(day);
		expect(TRACKED_MICROS.some((k) => dm[k] > 0)).toBe(true);
	});
});

describe('dayCalorieStatus (+/-10%)', () => {
	it('flags low / over / ok at the thresholds', () => {
		expect(dayCalorieStatus(800, 1000).state).toBe('low');
		expect(dayCalorieStatus(1200, 1000).state).toBe('over');
		expect(dayCalorieStatus(1000, 1000).state).toBe('ok');
		expect(dayCalorieStatus(950, 1000).state).toBe('ok');   // within 10% under
		expect(dayCalorieStatus(1050, 1000).state).toBe('ok');  // within 10% over
		expect(dayCalorieStatus(900, 1000).state).toBe('ok');   // exactly 10% under is not "low"
		expect(dayCalorieStatus(500, 0).state).toBe('ok');      // no target -> ok
	});
});

describe('calorie-matched portions', () => {
	it('kcalMatchedServings snaps to 0.5 and clamps [0.5, 3]', () => {
		expect(kcalMatchedServings(600, 300)).toBe(2);
		expect(kcalMatchedServings(300, 300)).toBe(1);
		expect(kcalMatchedServings(50, 300)).toBe(0.5);   // tiny -> floor
		expect(kcalMatchedServings(3000, 300)).toBe(3);   // huge -> cap
		expect(kcalMatchedServings(400, 0)).toBe(1);      // guard
	});
	it('kcalMatchedGrams snaps to a neat step and guards zero-energy foods', () => {
		expect(kcalMatchedGrams(100, 50, 80)).toBe(200);  // 200 g -> step 25
		expect(kcalMatchedGrams(100, 0, 80)).toBe(80);    // zero-energy -> fallback
		expect(kcalMatchedGrams(10, 52, 30)).toBe(20);    // ~19 g -> step 5
	});
});

describe('microContributors', () => {
	const ZERO = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
	it('ranks ingredient contributions and roughly sums to the day micro total', () => {
		const day: PlanDay = { day: 1, meals: [baseMeal(1)], roundOut: [], totals: ZERO };
		const c = microContributors(day, 'potassium_mg');
		for (let i = 1; i < c.length; i++) expect(c[i - 1].amount).toBeGreaterThanOrEqual(c[i].amount); // ranked desc
		const sum = c.reduce((s, x) => s + x.amount, 0);
		expect(Math.abs(sum - dayMicros(day).potassium_mg)).toBeLessThanOrEqual(c.length * 0.1 + 1); // ~equals total
	});
	it('counts a 0-kcal supplement as its own contributor', () => {
		const day: PlanDay = {
			day: 1,
			meals: [baseMeal(1), { slotKey: 'supplement', recipeId: null, servings: 0, ...ZERO, additions: [{ kind: 'supplement', micro: 'vitamin_d_ug', amount: 15 }] }],
			roundOut: [], totals: ZERO
		};
		expect(microContributors(day, 'vitamin_d_ug').find((x) => x.id === 'supplement')?.amount).toBe(15);
	});
});
