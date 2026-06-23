// Pure neighbourhood generation for the meal-plan optimizer (planning/44, report section 9A). Each move
// returns a NEW (deep-cloned) WeekPlan; the input is never mutated. Moves are built to be FEASIBLE by
// design: serving nudges keep the same (already-eligible) recipe; supplement lines carry 0 kcal; calcium
// milk is only offered when the diet allows it, and a band-breaking placement simply scores badly so the
// optimizer rejects it (the scorer's hard-band term + the validator are the guarantees, not this file).
//
// Stage 2 move set (focused + correct): serving nudges (band repair + centering), supplement lines for short
// non-calcium micros, and calorie-aware calcium (milk, plus a combined compensating trim). Recipe swaps and
// eat-alone round-out moves are a deferred Stage 2 enhancement - this first cut already fixes the overshoot
// and covers micros without ever blindly breaking the band.

import type { WeekPlan, PlanDay, PlanMeal } from '../engine/meal-planner';
import type { FullProfile } from '../profile-core';
import type { EnergyResult } from '../engine/engine';
import { getRecipe, type Recipe } from '../content/recipes';
import { getIngredient } from '../content/ingredients';
import { ingredientAllowed } from '../recipe-filters';
import { dayTotals, weekMicros, kcalMatchedServings } from './day-totals';
import { eligibleRecipes, isOmnivoreProfile, SUBSTITUTE_RECIPE_IDS } from '../engine/meal-planner';
import { OPTIMIZER, SUPPLEMENTABLE_MICROS, householdServingCap } from './constants';

export interface Move { kind: string; week: WeekPlan; }

const clone = (w: WeekPlan): WeekPlan => structuredClone(w);

// Copy-on-write clone for SINGLE-DAY moves: deep-copy only the touched day, share the other days by
// reference (scoreWeek/validateWeek only READ them). Far cheaper than cloning the whole week per candidate.
function cloneDay(week: WeekPlan, di: number): WeekPlan {
	const days = week.days.slice();
	const d = week.days[di];
	days[di] = {
		...d,
		totals: { ...d.totals },
		roundOut: d.roundOut.slice(),
		meals: d.meals.map((m) => ({
			...m,
			additions: m.additions ? m.additions.map((a) => ({ ...a })) : undefined,
			ingredientEdits: m.ingredientEdits ? m.ingredientEdits.map((e) => ({ ...e })) : undefined
		}))
	};
	return { ...week, days, meta: { ...week.meta } };
}

/** Set a recipe meal's servings and recompute its stored macros (the basis day-totals reads for an
 *  unedited recipe meal). */
function setServings(m: PlanMeal, r: Recipe, s: number): void {
	const n = r.nutritionPerServing;
	m.servings = s;
	m.kcal = Math.round(n.energy_kcal * s);
	m.protein = Math.round(n.protein_g * s);
	m.carbs = Math.round(n.carbohydrates_g * s);
	m.fat = Math.round(n.fat_g * s);
	m.fiber = Math.round(n.fiber_g * s);
}

function mainSlotKey(day: PlanDay): string {
	let key = '', best = -1;
	for (const m of day.meals) if (m.recipeId && m.kcal > best) { best = m.kcal; key = m.slotKey; }
	return key || day.meals[0]?.slotKey || 'meal_lunch';
}

function addMilk(day: PlanDay, grams: number): void {
	day.meals.push({
		slotKey: mainSlotKey(day), recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
		additions: [{ kind: 'ingredient', ingredientId: 'milk', grams }]
	});
}

/** Reduce the largest still-trimmable slot dish by 0.5 servings. Returns false if nothing can be trimmed. */
function trimLargestDish(day: PlanDay): boolean {
	let idx = -1, best = -1;
	for (let i = 0; i < day.meals.length; i++) {
		const m = day.meals[i];
		if (m.recipeId && m.servings > OPTIMIZER.servingMin && m.kcal > best) { best = m.kcal; idx = i; }
	}
	if (idx < 0) return false;
	const m = day.meals[idx];
	const r = getRecipe(m.recipeId!);
	if (!r) return false;
	setServings(m, r, m.servings - 0.5);
	return true;
}

function hasSupplement(week: WeekPlan, micro: string): boolean {
	for (const d of week.days) for (const m of d.meals) for (const a of m.additions ?? [])
		if (a.kind === 'supplement' && a.micro === micro) return true;
	return false;
}

function tidyDose(amount: number): number {
	return amount >= 10 ? Math.round(amount) : Math.round(amount * 10) / 10;
}

/**
 * Generate the deterministic, fixed-order feasible neighbourhood of a week. The optimizer scores each and
 * accepts the best improving one. Order: serving nudges (by day, meal, +0.5 then -0.5), then supplement
 * moves (by tracked-micro order), then calcium moves (by day; simple add, then add+trim).
 */
export function generateMoves(week: WeekPlan, profile: FullProfile, energy: EnergyResult): Move[] {
	const moves: Move[] = [];
	const sMax = householdServingCap(week.meta.householdScale); // household-aware serving cap (planning/56 HH3)
	const hhScale = Math.max(1, week.meta.householdScale || 1); // micro dosing target scales with the household (planning/56 HH4)

	// A. serving nudges (+/- 0.5) on slot recipe meals - the primary band-repair + centering lever.
	for (let di = 0; di < week.days.length; di++) {
		for (let mi = 0; mi < week.days[di].meals.length; mi++) {
			const m = week.days[di].meals[mi];
			if (!m.recipeId) continue;
			const r = getRecipe(m.recipeId);
			if (!r) continue;
			for (const delta of [0.5, -0.5]) {
				const s = m.servings + delta;
				if (s < OPTIMIZER.servingMin || s > sMax) continue;
				const w = cloneDay(week, di);
				setServings(w.days[di].meals[mi], r, s);
				moves.push({ kind: `nudge:${di}:${mi}:${delta > 0 ? 'up' : 'down'}`, week: w });
			}
		}
	}

	// B. supplement lines for short NON-calcium micros (calcium is food-only; iron skipped when the user
	// chose food-first iron). 0 kcal, so always band-safe; one move adds a daily line for the whole week.
	const wk = weekMicros(week.days);
	for (const k of SUPPLEMENTABLE_MICROS) {
		if (k === 'iron_mg' && profile.preferIronFromFood) continue;
		const t7 = energy.microTargets[k] * 7 * hhScale; // household-scaled weekly target (planning/56 HH4)
		if (t7 <= 0 || wk[k] >= t7 * OPTIMIZER.microCloseEnough) continue;
		if (hasSupplement(week, k)) continue;
		// Dose only the WEEKLY GAP, spread per day, so the week lands near 100% of target - NOT the ~190%
		// the old full-RDA-per-day dosing produced (which could also exceed a micro's supplemental UL).
		const perDay = tidyDose((t7 - wk[k]) / 7);
		if (perDay <= 0) continue;
		const w = clone(week);
		for (const day of w.days) day.meals.push({
			slotKey: 'supplement', recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
			additions: [{ kind: 'supplement', micro: k, amount: perDay }]
		});
		moves.push({ kind: `supplement:${k}`, week: w });
	}

	// C. calorie-aware calcium (milk), only if the diet allows milk and calcium is still short. One candidate
	// per day for a simple glass, plus a combined "glass + trim the largest dish 0.5" candidate. Band-breaking
	// placements just score badly (huge band term) and are never accepted; if NO placement fits, calcium stays
	// short and is flagged by the weekly micro UI ("flag, don't force").
	const milk = getIngredient('milk');
	// Calcium stays food-only "flag, don't force" (solo target, NOT household-scaled): a household drinking
	// many solo glasses to chase the aggregate target would spam milk lines; calcium is the one tracked micro
	// the plan flags rather than pills. The scorer still measures household calcium honestly (microRaw scaled).
	const caT7 = energy.microTargets.calcium_mg * 7;
	if (milk && ingredientAllowed(milk, profile) && wk.calcium_mg < caT7 * OPTIMIZER.microCloseEnough) {
		for (let di = 0; di < week.days.length; di++) {
			const simple = cloneDay(week, di);
			addMilk(simple.days[di], OPTIMIZER.calciumGrams);
			moves.push({ kind: `calcium:${di}`, week: simple });

			const combined = cloneDay(week, di);
			addMilk(combined.days[di], OPTIMIZER.calciumGrams);
			if (trimLargestDish(combined.days[di])) moves.push({ kind: `calcium+trim:${di}`, week: combined });
		}
	}

	return moves;
}

/** Recipe-swap moves: replace a slot dish with a same-mealtime, eligible, kcal-matched alternative. Kept
 *  SEPARATE so the optimizer tries these only when the cheap moves stall (swaps are the costly neighbourhood).
 *  Excludes recipes already used that day, so it never creates a within-day repeat (precise-safe). */
export function generateSwaps(week: WeekPlan, profile: FullProfile, eligible: readonly Recipe[] = eligibleRecipes(profile)): Move[] {
	const moves: Move[] = [];
	// Omnivore default: a swap must never re-introduce a vegan substitute-protein dish (tofu/tempeh/seitan/
	// edamame). planWeek already hard-excludes them from its pool, but the optimizer's swaps draw from the full
	// eligible set, so without this filter a swap could put tofu back on an omnivore's plate (audit H1: the
	// "Double-tofu noodle bowl" seen in a Precise omnivore plan). Veg/vegan + includePlantProteins are exempt.
	const omnivore = isOmnivoreProfile(profile);
	const usedWeek = new Set<string>();
	for (const d of week.days) for (const mm of d.meals) {
		if (mm.recipeId) usedWeek.add(mm.recipeId);
		for (const a of mm.additions ?? []) if (a.kind === 'recipe') usedWeek.add(a.recipeId);
	}
	for (let di = 0; di < week.days.length; di++) {
		const day = week.days[di];
		for (let mi = 0; mi < day.meals.length; mi++) {
			const m = day.meals[mi];
			if (!m.recipeId) continue;
			const cur = getRecipe(m.recipeId);
			if (!cur) continue;
			const curK = cur.nutritionPerServing.energy_kcal;
			const cands = eligible
				.filter((r) => !usedWeek.has(r.id) && !(omnivore && SUBSTITUTE_RECIPE_IDS.has(r.id)) && r.mealtimes.some((mt) => cur.mealtimes.includes(mt)))
				.sort((a, b) => Math.abs(a.nutritionPerServing.energy_kcal - curK) - Math.abs(b.nutritionPerServing.energy_kcal - curK) || a.id.localeCompare(b.id))
				.slice(0, OPTIMIZER.swapCandidates);
			for (const cand of cands) {
				const w = cloneDay(week, di);
				const nm = w.days[di].meals[mi];
				nm.recipeId = cand.id;
				nm.ingredientEdits = undefined; // edits belonged to the old recipe
				setServings(nm, cand, kcalMatchedServings(m.kcal, cand.nutritionPerServing.energy_kcal));
				moves.push({ kind: `swap:${di}:${mi}:${cand.id}`, week: w });
			}
		}
	}
	return moves;
}
