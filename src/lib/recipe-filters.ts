// Pure recipe filter + nutrient-flag logic (planning section 17). Shared by the recipe browse page, the
// detail page, and the tests so the rules never drift. No runes, no DOM - unit-testable in node.

import type { Recipe } from './content/recipes';
import type { DietaryFilter } from './profile-core';
import { getIngredient, type Ingredient, type Loc } from './content/ingredients';
import {
	HIGH_PROTEIN_G, HIGH_PROTEIN_PCT, HIGH_FIBRE_G, LOW_CAL_KCAL, LOW_CARB_G
} from './nutrition/constants';

export type NutrientChip = 'high-protein' | 'high-fibre' | 'low-cal' | 'low-carb';
export type GoalBucket = 'lose' | 'maintain' | 'gain';

// Raw recipe goal tags are messy (cut / maintain / bulk / gain / gain-muscle); fold them into 3 buckets.
export function goalBucketsOf(r: Recipe): GoalBucket[] {
	const out = new Set<GoalBucket>();
	for (const g of r.goal) {
		if (g === 'cut') out.add('lose');
		else if (g === 'maintain') out.add('maintain');
		else if (g === 'bulk' || g === 'gain' || g === 'gain-muscle') out.add('gain');
	}
	return [...out];
}

export function matchesGoal(r: Recipe, bucket: GoalBucket): boolean {
	return goalBucketsOf(r).includes(bucket);
}

// Theme 10: ONE shared localized label map for every recipe `course` value, so course names never fall
// back to raw English in fi/hu/sv. Used by the recipe browse + detail pages (consolidated from the old
// component-local maps). Tested for full coverage in recipes.test.ts.
export const COURSE_LABELS: Record<string, Loc> = {
	breakfast: { en: 'Breakfast', fi: 'Aamiainen', hu: 'Reggeli', sv: 'Frukost' },
	lunch: { en: 'Lunch', fi: 'Lounas', hu: 'Ebéd', sv: 'Lunch' },
	dinner: { en: 'Dinner', fi: 'Päivällinen', hu: 'Vacsora', sv: 'Middag' },
	snack: { en: 'Snack', fi: 'Välipala', hu: 'Nasi', sv: 'Mellanmål' },
	dessert: { en: 'Dessert', fi: 'Jälkiruoka', hu: 'Desszert', sv: 'Efterrätt' },
	soup: { en: 'Soup', fi: 'Keitto', hu: 'Leves', sv: 'Soppa' },
	salad: { en: 'Salad', fi: 'Salaatti', hu: 'Saláta', sv: 'Sallad' },
	drink: { en: 'Drink', fi: 'Juoma', hu: 'Ital', sv: 'Dryck' },
	bread: { en: 'Bread', fi: 'Leipä', hu: 'Kenyér', sv: 'Bröd' },
	stew: { en: 'Stew', fi: 'Pata', hu: 'Pörkölt', sv: 'Gryta' },
	side: { en: 'Side', fi: 'Lisuke', hu: 'Köret', sv: 'Tillbehör' },
	'side dish': { en: 'Side dish', fi: 'Lisuke', hu: 'Köret', sv: 'Tillbehör' },
	sauce: { en: 'Sauce', fi: 'Kastike', hu: 'Mártás', sv: 'Sås' },
	starter: { en: 'Starter', fi: 'Alkuruoka', hu: 'Előétel', sv: 'Förrätt' },
	'main course': { en: 'Main course', fi: 'Pääruoka', hu: 'Főétel', sv: 'Huvudrätt' },
	casserole: { en: 'Casserole', fi: 'Laatikkoruoka', hu: 'Rakott étel', sv: 'Gratäng' },
	'one-pot meal': { en: 'One-pot meal', fi: 'Yhden padan ateria', hu: 'Egyfazekas étel', sv: 'Enkelgrytsrätt' }
};

/** Localized course name; falls back to a capitalized raw value only for an unknown course. */
export function courseLabel(course: string, lang: 'en' | 'fi' | 'hu' | 'sv'): string {
	const l = COURSE_LABELS[course];
	return l ? l[lang] : course.charAt(0).toUpperCase() + course.slice(1);
}

export function matchesDiet(r: Recipe, f: DietaryFilter): boolean {
	const d = r.dietary;
	switch (f) {
		case 'vegetarian': return d.vegetarian;
		case 'vegan': return d.vegan;
		case 'noRedMeat': return !d.containsRedMeat;
		case 'noPork': return !d.containsPork;
		case 'noFish': return !d.containsFish;
		case 'glutenFree': return d.glutenFree;
		case 'lactoseFree': return d.lactoseFree;
		case 'dairyFree': return d.dairyFree;
		case 'nutFree': return d.nutFree;
		case 'soyFree': return d.soyFree;
		default: return true;
	}
}

// --- Theme 9: smart gluten-free / lactose-free (annotate, do not always drop) -----------------------
// Ingredients that are not GF but have a widely available drop-in gluten-free version: we keep the dish
// and annotate "(gluten free)" rather than excluding it. Keyed by the internal swap family + a few ids.
const GF_SWAP_FAMILIES = new Set(['pasta', 'bread', 'flour']);
const GF_SWAP_IDS = new Set(['soy-sauce']); // -> tamari
// Lactose: dairy with an everyday lactose-free version (milk / cream / yogurt drop-ins).
const LF_SWAP_FAMILIES = new Set(['milk', 'cream', 'yogurt']);

export function glutenSwappable(ing: Ingredient): boolean {
	if (ing.dietary.glutenFree) return false;
	return GF_SWAP_FAMILIES.has(ing.family ?? '') || GF_SWAP_IDS.has(ing.id);
}
export function lactoseSwappable(ing: Ingredient): boolean {
	if (ing.dietary.lactoseFree) return false;
	return LF_SWAP_FAMILIES.has(ing.family ?? '');
}

// A recipe is gluten-free-ABLE if it is already GF, or every non-GF ingredient has a GF drop-in (so we
// annotate instead of dropping). A battered/breaded dish with a non-swappable gluten source stays out.
export function glutenFreeable(r: Recipe): boolean {
	if (r.dietary.glutenFree) return true;
	return r.ingredients.every((ri) => {
		const ing = getIngredient(ri.ingredientId);
		return ing ? (ing.dietary.glutenFree || glutenSwappable(ing)) : false;
	});
}
export function lactoseFreeable(r: Recipe): boolean {
	if (r.dietary.lactoseFree) return true;
	return r.ingredients.every((ri) => {
		const ing = getIngredient(ri.ingredientId);
		return ing ? (ing.dietary.lactoseFree || lactoseSwappable(ing)) : false;
	});
}

const GF_NOTE: Loc = { en: 'gluten free', fi: 'gluteeniton', hu: 'gluténmentes', sv: 'glutenfri' };
const LF_NOTE: Loc = { en: 'lactose-free', fi: 'laktoositon', hu: 'laktózmentes', sv: 'laktosfri' };
/** Localized "(gluten free)" / "(lactose-free)" annotations to show for an ingredient under the active
 *  diet filters. Empty when none apply. Drives recipe detail + shopping list labels. */
export function dietAnnotations(ing: Ingredient, filters: DietaryFilter[]): Loc[] {
	const out: Loc[] = [];
	if (filters.includes('glutenFree') && glutenSwappable(ing)) out.push(GF_NOTE);
	if (filters.includes('lactoseFree') && lactoseSwappable(ing)) out.push(LF_NOTE);
	return out;
}

// Per-INGREDIENT eligibility for a profile (planning/43+). Any food the planner adds OUTSIDE a recipe (the
// eat-alone calorie round-out, the calcium/micro food top-ups) MUST pass this, so a top-up can never slip in
// a food that violates the user's diet, FODMAP level, or avoid list (e.g. no fish/pork/red-meat, gluten-free,
// lactose-free, dairy-free, nut-free, soy-free, vegan/vegetarian, or a disliked food). Mirrors matchesDiet at
// the ingredient level, plus FODMAP + avoid.
export function ingredientAllowed(
	ing: Ingredient,
	profile: { dietaryFilters: DietaryFilter[]; fodmap: 'off' | 'gentle' | 'strict'; dislikedIngredientIds: string[] }
): boolean {
	if (profile.dislikedIngredientIds.includes(ing.id)) return false;
	const d = ing.dietary;
	for (const f of profile.dietaryFilters) {
		switch (f) {
			case 'vegetarian': if (!d.vegetarian) return false; break;
			case 'vegan': if (!d.vegan) return false; break;
			case 'noRedMeat': if (d.containsRedMeat) return false; break;
			case 'noPork': if (d.containsPork) return false; break;
			case 'noFish': if (d.containsFish) return false; break;
			case 'glutenFree': if (!d.glutenFree) return false; break;
			case 'lactoseFree': if (!d.lactoseFree) return false; break;
			case 'dairyFree': if (!d.dairyFree) return false; break;
			case 'nutFree': if (!d.nutFree) return false; break;
			case 'soyFree': if (!d.soyFree) return false; break;
		}
	}
	if (profile.fodmap === 'gentle' && d.fodmap === 'high') return false;
	if (profile.fodmap === 'strict' && d.fodmap !== 'low') return false;
	return true;
}

export function matchesFodmap(r: Recipe, mode: 'off' | 'gentle' | 'strict'): boolean {
	if (mode === 'off') return true;
	if (mode === 'gentle') return r.dietary.fodmap !== 'high';
	return r.dietary.fodmap === 'low';
}

// Per-serving nutrient chips (planning section 5 thresholds).
export function nutrientFlags(r: Recipe): Record<NutrientChip, boolean> {
	const n = r.nutritionPerServing;
	const proteinPct = n.energy_kcal > 0 ? (n.protein_g * 4) / n.energy_kcal : 0;
	return {
		'high-protein': n.protein_g >= HIGH_PROTEIN_G || proteinPct >= HIGH_PROTEIN_PCT,
		'high-fibre': n.fiber_g >= HIGH_FIBRE_G,
		'low-cal': n.energy_kcal <= LOW_CAL_KCAL,
		'low-carb': n.carbohydrates_g <= LOW_CARB_G
	};
}

export function matchesNutrient(r: Recipe, chip: NutrientChip): boolean {
	return nutrientFlags(r)[chip];
}

// Alcohol detection by ingredient id token (recipes have no explicit alcohol flag).
const ALCOHOL_TOKENS = [
	'wine', 'beer', 'rum', 'vodka', 'whisky', 'whiskey', 'brandy', 'liqueur', 'sherry', 'cognac',
	'vermouth', 'sake', 'gin', 'bourbon', 'cider', 'prosecco', 'champagne', 'marsala', 'kahlua', 'amaretto'
];
export function isAlcoholFree(r: Recipe): boolean {
	return !r.ingredients.some((ing) =>
		ALCOHOL_TOKENS.some((tok) => ing.ingredientId.includes(tok))
	);
}

// bulk goal + low-cal filter is contradictory; the UI surfaces a gentle hint.
export function isContradiction(goal: GoalBucket | 'all', nutrients: NutrientChip[]): boolean {
	return goal === 'gain' && (nutrients.includes('low-cal') || nutrients.includes('low-carb'));
}
