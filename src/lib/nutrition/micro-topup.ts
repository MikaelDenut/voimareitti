// RETIRED FROM THE LIVE PATH (2026-06-20, planning/44): NutritionPlanner.generate now uses optimizeWeek
// (src/lib/engine/optimizer.ts), which covers calcium + supplements calorie-awarely under a HARD calorie
// band. This module is kept ONLY as (a) the baseline reference for the shadow-comparison test and (b) its
// own unit tests. Do NOT re-wire applyMicroTopUps into generate() - the blind append is the overshoot bug.
//
// Weekly micronutrient top-up (planning/38). Runs AFTER planWeek, as a deterministic overlay: if the week
// falls short on a tracked micro, fix it - calcium with FOOD (milk; never a pill, per the Bolland evidence
// on supplemental calcium), every other short micro with an auto-added daily Supplement line. The generator
// already covers the easy nutrients, so this mostly fires for vitamin D / B12 or after the user edits the
// menu. Pure + deterministic; planWeek itself stays untouched.

import type { WeekPlan, PlanMeal } from '../engine/meal-planner';
import { computePlanHash } from '../engine/meal-planner';
import type { FullProfile } from '../profile-core';
import { getIngredient } from '../content/ingredients';
import { ingredientAllowed } from '../recipe-filters';
import { microTargetsFor } from './constants';
import { weekMicros, dayTotals, TRACKED_MICROS, type MicroKey } from './day-totals';

const CALCIUM_FOOD = 'milk';
const CALCIUM_GRAMS = 200; // ~200 ml per top-up

function mainSlot(day: WeekPlan['days'][number]): string {
	let key = '', best = -1;
	for (const m of day.meals) if (m.recipeId && m.kcal > best) { best = m.kcal; key = m.slotKey; }
	return key || day.meals[0]?.slotKey || 'meal_lunch';
}

/** Round a supplement dose to a tidy number for display. */
function tidyDose(amount: number): number {
	return amount >= 10 ? Math.round(amount) : Math.round(amount * 10) / 10;
}

/**
 * Mutates the week: tops up calcium with milk (if the diet allows dairy) and adds a daily supplement line for
 * any other tracked micro still short for the week. Recomputes day totals + the plan hash.
 */
export function applyMicroTopUps(week: WeekPlan, profile: FullProfile): void {
	const days = week.days;
	if (!days.length) return;
	const tgt = microTargetsFor(profile.age, profile.sex, profile.pregnant);

	// 1. Calcium: food-only (milk), respecting the FULL diet. Never a pill. Milk must pass the same ingredient
	// eligibility every other added food does (diet filters + FODMAP + avoid); if it does not (vegan, lactose-
	// free, dairy-free, milk avoided, strict FODMAP...), leave calcium flagged instead of adding milk.
	const milk = getIngredient(CALCIUM_FOOD);
	const milkOk = !!milk && ingredientAllowed(milk, profile);
	if (milkOk) {
		let guard = 0;
		const cap = days.length; // at most one ~200 ml glass per day
		while (weekMicros(days).calcium_mg < tgt.calcium_mg * 7 && guard < cap) {
			const day = days[guard % days.length];
			day.meals.push({
				slotKey: mainSlot(day), recipeId: null, servings: 0,
				kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
				additions: [{ kind: 'ingredient', ingredientId: CALCIUM_FOOD, grams: CALCIUM_GRAMS }]
			});
			guard++;
		}
	}

	// 2. Every other tracked micro still genuinely short for the week -> a daily Supplement line on each day.
	const wk = weekMicros(days);
	for (const k of TRACKED_MICROS) {
		if (k === 'calcium_mg') continue;            // calcium is food-only
		// Iron: if the user chose to get iron from food, NEVER add an iron pill - the planner already worked
		// harder to pick iron-rich meals; any remaining gap is left honestly flagged (planning/43+).
		if (k === 'iron_mg' && profile.preferIronFromFood) continue;
		if (wk[k] >= tgt[k] * 7 * 0.9) continue;     // close enough across the week
		const dose = tidyDose(tgt[k]);
		for (const day of days) {
			day.meals.push({
				slotKey: 'supplement', recipeId: null, servings: 0,
				kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
				additions: [{ kind: 'supplement', micro: k as MicroKey, amount: dose }]
			} as PlanMeal);
		}
	}

	for (const day of days) day.totals = dayTotals(day);
	week.meta.planHash = computePlanHash(week.meta.seed, profile, days);
}
