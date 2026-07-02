// ONE shared source for the nutrition-side label maps that used to be copy-pasted into
// NutritionPlanner, MealSnapshot, MealPrint and the recipe detail page - and had already drifted
// (HU Thursday 'Csü' vs 'Csüt'; three different Finnish terms for the same micros heading).
// 2026-07 parity audit M5. Pure data, no runes, unit-testable.
import type { Loc } from './content/data';
import { TRACKED_MICROS, type MicroKey } from './nutrition/day-totals';

/** Mon..Sun short day names (plan day 1 = Monday). */
export const DAY_NAMES: Loc[] = [
	{ en: 'Mon', fi: 'Ma', hu: 'Hét', sv: 'Mån' }, { en: 'Tue', fi: 'Ti', hu: 'Kedd', sv: 'Tis' },
	{ en: 'Wed', fi: 'Ke', hu: 'Sze', sv: 'Ons' }, { en: 'Thu', fi: 'To', hu: 'Csüt', sv: 'Tor' },
	{ en: 'Fri', fi: 'Pe', hu: 'Pén', sv: 'Fre' }, { en: 'Sat', fi: 'La', hu: 'Szo', sv: 'Lör' },
	{ en: 'Sun', fi: 'Su', hu: 'Vas', sv: 'Sön' }
];

/** Localized names of the 9 tracked micronutrients (facts labels, chips, popups, PDFs). */
export const MICRO_LABELS: Record<string, Loc> = {
	potassium_mg: { en: 'Potassium', fi: 'Kalium', hu: 'Kálium', sv: 'Kalium' },
	calcium_mg: { en: 'Calcium', fi: 'Kalsium', hu: 'Kalcium', sv: 'Kalcium' },
	iron_mg: { en: 'Iron', fi: 'Rauta', hu: 'Vas', sv: 'Järn' },
	magnesium_mg: { en: 'Magnesium', fi: 'Magnesium', hu: 'Magnézium', sv: 'Magnesium' },
	zinc_mg: { en: 'Zinc', fi: 'Sinkki', hu: 'Cink', sv: 'Zink' },
	vitamin_c_mg: { en: 'Vitamin C', fi: 'C-vitamiini', hu: 'C-vitamin', sv: 'C-vitamin' },
	vitamin_d_ug: { en: 'Vitamin D', fi: 'D-vitamiini', hu: 'D-vitamin', sv: 'D-vitamin' },
	vitamin_b12_ug: { en: 'Vitamin B12', fi: 'B12-vitamiini', hu: 'B12-vitamin', sv: 'B12-vitamin' },
	folate_ug: { en: 'Folate', fi: 'Folaatti', hu: 'Folát', sv: 'Folat' }
};

/** The canonical "Vitamins and minerals" sub-heading (was three different Finnish terms). */
export const MICROS_HEADING: Loc = {
	en: 'Vitamins and minerals', fi: 'Vitamiinit ja kivennäisaineet',
	hu: 'Vitaminok és ásványi anyagok', sv: 'Vitaminer och mineraler'
};

/** Tracked-micro render order (re-export so templates need one import). */
export const MIC: readonly MicroKey[] = TRACKED_MICROS;

/** Display unit of a tracked micro key. */
export const microUnit = (k: string): string => (k.endsWith('_ug') ? 'µg' : 'mg');

/** Tracked micro key -> its supplement illustration (static/img/supplements/<name>.webp). */
export const MICRO_IMG: Record<string, string> = {
	potassium_mg: 'potassium', calcium_mg: 'calcium', iron_mg: 'iron', magnesium_mg: 'magnesium',
	zinc_mg: 'zinc', vitamin_c_mg: 'vitamin-c', vitamin_d_ug: 'vitamin-d', vitamin_b12_ug: 'vitamin-b12', folate_ug: 'folate'
};
export const microImg = (k: string): string => `/img/supplements/${MICRO_IMG[k] ?? 'vitamin-d'}.webp`;

/** Localized dietary-filter labels (same wording as the ProfilePanel toggles) - used by the meal PDF's
 *  filter pills, which used to print raw ids like "noRedMeat" in every language (audit M6). */
export const DIET_LABELS: Record<string, Loc> = {
	vegetarian: { en: 'Vegetarian', fi: 'Kasvisruoka', hu: 'Vegetáriánus', sv: 'Vegetarisk' },
	vegan: { en: 'Vegan', fi: 'Vegaani', hu: 'Vegán', sv: 'Vegansk' },
	noRedMeat: { en: 'No red meat', fi: 'Ei punaista lihaa', hu: 'Vörös hús nélkül', sv: 'Inget rött kött' },
	noPork: { en: 'No pork', fi: 'Ei sianlihaa', hu: 'Sertés nélkül', sv: 'Inget fläsk' },
	noFish: { en: 'No fish', fi: 'Ei kalaa', hu: 'Hal nélkül', sv: 'Ingen fisk' },
	glutenFree: { en: 'Gluten-free', fi: 'Gluteeniton', hu: 'Gluténmentes', sv: 'Glutenfri' },
	lactoseFree: { en: 'Lactose-free', fi: 'Laktoositon', hu: 'Laktózmentes', sv: 'Laktosfri' },
	dairyFree: { en: 'Dairy-free', fi: 'Maidoton', hu: 'Tejmentes', sv: 'Mjölkfri' },
	nutFree: { en: 'Nut-free', fi: 'Pähkinätön', hu: 'Dióféle nélkül', sv: 'Nötfri' },
	soyFree: { en: 'Soy-free', fi: 'Soijaton', hu: 'Szójamentes', sv: 'Sojafri' }
};
export const ALCOHOL_FREE_LABEL: Loc = { en: 'Alcohol-free', fi: 'Alkoholiton', hu: 'Alkoholmentes', sv: 'Alkoholfri' };
export const FODMAP_LABELS: Record<string, Loc> = {
	gentle: { en: 'FODMAP gentle', fi: 'FODMAP kevyt', hu: 'FODMAP enyhe', sv: 'FODMAP mild' },
	strict: { en: 'FODMAP strict', fi: 'FODMAP tiukka', hu: 'FODMAP szigorú', sv: 'FODMAP strikt' }
};
