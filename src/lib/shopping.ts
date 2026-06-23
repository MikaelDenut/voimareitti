// Shopping-list rollup (planning section 13). Pure + deterministic: turns a WeekPlan into one line per
// canonical ingredient id, summed across the week (meals scaled by servings + eat-alone round-out),
// grouped by aisle, with shoppable quantities. No runes, no DOM - unit-testable. Different products
// (beef-mince vs pork-mince, red wine vs white wine) stay separate because the key is the ingredient id.

import type { WeekPlan } from './engine/meal-planner';
import { getIngredient, type Ingredient } from './content/ingredients';
import { effectiveIngredients } from './nutrition/day-totals';

export type Aisle =
	| 'produce' | 'meat-fish-protein' | 'dairy-eggs' | 'dry-goods-pantry'
	| 'frozen' | 'condiments' | 'other';

export const AISLE_ORDER: Aisle[] = [
	'produce', 'meat-fish-protein', 'dairy-eggs', 'dry-goods-pantry', 'frozen', 'condiments', 'other'
];

export interface ShopLine {
	ingredientId: string;     // canonical id == lineId for check-off
	grams: number;            // exact summed grams (preserved)
	aisle: Aisle;
	pantry: boolean;          // dimmed / grouped
	usedIn: number;           // how many distinct recipes used it (paper hides this)
}

export interface ShoppingList {
	lines: ShopLine[];
	byAisle: { aisle: Aisle; lines: ShopLine[] }[];
	planHash: string;
}

// Ingredients that are never put on a shopping line (always on hand / not bought).
const DROP_IDS = new Set(['water', 'tap-water', 'ice', 'ice-cubes']);

// Pantry staples: dimmed/grouped because most kitchens already have them.
const PANTRY_IDS = new Set([
	'salt', 'black-pepper', 'white-pepper', 'sugar', 'brown-sugar', 'olive-oil', 'vegetable-oil',
	'sunflower-oil', 'rapeseed-oil', 'plain-flour', 'wheat-flour', 'baking-powder', 'baking-soda',
	'vanilla-extract', 'honey', 'maple-syrup', 'cornflour', 'cornstarch'
]);

export function aisleOf(ing: Ingredient): Aisle {
	if (ing.id.includes('frozen')) return 'frozen';
	switch (ing.role) {
		case 'vegetable':
		case 'fruit':
			return 'produce';
		case 'protein':
		case 'legume':
			return 'meat-fish-protein';
		case 'dairy':
			return 'dairy-eggs';
		case 'carb':
			return 'dry-goods-pantry';
		case 'seasoning':
			return 'condiments';
		case 'liquid':
			return 'condiments';
		default:
			return 'other';
	}
}

export function isPantry(ing: Ingredient): boolean {
	return ing.role === 'seasoning' || PANTRY_IDS.has(ing.id);
}

/** Shoppable quantity: round exact grams UP to a sensible amount, switching to kg above 1 kg. */
export function shopUnit(_ing: Ingredient, grams: number): { value: number; unit: 'g' | 'kg' } {
	if (grams >= 1000) {
		return { value: Math.ceil(grams / 100) / 10, unit: 'kg' }; // up to nearest 0.1 kg
	}
	const step = grams >= 200 ? 50 : grams >= 50 ? 10 : 5;
	return { value: Math.max(step, Math.ceil(grams / step) * step), unit: 'g' };
}

const UNIT_LABEL: Record<string, Record<string, string>> = {
	g: { en: 'g', fi: 'g', hu: 'g', sv: 'g' },
	kg: { en: 'kg', fi: 'kg', hu: 'kg', sv: 'kg' }
};

/** Locale-aware quantity string (decimal comma for fi/hu/sv via Intl). */
export function formatQuantity(value: number, unit: 'g' | 'kg', locale: string): string {
	const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
	const u = (UNIT_LABEL[unit] && UNIT_LABEL[unit][locale]) || unit;
	return `${n} ${u}`;
}

// Follow a substitution chain (A->B->C) with a cycle guard, so a line can be re-swapped.
function resolveSub(id: string, subs: Record<string, string>): string {
	let cur = id;
	for (let i = 0; i < 6; i++) {
		const next = subs[cur];
		if (!next || next === cur) break;
		cur = next;
	}
	return cur;
}

/** True canonical-id aggregation. Two recipes using beef-mince produce ONE line. `substitutions` swaps an
 *  ingredient across the whole week (shopping-line swap). */
export function shoppingList(week: WeekPlan, opts: { substitutions?: Record<string, string> } = {}): ShoppingList {
	const subs = opts.substitutions ?? {};
	const grams = new Map<string, number>();
	const recipeSet = new Map<string, Set<string>>(); // ingredientId -> set of recipe ids

	for (const day of week.days) {
		for (const meal of day.meals) {
			// Effective list = recipe ingredients with per-ingredient swaps/removals applied + added foods,
			// already scaled to the meal's servings (planning/37).
			for (const eff of effectiveIngredients(meal)) {
				const id = resolveSub(eff.ingredientId, subs);
				grams.set(id, (grams.get(id) ?? 0) + eff.grams);
				if (meal.recipeId) {
					if (!recipeSet.has(id)) recipeSet.set(id, new Set());
					recipeSet.get(id)!.add(meal.recipeId);
				}
			}
		}
		for (const ro of day.roundOut) {
			const id = resolveSub(ro.ingredientId, subs);
			grams.set(id, (grams.get(id) ?? 0) + ro.grams);
		}
	}

	const lines: ShopLine[] = [];
	for (const [id, g] of grams) {
		if (DROP_IDS.has(id)) continue;
		const ing = getIngredient(id);
		if (!ing) continue;
		lines.push({
			ingredientId: id,
			grams: Math.round(g),
			aisle: aisleOf(ing),
			pantry: isPantry(ing),
			usedIn: recipeSet.get(id)?.size ?? 0
		});
	}
	// Deterministic order: aisle, then pantry last within aisle, then id.
	lines.sort((a, b) =>
		AISLE_ORDER.indexOf(a.aisle) - AISLE_ORDER.indexOf(b.aisle) ||
		Number(a.pantry) - Number(b.pantry) ||
		a.ingredientId.localeCompare(b.ingredientId)
	);

	const byAisle = AISLE_ORDER
		.map((aisle) => ({ aisle, lines: lines.filter((l) => l.aisle === aisle) }))
		.filter((g) => g.lines.length > 0);

	return { lines, byAisle, planHash: planHash(week) };
}

/** The plan's stable hash (used for the check-off localStorage key). */
export function planHash(week: WeekPlan): string {
	return week.meta.planHash;
}
