// In-memory current working meal plan (planning/43). A generated plan is TEMPORARY by default: it is NOT
// persisted to localStorage and is shared across pages (planner, shopping, print) only for the current
// session via this module store. It survives in-app navigation but is gone on a full page reload - intended,
// so a stale plan can never linger ("same plan forever" is removed). The ONLY durable store is an explicit
// Save (saveMeal -> the saved-plans list). `sig` is the profile-settings signature the plan was generated
// under, so any relevant settings change invalidates the visible plan.
import type { WeekPlan } from './engine/meal-planner';
import type { FullProfile } from './profile-core';

export const currentPlan = $state<{ week: WeekPlan | null; sig: string }>({ week: null, sig: '' });

/** Signature of every profile setting that should force a fresh plan when it changes (avoid foods, diet,
 *  meals/day, goal, body/energy inputs, household, overrides, plant-protein opt-in). Pure + stable. */
export function planSettingsSig(p: FullProfile): string {
	return JSON.stringify({
		m: p.mealsPerDay,
		df: [...p.dietaryFilters].sort(),
		fo: p.fodmap,
		al: p.alcoholFree,
		di: [...p.dislikedIngredientIds].sort(),
		dr: [...p.dislikedRecipeIds].sort(),
		ng: p.nutritionGoal,
		ipp: p.includePlantProteins,
		iff: p.preferIronFromFood,
		cm: p.cookingMode, cs: p.cookSessionsPerWeek,
		pg: p.pregnant, pp: p.postpartum, bf: p.breastfeeding,
		a: p.age, s: p.sex, w: p.weightKg, h: p.heightCm, d: p.days,
		hh: p.household.map((m) => `${m.age}/${m.sex ?? ''}/${m.activity ?? ''}/${m.goal ?? ''}`),
		ov: [p.kcalOverride ?? '', p.proteinOverride ?? '', p.carbOverride ?? '', p.fatOverride ?? '']
	});
}
