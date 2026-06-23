// Nutrition constants (planning section 5) - the ONE home for every tunable number in the food system.
// No magic numbers in the planner, filters, UI, or tests; import from here. Plain values only, no runes.
// Sources for the micro targets are mainstream public references (EFSA / WHO / Nordic NNR ranges); they
// are SOFT targets for a general wellness tool, never medical advice.

import type { NutritionGoalId, Sex } from '$lib/content/data';

// --- recipe "soft" nutrient chips (per serving unless noted) ----------------
export const HIGH_PROTEIN_G = 25;
export const HIGH_PROTEIN_PCT = 0.25; // >=25% of kcal from protein also qualifies
export const HIGH_FIBRE_G = 8;
export const LOW_CAL_KCAL = 400;
export const LOW_CARB_G = 20;

// --- planner tolerances (precedence: safety > kcal floor > kcal band > protein > carb ceiling) ------
export const KCAL_TOLERANCE = 0.07; // accept a day within +-7% of the kcal target

// Per-day calorie status thresholds for the EDITED day in the planner (planning/37). A day more than 10%
// under target reads "low"; more than 10% over reads a calm "over your set amount" note. User-facing,
// separate from the generator's KCAL_TOLERANCE above.
export const DAY_UNDER_PCT = 0.10;
export const DAY_OVER_PCT = 0.10;
export const PROTEIN_BAND: [number, number] = [-5, 30]; // achieved daily protein acceptance window (g)
export const CARB_CEILING_GPERKG = { cut: 1.5, maintain: 2.5, bulk: null } as const;

// Map the app's nutritionGoal ids onto the carb-ceiling phases above.
export const CARB_PHASE: Record<NutritionGoalId, keyof typeof CARB_CEILING_GPERKG> = {
	lose: 'cut',
	maintain: 'maintain',
	gain: 'bulk'
};

// --- variety + default-diet weighting (planning/43 audit) -------------------
// Omnivore default must not lean on vegan substitute proteins. These recipes stay fully eligible and
// browsable; they are only DOWN-WEIGHTED (never excluded) when the profile is omnivore and has not opted
// in. Vegetarian/vegan profiles, or an explicit "include plant proteins" opt-in, restore full weight.
export const SUBSTITUTE_PROTEIN_WEIGHT_OMNIVORE = 0.08;
// Substitute-protein detection tokens (matched against ingredient ids). Soy SAUCE/miso are intentionally
// NOT here - they are seasonings in many omnivore dishes; only primary plant-protein analogues count.
export const SUBSTITUTE_PROTEIN_TOKENS = ['tofu', 'tempeh', 'seitan', 'edamame'] as const;
// Dominant-ingredient throttle: how often one primary-protein ingredient (e.g. salmon) may recur across a
// 7-day plan before its recipes are heavily down-weighted (soft, never a hard block).
export const PROTEIN_VARIETY_CAP_PER_WEEK = 3;
export const PROTEIN_THROTTLE_WEIGHT = 0.05;

// --- high-protein snack round-out (Mikael's high-protein/low-cal request, 2026-06-18) --------------
// A snack counts as a protein top-up lever when it delivers a meaningful protein bump without becoming a
// meal. Definition + sizing: roughly 15-30 g protein and at most ~250 kcal. The planner uses this to lift
// a protein-short day (especially the high-protein + low-calorie combo, where you cannot just add food).
export const PROTEIN_SNACK_MIN_G = 15;
export const PROTEIN_SNACK_MAX_KCAL = 250;

// --- portion caps -----------------------------------------------------------
export const PROTEIN_MAIN_PORTION_CAP_G = 250; // cooked protein source per main serving
export const PROTEIN_SNACK_CAP_G = 60;         // protein source per snack serving
export const PROTEIN_SHAKE_CAP_PER_DAY = 1;    // at most one protein-shake recipe per day

// --- child / household portion factor (scale of an adult serving) -----------
export const CHILD_PORTION_FACTOR = { min: 0.3, max: 1.0 } as const;

// --- swap macro tolerance by ingredient role (relative distance allowed) ----
export const SWAP_TOLERANCE: Record<string, number> = {
	protein: 0.25, carb: 0.3, fat: 0.3, dairy: 0.3, legume: 0.3,
	vegetable: 0.5, fruit: 0.5, other: 0.5, seasoning: 1, liquid: 1
};

// --- meal-slot label keys (named style), in serving order, up to 8 ----------
// i18n keys; the actual 4-language names live in i18n.ts (planning section 29 / Phase 12).
export const MEAL_SLOT_KEYS = [
	'meal_breakfast', 'meal_second_breakfast', 'meal_elevenses', 'meal_lunch',
	'meal_afternoon_snack', 'meal_dinner', 'meal_supper', 'meal_late_snack'
] as const;

// --- age-aware protein floor (g/kg) -----------------------------------------
// Older adults need more protein to offset sarcopenia; this is a soft FLOOR added on top of the goal
// band, never a reduction. Returns the per-kg floor for the age.
export function proteinFloorPerKg(age: number): number {
	if (age >= 65) return 1.2;
	if (age >= 50) return 1.0;
	return 0; // younger adults: the goal band already governs
}

// --- soft daily micro targets by age / sex / pregnancy ----------------------
// Keys match IngredientMicros so the planner can sum recipe micros against them. SOFT targets only.
export type MicroTargets = {
	potassium_mg: number; calcium_mg: number; iron_mg: number; magnesium_mg: number;
	zinc_mg: number; vitamin_c_mg: number; vitamin_d_ug: number; vitamin_b12_ug: number;
	folate_ug: number;
};

export function microTargetsFor(age: number, sex: Sex, pregnant: boolean): MicroTargets {
	// Each target is the HIGHER of the US (NIH RDA/AI) and Nordic (NNR 2023 RI/AI) recommendation for the
	// person's sex / age / pregnancy. Sources: NIH Office of Dietary Supplements; Nordic Nutrition
	// Recommendations 2023. Soft references for a general wellness tool, never medical advice.
	const female = sex === 'female';
	const t: MicroTargets = {
		potassium_mg: 3500,                                            // NNR 3500 (> US AI)
		calcium_mg: (female && age >= 51) || age >= 71 ? 1200 : 1000,  // US (> NNR 950)
		iron_mg: pregnant ? 27 : female && age < 51 ? 18 : 9,          // US premeno F 18 / preg 27; NNR M + post-meno F 9
		magnesium_mg: female ? 320 : 420,                              // US (> NNR 300/350)
		zinc_mg: pregnant ? 11 : female ? 9.7 : 12.7,                  // NNR 9.7/12.7 (> US 8/11); US preg ~11
		vitamin_c_mg: pregnant ? 100 : female ? 95 : 110,              // NNR 95/110 (> US 75/90); preg ~100
		vitamin_d_ug: age >= 70 ? 20 : 15,                             // US 15 adults / 20 for 70+ (> NNR 10)
		vitamin_b12_ug: pregnant ? 4.5 : 4,                            // NNR 4 (> US 2.4); preg 4.5
		folate_ug: pregnant ? 600 : 400                                // US 400 / 600 preg (> NNR 330)
	};
	return t;
}

// --- bundle budget ----------------------------------------------------------
// Initial public-page JS ceiling (KB, gzipped) for light pages that must NOT pull in the food system.
// Re-measured and tightened in Phase 12 once the generated modules' real cost is known.
export const BUNDLE_BUDGET_KB = { lightPageInitialJs: 180, recipeBrowseInitialJs: 260 } as const;

// --- plan-quality scorer weights (planning/44 + report section 9A) -----------
// Used by src/lib/nutrition/score.ts (scoreWeek). Mikael's policy 2026-06-20: HARD calorie band, soft rest.
// `bandExceed` is the hard guardrail - weighted so large that no soft gain can ever offset a band violation
// (the Stage 2 validator ALSO asserts the band as a true throw). Everything else is soft + tiered; trades
// happen via these weights. INITIAL values: tunable, test-driven, and validated by the Stage 2.5 shadow
// comparison before any UI wiring. Lower score = better; each weight multiplies a normalized [0..] penalty.
export const SCORE_WEIGHTS = {
	// Tier 1 - calorie (band hard, centering soft)
	bandExceed: 100000,    // per unit of fractional overshoot beyond the band; effectively hard
	calorieCenter: 60,     // prefer days near target, not just barely inside the band
	// Tier 2 - protein floor (age-aware)
	proteinShort: 1200,
	// Tier 3 - weekly micro adequacy
	microShort: 800,       // below target x7
	microExcessUL: 1500,   // above a food-relevant UL x7 (worse than a shortfall)
	// Tier 4 - macros
	carbCeiling: 200,
	fatTarget: 80,
	fibreShort: 120,
	// Tier 5 - variety + naturalness
	withinDayRepeat: 400,  // a recipe twice in one day (also a hard zero elsewhere); heavy
	dominantProtein: 60,   // one primary protein past PROTEIN_VARIETY_CAP_PER_WEEK
	omnivoreSubstitute: 40,// vegan substitute-protein dish for an omnivore default
	weekRepeat: 120,       // low distinct-recipe variety across the week
	addOn: 8               // prefer fewer bolt-on foods (raise a dish over piling on extras)
} as const;

// --- optimizer search config (planning/44 + report section 9A) -----------------------------------
// Deterministic, capped local search in src/lib/engine/optimizer.ts. No RNG in the Stage 2 core (greedy
// steepest-descent); seeded kicks can be added later. Tunable + shadow-validated.
export const OPTIMIZER = {
	maxIters: 200,         // hard cap on accepted improving steps (termination guard; rarely reached)
	epsilon: 1e-6,         // a move must beat the current score by more than this to be accepted
	servingMin: 0.5,
	servingMax: 4,         // matches the planWeek main-dish raise cap
	calciumGrams: 200,     // one ~200 ml glass of milk per calcium move (matches micro-topup)
	microCloseEnough: 0.9, // a weekly micro at >= 90% of target x7 is "covered" (matches micro-topup)
	swapCandidates: 4       // recipe-swap move: same-mealtime alternatives tried per slot (perf bound)
} as const;

/**
 * Household-aware per-dish serving cap (planning/56 HH3). SOLO uses OPTIMIZER.servingMax (4). A household
 * cooks ONE shared menu, so a single dish may scale to that many servings PER adult-equivalent
 * (householdScale = targetKcal / soloTarget). This lets the shared menu actually reach the household calorie
 * target instead of plateauing at the solo 4-serving cap (which under-delivered large households down to ~50%),
 * while keeping the PER-PERSON serving (total / scale) realistic at <= servingMax. Solo (scale <= 1) is
 * byte-identical. Used by planWeek/batchPlanWeek (init + raise caps), optimizeWeek's validator, and the
 * nudge move generator so every cap site agrees.
 */
export const householdServingCap = (householdScale = 1): number =>
	OPTIMIZER.servingMax * Math.max(1, householdScale || 1);

// --- responsible auto-supplement set (2026-06-20) -------------------------------------------------
// The optimizer adds a supplement line ONLY for these micros, and only doses the weekly GAP (not a full
// RDA per day). Deliberately excluded: calcium (food-only, via milk) and magnesium / folate / potassium -
// these are food nutrients the plan should FLAG (yellow weekly cell) rather than pill-push. Routinely
// supplementing them is unnecessary, and a full-RDA magnesium pill exceeds magnesium's 350 mg supplemental
// UL. Supplemented micros are the evidence-based, supplement-form-sensible ones with tracked food ULs.
export const SUPPLEMENTABLE_MICROS: readonly (keyof MicroTargets)[] = [
	'vitamin_d_ug', 'vitamin_b12_ug', 'iron_mg', 'zinc_mg', 'vitamin_c_mg'
];
