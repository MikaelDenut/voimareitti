// Pure plan-quality scorer (planning/44 + report section 9A). `scoreWeek` measures how good a generated
// WeekPlan is, as the single source of truth reused by the optimizer (Stage 2) and the tests. Lower = better.
//
// Layering (Mikael's decision 2026-06-20: "hard band, soft rest"):
//   - The per-day calorie band is a HARD constraint. Here it surfaces as `terms.band`, weighted (SCORE_WEIGHTS
//     .bandExceed) so large that no soft gain can offset a band violation. `inBand` is the boolean the
//     optimizer + the Stage 2 validator key off (the validator additionally THROWS on any violation, so the
//     band is enforced, not merely discouraged).
//   - Every other user-visible quality goal is a SOFT, tiered term: protein floor, weekly micro adequacy,
//     macros (carb ceiling / fat / fibre), and variety + naturalness. Trades happen via the weights.
//
// Pure + deterministic: reads the plan, mutates nothing, sums over fixed-order arrays. Macros + micros are
// recomputed through day-totals (the ONE canonical basis), so the score reflects the EFFECTIVE plan including
// every addition (milk / snack / supplement), never stale stored values (report risk R5).

import type { WeekPlan, PlanDay } from '../engine/meal-planner';
import type { FullProfile } from '../profile-core';
import type { EnergyResult } from '../engine/engine';
import { recipes } from '../content/recipes';
import { getIngredient } from '../content/ingredients';
import { dayTotals, dayMicros, weekMicros, TRACKED_MICROS, type MicroKey } from './day-totals';
import {
	KCAL_TOLERANCE, SUBSTITUTE_PROTEIN_TOKENS, PROTEIN_VARIETY_CAP_PER_WEEK, SCORE_WEIGHTS
} from './constants';
import { MICRO_UL } from './micro-limits';

// --- module-level maps (mirror src/lib/engine/meal-planner.ts; Stage 2 consolidates into one shared
//     export so the scorer and the move generator can never drift). Built once, deterministic. -----------
const SUBSTITUTE_RECIPE_IDS: Set<string> = new Set(
	recipes
		.filter((r) =>
			(r.dietary.vegetarian || r.dietary.vegan) &&
			r.ingredients.some((ing) => SUBSTITUTE_PROTEIN_TOKENS.some((t) => ing.ingredientId.includes(t)))
		)
		.map((r) => r.id)
);

const PRIMARY_PROTEIN: Map<string, string> = (() => {
	const m = new Map<string, string>();
	for (const r of recipes) {
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

/** Omnivore = no vegetarian/vegan filter and no plant-protein opt-in (mirrors the engine's rule). */
function isOmnivoreProfile(p: FullProfile): boolean {
	if (p.includePlantProteins) return false;
	return !p.dietaryFilters.includes('vegetarian') && !p.dietaryFilters.includes('vegan');
}

/** Every recipe id a day references: slot recipes AND recipe-kind additions (the protein-snack lever). */
function dayRecipeIds(day: PlanDay): string[] {
	const ids: string[] = [];
	for (const m of day.meals) {
		if (m.recipeId) ids.push(m.recipeId);
		for (const a of m.additions ?? []) if (a.kind === 'recipe') ids.push(a.recipeId);
	}
	return ids;
}

/** Bolt-on foods (eat-alone round-out + snack additions), excluding 0-kcal supplements. */
function dayAddOnCount(day: PlanDay): number {
	let n = 0;
	for (const m of day.meals) for (const a of m.additions ?? []) if (a.kind === 'ingredient' || a.kind === 'recipe') n++;
	return n;
}

// --- per-day computation cache (2026-07 audit M1) -------------------------------------------------------
// dayTotals + dayMicros re-walk every ingredient of every meal; scoreWeek used to recompute them 4x per day
// per CANDIDATE, and the optimizer scores ~60-70 candidates per iteration. Candidate weeks share 6 of 7 day
// OBJECTS by reference (moves.cloneDay copies only the touched day), so a WeakMap keyed on the day object
// makes every untouched day a cache hit across the whole optimizer run. The cache is created per
// optimizeWeek call and passed in explicitly - inside one run day objects are never mutated in place
// (every move clones), so the cache can never go stale. Callers that omit it get the original behavior.
export type DayComputed = { totals: ReturnType<typeof dayTotals>; micros: Record<MicroKey, number> };
export type ScoreCache = WeakMap<PlanDay, DayComputed>;
export const createScoreCache = (): ScoreCache => new WeakMap();

function computedFor(d: PlanDay, cache?: ScoreCache): DayComputed {
	const hit = cache?.get(d);
	if (hit) return hit;
	const v: DayComputed = { totals: dayTotals(d), micros: dayMicros(d) };
	cache?.set(d, v);
	return v;
}

// --- tier raws (each a normalized, non-negative penalty; exported for unit tests) ----------------------

/** Sum of per-day fractional distance OUTSIDE the band. 0 == every day inside the hard band. */
export function bandExceedRaw(days: PlanDay[], target: number, cache?: ScoreCache): number {
	if (target <= 0) return 0;
	let s = 0;
	for (const d of days) {
		const delta = Math.abs(computedFor(d, cache).totals.kcal - target) / target;
		if (delta > KCAL_TOLERANCE) s += delta - KCAL_TOLERANCE;
	}
	return s;
}

/** Soft centering inside the band: 0 at target, 1 per day at the band edge (squared). */
export function calorieCenterRaw(days: PlanDay[], target: number, cache?: ScoreCache): number {
	if (target <= 0) return 0;
	let s = 0;
	for (const d of days) {
		const delta = (computedFor(d, cache).totals.kcal - target) / target;
		const within = Math.max(-KCAL_TOLERANCE, Math.min(KCAL_TOLERANCE, delta)) / KCAL_TOLERANCE;
		s += within * within;
	}
	return s;
}

/** Per-day protein shortfall below the floor (age-aware), as a fraction of the floor. */
export function proteinShortRaw(days: PlanDay[], floor: number, cache?: ScoreCache): number {
	if (floor <= 0) return 0;
	let s = 0;
	for (const d of days) {
		const p = computedFor(d, cache).totals.protein;
		if (p < floor) s += (floor - p) / floor;
	}
	return s;
}

/** Weekly micro adequacy: shortfall below target x7 + excess above a food-relevant UL x7. `scale` is the
 *  household scale (planning/56 HH4): the aggregate weekMicros feed `scale` adult-equivalents, so BOTH the
 *  target and the UL scale with it - otherwise a household's aggregate looks like a huge surplus over one
 *  person's target (no repair) AND a huge breach of one person's UL (bogus excess). Solo: scale = 1. */
export function microRaw(days: PlanDay[], targets: EnergyResult['microTargets'], scale = 1, cache?: ScoreCache): { short: number; excess: number } {
	// weekMicros = sum of dayMicros; with a cache we sum the cached per-day micros instead of re-walking.
	let wk: Record<MicroKey, number>;
	if (cache) {
		wk = Object.fromEntries(TRACKED_MICROS.map((k) => [k, 0])) as Record<MicroKey, number>;
		for (const d of days) {
			const dm = computedFor(d, cache).micros;
			for (const k of TRACKED_MICROS) wk[k] += dm[k] ?? 0;
		}
		for (const k of TRACKED_MICROS) wk[k] = Math.round(wk[k] * 10) / 10; // mirror weekMicros' rounding
	} else {
		wk = weekMicros(days);
	}
	let short = 0, excess = 0;
	for (const k of TRACKED_MICROS) {
		const t7 = targets[k] * 7 * scale;
		const got = wk[k] ?? 0;
		if (t7 > 0 && got < t7) short += (t7 - got) / t7;
		const ul = MICRO_UL[k];
		if (ul != null) {
			const ul7 = ul * 7 * scale;
			if (got > ul7) excess += (got - ul7) / ul7;
		}
	}
	return { short, excess };
}

/** Macro penalties: carbs over the ceiling, fat distance from target, fibre under target. Targets are passed
 *  in (household-scaled by the caller) so this stays a pure function of explicit numbers. */
export function macroRaw(days: PlanDay[], carbCeilingG: number | null, fatG: number, fiberG: number, cache?: ScoreCache): { carb: number; fat: number; fibre: number } {
	let carb = 0, fat = 0, fibre = 0;
	for (const d of days) {
		const t = computedFor(d, cache).totals;
		if (carbCeilingG != null && carbCeilingG > 0 && t.carbs > carbCeilingG) carb += (t.carbs - carbCeilingG) / carbCeilingG;
		if (fatG > 0) fat += Math.abs(t.fat - fatG) / fatG;
		if (fiberG > 0 && t.fiber < fiberG) fibre += (fiberG - t.fiber) / fiberG;
	}
	return { carb, fat, fibre };
}

/** Variety + naturalness: within-day repeats, dominant primary protein, omnivore substitutes, low weekly
 *  variety, and bolt-on count. */
export function varietyRaw(week: WeekPlan, profile: FullProfile): {
	repeat: number; dominant: number; substitute: number; weekRepeat: number; addOn: number;
} {
	const omnivore = isOmnivoreProfile(profile);
	let repeat = 0, addOn = 0, substitute = 0;
	const proteinCount: Record<string, number> = {};
	const allSlotIds: string[] = [];
	for (const day of week.days) {
		const ids = dayRecipeIds(day);
		repeat += ids.length - new Set(ids).size; // within-day repeats
		addOn += dayAddOnCount(day);
		for (const id of ids) {
			const pp = PRIMARY_PROTEIN.get(id);
			if (pp) proteinCount[pp] = (proteinCount[pp] ?? 0) + 1;
			if (omnivore && SUBSTITUTE_RECIPE_IDS.has(id)) substitute++;
		}
		for (const m of day.meals) if (m.recipeId) allSlotIds.push(m.recipeId);
	}
	let dominant = 0;
	for (const c of Object.values(proteinCount)) if (c > PROTEIN_VARIETY_CAP_PER_WEEK) dominant += c - PROTEIN_VARIETY_CAP_PER_WEEK;
	const weekRepeat = allSlotIds.length > 0 ? (allSlotIds.length - new Set(allSlotIds).size) / allSlotIds.length : 0;
	return { repeat, dominant, substitute, weekRepeat, addOn };
}

// --- combined score ------------------------------------------------------------------------------------

export interface ScoreTerms {
	band: number; calorie: number; protein: number; micro: number; macro: number; variety: number;
}
export interface ScoreResult {
	total: number;     // sum of all weighted terms; lower is better
	inBand: boolean;   // true == no day outside the hard calorie band
	terms: ScoreTerms; // weighted contributions (sum to total)
}

/**
 * Score a whole week. Pure; mutates nothing. `inBand` is the hard-band flag; `total` is the soft quality
 * (dominated by the band term whenever a day is out of band, so the optimizer always repairs the band first).
 */
export function scoreWeek(week: WeekPlan, profile: FullProfile, energy: EnergyResult, cache?: ScoreCache): ScoreResult {
	const W = SCORE_WEIGHTS;
	const days = week.days;
	// Household-aware targets: planWeek scales each day's servings to feed the whole household and records the
	// scaled total in meta.targetKcal + meta.householdScale. Score the calorie band against meta.targetKcal and
	// scale the protein floor, macro targets, AND the micro targets/ULs by householdScale (planning/56 HH4) so
	// the optimizer repairs household micros (supplements) the same way it does for a solo user, instead of
	// seeing the aggregate household food as a surplus against one person's target. Solo: scale = 1.
	const scale = week.meta.householdScale || 1;
	const target = week.meta.targetKcal || energy.target;

	const bandR = bandExceedRaw(days, target, cache);
	const calR = calorieCenterRaw(days, target, cache);
	const protR = proteinShortRaw(days, energy.proteinBand[0] * scale, cache);
	const mic = microRaw(days, energy.microTargets, scale, cache);
	const mac = macroRaw(days, energy.carbCeilingG != null ? energy.carbCeilingG * scale : null, energy.fatG * scale, energy.fiberG * scale, cache);
	const v = varietyRaw(week, profile);

	const band = W.bandExceed * bandR;
	const calorie = W.calorieCenter * calR;
	const protein = W.proteinShort * protR;
	const micro = W.microShort * mic.short + W.microExcessUL * mic.excess;
	const macro = W.carbCeiling * mac.carb + W.fatTarget * mac.fat + W.fibreShort * mac.fibre;
	// Batch mode INTENDS repetition (cook once, eat leftovers across and within days), so the variety
	// penalties that punish that - within-day repeat, weekly repeat, dominant primary protein - are dropped in
	// batch. Omnivore-substitute correctness and the mild add-on preference still apply in both modes.
	const batchMode = profile.cookingMode === 'batch';
	const variety = W.omnivoreSubstitute * v.substitute + W.addOn * v.addOn +
		(batchMode ? 0 : W.withinDayRepeat * v.repeat + W.dominantProtein * v.dominant + W.weekRepeat * v.weekRepeat);

	return {
		total: band + calorie + protein + micro + macro + variety,
		inBand: bandR === 0,
		terms: { band, calorie, protein, micro, macro, variety }
	};
}
