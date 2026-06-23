// Deterministic weekly meal planner (planning section 10). Pure + seeded: the same profile + seed +
// data always produces the same WeekPlan. No runes, no DOM. Tolerance precedence (never violated):
//   1. diet / allergen / alcohol-free / pregnancy / FODMAP safety filters  (NEVER relaxed)
//   2. calorie floor (never breached - inherited from estimateEnergy)
//   3. calorie target band
//   4. protein target
//   5. carb ceiling (softest)
// Soft NUTRIENT chips relax (widest impact first) before variety; safety filters never auto-relax.

import type { EnergyResult } from './engine';
import type { FullProfile, HouseholdMember, DietaryFilter, FodmapLevel } from '../profile-core';
import { recipes as ALL_RECIPES, type Recipe } from '../content/recipes';
import { ingredients as ALL_INGREDIENTS, getIngredient, type Ingredient } from '../content/ingredients';
import {
	matchesDiet, matchesFodmap, matchesNutrient, isAlcoholFree, glutenFreeable, lactoseFreeable,
	ingredientAllowed, type NutrientChip
} from '../recipe-filters';
import {
	KCAL_TOLERANCE, PROTEIN_BAND, PROTEIN_SHAKE_CAP_PER_DAY, MEAL_SLOT_KEYS,
	SUBSTITUTE_PROTEIN_WEIGHT_OMNIVORE, SUBSTITUTE_PROTEIN_TOKENS,
	PROTEIN_VARIETY_CAP_PER_WEEK, PROTEIN_THROTTLE_WEIGHT,
	PROTEIN_SNACK_MIN_G, PROTEIN_SNACK_MAX_KCAL
} from '../nutrition/constants';
import { PIECE_GRAMS } from '../nutrition/piece-weights';

// --- output types -----------------------------------------------------------

// User edits layered on top of the deterministic plan (planning/37). All optional, so plans generated
// before this feature stay valid (absent == no edit). planWeek never produces them; the UI adds them.
export type AddedFood =
	| { kind: 'ingredient'; ingredientId: string; grams: number; pieces?: number }
	| { kind: 'recipe'; recipeId: string; servings: number }
	// A supplement provides one micronutrient (no kcal/macros); micro is a tracked MicroKey, amount in its
	// unit (mg/ug). Delete-only in the UI (never swapped).
	| { kind: 'supplement'; micro: string; amount: number };

export interface IngredientEdit {
	originalId: string;   // the recipe ingredient being edited
	swapToId?: string;    // present = swapped to this ingredient (with kcal-matched grams)
	grams?: number;       // overridden per-base-serving grams (for a swap)
	removed?: boolean;    // present = deleted from this dish
}

export interface PlanMeal {
	slotKey: string;
	recipeId: string | null; // null = a zero-option placeholder slot
	servings: number;
	kcal: number; protein: number; carbs: number; fat: number; fiber: number;
	ingredientEdits?: IngredientEdit[]; // per-ingredient swap/delete on the recipe
	additions?: AddedFood[];            // extra foods added to this meal
}
export interface RoundOut { ingredientId: string; grams: number; }
export interface PlanDay {
	day: number; // 1..7 (Mon..Sun)
	meals: PlanMeal[];
	roundOut: RoundOut[];
	totals: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
}
export interface PlanWarning { code: string; detail?: string; }
export interface WeekPlan {
	days: PlanDay[];
	meta: {
		seed: number;
		targetKcal: number;
		proteinBand: [number, number];
		carbCeilingG: number | null;
		activeFilters: { diet: DietaryFilter[]; fodmap: FodmapLevel; alcoholFree: boolean };
		relaxedNutrients: NutrientChip[];
		householdScale: number;
		planHash: string;
	};
	warnings: PlanWarning[];
}
export interface PlanOptions {
	profile: FullProfile;
	energy: EnergyResult;
	mealsPerDay?: number;
	nutrientFilters?: NutrientChip[];
	seed?: number;
	household?: HouseholdMember[];
}

// --- deterministic helpers --------------------------------------------------

function hashStr(s: string): number {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
	return h >>> 0;
}
function mulberry32(seed: number) {
	let a = seed >>> 0;
	return function () {
		a |= 0; a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// --- pregnancy hard exclusions (planning section 10 step 2) -----------------
const PREGNANCY_UNSAFE_TOKENS = [
	'swordfish', 'shark', 'marlin', 'king-mackerel', 'bigeye', 'liver', 'pate', 'pâté',
	'raw-egg', 'tartare', 'carpaccio', 'sushi', 'unpasteur', 'raw-milk', 'blue-cheese', 'brie',
	'camembert', 'roquefort', 'gorgonzola'
];
function pregnancySafe(r: Recipe): boolean {
	if (!r.ingredients.some((ing) => PREGNANCY_UNSAFE_TOKENS.some((t) => ing.ingredientId.includes(t)))) {
		return isAlcoholFree(r); // alcohol is also excluded in pregnancy
	}
	return false;
}

// --- meal-slot templates ----------------------------------------------------
type SlotGroup = 'breakfast' | 'lunch' | 'dinner' | 'snack';
interface Slot { key: string; group: SlotGroup; weight: number; }

// Theme 8: slot -> mealtime policy (single source). A slot is filled from recipes whose `mealtimes`
// tag includes the slot's own mealtime (breakfast/lunch/dinner/snack). If the nutrient-relaxed pool has
// none, relax to a SENSIBLE family of mealtimes (NOT "any recipe"); if still none, the slot renders the
// zero-option placeholder rather than serve something inappropriate (no dinner steak at breakfast).
const MEALTIME_FALLBACK: Record<SlotGroup, SlotGroup[]> = {
	breakfast: ['snack'], // a light snack/drink can stand in for breakfast
	lunch: ['dinner'],
	dinner: ['lunch', 'snack'], // a lunch main, then a light snack
	snack: [] // no relaxation; placeholder if truly none
};

function slotsFor(n: number): Slot[] {
	const K = MEAL_SLOT_KEYS;
	const table: Record<number, Slot[]> = {
		1: [{ key: K[3], group: 'lunch', weight: 1 }],
		2: [{ key: K[0], group: 'breakfast', weight: 0.45 }, { key: K[5], group: 'dinner', weight: 0.55 }],
		3: [{ key: K[0], group: 'breakfast', weight: 0.3 }, { key: K[3], group: 'lunch', weight: 0.35 }, { key: K[5], group: 'dinner', weight: 0.35 }],
		4: [{ key: K[0], group: 'breakfast', weight: 0.28 }, { key: K[3], group: 'lunch', weight: 0.3 }, { key: K[4], group: 'snack', weight: 0.12 }, { key: K[5], group: 'dinner', weight: 0.3 }],
		5: [{ key: K[0], group: 'breakfast', weight: 0.25 }, { key: K[1], group: 'snack', weight: 0.1 }, { key: K[3], group: 'lunch', weight: 0.3 }, { key: K[4], group: 'snack', weight: 0.1 }, { key: K[5], group: 'dinner', weight: 0.25 }],
		6: [{ key: K[0], group: 'breakfast', weight: 0.22 }, { key: K[1], group: 'snack', weight: 0.1 }, { key: K[3], group: 'lunch', weight: 0.28 }, { key: K[4], group: 'snack', weight: 0.1 }, { key: K[5], group: 'dinner', weight: 0.24 }, { key: K[6], group: 'snack', weight: 0.06 }],
		7: [{ key: K[0], group: 'breakfast', weight: 0.2 }, { key: K[1], group: 'snack', weight: 0.08 }, { key: K[2], group: 'snack', weight: 0.06 }, { key: K[3], group: 'lunch', weight: 0.26 }, { key: K[4], group: 'snack', weight: 0.1 }, { key: K[5], group: 'dinner', weight: 0.24 }, { key: K[6], group: 'snack', weight: 0.06 }],
		8: [{ key: K[0], group: 'breakfast', weight: 0.19 }, { key: K[1], group: 'snack', weight: 0.08 }, { key: K[2], group: 'snack', weight: 0.05 }, { key: K[3], group: 'lunch', weight: 0.24 }, { key: K[4], group: 'snack', weight: 0.09 }, { key: K[5], group: 'dinner', weight: 0.23 }, { key: K[6], group: 'snack', weight: 0.06 }, { key: K[7], group: 'snack', weight: 0.06 }]
	};
	const clamped = Math.min(8, Math.max(1, Math.round(n)));
	return table[clamped];
}

// --- protein shake detection (cap) ------------------------------------------
function isProteinShake(r: Recipe): boolean {
	return r.course.includes('drink') && r.nutritionPerServing.protein_g >= 15;
}

// --- household energy --------------------------------------------------------
function childKcal(age: number): number {
	if (age <= 3) return 1000;
	if (age <= 6) return 1400;
	if (age <= 10) return 1800;
	if (age <= 13) return 2100;
	return 2500; // 14-17
}
export function memberKcal(m: HouseholdMember): number {
	if (m.age < 18) return childKcal(m.age);
	const base = m.sex === 'male' ? 2500 : m.sex === 'female' ? 2000 : 2250;
	const af = m.activity === 'high' ? 1.15 : m.activity === 'low' ? 0.95 : 1.0;
	return Math.round(base * af);
}

// --- main -------------------------------------------------------------------

const DAY_COUNT = 7;
const VARIETY_WINDOW = 3;

/**
 * The recipes a profile may eat: hard safety filters that NEVER relax (diet, alcohol-free, FODMAP,
 * pregnancy exclusions, disliked recipes/ingredients). Shared with the UI for swap candidates.
 */
export function eligibleRecipes(profile: FullProfile): Recipe[] {
	const dislikedRecipes = new Set(profile.dislikedRecipeIds ?? []);
	const dislikedIngredients = new Set(profile.dislikedIngredientIds ?? []);
	return ALL_RECIPES.filter((r) => {
		// Component / sub-recipes (e.g. bechamel) are building blocks shown as ingredient popups, never a meal.
		if (r.component) return false;
		if (dislikedRecipes.has(r.id)) return false;
		if (r.ingredients.some((ing) => dislikedIngredients.has(ing.ingredientId))) return false;
		// Theme 9: gluten-free / lactose-free are SOFT - keep a dish whose only offending ingredients have
		// a drop-in version (we annotate it downstream) instead of dropping it. Other diet filters stay hard.
		for (const f of profile.dietaryFilters) {
			if (f === 'glutenFree') { if (!glutenFreeable(r)) return false; }
			else if (f === 'lactoseFree') { if (!lactoseFreeable(r)) return false; }
			else if (!matchesDiet(r, f)) return false;
		}
		if (profile.alcoholFree && !isAlcoholFree(r)) return false;
		if (!matchesFodmap(r, profile.fodmap)) return false;
		if ((profile.pregnant || profile.postpartum) && !pregnancySafe(r)) return false;
		return true;
	});
}

// --- default-omnivore + variety helpers (planning/43 audit) -----------------
// Recipes whose protein leans on a vegan substitute (tofu/tempeh/seitan/edamame) AND that are
// vegetarian/vegan (so a meat dish with a dab of something is never caught). Down-weighted for omnivores.
export const SUBSTITUTE_RECIPE_IDS: Set<string> = new Set(
	ALL_RECIPES.filter((r) =>
		(r.dietary.vegetarian || r.dietary.vegan) &&
		r.ingredients.some((ing) => SUBSTITUTE_PROTEIN_TOKENS.some((t) => ing.ingredientId.includes(t)))
	).map((r) => r.id)
);

// The protein-role ingredient contributing the most protein to each recipe (grams x protein/100 g). Used
// by the dominant-ingredient throttle so one protein (salmon, chicken-breast, tofu...) cannot dominate a
// week. Precomputed once; deterministic. Legume/plant sides (beans, lentils) are not protein-role, so they
// are never throttled (they are encouraged as omnivore sides).
const PRIMARY_PROTEIN: Map<string, string> = (() => {
	const m = new Map<string, string>();
	for (const r of ALL_RECIPES) {
		let bestId = '', best = 0;
		for (const ing of r.ingredients) {
			const d = getIngredient(ing.ingredientId);
			if (!d || d.role !== 'protein') continue;
			const contrib = (Number(ing.grams) || 0) * (d.per100g.protein_g || 0);
			if (contrib > best) { best = contrib; bestId = ing.ingredientId; }
		}
		if (bestId) m.set(r.id, bestId);
	}
	return m;
})();

/** Omnivore = no vegetarian/vegan filter and no explicit plant-protein opt-in. */
export function isOmnivoreProfile(p: FullProfile): boolean {
	if (p.includePlantProteins) return false;
	return !p.dietaryFilters.includes('vegetarian') && !p.dietaryFilters.includes('vegan');
}

/** Seeded weighted pick. weightOf <= 0 candidates are effectively skipped; if all are 0, falls back to a
 *  uniform pick so a slot is always filled (variety/throttle never leave an empty slot). */
function pickWeighted(cands: Recipe[], rng: () => number, weightOf: (r: Recipe) => number): Recipe {
	let total = 0;
	const w = cands.map((r) => { const x = Math.max(0, weightOf(r)); total += x; return x; });
	if (total <= 0) return cands[Math.floor(rng() * cands.length) % cands.length];
	let x = rng() * total;
	for (let i = 0; i < cands.length; i++) { x -= w[i]; if (x <= 0) return cands[i]; }
	return cands[cands.length - 1];
}

const proteinDensity = (r: Recipe) => r.nutritionPerServing.protein_g / (r.nutritionPerServing.energy_kcal || 1);

// Eat-alone round-out ranking (planning/56 HH6). The old sort was potassium-only, so the fill always picked
// the same potassium-dense items (raisins/prunes/dates/avocado) every day. This composite rewards a SPREAD
// across the micros a fruit/veg can realistically provide (each normalized by a round adult reference), so the
// top of the list is broadly nutrient-dense, not potassium-myopic. Deterministic; calcium/zinc/B12 are left to
// the supplements (a fruit bowl cannot fix them). Higher score = better round-out.
function eatAloneMicroScore(i: Ingredient): number {
	const m = i.micros_per100g;
	return (m.potassium_mg / 4700) + (m.magnesium_mg / 400) + (m.folate_ug / 400) +
		(m.vitamin_c_mg / 90) + (m.iron_mg / 15) + (m.calcium_mg / 1000) + (i.per100g.fiber_g / 30);
}
const sortEatAlone = (pool: Ingredient[]): Ingredient[] =>
	[...pool].sort((a, b) => (eatAloneMicroScore(b) - eatAloneMicroScore(a)) || a.id.localeCompare(b.id));
// Top window the daily fill rotates through, so the week varies the round-out instead of repeating the same
// four items. Window stays small + high-quality (all near the top of the micro-spread sort).
const EAT_ALONE_WINDOW = 8;

export function planWeek(opts: PlanOptions): WeekPlan {
	const { profile, energy } = opts;
	const mealsPerDay = Math.min(8, Math.max(1, Math.round(opts.mealsPerDay ?? profile.mealsPerDay ?? 3)));
	const baseSeed = (opts.seed ?? (profile.profileSeed * 31 + profile.planSeedOffset)) >>> 0;
	const household = opts.household ?? profile.household ?? [];

	// Household-aggregate target (single menu scaled to feed everyone).
	const householdExtra = household.reduce((s, m) => s + memberKcal(m), 0);
	const targetKcal = energy.target + householdExtra;
	const householdScale = energy.target > 0 ? targetKcal / energy.target : 1;
	// Household-aware serving cap (planning/56 HH3): a shared menu may scale a dish up to N servings per
	// adult-equivalent, so the single menu reaches the household target instead of plateauing at the solo cap.
	// Solo (sCap === 1) keeps every literal cap below byte-identical. Per-person servings (total / scale) stay realistic.
	const sCap = Math.max(1, householdScale);

	const warnings: PlanWarning[] = [];

	// --- HARD pool: safety filters that NEVER relax -------------------------
	const hardPool = eligibleRecipes(profile);

	// --- SOFT nutrient filters with relaxation ------------------------------
	const requested = opts.nutrientFilters ?? [];
	let activeNutrients = [...requested];
	const relaxedNutrients: NutrientChip[] = [];
	const minPool = Math.max(mealsPerDay * 2, 8);
	function applyNutrients(list: NutrientChip[]): Recipe[] {
		return hardPool.filter((r) => list.every((c) => matchesNutrient(r, c)));
	}
	let pool = applyNutrients(activeNutrients);
	while (pool.length < minPool && activeNutrients.length > 0) {
		// widest-impact first: drop the filter whose removal grows the pool most.
		let best = activeNutrients[0], bestGain = -1;
		for (const c of activeNutrients) {
			const without = activeNutrients.filter((x) => x !== c);
			const gain = applyNutrients(without).length;
			if (gain > bestGain) { bestGain = gain; best = c; }
		}
		activeNutrients = activeNutrients.filter((x) => x !== best);
		relaxedNutrients.push(best);
		pool = applyNutrients(activeNutrients);
	}
	if (relaxedNutrients.length) warnings.push({ code: 'relaxed-nutrients', detail: relaxedNutrients.join(',') });

	// Candidate pools per slot group (stable order by id).
	const byGroup: Record<SlotGroup, Recipe[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
	const sortedPool = [...pool].sort((a, b) => a.id.localeCompare(b.id));
	const mealtimePool = (mt: SlotGroup) => sortedPool.filter((r) => r.mealtimes.includes(mt));
	const omnivore = isOmnivoreProfile(profile);
	for (const g of Object.keys(byGroup) as SlotGroup[]) {
		let list = mealtimePool(g); // primary: recipes appropriate for this slot
		if (list.length === 0) {
			// sensible-family fallback only (never "any recipe"); empty stays empty -> placeholder
			for (const alt of MEALTIME_FALLBACK[g]) {
				list = mealtimePool(alt);
				if (list.length) break;
			}
		}
		// Omnivore default: HARD-exclude vegan substitute-protein dishes (tofu/tempeh/seitan/edamame), matching
		// batchPlanWeek. The soft down-weight (pickWeighted below) was NOT enough - substitutes still surfaced
		// in precise mode (audit H1, 2026-06-20). Keep them for vegetarian/vegan + the includePlantProteins
		// opt-in (isOmnivoreProfile=false). Fallback keeps the slot non-empty if exclusion would empty it.
		if (omnivore) { const ns = list.filter((r) => !SUBSTITUTE_RECIPE_IDS.has(r.id)); if (ns.length) list = ns; }
		byGroup[g] = list;
	}

	const slots = slotsFor(mealsPerDay);
	const slotGroup = new Map<string, SlotGroup>(slots.map((s) => [s.key, s.group]));
	// Iron-from-food preference: bias slot selection toward iron-rich recipes so the week reaches iron without
	// a pill (micro-topup then leaves the iron supplement out). Opt-in (female profiles); off by default.
	const ironBias = profile.preferIronFromFood === true;
	// Per-week primary-protein usage for the dominant-ingredient throttle.
	const proteinUsed: Record<string, number> = {};

	// Eat-alone foods used to round out a day that falls short of the target, potassium-first then fibre
	// then vitamin C (planning step 14). They are added as normal single-ingredient items on the day's main
	// meal slot (planning/37), so they show as ordinary editable lines, not an afterthought. They must pass the
	// FULL ingredient eligibility (diet filters + FODMAP + avoid) - the round-out can never add a food the user
	// excluded (planning/43+: e.g. no high-FODMAP fruit on a strict-FODMAP plan, no avoided food).
	const eatAlone = sortEatAlone(ALL_INGREDIENTS
		.filter((i) => i.eatAlone && (i.role === 'fruit' || i.role === 'vegetable') && ingredientAllowed(i, profile)));

	const recent: string[] = []; // recipe ids used in the last VARIETY_WINDOW days
	const days: PlanDay[] = [];
	let anyEmptySlot = false;
	let proteinShortDays = 0;
	let kcalOffDays = 0;

	for (let d = 0; d < DAY_COUNT; d++) {
		const rng = mulberry32((baseSeed ^ Math.imul(d + 1, 0x9e3779b1)) >>> 0);
		const isTraining = d < profile.days; // first N days are training days
		const meals: PlanMeal[] = [];
		const usedToday = new Set<string>();
		let shakesToday = 0;

		for (const slot of slots) {
			let cands = byGroup[slot.group];
			// Variety: prefer recipes not used in the last window or today.
			let varied = cands.filter((r) => !recent.includes(r.id) && !usedToday.has(r.id));
			if (varied.length === 0) varied = cands.filter((r) => !usedToday.has(r.id));
			if (varied.length === 0) varied = cands;
			// Protein-shake cap.
			if (shakesToday >= PROTEIN_SHAKE_CAP_PER_DAY) {
				const noShake = varied.filter((r) => !isProteinShake(r));
				if (noShake.length) varied = noShake;
			}

			if (varied.length === 0) {
				meals.push({ slotKey: slot.key, recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
				anyEmptySlot = true;
				continue;
			}

			// Weighted pick: down-weight vegan substitute proteins for omnivores (default-omnivore rule) and
			// throttle any primary protein that already hit its weekly cap (dominant-ingredient variety). Both
			// are soft weights, never hard exclusions - a slot always fills (planning/43 F + variety).
			const pick = pickWeighted(varied, rng, (r) => {
				let w = 1;
				if (omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id)) w *= SUBSTITUTE_PROTEIN_WEIGHT_OMNIVORE;
				const pp = PRIMARY_PROTEIN.get(r.id);
				if (pp && (proteinUsed[pp] ?? 0) >= PROTEIN_VARIETY_CAP_PER_WEEK) w *= PROTEIN_THROTTLE_WEIGHT;
				// Iron-rich nudge (opt-in): a 6 mg/serving recipe ~2x, 12 mg ~3x (capped). Soft, keeps variety.
				if (ironBias) w *= 1 + Math.min(2, (r.microsPerServing?.iron_mg || 0) / 6);
				return w;
			});
			if (isProteinShake(pick)) shakesToday++;
			usedToday.add(pick.id);
			{ const pp = PRIMARY_PROTEIN.get(pick.id); if (pp) proteinUsed[pp] = (proteinUsed[pp] ?? 0) + 1; }

			// Scale servings toward this slot's kcal share. Training-aware: post-workout (the dinner slot
			// on a training day) gets a small carb/protein-favouring bump.
			const slotKcal = targetKcal * slot.weight * (isTraining && slot.group === 'dinner' ? 1.05 : 1);
			const perKcal = pick.nutritionPerServing.energy_kcal || 1;
			let servings = slotKcal / perKcal;
			servings = Math.max(0.5, Math.min(3 * sCap, Math.round(servings * 2) / 2));
			const n = pick.nutritionPerServing;
			meals.push({
				slotKey: slot.key,
				recipeId: pick.id,
				servings,
				kcal: n.energy_kcal * servings,
				protein: n.protein_g * servings,
				carbs: n.carbohydrates_g * servings,
				fat: n.fat_g * servings,
				fiber: n.fiber_g * servings
			});
		}

		// Day totals.
		const totals = meals.reduce(
			(t, m) => ({ kcal: t.kcal + m.kcal, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat, fiber: t.fiber + m.fiber }),
			{ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
		);

		// Calorie TRIM (planning/43+: reported overshoot on a fat-loss goal). The per-slot serving rounding
		// (0.5 steps) can land a calorie-dense dish ABOVE its slot share, and the levers below only ever ADD -
		// so a day could be stranded over target with nothing to pull it back. Here, while the day is over the
		// band, reduce one slot meal by 0.5 servings, each step choosing the reduction that lands the DAY total
		// CLOSEST to target (never below 0.5/serving, and only if it improves the fit). This leans a dense day
		// back onto target instead of overshooting; a fat-loss day no longer ends up high.
		{
			const dist = (k: number) => Math.abs(k - targetKcal);
			let trimGuard = 0;
			while (totals.kcal > targetKcal * (1 + KCAL_TOLERANCE) && trimGuard++ < 40) {
				let bestIdx = -1, bestDist = dist(totals.kcal);
				for (let mi = 0; mi < meals.length; mi++) {
					const m = meals[mi];
					if (!m.recipeId || m.servings <= 0.5) continue;
					const rr = ALL_RECIPES.find((x) => x.id === m.recipeId);
					if (!rr) continue;
					const after = totals.kcal - rr.nutritionPerServing.energy_kcal * 0.5;
					if (dist(after) < bestDist) { bestDist = dist(after); bestIdx = mi; }
				}
				if (bestIdx < 0) break;
				const m = meals[bestIdx];
				const n = ALL_RECIPES.find((x) => x.id === m.recipeId)!.nutritionPerServing;
				m.servings -= 0.5;
				m.kcal -= n.energy_kcal * 0.5; m.protein -= n.protein_g * 0.5; m.carbs -= n.carbohydrates_g * 0.5; m.fat -= n.fat_g * 0.5; m.fiber -= n.fiber_g * 0.5;
				totals.kcal -= n.energy_kcal * 0.5; totals.protein -= n.protein_g * 0.5; totals.carbs -= n.carbohydrates_g * 0.5; totals.fat -= n.fat_g * 0.5; totals.fiber -= n.fiber_g * 0.5;
			}
		}

		// Round-out: if the planned meals fall short of the target, add eat-alone single foods as NORMAL
		// editable items attached to the day's main meal slot (e.g. Lunch), instead of a static afterthought
		// line (planning/37). They count toward the day totals here so the stored totals stay correct.
		let mainIdx = -1, bestKcal = -1;
		for (let mi = 0; mi < meals.length; mi++) { const m = meals[mi]; if (m.recipeId && m.kcal > bestKcal) { bestKcal = m.kcal; mainIdx = mi; } }
		const mainSlotKey = meals[mainIdx]?.slotKey || slots[0]?.key || 'meal_lunch';

		// Lever 1: raise the day's MAIN dish servings (0.5 steps, cap 4) to close most of the gap - cheaper
		// and more natural than piling on extra fruit ("4 servings of the tabbouleh, not 3 + a pile"). Never
		// push the day above ~target.
		if (mainIdx >= 0) {
			const m = meals[mainIdx];
			const rr = m.recipeId ? ALL_RECIPES.find((r) => r.id === m.recipeId) : null;
			if (rr) {
				const n = rr.nutritionPerServing;
				while (m.servings < 4 * sCap && totals.kcal < targetKcal * 0.97 && totals.kcal + n.energy_kcal * 0.5 <= targetKcal * 1.05) {
					m.servings += 0.5;
					m.kcal += n.energy_kcal * 0.5; m.protein += n.protein_g * 0.5; m.carbs += n.carbohydrates_g * 0.5; m.fat += n.fat_g * 0.5; m.fiber += n.fiber_g * 0.5;
					totals.kcal += n.energy_kcal * 0.5; totals.protein += n.protein_g * 0.5; totals.carbs += n.carbohydrates_g * 0.5; totals.fat += n.fat_g * 0.5; totals.fiber += n.fiber_g * 0.5;
				}
			}
		}
		// Lever 1.5 - PROTEIN SNACK (high-protein/low-cal request): if the day is still protein-short, add a
		// high-protein, low-calorie snack (>=PROTEIN_SNACK_MIN_G protein, <=PROTEIN_SNACK_MAX_KCAL) BEFORE filling
		// calories with fruit/veg, so a low-calorie day can still reach its protein band. One serving, kept inside
		// the kcal band, drawn from the safety-filtered pool (respects diet + avoid), honouring the omnivore
		// down-weight and within-week variety. This is the lever that makes the high-protein + low-cal combo land.
		let snacksAdded = 0;
		while (totals.protein < energy.proteinBand[0] && snacksAdded < 3) {
			const fits = (r: Recipe) =>
				r.mealtimes.includes('snack') &&
				r.nutritionPerServing.protein_g >= PROTEIN_SNACK_MIN_G &&
				r.nutritionPerServing.energy_kcal <= PROTEIN_SNACK_MAX_KCAL &&
				!usedToday.has(r.id) &&
				!(omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id)) &&
				totals.kcal + r.nutritionPerServing.energy_kcal <= targetKcal * (1 + KCAL_TOLERANCE);
			const all = hardPool.filter(fits);
			if (!all.length) break;
			const fresh = all.filter((r) => !recent.includes(r.id));
			const pickFrom = (fresh.length ? fresh : all)
				.sort((a, b) => b.nutritionPerServing.protein_g - a.nutritionPerServing.protein_g || a.id.localeCompare(b.id));
			const snack = pickFrom[0];
			const sn = snack.nutritionPerServing;
			meals.push({
				slotKey: mainSlotKey, recipeId: null, servings: 0,
				kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
				additions: [{ kind: 'recipe', recipeId: snack.id, servings: 1 }]
			});
			totals.kcal += sn.energy_kcal; totals.protein += sn.protein_g; totals.carbs += sn.carbohydrates_g; totals.fat += sn.fat_g; totals.fiber += sn.fiber_g;
			usedToday.add(snack.id);
			recent.push(snack.id); // rotate snacks across days too, not just within a day
			{ const pp = PRIMARY_PROTEIN.get(snack.id); if (pp) proteinUsed[pp] = (proteinUsed[pp] ?? 0) + 1; }
			snacksAdded++;
		}

		// Lever 2: add foods in SENSIBLE portions: whole/half pieces where the food has a natural unit (1 or 1.5
		// apples), else a normal handful in grams - never an odd sliver like 20 g of a spice or raw meat
		// (the eat-alone pool is already only stand-alone fruit/veg). Stop once the day is within ~4%.
		let added = 0;
		const fillWin = Math.min(eatAlone.length, EAT_ALONE_WINDOW) || 1;
		for (let j = 0; j < fillWin && added < 4; j++) {
			const gap = targetKcal - totals.kcal;
			if (gap < targetKcal * 0.04) break;
			const food = eatAlone[(j + d) % fillWin]; // rotate the top micro-spread window by day (planning/56 HH6)
			const per100 = food.per100g.energy_kcal || 1;
			const pieceG = PIECE_GRAMS[food.id];
			let grams: number;
			let pieces: number | undefined;
			if (pieceG) {
				const kcalPerPiece = (per100 * pieceG) / 100 || 1;
				pieces = Math.max(0.5, Math.min(3 * sCap, Math.round((gap / kcalPerPiece) * 2) / 2));
				grams = Math.round(pieces * pieceG);
			} else {
				grams = Math.max(50, Math.min(200 * sCap, Math.round(((gap / per100) * 100) / 10) * 10));
			}
			const f = grams / 100;
			meals.push({
				slotKey: mainSlotKey, recipeId: null, servings: 0,
				kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
				additions: [{ kind: 'ingredient', ingredientId: food.id, grams, ...(pieces ? { pieces } : {}) }]
			});
			totals.kcal += food.per100g.energy_kcal * f;
			totals.protein += food.per100g.protein_g * f;
			totals.carbs += food.per100g.carbohydrates_g * f;
			totals.fat += food.per100g.fat_g * f;
			totals.fiber += food.per100g.fiber_g * f;
			added++;
		}
		const roundOut: RoundOut[] = []; // kept empty for WeekPlan shape stability (round-out is now real items)

		// Protein repair (planning/43 G): if the day is protein-short, swap the lowest-protein-density slot
		// meal for a higher-protein-density same-mealtime recipe at MATCHED kcal - this lifts protein while
		// keeping the day inside the kcal band. Soft + bounded; respects the same eligible/throttled pool and
		// the no-same-day-repeat rule. If no improving swap exists, the day stays as-is and the warning fires.
		const proteinFloor = energy.proteinBand[0];
		let pGuard = 0;
		while (totals.protein < proteinFloor && pGuard++ < 16) {
			let best: { mi: number; cand: Recipe; servings: number; dProtein: number } | null = null;
			for (let mi = 0; mi < meals.length; mi++) {
				const m = meals[mi];
				if (!m.recipeId) continue;
				const group = slotGroup.get(m.slotKey);
				if (!group) continue;
				const cur = ALL_RECIPES.find((r) => r.id === m.recipeId);
				if (!cur) continue;
				const curDen = proteinDensity(cur);
				for (const cand of byGroup[group]) {
					if (cand.id === m.recipeId || usedToday.has(cand.id)) continue;
					// Keep the default-omnivore rule during repair: never lift protein by swapping in a vegan
					// substitute-protein dish for an omnivore (that would re-introduce tofu through the back door).
					if (omnivore && SUBSTITUTE_RECIPE_IDS.has(cand.id)) continue;
					if (proteinDensity(cand) <= curDen) continue;
					let s = m.kcal / (cand.nutritionPerServing.energy_kcal || 1);
					s = Math.max(0.5, Math.min(3 * sCap, Math.round(s * 2) / 2));
					const newK = cand.nutritionPerServing.energy_kcal * s;
					const dayKcalAfter = totals.kcal - m.kcal + newK;
					// keep the day inside [target*0.90, target*(1+tol)] so protein repair never breaks kcal
					if (dayKcalAfter > targetKcal * (1 + KCAL_TOLERANCE) || dayKcalAfter < targetKcal * 0.90) continue;
					const dP = cand.nutritionPerServing.protein_g * s - m.protein;
					if (dP > 0 && (!best || dP > best.dProtein)) best = { mi, cand, servings: s, dProtein: dP };
				}
			}
			if (!best) break;
			const m = meals[best.mi];
			const oldId = m.recipeId;
			const cand = best.cand, s = best.servings, n = cand.nutritionPerServing;
			const oldPP = oldId ? PRIMARY_PROTEIN.get(oldId) : undefined;
			if (oldPP && proteinUsed[oldPP]) proteinUsed[oldPP]--;
			if (oldId) usedToday.delete(oldId);
			totals.kcal += n.energy_kcal * s - m.kcal;
			totals.protein += n.protein_g * s - m.protein;
			totals.carbs += n.carbohydrates_g * s - m.carbs;
			totals.fat += n.fat_g * s - m.fat;
			totals.fiber += n.fiber_g * s - m.fiber;
			m.recipeId = cand.id; m.servings = s; m.ingredientEdits = undefined;
			m.kcal = n.energy_kcal * s; m.protein = n.protein_g * s; m.carbs = n.carbohydrates_g * s; m.fat = n.fat_g * s; m.fiber = n.fiber_g * s;
			usedToday.add(cand.id);
			const newPP = PRIMARY_PROTEIN.get(cand.id);
			if (newPP) proteinUsed[newPP] = (proteinUsed[newPP] ?? 0) + 1;
		}

		// Round display values.
		for (const m of meals) {
			m.kcal = Math.round(m.kcal); m.protein = Math.round(m.protein);
			m.carbs = Math.round(m.carbs); m.fat = Math.round(m.fat); m.fiber = Math.round(m.fiber);
		}
		totals.kcal = Math.round(totals.kcal); totals.protein = Math.round(totals.protein);
		totals.carbs = Math.round(totals.carbs); totals.fat = Math.round(totals.fat); totals.fiber = Math.round(totals.fiber);

		// Warnings tally.
		if (Math.abs(totals.kcal - targetKcal) > targetKcal * KCAL_TOLERANCE) kcalOffDays++;
		if (totals.protein < energy.proteinBand[0] + PROTEIN_BAND[0]) proteinShortDays++;

		// Update variety window.
		for (const m of meals) if (m.recipeId) recent.push(m.recipeId);
		while (recent.length > mealsPerDay * VARIETY_WINDOW) recent.shift();

		days.push({ day: d + 1, meals, roundOut, totals });
	}

	if (anyEmptySlot) warnings.push({ code: 'empty-slot' });
	if (kcalOffDays > 0) warnings.push({ code: 'kcal-off', detail: `${kcalOffDays} day(s)` });
	if (proteinShortDays > 0) warnings.push({ code: 'protein-low', detail: `${proteinShortDays} day(s)` });

	const planHash = computePlanHash(baseSeed, profile, days);

	return {
		days,
		meta: {
			seed: baseSeed,
			targetKcal: Math.round(targetKcal),
			proteinBand: energy.proteinBand,
			carbCeilingG: energy.carbCeilingG,
			activeFilters: { diet: [...profile.dietaryFilters], fodmap: profile.fodmap, alcoholFree: profile.alcoholFree },
			relaxedNutrients,
			householdScale,
			planHash
		},
		warnings
	};
}

/**
 * BATCH ("Smart cooking") week generator (B2 / planning/47). Cooks a small number of real dishes
 * (~profile.cookSessionsPerWeek) in the MAIN slots (lunch/dinner) and repeats each across consecutive days as
 * leftovers; fills the LIGHT slots (breakfast/snacks) with quick / no-cook items, fresh each day. Output is a
 * shape-identical WeekPlan, so every consumer + the optimizer work unchanged. optimizeWeek (batch-aware, with
 * recipe-swaps disabled) then polishes band / protein / micros without fragmenting the cooked batches.
 * Deterministic for a given seed. Cross-day and within-day recipe repeats are intentional (allowed in batch).
 */
export function batchPlanWeek(opts: PlanOptions): WeekPlan {
	const { profile, energy } = opts;
	const mealsPerDay = Math.min(8, Math.max(1, Math.round(opts.mealsPerDay ?? profile.mealsPerDay ?? 3)));
	const baseSeed = (opts.seed ?? (profile.profileSeed * 31 + profile.planSeedOffset)) >>> 0;
	const household = opts.household ?? profile.household ?? [];
	const householdExtra = household.reduce((s, m) => s + memberKcal(m), 0);
	const targetKcal = energy.target + householdExtra;
	const householdScale = energy.target > 0 ? targetKcal / energy.target : 1;
	const sCap = Math.max(1, householdScale); // household-aware serving cap (planning/56 HH3); solo === 1
	const warnings: PlanWarning[] = [];

	// Hard-safety pool + mealtime grouping (same as planWeek; sensible-family fallback, never "any recipe").
	const sorted = [...eligibleRecipes(profile)].sort((a, b) => a.id.localeCompare(b.id));
	const byId = new Map(sorted.map((r) => [r.id, r]));
	// Eat-alone fruit/veg for fine-grained under-band fill (same pool + eligibility planWeek uses).
	const eatAlone = sortEatAlone(ALL_INGREDIENTS
		.filter((i) => i.eatAlone && (i.role === 'fruit' || i.role === 'vegetable') && ingredientAllowed(i, profile)));
	const byGroup: Record<SlotGroup, Recipe[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
	const mealtimePool = (mt: SlotGroup) => sorted.filter((r) => r.mealtimes.includes(mt));
	for (const g of Object.keys(byGroup) as SlotGroup[]) {
		let list = mealtimePool(g);
		if (list.length === 0) for (const alt of MEALTIME_FALLBACK[g]) { list = mealtimePool(alt); if (list.length) break; }
		byGroup[g] = list;
	}

	const slots = slotsFor(mealsPerDay);
	const omnivore = isOmnivoreProfile(profile);
	const rng = mulberry32(baseSeed === 0 ? 0x9e3779b1 : baseSeed);
	const wOf = (r: Recipe) => (omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id) ? SUBSTITUTE_PROTEIN_WEIGHT_OMNIVORE : 1);
	function pickDistinct(list: Recipe[], n: number): Recipe[] {
		const picks: Recipe[] = [];
		const avail = [...list];
		while (picks.length < n && avail.length) {
			const r = pickWeighted(avail, rng, wOf);
			picks.push(r);
			avail.splice(avail.indexOf(r), 1);
		}
		return picks;
	}

	// MAIN slots carry the cooked batches (+ leftovers); LIGHT slots are quick/no-cook, fresh daily.
	const MAIN: SlotGroup[] = ['lunch', 'dinner'];
	const mainSlotCount = slots.filter((s) => MAIN.includes(s.group)).length || 1;
	const sessions = Math.min(7, Math.max(1, Math.round(profile.cookSessionsPerWeek || 4)));
	// 3-day leftover cap (audit C1, decision planning/50): no cooked dish is eaten more than MAX_LEFTOVER_DAYS
	// consecutive days (within USDA 3-4 day fridge guidance). Lunch and dinner stay SEPARATE dishes, so the
	// per-day micro/macro spread and within-day variety are preserved. Each main slot uses >=2 distinct dishes
	// so the cap can hold; the preset sets the variety/cook level (Minimal ~2 / Balanced ~3 / I-enjoy ~4
	// distinct dishes per main slot). mainSlotCount is no longer divided in (separate dishes inherently cost
	// more cooks than the old 4-7 day batches - the deliberate trade for safe, varied leftovers).
	const MAX_LEFTOVER_DAYS = 3;
	const dishesPerMain = Math.min(7, Math.max(2, Math.round(sessions / 2) + 1));

	// Pre-assign each slot a 7-day recipe sequence.
	const seqBySlot = new Map<string, (Recipe | null)[]>();
	for (const slot of slots) {
		let group = byGroup[slot.group];
		// Omnivore default: never serve a vegan substitute-protein dish (tofu/tempeh/seitan/edamame). In batch a
		// single pick repeats all week as leftovers, so the soft omnivore down-weight is not enough - hard-exclude
		// here. Still available to vegetarian/vegan + the includePlantProteins opt-in (isOmnivoreProfile false).
		if (omnivore) { const ns = group.filter((r) => !SUBSTITUTE_RECIPE_IDS.has(r.id)); if (ns.length) group = ns; }
		const seq: (Recipe | null)[] = [];
		if (MAIN.includes(slot.group)) {
			const cooks = group.filter((r) => r.cookEffort === 'cook');
			const usePool = cooks.length >= 1 ? cooks : group; // fall back if a diet has no 'cook' dish here
			const dishes = pickDistinct(usePool, dishesPerMain);
			if (dishes.length === 0) { for (let d = 0; d < DAY_COUNT; d++) seq.push(null); }
			else {
				// Eat each cooked dish for up to MAX_LEFTOVER_DAYS consecutive days, then move to the next dish,
				// cycling through `dishes`. With >=2 distinct dishes, adjacent runs use different dishes, so the
				// longest run of any single dish is exactly runLen (<= MAX_LEFTOVER_DAYS). Deterministic. (A tiny
				// eligible pool yielding only 1 dish cannot honour the cap - an unavoidable edge for an extreme
				// diet with a single cookable main; the regression test asserts the cap only when >=2 exist.)
				const runLen = Math.min(MAX_LEFTOVER_DAYS, Math.max(1, Math.ceil(DAY_COUNT / dishes.length)));
				for (let d = 0; d < DAY_COUNT; d++) seq.push(dishes[Math.floor(d / runLen) % dishes.length]);
			}
		} else {
			const easy = group.filter((r) => r.cookEffort !== 'cook');
			const usePool = easy.length >= 1 ? easy : group;
			let last = '';
			for (let d = 0; d < DAY_COUNT; d++) {
				if (usePool.length === 0) { seq.push(null); continue; }
				let pick = pickWeighted(usePool, rng, wOf);
				if (usePool.length > 1 && pick.id === last) pick = pickWeighted(usePool.filter((r) => r.id !== last), rng, wOf);
				seq.push(pick); last = pick.id;
			}
		}
		seqBySlot.set(slot.key, seq);
	}

	// Build the week, sizing each meal to its slot's kcal share (optimizeWeek then trims/raises to band).
	const days: PlanDay[] = [];
	let anyEmpty = false;
	for (let d = 0; d < DAY_COUNT; d++) {
		const meals: PlanMeal[] = [];
		for (const slot of slots) {
			const pick = seqBySlot.get(slot.key)![d];
			if (!pick) { anyEmpty = true; meals.push({ slotKey: slot.key, recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }); continue; }
			const perKcal = pick.nutritionPerServing.energy_kcal || 1;
			const servings = Math.max(0.5, Math.min(3 * sCap, Math.round((targetKcal * slot.weight / perKcal) * 2) / 2));
			const n = pick.nutritionPerServing;
			meals.push({ slotKey: slot.key, recipeId: pick.id, servings,
				kcal: Math.round(n.energy_kcal * servings), protein: Math.round(n.protein_g * servings),
				carbs: Math.round(n.carbohydrates_g * servings), fat: Math.round(n.fat_g * servings), fiber: Math.round(n.fiber_g * servings) });
		}
		// Raise toward the band: batch days can fall short, and optimizeWeek only HARD-penalises over-band, so
		// fill under-target days here - bump the meal that best fills toward target WITHOUT crossing the upper
		// band (so this never creates an over-band day; a day that cannot reach the floor without overshooting
		// is left a touch under, which is safe).
		{
			const lo = targetKcal * (1 - KCAL_TOLERANCE);
			const hi = targetKcal * (1 + KCAL_TOLERANCE);
			let guard = 0;
			let total = meals.reduce((t, m) => t + m.kcal, 0);
			while (total < lo && guard++ < 40) {
				let bestIdx = -1, bestNew = -1;
				for (let mi = 0; mi < meals.length; mi++) {
					const m = meals[mi];
					if (!m.recipeId || m.servings >= 4 * sCap) continue;
					const rr = byId.get(m.recipeId); if (!rr) continue;
					const newTotal = total - m.kcal + Math.round(rr.nutritionPerServing.energy_kcal * (m.servings + 0.5));
					if (newTotal <= hi + 0.5 && newTotal > bestNew) { bestNew = newTotal; bestIdx = mi; }
				}
				if (bestIdx < 0) break;
				const m = meals[bestIdx]; const nn = byId.get(m.recipeId!)!.nutritionPerServing; const s = m.servings + 0.5;
				m.servings = s; m.kcal = Math.round(nn.energy_kcal * s); m.protein = Math.round(nn.protein_g * s); m.carbs = Math.round(nn.carbohydrates_g * s); m.fat = Math.round(nn.fat_g * s); m.fiber = Math.round(nn.fiber_g * s);
				total = meals.reduce((t, mm) => t + mm.kcal, 0);
			}
		}
		// Fine-grained fill: if still under, add eat-alone fruit/veg (the small kcal the 0.5-serving raise cannot
		// hit) - planWeek's round-out, shown as ordinary easy-food lines (no cooking). Carrier stores 0 macros;
		// the addition carries them (matches mealMacros: recipePart=stored 0 + additionsPart=food, counted once).
		const tot = meals.reduce((t, m) => ({ kcal: t.kcal + m.kcal, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat, fiber: t.fiber + m.fiber }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
		const mainKey = slots.reduce((a, b) => (b.weight > a.weight ? b : a), slots[0]).key;
		// Protein lever (audit H3): batch has no protein-repair SWAP (swaps are disabled in batch so they cannot
		// fragment the leftovers), so a day of moderate-protein cooked dishes can fall below the floor with no
		// recourse - precise meets the floor far more often. Add high-protein, low-calorie snacks (the SAME lever
		// planWeek uses, lever 1.5) until the day reaches the protein floor or the band/cap stops it. Runs BEFORE
		// the eat-alone fill (and updates `tot`) so its kcal is counted and never doubles the day over the band.
		// Band-safe (gated to the upper band), omnivore-safe (no substitutes), deterministic.
		{
			const usedToday = new Set(meals.map((m) => m.recipeId).filter((x): x is string => !!x));
			let pAdded = 0;
			while (tot.protein < energy.proteinBand[0] && pAdded < 3) {
				const cands = sorted.filter((r) =>
					r.mealtimes.includes('snack') &&
					r.nutritionPerServing.protein_g >= PROTEIN_SNACK_MIN_G &&
					r.nutritionPerServing.energy_kcal <= PROTEIN_SNACK_MAX_KCAL &&
					!usedToday.has(r.id) &&
					!(omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id)) &&
					tot.kcal + r.nutritionPerServing.energy_kcal <= targetKcal * (1 + KCAL_TOLERANCE)
				).sort((a, b) => b.nutritionPerServing.protein_g - a.nutritionPerServing.protein_g || a.id.localeCompare(b.id));
				if (!cands.length) break;
				const sn = cands[0].nutritionPerServing;
				meals.push({ slotKey: mainKey, recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, additions: [{ kind: 'recipe', recipeId: cands[0].id, servings: 1 }] });
				usedToday.add(cands[0].id);
				tot.kcal += sn.energy_kcal; tot.protein += sn.protein_g; tot.carbs += sn.carbohydrates_g; tot.fat += sn.fat_g; tot.fiber += sn.fiber_g;
				pAdded++;
			}
		}
		const fillWin = Math.min(eatAlone.length, EAT_ALONE_WINDOW) || 1;
		for (let j = 0, added = 0; j < fillWin && added < 4; j++) {
			if (targetKcal - tot.kcal < targetKcal * KCAL_TOLERANCE * 0.6) break;
			const food = eatAlone[(j + d) % fillWin]; // rotate the top micro-spread window by day (planning/56 HH6)
			const per100 = food.per100g.energy_kcal || 1;
			const pieceG = PIECE_GRAMS[food.id];
			let grams: number; let pieces: number | undefined;
			if (pieceG) { const kpp = (per100 * pieceG) / 100 || 1; pieces = Math.max(0.5, Math.min(3 * sCap, Math.round(((targetKcal - tot.kcal) / kpp) * 2) / 2)); grams = Math.round(pieces * pieceG); }
			else { grams = Math.max(50, Math.min(200 * sCap, Math.round((((targetKcal - tot.kcal) / per100) * 100) / 10) * 10)); }
			const f = grams / 100;
			meals.push({ slotKey: mainKey, recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, additions: [{ kind: 'ingredient', ingredientId: food.id, grams, ...(pieces ? { pieces } : {}) }] });
			tot.kcal += food.per100g.energy_kcal * f; tot.protein += food.per100g.protein_g * f; tot.carbs += food.per100g.carbohydrates_g * f; tot.fat += food.per100g.fat_g * f; tot.fiber += food.per100g.fiber_g * f;
			added++;
		}
		const totals = { kcal: Math.round(tot.kcal), protein: Math.round(tot.protein), carbs: Math.round(tot.carbs), fat: Math.round(tot.fat), fiber: Math.round(tot.fiber) };
		days.push({ day: d + 1, meals, roundOut: [], totals });
	}
	if (anyEmpty) warnings.push({ code: 'empty-slot' });

	return {
		days,
		meta: {
			seed: baseSeed, targetKcal: Math.round(targetKcal), proteinBand: energy.proteinBand,
			carbCeilingG: energy.carbCeilingG,
			activeFilters: { diet: [...profile.dietaryFilters], fodmap: profile.fodmap, alcoholFree: profile.alcoholFree },
			relaxedNutrients: [], householdScale, planHash: computePlanHash(baseSeed, profile, days)
		},
		warnings
	};
}

export function computePlanHash(seed: number, profile: FullProfile, days: PlanDay[]): string {
	const sig = JSON.stringify({
		seed,
		f: [...profile.dietaryFilters].sort(),
		fod: profile.fodmap,
		alc: profile.alcoholFree,
		d: days.map((day) => day.meals.map((m) => {
			// Unedited meals serialize exactly as before (so existing plans keep their hash + shopping
			// check-off); edits/additions append only when present.
			const core = `${m.recipeId}:${m.servings}`;
			const e = m.ingredientEdits?.length
				? '#e' + m.ingredientEdits.map((x) => `${x.originalId}>${x.swapToId ?? ''}:${x.grams ?? ''}${x.removed ? 'x' : ''}`).join(',')
				: '';
			const a = m.additions?.length
				? '#a' + m.additions.map((x) =>
					x.kind === 'ingredient' ? `i:${x.ingredientId}:${x.grams}`
						: x.kind === 'recipe' ? `r:${x.recipeId}:${x.servings}`
							: `s:${x.micro}:${x.amount}`).join(',')
				: '';
			return core + e + a;
		}).join('|'))
	});
	return hashStr(sig).toString(36);
}
