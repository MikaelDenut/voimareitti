// A2/A3: friendly household-unit display (eggs / spoons / pieces) layered on top of grams. Grams remain the
// source of truth for ALL nutrition + shopping math; this is display only. Pure, no DOM.
import { getIngredient, type Loc } from '../content/ingredients';
import { PIECE_GRAMS } from './piece-weights';

export interface HouseholdAmount { count: number; unit: string; }

// When an ingredient declares several household units, prefer a countable/visual one. Unknown units still
// work (shown with their raw token if not in UNIT_LABELS).
const WHOLE_FIRST = ['piece', 'slice', 'clove', 'can']; // friendliest; tried before spoons
const SPOONS = ['tbsp', 'tsp', 'cup'];
const WHOLE_UNITS = new Set(['piece', 'slice', 'clove', 'can']); // bought/used as whole items
// Above this a spoon count reads absurd (audit M1: "63 tbsp" of onion); fall back to pieces or grams instead.
const MAX_SPOONS = 12;

function roundCount(unit: string, raw: number): number {
	const step = unit === 'cup' ? 0.25 : 0.5;
	return Math.round(raw / step) * step;
}

/** Best household-unit amount for a gram quantity, or null when none is sensible (caller shows grams).
 *  Order: a declared WHOLE unit (piece/slice/clove/can) -> a countable PIECE_GRAMS piece -> a declared
 *  spoon/cup unit, but only when the spoon count stays sensible. This prefers "4.5 pc onion" over the old
 *  "63 tbsp onion" (audit M1): PIECE_GRAMS is now consulted BEFORE spoons, and spoon counts are capped. */
export function householdAmount(ingredientId: string, grams: number): HouseholdAmount | null {
	if (!(grams > 0)) return null;
	const units = getIngredient(ingredientId)?.householdUnits ?? [];
	// 1. A declared whole unit - always the friendliest ("2 eggs", "1 can").
	for (const u of WHOLE_FIRST) {
		const m = units.find((x) => x.unit === u);
		if (m && m.grams > 0) { const count = roundCount(u, grams / m.grams); if (count >= 0.5) return { count, unit: u }; }
	}
	// 2. A countable piece weight - prefer pieces over spoons for produce that has both (onion, carrot...).
	const pg = PIECE_GRAMS[ingredientId];
	if (pg && pg > 0) { const count = roundCount('piece', grams / pg); if (count >= 0.5) return { count, unit: 'piece' }; }
	// 3. A declared spoon/cup unit - fine for genuinely small amounts; an absurd count falls back to grams.
	for (const u of SPOONS) {
		const m = units.find((x) => x.unit === u);
		if (m && m.grams > 0) { const count = roundCount(u, grams / m.grams); return count >= 0.5 && count <= MAX_SPOONS ? { count, unit: u } : null; }
	}
	return null;
}

/** Shopping quantity: whole items rounded UP (you buy whole eggs); spoons/cups keep the .5/.25 amount. */
export function householdBuyAmount(ingredientId: string, grams: number): HouseholdAmount | null {
	const a = householdAmount(ingredientId, grams);
	if (!a) return null;
	return WHOLE_UNITS.has(a.unit) ? { count: Math.max(1, Math.ceil(a.count)), unit: a.unit } : a;
}

// Localized unit abbreviations (correct diacritics; the food name itself is shown alongside).
export const UNIT_LABELS: Record<string, Loc> = {
	piece: { en: 'pc', fi: 'kpl', hu: 'db', sv: 'st' },
	slice: { en: 'slice', fi: 'viipale', hu: 'szelet', sv: 'skiva' },
	clove: { en: 'clove', fi: 'kynsi', hu: 'gerezd', sv: 'klyfta' },
	can: { en: 'can', fi: 'tölkki', hu: 'doboz', sv: 'burk' },
	tbsp: { en: 'tbsp', fi: 'rkl', hu: 'ek', sv: 'msk' },
	tsp: { en: 'tsp', fi: 'tl', hu: 'tk', sv: 'tsk' },
	cup: { en: 'cup', fi: 'kuppi', hu: 'csésze', sv: 'kopp' }
};
