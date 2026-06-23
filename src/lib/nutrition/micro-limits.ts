// Official reference values for the 9 tracked micronutrients, used to flag the WEEKLY intake (not a single
// day) as low / good / high in the planner. Daily recommended targets come from microTargetsFor (RDA/AI by
// age/sex/pregnancy, already in constants.ts). Here we add the food-relevant Tolerable Upper Intake Level.
//
// Sources: NIH / IOM Dietary Reference Intakes (DRI) tables - elements + vitamins (National Academies),
// via NIH Office of Dietary Supplements. See planning notes.
//   Calcium UL 2500 mg, Iron 45 mg, Zinc 40 mg, Vitamin C 2000 mg, Vitamin D 100 ug (4000 IU).
//   FOOD-RELEVANT UL = null where the UL does NOT apply to food intake, so we never flag a food diet "too
//   high" for it: magnesium (UL 350 mg is supplemental magnesium ONLY), folate (UL 1000 ug is synthetic
//   folic acid / fortification ONLY), potassium and vitamin B12 (no UL established).

import type { MicroKey } from './day-totals';
import { microTargetsFor } from './constants';

export const MICRO_UL: Record<MicroKey, number | null> = {
	potassium_mg: null,   // no UL (AI-based; excess from food is excreted)
	calcium_mg: 2500,
	iron_mg: 45,
	magnesium_mg: null,   // UL 350 mg is for supplemental Mg only, not food
	zinc_mg: 25,    // NNR/EFSA 25 (more cautious than the US 40)
	vitamin_c_mg: 2000,
	vitamin_d_ug: 100,
	vitamin_b12_ug: null, // no UL
	folate_ug: null       // UL 1000 ug is for folic acid (supplements/fortification) only, not food folate
};

export type MicroBand = 'low-bad' | 'low' | 'good' | 'high' | 'high-bad';

/**
 * Band a WEEKLY micronutrient total against the recommended weekly range. Compared to 7x the daily target
 * (RDA/AI) at the bottom and 7x the food-relevant UL at the top:
 *   - high-bad (red, "too high"): above the weekly UL                       (only if a food UL exists)
 *   - high (yellow): in the top fifth approaching the UL
 *   - good (green): at/above the recommended target and within the safe range
 *   - low (yellow): a bit under the recommended target
 *   - low-bad (red, "too low"): well under (below ~70% of the target across the week)
 * Buffers (0.7 below, 0.8 toward the UL) are deliberately gentle so only a genuinely off WEEK is flagged.
 */
export function weeklyMicroBand(weekTotal: number, dailyTarget: number, ul: number | null): MicroBand {
	const wkTarget = dailyTarget * 7;
	if (ul != null) {
		const wkUl = ul * 7;
		if (weekTotal > wkUl) return 'high-bad';
		if (weekTotal >= wkUl * 0.8 && weekTotal >= wkTarget) return 'high';
	}
	if (wkTarget > 0 && weekTotal < wkTarget * 0.7) return 'low-bad';
	if (wkTarget > 0 && weekTotal < wkTarget) return 'low';
	return 'good';
}

/** Daily targets + food-relevant ULs for a profile (RDA/AI from microTargetsFor, UL from MICRO_UL). */
export function microLimits(age: number, sex: 'male' | 'female' | 'unspecified', pregnant: boolean) {
	const target = microTargetsFor(age, sex, pregnant);
	return { target, ul: MICRO_UL };
}
