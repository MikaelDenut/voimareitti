// Pure, deterministic, capped meal-plan optimizer (planning/44, report section 9A). Takes a feasible-ish
// warm start (planWeek output) and improves it by greedy steepest-descent over scoreWeek, using the pure
// move generator. No RNG, no DOM, no mutation of the input. The per-day calorie band is enforced by the
// scorer's huge band term (the optimizer always repairs the band before chasing soft wins) AND re-checked
// by validateWeek, which throws on any HARD safety violation. NOT wired into the UI in Stage 2.

import type { WeekPlan, PlanDay } from './meal-planner';
import { computePlanHash, eligibleRecipes } from './meal-planner';
import type { FullProfile } from '../profile-core';
import type { EnergyResult } from './engine';
import { getIngredient } from '../content/ingredients';
import { ingredientAllowed } from '../recipe-filters';
import { scoreWeek, createScoreCache } from '../nutrition/score';
import { dayTotals } from '../nutrition/day-totals';
import { generateMoves, generateSwaps } from '../nutrition/moves';
import { OPTIMIZER, KCAL_TOLERANCE, householdServingCap } from '../nutrition/constants';

export interface ValidationResult {
	safety: string[]; // HARD violations the optimizer must never produce (asserted; optimizeWeek throws)
	band: string[];   // days outside the calorie band (the objective; minimised, ideally empty)
}

export interface OptimizeResult {
	week: WeekPlan;
	diagnostics: { iterations: number; accepted: string[]; warmScore: number; score: number };
}

/** Re-check every HARD constraint on a finished week. `safety` must be empty (optimizeWeek throws if not);
 *  `band` is reported for the calorie objective. Pure. */
export function validateWeek(week: WeekPlan, profile: FullProfile, energy: EnergyResult): ValidationResult {
	const safety: string[] = [];
	const band: string[] = [];
	const eligible = new Set(eligibleRecipes(profile).map((r) => r.id));
	const target = week.meta.targetKcal || energy.target; // household-aware (matches scoreWeek)
	const lo = target * (1 - KCAL_TOLERANCE);
	const hi = target * (1 + KCAL_TOLERANCE);
	const sMax = householdServingCap(week.meta.householdScale); // household-aware serving cap (planning/56 HH3)

	for (const day of week.days) {
		const usedIds: string[] = [];
		for (const m of day.meals) {
			if (m.recipeId) {
				if (!eligible.has(m.recipeId)) safety.push(`day ${day.day}: ineligible recipe ${m.recipeId}`);
				if (m.servings < OPTIMIZER.servingMin - 1e-9 || m.servings > sMax + 1e-9)
					safety.push(`day ${day.day}: servings ${m.servings} out of [${OPTIMIZER.servingMin}, ${sMax}]`);
				usedIds.push(m.recipeId);
			}
			for (const a of m.additions ?? []) {
				if (a.kind === 'ingredient') {
					const ing = getIngredient(a.ingredientId);
					if (!ing || !ingredientAllowed(ing, profile)) safety.push(`day ${day.day}: disallowed ingredient ${a.ingredientId}`);
				} else if (a.kind === 'recipe') {
					if (!eligible.has(a.recipeId)) safety.push(`day ${day.day}: ineligible added recipe ${a.recipeId}`);
					usedIds.push(a.recipeId);
				} else if (a.kind === 'supplement') {
					if (a.micro === 'calcium_mg') safety.push(`day ${day.day}: calcium supplement is forbidden (food-only)`);
					if (a.micro === 'iron_mg' && profile.preferIronFromFood) safety.push(`day ${day.day}: iron pill despite preferIronFromFood`);
					if (m.kcal !== 0) safety.push(`day ${day.day}: supplement line carries ${m.kcal} kcal`);
				}
			}
		}
		// Within-day repeat is a hard error in precise mode; in batch it is the POINT (leftovers eaten twice in a day).
			if (profile.cookingMode !== 'batch' && new Set(usedIds).size !== usedIds.length) safety.push(`day ${day.day}: a recipe repeats within the day`);
		const k = dayTotals(day).kcal;
		if (k > hi + 0.5 || k < lo - 0.5) band.push(`day ${day.day}: ${Math.round(k)} outside [${Math.round(lo)}, ${Math.round(hi)}]`);
	}
	return { safety, band };
}

/** Recompute each day's stored totals + the plan hash from the (optimized) meals, so downstream consumers
 *  (MealPrint, shopping, saved plans) read consistent numbers. Mirrors applyMicroTopUps's finalize step. */
function finalize(week: WeekPlan, profile: FullProfile): void {
	for (const day of week.days) day.totals = dayTotals(day);
	week.meta.planHash = computePlanHash(week.meta.seed, profile, week.days);
}

/**
 * Optimize a week. Pure: clones the input, never mutates it. Greedy steepest-descent over scoreWeek with a
 * deterministic, fixed-order neighbourhood and a hard iteration cap, so it terminates and is byte-identical
 * for identical inputs. Guarantees score(result) <= score(warmStart). Throws if it would emit any hard
 * safety violation (it never should).
 */
export function optimizeWeek(initial: WeekPlan, profile: FullProfile, energy: EnergyResult): OptimizeResult {
	// Proxy-safe deep clone. In the app, `initial` arrives as a Svelte 5 $state proxy (the $bindable `week`),
	// and structuredClone throws DataCloneError on state proxies - which silently broke Generate after wiring
	// (the click threw, so the view never switched: "Generate does nothing"). WeekPlan is fully JSON-
	// serializable (it is persisted to localStorage), so a JSON round-trip clones it safely AND strips the
	// proxy; every downstream clone (moves.ts) then operates on a plain object.
	let cur: WeekPlan = JSON.parse(JSON.stringify(initial));
	// Per-run day-computation cache (2026-07 audit M1): candidate weeks share untouched day objects by
	// reference (moves.cloneDay), so caching dayTotals/dayMicros per day object makes scoring a candidate
	// cost ~1 recomputed day instead of 7. Safe within one run: moves never mutate a day in place.
	const cache = createScoreCache();
	let curScore = scoreWeek(cur, profile, energy, cache).total;
	const warmScore = curScore;
	const accepted: string[] = [];
	let iterations = 0;

	const eligible = eligibleRecipes(profile); // computed once, reused across iterations (perf)
	const pickBest = (moves: { kind: string; week: WeekPlan }[]) => {
		let best: WeekPlan | null = null, bestKind = '', bestScore = curScore;
		for (const mv of moves) {
			const s = scoreWeek(mv.week, profile, energy, cache).total;
			if (s < bestScore - OPTIMIZER.epsilon) { bestScore = s; best = mv.week; bestKind = mv.kind; }
		}
		return best ? { week: best, kind: bestKind, score: bestScore } : null;
	};
	// Swaps are the costly neighbourhood; accept the FIRST improving swap rather than scoring them all.
	const pickFirst = (moves: { kind: string; week: WeekPlan }[]) => {
		for (const mv of moves) {
			const s = scoreWeek(mv.week, profile, energy, cache).total;
			if (s < curScore - OPTIMIZER.epsilon) return { week: mv.week, kind: mv.kind, score: s };
		}
		return null;
	};
	for (; iterations < OPTIMIZER.maxIters; iterations++) {
		// Cheap moves first (nudge / supplement / calcium); only when they stall do we try the costlier
		// recipe swaps. Keeps the common case fast while still reaching swap improvements. Deterministic.
		let step = pickBest(generateMoves(cur, profile, energy));
		// Swaps are a PRECISE-mode lever (variety / micro recovery). In batch mode the generator owns recipe
		// selection + leftovers, so swaps are disabled there - a swap would fragment the cooked batches.
		if (!step && profile.cookingMode !== 'batch') step = pickFirst(generateSwaps(cur, profile, eligible));
		if (!step) break;
		cur = step.week;
		curScore = step.score;
		accepted.push(step.kind);
	}

	finalize(cur, profile);
	const v = validateWeek(cur, profile, energy);
	if (v.safety.length) throw new Error('optimizeWeek produced hard safety violations: ' + v.safety.join('; '));

	return { week: cur, diagnostics: { iterations, accepted, warmScore, score: curScore } };
}
