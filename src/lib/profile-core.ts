// Pure profile logic (planning section 6) - types, defaults, migration. No runes, no $app imports, so it
// is unit-testable in the node vitest environment. The reactive shared store lives in profile.svelte.ts
// and wraps this. SSR-safe by construction (nothing here touches localStorage or the DOM).

import type { Profile as WorkoutProfile } from './engine/engine';
import type { Sex, NutritionGoalId } from './content/data';

// Bump when the shape changes in a way that needs migration. Old blobs (no version) are treated as v0
// and merged over defaults.
// v3: added breastfeeding + override targets (kcal/protein/carb/fat/water) + HouseholdMember.type.
export const SCHEMA_VERSION = 3;

export type DietaryFilter =
	| 'vegetarian' | 'vegan' | 'noRedMeat' | 'noPork' | 'noFish'
	| 'glutenFree' | 'lactoseFree' | 'dairyFree' | 'nutFree' | 'soyFree';

export type FodmapLevel = 'off' | 'gentle' | 'strict';
export type MealLabelStyle = 'named' | 'numbered';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type MemberType = 'adult' | 'teen' | 'child';

// Representative age per member type, used for the age-banded household energy (engine memberKcal stays
// age-based, so existing households are unaffected). Babies/infants are intentionally not a type.
export const MEMBER_TYPE_AGE: Record<MemberType, number> = { adult: 35, teen: 15, child: 8 };

/** Derive a member type from an age band (used when migrating legacy free-form ages). */
export function memberTypeOf(age: number): MemberType {
	if (age >= 18) return 'adult';
	if (age >= 13) return 'teen';
	return 'child';
}

export interface HouseholdMember {
	id: string;
	label: string;
	age: number;
	type?: MemberType; // add-by-type UX; maps to a representative age band. Derived from age if absent.
	sex?: Sex;
	weightKg?: number;
	heightCm?: number;
	activity?: ActivityLevel;
	goal?: NutritionGoalId; // adults only; minors never get a deficit goal
}

// The full profile: every workout field (from the engine contract) PLUS the food-planner fields and
// deterministic planning seeds. Assignable to the engine's Profile (structural superset).
export interface FullProfile extends WorkoutProfile {
	// Food planner
	mealsPerDay: number; // 1..8
	dietaryFilters: DietaryFilter[];
	fodmap: FodmapLevel;
	alcoholFree: boolean;
	mealLabels: MealLabelStyle;
	household: HouseholdMember[];
	dislikedIngredientIds: string[];
	dislikedRecipeIds: string[];
	// Default plans are omnivore: vegan substitute proteins (tofu/tempeh/seitan/edamame mains) are
	// down-weighted unless the profile is vegetarian/vegan OR this opt-in is set (then full weight).
	includePlantProteins: boolean;
	// Iron preference (female profiles). When true, the planner works EXTRA hard to choose iron-rich meals
	// and NEVER adds an iron supplement (some people find iron pills hard on the stomach). When false
	// (default), an iron supplement is added if the week falls short. Menstruating women need ~18 mg/day.
	preferIronFromFood: boolean;
	// B2 batch mode (planning/47). 'precise' = today's planWeek (one dish per slot, maximum variety).
	// 'batch' = Smart cooking: cook ~cookSessionsPerWeek real dishes/week in larger amounts, eat leftovers,
	// fill the rest with quick/no-cook items. Default stays 'precise' until the generator is validated (S6).
	cookingMode: 'precise' | 'batch';
	cookSessionsPerWeek: number; // batch target: ~2 (Minimal) / 4 (Balanced) / 6 (I enjoy cooking)
	// Meta + deterministic seeds
	schemaVersion: number;
	profileSeed: number;
	planSeedOffset: number;
}

export const DIETARY_VALUES: DietaryFilter[] = [
	'vegetarian', 'vegan', 'noRedMeat', 'noPork', 'noFish',
	'glutenFree', 'lactoseFree', 'dairyFree', 'nutFree', 'soyFree'
];

export function defaultProfile(): FullProfile {
	return {
		// Workout (mirrors the legacy generate-form defaults so behaviour is unchanged)
		age: 30,
		sex: 'unspecified',
		weightKg: 75,
		heightCm: 175,
		trainingGoal: 'general',
		nutritionGoal: 'maintain',
		experience: 'beginner',
		emphasis: 'balanced',
		split: 'auto',
		location: 'home',
		equipment: ['chair'],
		days: 3,
		minutes: 45,
		pregnant: false,
		postpartum: false,
		trimester: 2,
		breastfeeding: false,
		warmupStyle: 'stretch',
		easierOptions: false,
		// Food
		mealsPerDay: 3,
		dietaryFilters: [],
		fodmap: 'off',
		alcoholFree: false,
		mealLabels: 'named',
		household: [],
		dislikedIngredientIds: [],
		dislikedRecipeIds: [],
		includePlantProteins: false,
		preferIronFromFood: false,
		cookingMode: 'batch', // S6: Smart cooking is the default; Precise portions is opt-in via the toggle
		cookSessionsPerWeek: 4, // Balanced
		// Meta
		schemaVersion: SCHEMA_VERSION,
		profileSeed: 1,
		planSeedOffset: 0
	};
}

// --- migration / validation -------------------------------------------------

function num(v: unknown, fallback: number): number {
	return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
function strArray(v: unknown): string[] | undefined {
	return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : undefined;
}
function clampInt(v: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, Math.round(v)));
}

/**
 * Turn an arbitrary parsed blob into a valid FullProfile. Never throws: unknown/garbage shapes fall back
 * to defaults; wrong-typed fields are repaired. Handles legacy `vr-profile` (workout-only, no version).
 */
export function migrate(raw: unknown): FullProfile {
	const base = defaultProfile();
	if (!raw || typeof raw !== 'object') return base;
	const r = raw as Record<string, unknown>;
	const out: FullProfile = { ...base };
	const outRec = out as unknown as Record<string, unknown>;
	const baseRec = base as unknown as Record<string, unknown>;

	// Copy any known key whose value is present and roughly the right kind; drop everything else.
	for (const key of Object.keys(base)) {
		const v = r[key];
		if (v === undefined || v === null) continue;
		if (Array.isArray(baseRec[key])) {
			if (Array.isArray(v)) outRec[key] = v;
		} else if (typeof v === typeof baseRec[key]) {
			outRec[key] = v;
		}
	}

	// Repair / clamp the fields the engine + planner depend on.
	out.age = clampInt(num(out.age, base.age), 12, 100);
	// Clamp to sane positive ranges so a corrupt/zero stored value can never produce Infinity/NaN BMI/BMR.
	out.weightKg = Math.min(300, Math.max(30, num(out.weightKg, base.weightKg)));
	out.heightCm = Math.min(250, Math.max(100, num(out.heightCm, base.heightCm)));
	out.days = clampInt(num(out.days, base.days), 1, 7);
	out.minutes = clampInt(num(out.minutes, base.minutes), 10, 180);
	out.mealsPerDay = clampInt(num(out.mealsPerDay, base.mealsPerDay), 1, 8);
	if (out.trimester !== 1 && out.trimester !== 2 && out.trimester !== 3) out.trimester = base.trimester;
	if (out.fodmap !== 'off' && out.fodmap !== 'gentle' && out.fodmap !== 'strict') out.fodmap = base.fodmap;
	if (out.mealLabels !== 'named' && out.mealLabels !== 'numbered') out.mealLabels = base.mealLabels;
	if (out.cookingMode !== 'precise' && out.cookingMode !== 'batch') out.cookingMode = base.cookingMode;
	out.cookSessionsPerWeek = clampInt(num(out.cookSessionsPerWeek, base.cookSessionsPerWeek), 1, 7);

	// Filter the dietary array down to known values.
	const df = strArray(r.dietaryFilters) ?? [];
	out.dietaryFilters = df.filter((x): x is DietaryFilter => (DIETARY_VALUES as string[]).includes(x));
	out.dislikedIngredientIds = strArray(r.dislikedIngredientIds) ?? [];
	out.dislikedRecipeIds = strArray(r.dislikedRecipeIds) ?? [];

	// Household members, defensively normalized.
	out.household = Array.isArray(r.household)
		? (r.household as unknown[])
			.filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
			.map((m, i) => {
				const age = clampInt(num(m.age, 30), 1, 100);
				const type: MemberType = (m.type === 'adult' || m.type === 'teen' || m.type === 'child')
					? m.type : memberTypeOf(age);
				return {
					id: typeof m.id === 'string' ? m.id : 'm' + i,
					label: typeof m.label === 'string' ? m.label : 'Member ' + (i + 1),
					age,
					type,
					sex: m.sex === 'male' || m.sex === 'female' || m.sex === 'unspecified' ? m.sex : undefined,
					weightKg: typeof m.weightKg === 'number' && Number.isFinite(m.weightKg) ? m.weightKg : undefined,
					heightCm: typeof m.heightCm === 'number' && Number.isFinite(m.heightCm) ? m.heightCm : undefined,
					activity: m.activity === 'low' || m.activity === 'moderate' || m.activity === 'high' ? m.activity : undefined,
					goal: typeof m.goal === 'string' ? (m.goal as NutritionGoalId) : undefined
				};
			})
		: [];

	// Override targets (advanced): copy only finite positive numbers, drop garbage/undefined.
	const optNum = (v: unknown): number | undefined =>
		typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;
	out.kcalOverride = optNum(r.kcalOverride);
	out.proteinOverride = optNum(r.proteinOverride);
	out.carbOverride = optNum(r.carbOverride);
	out.fatOverride = optNum(r.fatOverride);
	out.waterOverride = optNum(r.waterOverride);
	out.breastfeeding = r.breastfeeding === true;

	// Optional waist measurement (enables waist-to-height). Not in defaultProfile, so the generic copy
	// loop above never carries it - preserve it explicitly here or it is silently lost on every reload.
	const waist = optNum(r.waistCm);
	if (waist !== undefined) out.waistCm = Math.min(200, Math.max(40, waist));

	out.profileSeed = num(out.profileSeed, base.profileSeed);
	out.planSeedOffset = num(out.planSeedOffset, base.planSeedOffset);
	out.schemaVersion = SCHEMA_VERSION;
	return out;
}

/** Parse a raw localStorage string into a valid profile. null/garbage/invalid JSON -> defaults. */
export function parseStored(raw: string | null): FullProfile {
	if (!raw) return defaultProfile();
	try { return migrate(JSON.parse(raw)); } catch { return defaultProfile(); }
}
