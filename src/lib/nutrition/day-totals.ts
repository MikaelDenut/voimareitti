// Pure helpers for the EDITABLE meal day (planning/37): the effective ingredient list of a meal (recipe
// with per-ingredient swap/delete edits applied + added foods), live macro + micro totals, the per-day
// calorie status, and calorie-preserving swap portion math. No runes, no DOM - unit-testable. planWeek
// stays untouched; these compute the display/shopping view of a (possibly edited) persisted plan.

import { getIngredient } from '../content/ingredients';
import { getRecipe } from '../content/recipes';
import type { PlanMeal, PlanDay, AddedFood } from '../engine/meal-planner';
import { DAY_UNDER_PCT, DAY_OVER_PCT } from './constants';

export interface MacroTotals { kcal: number; protein: number; carbs: number; fat: number; fiber: number; }
export type MicroKey =
	| 'potassium_mg' | 'calcium_mg' | 'iron_mg' | 'magnesium_mg' | 'zinc_mg'
	| 'vitamin_c_mg' | 'vitamin_d_ug' | 'vitamin_b12_ug' | 'folate_ug';
export const TRACKED_MICROS: MicroKey[] = [
	'potassium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg', 'zinc_mg',
	'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_b12_ug', 'folate_ug'
];
export type MicroTotals = Record<MicroKey, number>;

export interface EffIngredient { ingredientId: string; grams: number; }

const ZERO_MACROS: MacroTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
const zeroMicros = (): MicroTotals =>
	Object.fromEntries(TRACKED_MICROS.map((k) => [k, 0])) as MicroTotals;

function recipeBase(recipeId: string): number {
	const r = getRecipe(recipeId);
	return (r?.base_servings || r?.computed?.baseServings || 1) || 1;
}

/** Expand an added food to its absolute (meal-scale) ingredient grams. Supplements contribute no ingredients
 *  (their micronutrient is added separately in mealMicros). */
function additionIngredients(a: AddedFood): EffIngredient[] {
	if (a.kind === 'ingredient') return [{ ingredientId: a.ingredientId, grams: a.grams }];
	if (a.kind === 'supplement') return [];
	const r = getRecipe(a.recipeId);
	if (!r) return [];
	const scale = a.servings / recipeBase(a.recipeId);
	return r.ingredients.map((ri) => ({ ingredientId: ri.ingredientId, grams: ri.grams * scale }));
}

/**
 * The effective ingredient list of a meal at its planned servings: the recipe's ingredients with edits
 * applied (drop removed, apply swap id + per-base grams) scaled by servings/base, PLUS added foods.
 */
export function effectiveIngredients(meal: PlanMeal): EffIngredient[] {
	const out: EffIngredient[] = [];
	if (meal.recipeId) {
		const r = getRecipe(meal.recipeId);
		if (r) {
			const scale = meal.servings / recipeBase(meal.recipeId);
			const edits = meal.ingredientEdits ?? [];
			for (const ing of r.ingredients) {
				const edit = edits.find((e) => e.originalId === ing.ingredientId);
				if (edit?.removed) continue;
				const id = edit?.swapToId ?? ing.ingredientId;
				const baseGrams = edit?.grams ?? ing.grams;
				out.push({ ingredientId: id, grams: baseGrams * scale });
			}
		}
	}
	for (const a of meal.additions ?? []) out.push(...additionIngredients(a));
	return out;
}

function sumMacros(list: EffIngredient[]): MacroTotals {
	const t = { ...ZERO_MACROS };
	for (const { ingredientId, grams } of list) {
		const d = getIngredient(ingredientId);
		if (!d) continue;
		const f = grams / 100;
		t.kcal += d.per100g.energy_kcal * f;
		t.protein += d.per100g.protein_g * f;
		t.carbs += d.per100g.carbohydrates_g * f;
		t.fat += d.per100g.fat_g * f;
		t.fiber += d.per100g.fiber_g * f;
	}
	return t;
}

function addMacros(a: MacroTotals, b: MacroTotals): MacroTotals {
	return { kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, fiber: a.fiber + b.fiber };
}
function roundMacros(t: MacroTotals): MacroTotals {
	return { kcal: Math.round(t.kcal), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat), fiber: Math.round(t.fiber) };
}

const hasEdits = (meal: PlanMeal) => (meal.ingredientEdits?.length ?? 0) > 0;
const hasAdditions = (meal: PlanMeal) => (meal.additions?.length ?? 0) > 0;

/**
 * Meal macro totals (recipe portion + additions). For an UNEDITED recipe we reuse the planner's stored
 * values so a freshly generated plan shows byte-identical numbers; once an ingredient is edited we recompute
 * the recipe portion from its ingredients.
 */
export function mealMacros(meal: PlanMeal): MacroTotals {
	let recipePart: MacroTotals;
	if (meal.recipeId && hasEdits(meal)) {
		const r = getRecipe(meal.recipeId);
		const scale = r ? meal.servings / recipeBase(meal.recipeId) : 0;
		const edits = meal.ingredientEdits ?? [];
		const list: EffIngredient[] = [];
		if (r) for (const ing of r.ingredients) {
			const edit = edits.find((e) => e.originalId === ing.ingredientId);
			if (edit?.removed) continue;
			list.push({ ingredientId: edit?.swapToId ?? ing.ingredientId, grams: (edit?.grams ?? ing.grams) * scale });
		}
		recipePart = sumMacros(list);
	} else {
		recipePart = { kcal: meal.kcal, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, fiber: meal.fiber };
	}
	const additionsPart = sumMacros((meal.additions ?? []).flatMap(additionIngredients));
	return roundMacros(addMacros(recipePart, additionsPart));
}

/** Meal micro totals, always computed from the effective ingredient list (the planner stores no micros). */
export function mealMicros(meal: PlanMeal): MicroTotals {
	const t = zeroMicros();
	for (const { ingredientId, grams } of effectiveIngredients(meal)) {
		const d = getIngredient(ingredientId);
		if (!d) continue;
		const f = grams / 100;
		const m = d.micros_per100g as unknown as Record<string, number>;
		for (const k of TRACKED_MICROS) t[k] += (m[k] ?? 0) * f;
	}
	// Supplements contribute their single micronutrient directly (no food).
	for (const a of meal.additions ?? []) {
		if (a.kind === 'supplement' && (TRACKED_MICROS as string[]).includes(a.micro)) t[a.micro as MicroKey] += a.amount;
	}
	return t;
}

export interface MealFacts extends MacroTotals { sugars: number; salt: number; }
/** Full nutrition-label macros for a meal: mealMacros plus sugars + salt (computed from the effective
 *  ingredient list), so the meal can render the same FDA-style facts label used on the recipe page. */
export function mealFacts(meal: PlanMeal): MealFacts {
	const m = mealMacros(meal);
	let sugars = 0, salt = 0;
	for (const { ingredientId, grams } of effectiveIngredients(meal)) {
		const d = getIngredient(ingredientId);
		if (!d) continue;
		const f = grams / 100;
		sugars += d.per100g.sugars_g * f;
		salt += d.per100g.salt_g * f;
	}
	return { ...m, sugars: Math.round(sugars * 10) / 10, salt: Math.round(salt * 10) / 10 };
}

/** Total effective grams of a meal (the "weight" shown on the card). */
export function mealWeight(meal: PlanMeal): number {
	return Math.round(effectiveIngredients(meal).reduce((s, i) => s + i.grams, 0));
}

/** A batch "leftover": the SAME cooked dish served in the SAME slot on the PREVIOUS day. The caller gates
 *  this to batch mode (precise plans never repeat a recipe on consecutive days, so it is false there anyway).
 *  Replaces the old firstCookDay map, which mislabelled non-consecutive repeats and leaked into precise mode
 *  (audit C1 / P2). Pure + day-local. */
export function isLeftoverMeal(days: PlanDay[], dayIndex: number, meal: PlanMeal): boolean {
	if (!meal.recipeId || dayIndex <= 0) return false;
	return days[dayIndex - 1].meals.some((m) => m.slotKey === meal.slotKey && m.recipeId === meal.recipeId);
}

function roundOutMacros(day: PlanDay): MacroTotals {
	return roundMacros(sumMacros((day.roundOut ?? []).map((ro) => ({ ingredientId: ro.ingredientId, grams: ro.grams }))));
}

/** Day macro totals: every meal (recipe + edits + additions) plus the eat-alone round-out. */
export function dayTotals(day: PlanDay): MacroTotals {
	let t = { ...ZERO_MACROS };
	for (const m of day.meals) t = addMacros(t, mealMacros(m));
	t = addMacros(t, roundOutMacros(day));
	return roundMacros(t);
}

/** Day micro totals (the 9 tracked micros): every meal plus the round-out. */
export function dayMicros(day: PlanDay): MicroTotals {
	const t = zeroMicros();
	for (const m of day.meals) { const mm = mealMicros(m); for (const k of TRACKED_MICROS) t[k] += mm[k]; }
	for (const ro of day.roundOut ?? []) {
		const d = getIngredient(ro.ingredientId);
		if (!d) continue;
		const f = ro.grams / 100;
		const mic = d.micros_per100g as unknown as Record<string, number>;
		for (const k of TRACKED_MICROS) t[k] += (mic[k] ?? 0) * f;
	}
	for (const k of TRACKED_MICROS) t[k] = Math.round(t[k] * 10) / 10;
	return t;
}

/** Whole-week micro totals (sum of each day's micros). Drives the weekly nutrient flags. */
export function weekMicros(days: PlanDay[]): MicroTotals {
	const t = zeroMicros();
	for (const day of days) { const dm = dayMicros(day); for (const k of TRACKED_MICROS) t[k] += dm[k]; }
	for (const k of TRACKED_MICROS) t[k] = Math.round(t[k] * 10) / 10;
	return t;
}

export type CalorieState = 'low' | 'ok' | 'over';
/** Per-day calorie status vs the (household-aware) target: low when >10% under, over when >10% over. */
export function dayCalorieStatus(dayKcal: number, targetKcal: number): { state: CalorieState; deltaPct: number } {
	if (!targetKcal || targetKcal <= 0) return { state: 'ok', deltaPct: 0 };
	const delta = (dayKcal - targetKcal) / targetKcal;
	if (delta < -DAY_UNDER_PCT) return { state: 'low', deltaPct: delta };
	if (delta > DAY_OVER_PCT) return { state: 'over', deltaPct: delta };
	return { state: 'ok', deltaPct: delta };
}

/** Servings of a new dish that best match the original dish's calories, snapped to 0.5 and clamped [0.5,3]. */
export function kcalMatchedServings(origKcal: number, perServingKcal: number): number {
	if (!perServingKcal || perServingKcal <= 0) return 1;
	const raw = origKcal / perServingKcal;
	const snapped = Math.round(raw * 2) / 2;
	return Math.max(0.5, Math.min(3, snapped || 0.5));
}

/** Grams of a swapped ingredient that best match the original's calories, snapped to a neat step. */
export function kcalMatchedGrams(origKcal: number, toKcalPer100: number, fallbackGrams: number): number {
	if (!toKcalPer100 || toKcalPer100 <= 0) return Math.round(fallbackGrams);
	const raw = (origKcal / toKcalPer100) * 100;
	const step = raw >= 200 ? 25 : raw >= 50 ? 10 : 5;
	return Math.max(step, Math.round(raw / step) * step);
}

// --- micro contribution breakdown (A1: "where does this micronutrient come from") -------------------
export interface MicroContribution { id: string; amount: number; } // id = ingredient id, or 'supplement'

/** Ranked per-ingredient (+ supplement) contribution to ONE micro on a day. Pure; mirrors dayMicros. */
export function microContributors(day: PlanDay, key: MicroKey): MicroContribution[] {
	const acc = new Map<string, number>();
	for (const meal of day.meals) {
		for (const { ingredientId, grams } of effectiveIngredients(meal)) {
			const d = getIngredient(ingredientId);
			if (!d) continue;
			const m = d.micros_per100g as unknown as Record<string, number>;
			const amt = (m[key] ?? 0) * grams / 100;
			if (amt > 0) acc.set(ingredientId, (acc.get(ingredientId) ?? 0) + amt);
		}
		for (const a of meal.additions ?? []) {
			if (a.kind === 'supplement' && a.micro === key) acc.set('supplement', (acc.get('supplement') ?? 0) + a.amount);
		}
	}
	return [...acc.entries()]
		.map(([id, amount]) => ({ id, amount: Math.round(amount * 10) / 10 }))
		.filter((x) => x.amount > 0)
		.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
}

/** Ranked per-ingredient (+ supplement) contribution to ONE micro across the whole week. Pure. */
export function weekMicroContributors(days: PlanDay[], key: MicroKey): MicroContribution[] {
	const acc = new Map<string, number>();
	for (const day of days) for (const c of microContributors(day, key)) acc.set(c.id, (acc.get(c.id) ?? 0) + c.amount);
	return [...acc.entries()]
		.map(([id, amount]) => ({ id, amount: Math.round(amount * 10) / 10 }))
		.filter((x) => x.amount > 0)
		.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
}
