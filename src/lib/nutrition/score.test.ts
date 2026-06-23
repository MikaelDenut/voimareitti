import { describe, it, expect } from 'vitest';
import { planWeek, type PlanDay, type PlanMeal, type WeekPlan } from '../engine/meal-planner';
import { estimateEnergy } from '../engine/engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { getIngredient } from '../content/ingredients';
import { recipes } from '../content/recipes';
import { dayTotals, weekMicros, TRACKED_MICROS, type MicroKey } from './day-totals';
import { scoreWeek, bandExceedRaw, proteinShortRaw, macroRaw, varietyRaw } from './score';

// Pin precise: the variety terms here are precise-mode (batch zeroes within-day/week repeat penalties).
function mk(over: Partial<FullProfile> = {}): FullProfile { return { ...defaultProfile(), cookingMode: 'precise', ...over }; }
function gen(over: Partial<FullProfile> = {}, seed = 42) {
	const p = mk(over);
	const e = estimateEnergy(p);
	const w = planWeek({ profile: p, energy: e, seed });
	return { p, e, w };
}

// A synthetic day whose macros are fully controlled. mealMacros reuses the stored macros for an UNEDITED
// recipe meal, so dayTotals returns exactly these numbers (micros are recomputed from the real recipe but
// the macro-tier tests below never read micros).
function synthDay(day: number, m: { kcal: number; protein?: number; carbs?: number; fat?: number; fiber?: number }): PlanDay {
	const macros = { kcal: m.kcal, protein: m.protein ?? 0, carbs: m.carbs ?? 0, fat: m.fat ?? 0, fiber: m.fiber ?? 0 };
	const meal: PlanMeal = { slotKey: 'meal_lunch', recipeId: recipes[0].id, servings: 1, ...macros };
	return { day, meals: [meal], roundOut: [], totals: macros };
}
function synthWeek(days: PlanDay[], target = 0): WeekPlan {
	return { days, meta: { seed: 0, targetKcal: target, proteinBand: [0, 0], carbCeilingG: null, activeFilters: { diet: [], fodmap: 'off', alcoholFree: false }, relaxedNutrients: [], householdScale: 1, planHash: 'x' }, warnings: [] };
}

describe('scoreWeek - purity + determinism', () => {
	it('is deterministic and does not mutate the week', () => {
		const { p, e, w } = gen();
		const snap = JSON.stringify(w);
		expect(scoreWeek(w, p, e)).toEqual(scoreWeek(w, p, e));
		expect(JSON.stringify(w)).toBe(snap);
	});

	it('produces finite, non-negative tiers for a real plan', () => {
		const { p, e, w } = gen();
		const s = scoreWeek(w, p, e);
		for (const k of ['band', 'calorie', 'protein', 'micro', 'macro', 'variety'] as const) {
			expect(Number.isFinite(s.terms[k]), k).toBe(true);
			expect(s.terms[k], k).toBeGreaterThanOrEqual(0);
		}
		expect(Number.isFinite(s.total)).toBe(true);
	});
});

describe('calorie tier (hard band)', () => {
	it('bandExceedRaw is 0 inside the band and positive outside (both directions)', () => {
		const t = 2000;
		expect(bandExceedRaw([synthDay(1, { kcal: 2000 })], t)).toBe(0);
		expect(bandExceedRaw([synthDay(1, { kcal: 2100 })], t)).toBe(0);   // +5% still inside +-7%
		expect(bandExceedRaw([synthDay(1, { kcal: 2300 })], t)).toBeGreaterThan(0); // +15% over
		expect(bandExceedRaw([synthDay(1, { kcal: 1700 })], t)).toBeGreaterThan(0); // -15% under
	});

	it('inBand is false when any day leaves the band', () => {
		const { p, e } = gen();
		const over = synthWeek([synthDay(1, { kcal: e.target }), synthDay(2, { kcal: Math.round(e.target * 1.2) })], e.target);
		expect(scoreWeek(over, p, e).inBand).toBe(false);
		const ok = synthWeek([synthDay(1, { kcal: e.target }), synthDay(2, { kcal: e.target })], e.target);
		expect(scoreWeek(ok, p, e).inBand).toBe(true);
	});
});

describe('protein + macro tiers', () => {
	it('proteinShortRaw penalises only below the floor', () => {
		expect(proteinShortRaw([synthDay(1, { kcal: 2000, protein: 130 })], 120)).toBe(0);
		expect(proteinShortRaw([synthDay(1, { kcal: 2000, protein: 90 })], 120)).toBeGreaterThan(0);
	});

	it('macroRaw penalises carbs over ceiling and fibre under target, not fat at target', () => {
		const m = macroRaw([synthDay(1, { kcal: 2000, carbs: 150, fat: 60, fiber: 10 })], 100, 60, 30);
		expect(m.carb).toBeGreaterThan(0);
		expect(m.fibre).toBeGreaterThan(0);
		expect(m.fat).toBe(0);
	});
});

describe('micro tier rewards covering shortfalls', () => {
	it('adding a 0-kcal supplement that covers a shortfall lowers the score, band unchanged', () => {
		const { p, e, w } = gen({ dietaryFilters: ['vegan'] }, 5); // vegan -> B12/D short
		const before = scoreWeek(w, p, e);
		const wk = weekMicros(w.days);
		const shortK = TRACKED_MICROS.find((k) => wk[k] < e.microTargets[k] * 7);
		expect(shortK, 'a vegan plan should be short on at least one micro').toBeTruthy();
		for (const d of w.days) d.meals.push({
			slotKey: 'supplement', recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
			additions: [{ kind: 'supplement', micro: shortK as MicroKey, amount: e.microTargets[shortK as MicroKey] }]
		});
		const after = scoreWeek(w, p, e);
		expect(after.terms.micro).toBeLessThan(before.terms.micro);
		expect(after.total).toBeLessThan(before.total);
		expect(after.inBand).toBe(before.inBand); // supplements are 0 kcal
	});
});

describe('hard band beats the micro gain (the calcium-vs-band trade)', () => {
	it('milk that covers calcium but pushes a day over the band scores WORSE', () => {
		const { p, e, w } = gen({ mealsPerDay: 4, nutritionGoal: 'lose', weightKg: 70 }, 7);
		const before = scoreWeek(w, p, e);
		const milk = getIngredient('milk')!;
		const day = w.days[0];
		const need = e.target * 1.12 - dayTotals(day).kcal;          // overshoot to ~+12%
		const grams = Math.max(200, Math.round((need / (milk.per100g.energy_kcal || 64)) * 100));
		const meal = day.meals.find((m) => m.recipeId) ?? day.meals[0];
		meal.additions = [...(meal.additions ?? []), { kind: 'ingredient', ingredientId: 'milk', grams }];
		const after = scoreWeek(w, p, e);
		expect(after.inBand).toBe(false);
		expect(after.terms.band).toBeGreaterThan(before.terms.band); // the band penalty rises
		expect(after.total).toBeGreaterThan(before.total);           // and dominates any calcium gain
	});
});

describe('variety + naturalness tier', () => {
	it('flags within-day repeats', () => {
		const id = recipes[0].id;
		const z = { servings: 1, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
		const day: PlanDay = { day: 1, meals: [{ slotKey: 'a', recipeId: id, ...z }, { slotKey: 'b', recipeId: id, ...z }], roundOut: [], totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } };
		expect(varietyRaw(synthWeek([day]), mk()).repeat).toBeGreaterThan(0);
	});

	it('penalises omnivore substitute proteins for omnivores but not for vegans', () => {
		const subId = recipes.find((r) =>
			(r.dietary.vegetarian || r.dietary.vegan) &&
			r.ingredients.some((i) => ['tofu', 'tempeh', 'seitan', 'edamame'].some((t) => i.ingredientId.includes(t)))
		)?.id;
		expect(subId, 'a substitute-protein recipe should exist').toBeTruthy();
		const day: PlanDay = { day: 1, meals: [{ slotKey: 'a', recipeId: subId!, servings: 1, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }], roundOut: [], totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } };
		expect(varietyRaw(synthWeek([day]), mk()).substitute).toBeGreaterThan(0);          // omnivore default
		expect(varietyRaw(synthWeek([day]), mk({ dietaryFilters: ['vegan'] })).substitute).toBe(0); // vegan
	});
});
