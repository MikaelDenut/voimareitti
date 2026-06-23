// Per-ingredient swap options (planning section 12; Theme 4 family tier added).
// Ranking: Tier 1 curated substitutes -> Tier 2 same `family` (keeps "onion -> onion") ->
// Tier 3 same `role` within a macro tolerance (fallback). Pure + deterministic (stable ranking).
import { ingredients, getIngredient, type Ingredient } from './content/ingredients';
import { SWAP_TOLERANCE } from './nutrition/constants';

// `excludeIds` = ingredients already in the dish (don't suggest a duplicate). `avoidIds` = the profile's
// dislikedIngredientIds; a swap must never offer an avoided food (planning/43 A). Both are filtered out of
// every tier. The returned list is a STABLE ranked order, so a caller can cycle through it by index for a
// clean no-immediate-repeat swap (planning/43 E).
export function ingredientSwapOptions(id: string, excludeIds: string[] = [], avoidIds: string[] = []): Ingredient[] {
	const cur = getIngredient(id);
	if (!cur) return [];
	const exclude = new Set([id, ...excludeIds, ...avoidIds]);
	const seen = new Set<string>();
	const out: Ingredient[] = [];

	const dist = (i: Ingredient) =>
		Math.abs(i.per100g.energy_kcal - cur.per100g.energy_kcal) +
		Math.abs(i.per100g.protein_g - cur.per100g.protein_g) * 4;

	// Tier 1: curated substitutes that point at a real ingredient.
	for (const s of cur.substitutes ?? []) {
		if (!s.ingredientId || exclude.has(s.ingredientId) || seen.has(s.ingredientId)) continue;
		const ing = getIngredient(s.ingredientId);
		if (ing) { out.push(ing); seen.add(ing.id); }
	}

	// Tier 2: same family (an onion stays an onion). Ranked by macro distance then name. No calorie
	// gate here - same-family members are intrinsically sensible swaps even across a wider macro range.
	if (cur.family) {
		const famAlts = ingredients
			.filter((i) => i.family === cur.family && !exclude.has(i.id) && !seen.has(i.id))
			.sort((a, b) => dist(a) - dist(b) || a.id.localeCompare(b.id));
		for (const i of famAlts) { out.push(i); seen.add(i.id); }
	}

	// Tier 3 (fallback): same role, energy within tolerance, ranked by macro distance then name.
	const tol = SWAP_TOLERANCE[cur.role] ?? 0.4;
	const curK = cur.per100g.energy_kcal || 1;
	const roleAlts = ingredients
		.filter((i) =>
			i.role === cur.role && !exclude.has(i.id) && !seen.has(i.id) &&
			Math.abs(i.per100g.energy_kcal - cur.per100g.energy_kcal) <= curK * tol + 40
		)
		.sort((a, b) => dist(a) - dist(b) || a.id.localeCompare(b.id));
	for (const i of roleAlts) { out.push(i); seen.add(i.id); }

	return out;
}
