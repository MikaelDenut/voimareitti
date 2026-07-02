// Voimareitti deterministic generator. Pure functions: same profile -> same plan.
// An automatic tool that turns inputs into a suggestion; it does not gate or give advice.
//
// INPUT -> OUTPUT MAP (see ENGINE.md for the full write-up):
//   age, sex, weightKg, heightCm  -> BMR (Mifflin-St Jeor) -> energy + macro targets
//   daysPerWeek                   -> activity factor (energy) AND split + weekly volume spread
//   nutritionGoal                 -> calorie direction (deficit/maintenance/surplus) + protein band
//   trainingGoal                  -> reps, sets baseline, rest, tempo, effort (RIR), exercise scoring, cardio
//   experience                    -> sets baseline position + which exercises are allowed (difficulty gate)
//   emphasis                      -> +/- sets per exercise AND +/- number of exercises per session
//   split                         -> weekly structure (full-body / upper-lower / push-pull-legs / auto)
//   minutes/session               -> how many exercise slots fit (with rest time factored in)
//   equipment / location          -> exercises whose REQUIRED equipment the user actually owns
//   age / BMI (height+weight)     -> excludes exercises whose profile is unsuitable (ageMin / bmiMax)
//   effectiveness (profile)       -> ranks better exercises higher for the goal
//   pregnancy/trimester           -> moderate program, supine/prone exclusions, energy bump, no deficit

import {
	exercises, goals, nutritionGoals, emphases,
	dietPrinciples, foodGroups, supplements,
	expRank,
	type Exercise, type Goal, type NutritionGoal, type Emphasis,
	type GoalId, type NutritionGoalId, type EmphasisId, type SplitId,
	type Sex, type Experience, type Loc
} from '$lib/content/data';
import { profiles } from '$lib/content/profiles';
import { prenatalImages } from '$lib/content/exercise-images';
import {
	CARB_PHASE, CARB_CEILING_GPERKG, proteinFloorPerKg, microTargetsFor, KCAL_TOLERANCE,
	type MicroTargets
} from '$lib/nutrition/constants';

export interface Profile {
	age: number;
	sex: Sex;
	weightKg: number;
	heightCm: number;
	waistCm?: number; // optional - enables waist-to-height ratio
	trainingGoal: GoalId;
	nutritionGoal: NutritionGoalId;
	experience: Experience;
	emphasis: EmphasisId;
	split: SplitId;
	location: 'home' | 'gym';
	equipment: string[];
	days: number;
	minutes: number;
	pregnant: boolean;
	postpartum: boolean; // recently gave birth (conservative program, maintenance energy)
	trimester: 1 | 2 | 3;
	// Breastfeeding (female, not pregnant). Additive energy + water bump, mutually exclusive with
	// pregnancy (ignored when pregnant). undefined === false (today's behaviour, frozen fixtures unchanged).
	breastfeeding?: boolean;
	// Optional manual override targets (advanced). Each, when set, replaces its automatic value LAST,
	// clamped to a safe floor. undefined === automatic. Absent in all reference fixtures, so frozen.
	kcalOverride?: number;
	proteinOverride?: number;
	carbOverride?: number;
	fatOverride?: number;
	waterOverride?: number;
	// Warm-up preference. undefined === 'stretch' (today's behaviour, unchanged). 'active' = dynamic
	// drills, 'both' = a mix, 'mobility-only' = no strength sessions, just a mobility/stretch routine.
	warmupStyle?: 'stretch' | 'active' | 'both' | 'mobility-only';
	// Opt-in "show me easier options" toggle. Combined with the prefersEasier() heuristic, it biases
	// swap suggestions toward easier variations and surfaces modification tips more prominently.
	easierOptions?: boolean;
}

export interface EnergyResult {
	bmr: number;
	tdee: number;
	target: number;
	proteinLow: number;
	proteinHigh: number;
	fatG: number;
	carbG: number;
	fiberG: number;
	waterMl: number;
	// Set when a requested weight-loss deficit was withheld for safety (already underweight, or a young
	// teen still growing). The plan falls back to maintenance energy and the UI explains why.
	nutritionAdjusted?: 'underweight' | 'minor';
	// --- Phase 3 additive fields (food planner). Do NOT change the values above. ---
	// Age-aware daily protein target window [low, high] in g. Equals [proteinLow, proteinHigh] for younger
	// adults; the floor is raised for older adults (sarcopenia) - never lowered.
	proteinBand: [number, number];
	// Daily carbohydrate ceiling in g for the meal planner (cut/maintain phases). null = unrestricted
	// (bulk goal, pregnancy/postpartum, or a safety-adjusted minor).
	carbCeilingG: number | null;
	// Soft daily micronutrient targets (keys match IngredientMicros), by age/sex/pregnancy.
	microTargets: MicroTargets;
	// --- Theme 2 additive: richer daily water estimate (intensity + pregnancy/breastfeeding + age +
	// override aware). The frozen `waterMl` (weight x 33) above is left untouched. ---
	waterTargetMl: number;
	// Which targets the user has manually overridden (advanced). All false when fully automatic.
	overridden: { kcal: boolean; protein: boolean; carb: boolean; fat: boolean; water: boolean };
	// Set ONLY when manual overrides are physically infeasible (the mandatory macros need more kcal than the
	// calorie target). The UI uses this to BLOCK generation with a clear message. undefined = feasible.
	// Natural (no-override) profiles are always self-consistent, so this never fires for them.
	targetConflict?: { requiredKcal: number; targetKcal: number; proteinG: number; fatG: number; carbG: number };
}

export interface PlanItem {
	exercise: Exercise;
	sets: number;
	reps: string;
	restSec: number;
	tempo: string;
	uid?: string; // stable per-item id assigned by the UI for keying swap/remove (engine never sets it)
}

export type SessionKey = 'warmup' | 'cooldown' | 'session' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'birthprep';
export interface Session {
	title: string; // English fallback (PDF logic + tests)
	titleKey: SessionKey;
	n?: number;
	day: number; // 1-based day of the training week (0 = warm-up, shared by every day)
	items: PlanItem[];
}

export interface VolumeRow {
	muscle: string; // English key, localise with muscle()
	sets: number;
}

export type BmiCategory = 'under' | 'healthy' | 'over' | 'obese';
export interface BodyMetrics {
	bmi: number;
	bmiCategory: BmiCategory;
	weeklyChangeKg: number; // projected from the calorie target (negative = loss)
	fastPace: boolean; // |change| faster than ~1% of body weight per week
	waistRatio?: number; // waist-to-height, only when waist provided
	waistHigh?: boolean; // ratio >= 0.5
}

export interface Guidance {
	rir: Loc;
	tempo: string;
	progression: Loc;
	cardio: Loc;
	note: Loc;
	setsPerExercise: number;
	reps: string;
	restSec: number;
	weeklySets: number;
}

export interface Plan {
	trainingGoal: GoalId;
	nutritionGoal: NutritionGoalId;
	emphasis: EmphasisId;
	split: SplitId;
	resolvedSplit: Exclude<SplitId, 'auto'>;
	experience: Experience;
	prenatal: boolean;
	maxTier: number;
	energy: EnergyResult;
	body: BodyMetrics;
	warmup: Session;
	cooldown: Session;
	birthPrep?: Session; // trimester-weighted birth-prep block, only for pregnant users
	sessions: Session[];
	weeklyVolume: VolumeRow[];
	guidance: Guidance;
	diet: { principles: typeof dietPrinciples; groups: typeof foodGroups; energy: EnergyResult; nutrition: NutritionGoal };
	supplements?: typeof supplements;
	pullGap: boolean;
	mobilityOnly: boolean; // 'mobility-only' warm-up style: no strength sessions, just a movement routine
	easeLevel: number; // easeScore of the used profile (0 = no ease-in applied); drives the UI banner
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round = Math.round;

// Supine (on the back) and prone/plank moves to skip in pregnancy. The ball curl/bridge/stir-the-pot
// are supine or prone, so pregnant users get the seated/supported ball moves instead.
const PRENATAL_AVOID = new Set([
	'pushup', 'db-bench-press', 'plank',
	'ball-glute-bridge', 'ball-hamstring-curl', 'ball-stir-the-pot'
]);

const TIER: Record<string, number> = {
	none: 0, wall: 0, chair: 1, table: 1, 'water-bottles': 1, 'exercise-ball': 1,
	treadmill: 1, 'walking-pad': 1, 'exercise-bike': 1, 'rowing-machine': 1, dumbbell: 2,
	'resistance-band': 3, 'pull-up-bar': 3, 'adjustable-dumbbells': 4, bench: 4
};

export function maxTier(p: Profile): number {
	if (p.location === 'gym') return 5;
	return Math.max(0, ...p.equipment.map((id) => TIER[id] ?? 0));
}

// ---- Equipment ownership: select exercises whose REQUIRED equipment the user actually has ----
// Maps the profile's equipment labels to ownership tokens, then checks the user's owned set.
export const EQUIP_TOKEN: Record<string, string> = {
	None: '', Wall: 'wall', Chair: 'chair', Table: 'table', Bench: 'bench',
	Dumbbell: 'single-weight', Dumbbells: 'dumbbells', Kettlebell: 'single-weight',
	Barbell: 'barbell', Rack: 'barbell', 'Pull-up bar': 'pull-up-bar', 'Resistance band': 'band',
	'Cable machine': 'cable', Machine: 'machine', 'Ab wheel': 'ab-wheel', 'Exercise ball': 'ball',
	Treadmill: 'treadmill', 'Walking pad': 'walking-pad', 'Exercise bike': 'exercise-bike', 'Rowing machine': 'rowing-machine'
};
// Equipment tokens an exercise REQUIRES (derived from its profile labels). Shared with the library.
export function requiredTokens(id: string): string[] {
	const eq = profiles[id]?.equipment ?? [];
	return eq.map((l) => EQUIP_TOKEN[l] ?? '').filter(Boolean);
}
function ownedSatisfies(owned: Set<string>, token: string, gym: boolean): boolean {
	if (gym) return true;
	switch (token) {
		case 'wall': return true; // a wall / the floor is always available
		case 'single-weight': return owned.has('dumbbell') || owned.has('kettlebell') || owned.has('adjustable-dumbbells') || owned.has('water-bottles');
		case 'dumbbells': return owned.has('adjustable-dumbbells');
		case 'bench': return owned.has('bench');
		case 'barbell': return owned.has('barbell');
		case 'band': return owned.has('resistance-band');
		case 'pull-up-bar': return owned.has('pull-up-bar');
		case 'ab-wheel': return owned.has('ab-wheel');
		case 'ball': return owned.has('exercise-ball');
		case 'treadmill': return owned.has('treadmill');
		case 'walking-pad': return owned.has('walking-pad');
		case 'exercise-bike': return owned.has('exercise-bike');
		case 'rowing-machine': return owned.has('rowing-machine');
		case 'chair': return owned.has('chair');
		case 'table': return owned.has('table');
		case 'cable': case 'machine': return false; // gym only
		default: return false;
	}
}
export function hasEquipment(p: Profile, id: string): boolean {
	const gym = p.location === 'gym';
	const owned = new Set(p.equipment);
	// OR-alternatives: if the profile declares equipmentAny, every group must be satisfied by ANY
	// owned token in it (AND across groups, OR within a group). Otherwise fall back to the original
	// label-derived AND gate so untouched exercises behave byte-for-byte as before.
	const any = profiles[id]?.equipmentAny;
	if (any && any.length) {
		return any.every((group) => group.some((t) => ownedSatisfies(owned, t, gym)));
	}
	return requiredTokens(id).every((t) => ownedSatisfies(owned, t, gym));
}

function bmiOf(p: Profile): number {
	const h = p.heightCm / 100;
	return p.weightKg / (h * h);
}
// Profile-based suitability: excludes exercises the user does not fit (age / BMI).
export function suitable(p: Profile, id: string): boolean {
	const pr = profiles[id];
	if (!pr) return true;
	if (pr.ageMin && p.age < pr.ageMin) return false;
	if (pr.ageMax && p.age > pr.ageMax) return false;
	if (pr.bmiMax && bmiOf(p) > pr.bmiMax) return false;
	return true;
}
const eff = (id: string): number => profiles[id]?.effectiveness ?? 3;

// Pregnancy / postpartum safety predicate. Legacy avoid set PLUS metadata rules: supine/prone moves
// from the second trimester, high-impact in pregnancy, high-balance in the third trimester, and
// diastasis-caution core work postpartum. Returns false for everyone else (no effect). This closes the
// gap where supine/prone bodyweight moves (glute-bridge, crunch, etc.) were not excluded for pregnancy.
export function prenatalUnsafe(p: Profile, ex: Exercise): boolean {
	if (!p.pregnant && !p.postpartum) return false;
	if (PRENATAL_AVOID.has(ex.id)) return true;
	const pr = profiles[ex.id];
	if (!pr) return false;
	if (p.pregnant && p.trimester >= 2 && (pr.position === 'supine' || pr.position === 'prone')) return true;
	if (p.pregnant && pr.impact === 'high') return true;
	if (p.pregnant && p.trimester === 3 && pr.balanceDemand === 'high') return true;
	if (p.postpartum && pr.diastasisCaution) return true;
	return false;
}

// ---- Energy + macros ----
export function estimateEnergy(p: Profile): EnergyResult {
	const s = p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78;
	const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s;

	let af = clamp(1.3 + p.days * 0.06, 1.35, 1.75);
	if (p.trainingGoal === 'fat-loss') af += 0.05;
	const tdee = bmr * af;

	const h = p.heightCm / 100;
	const bmi = h > 0 ? p.weightKg / (h * h) : 0;

	const nutri = nutritionGoals.find((n) => n.id === p.nutritionGoal) ?? nutritionGoals[1];

	// Safety guard: a weight-loss deficit is NOT applied to someone already underweight (anorexic range)
	// or to a young teen still growing. We fall back to maintenance energy; the UI shows why.
	let nutritionAdjusted: 'underweight' | 'minor' | undefined;
	if (p.nutritionGoal === 'lose' && !p.pregnant && !p.postpartum) {
		if (bmi > 0 && bmi < 18.5) nutritionAdjusted = 'underweight';
		else if (p.age < 16) nutritionAdjusted = 'minor';
	}
	const effectiveAdjustPct = nutritionAdjusted ? 0 : nutri.calAdjustPct;

	let target: number;
	if (p.pregnant) {
		const bump = p.trimester === 3 ? 450 : p.trimester === 2 ? 340 : 0;
		target = tdee + bump; // never a deficit in pregnancy
	} else if (p.postpartum) {
		target = tdee; // maintenance while recovering / often breastfeeding - no deficit by default
	} else {
		target = tdee * (1 + effectiveAdjustPct / 100);
	}

	// Calorie floor: never dangerously low, and never below BMR while in a deficit.
	const sexFloor = p.sex === 'male' ? 1500 : p.sex === 'female' ? 1200 : 1300;
	target = Math.max(target, sexFloor);
	if (effectiveAdjustPct < 0) target = Math.max(target, bmr);

	// Breastfeeding (exclusive with pregnancy): add an energy increment and never a deficit. Only
	// fires when the flag is set, so all reference fixtures (flag false/undefined) are byte-identical.
	const breastfeeding = !!p.breastfeeding && !p.pregnant;
	if (breastfeeding) target = Math.max(target, tdee) + 450;

	// Protein scales on body weight, but for a high BMI we scale on a reference weight (BMI 27.5) so the
	// target stays realistic instead of demanding ~380 g for a very heavy user.
	const refWeight = bmi > 27.5 && h > 0 ? 27.5 * h * h : p.weightKg;
	const [pLo, pHi] = p.pregnant || p.postpartum || breastfeeding ? [1.6, 2.2] : nutri.proteinPerKg;
	const proteinLow = round(refWeight * pLo);
	const proteinHigh = round(refWeight * pHi);
	const fatG = Math.max(round((target * 0.25) / 9), round(p.weightKg * 0.6));
	const carbG = Math.max(0, round((target - proteinHigh * 4 - fatG * 9) / 4));
	const fiberG = round((target / 1000) * 14);
	const waterMl = round(p.weightKg * 33);

	// --- Phase 3 additive fields (do not affect any value above) ---
	// Age-aware protein band: raise the floor for older adults, never below the existing low.
	const ageFloor = round(refWeight * proteinFloorPerKg(p.age));
	const proteinBand: [number, number] = [Math.max(proteinLow, ageFloor), proteinHigh];

	// Carb ceiling: never cap minors (safety-adjusted), pregnancy/postpartum/breastfeeding, or a bulk goal.
	let carbCeilingG: number | null;
	if (p.pregnant || p.postpartum || breastfeeding || nutritionAdjusted === 'minor') {
		carbCeilingG = null;
	} else {
		const perKg = CARB_CEILING_GPERKG[CARB_PHASE[p.nutritionGoal]];
		carbCeilingG = perKg == null ? null : round(p.weightKg * perKg);
	}

	const microTargets = microTargetsFor(p.age, p.sex, p.pregnant);

	// --- Theme 2: richer daily water estimate (NEW field; frozen waterMl above is untouched) ---
	// Body-weight base + training load + pregnancy/breastfeeding + older-adult attention. A
	// clearly-labelled estimate, not medical advice.
	let waterTarget = waterMl + clamp(p.days, 0, 7) * 50;
	if (p.pregnant) waterTarget += 300;
	if (breastfeeding) waterTarget += 700;
	if (p.age >= 55) waterTarget += 250;
	let waterTargetMl = round(waterTarget / 10) * 10;

	// --- Theme 1.4: manual override targets, applied LAST, clamped to a safe floor. Each is undefined
	// in every reference fixture, so the frozen values are unaffected. ---
	let effTarget = target;
	let effProteinLow = proteinLow, effProteinHigh = proteinHigh;
	let effProteinBand: [number, number] = proteinBand;
	let effFatG = fatG, effCarbG = carbG;
	const overridden = { kcal: false, protein: false, carb: false, fat: false, water: false };
	if (p.kcalOverride && p.kcalOverride > 0) { effTarget = Math.max(round(p.kcalOverride), sexFloor); overridden.kcal = true; }
	if (p.proteinOverride && p.proteinOverride > 0) {
		const v = round(p.proteinOverride);
		effProteinLow = v; effProteinHigh = v; effProteinBand = [v, v]; overridden.protein = true;
	}
	if (p.carbOverride && p.carbOverride > 0) { effCarbG = Math.max(0, round(p.carbOverride)); overridden.carb = true; }
	if (p.fatOverride && p.fatOverride > 0) { effFatG = Math.max(0, round(p.fatOverride)); overridden.fat = true; }
	if (p.waterOverride && p.waterOverride > 0) { waterTargetMl = Math.max(0, round(p.waterOverride)); overridden.water = true; }

	// An override changes the energy/macro picture, so every NON-overridden target derived from the old
	// automatic values must be recomputed from the effective ones (2026-07 audit M-A). Otherwise a kcal
	// override of e.g. 1800 still reports fat/carb/fibre targets that sum to the old ~3000 kcal, the
	// overview shows impossible numbers, and the scorer chases them. Order: protein -> fat -> carb.
	// Only fires when an override is set, so all frozen fixtures (no overrides) stay byte-identical.
	let effFiberG = fiberG;
	if (overridden.kcal && !overridden.fat) {
		effFatG = Math.max(round((effTarget * 0.25) / 9), round(p.weightKg * 0.6));
	}
	if ((overridden.kcal || overridden.protein || overridden.fat) && !overridden.carb) {
		effCarbG = Math.max(0, round((effTarget - effProteinHigh * 4 - effFatG * 9) / 4));
	}
	if (overridden.kcal) effFiberG = round((effTarget / 1000) * 14);

	// Cross-field feasibility (custom-target hard block, planning/53 T1 + planning/54). The calories the plan
	// CANNOT avoid are the protein floor (always enforced) plus any EXPLICITLY pinned fat/carb override (the
	// user fixed those amounts; non-overridden fat/carb stay flexible and do not count). If those mandatory
	// macros need more than the calorie target (same slack as the plan's kcal band, KCAL_TOLERANCE), the
	// targets are physically impossible - flag it so the UI blocks generation. Only fires on a bad override combo.
	let targetConflict: EnergyResult['targetConflict'];
	if (overridden.kcal || overridden.protein || overridden.carb || overridden.fat) {
		const requiredKcal = effProteinBand[0] * 4 + (overridden.fat ? effFatG * 9 : 0) + (overridden.carb ? effCarbG * 4 : 0);
		if (requiredKcal > effTarget * (1 + KCAL_TOLERANCE)) {
			targetConflict = {
				requiredKcal: round(requiredKcal), targetKcal: round(effTarget),
				proteinG: effProteinBand[0], fatG: effFatG, carbG: effCarbG
			};
		}
	}

	return {
		bmr: round(bmr), tdee: round(tdee), target: round(effTarget),
		proteinLow: effProteinLow, proteinHigh: effProteinHigh, fatG: effFatG, carbG: effCarbG,
		fiberG: effFiberG, waterMl, nutritionAdjusted,
		proteinBand: effProteinBand, carbCeilingG, microTargets, waterTargetMl, overridden, targetConflict
	};
}

// ---- Body metrics (BMI + projected pace) derived from data we already collect ----
// All are simple screens, not diagnoses; the UI shows the limitations alongside.
export function bodyMetrics(p: Profile, energy: EnergyResult): BodyMetrics {
	const h = p.heightCm / 100;
	// Guard against a corrupt/zero height (would divide by zero -> Infinity). estimateEnergy guards the
	// same way; a 0 here only happens with bad stored data, never with a valid profile.
	const bmi = h > 0 ? Math.round((p.weightKg / (h * h)) * 10) / 10 : 0;
	const bmiCategory: BmiCategory = bmi < 18.5 ? 'under' : bmi < 25 ? 'healthy' : bmi < 30 ? 'over' : 'obese';
	// ~7700 kcal per kg of body mass; projects the chosen target vs maintenance.
	const weeklyChangeKg = Math.round((((energy.target - energy.tdee) * 7) / 7700) * 100) / 100;
	const fastPace = Math.abs(weeklyChangeKg) > p.weightKg * 0.01; // > 1% body weight / week
	const out: BodyMetrics = { bmi, bmiCategory, weeklyChangeKg, fastPace };
	// Waist-to-height is meaningless during pregnancy (the abdomen reflects the baby), so skip it.
	if (p.waistCm && p.waistCm > 0 && p.heightCm > 0 && !p.pregnant) {
		out.waistRatio = Math.round((p.waistCm / p.heightCm) * 100) / 100;
		out.waistHigh = out.waistRatio >= 0.5;
	}
	return out;
}

// ---- Program structure ----
const PAT = {
	full: ['squat', 'hinge', 'push-h', 'pull-h', 'push-v', 'lunge', 'core', 'calf'],
	upper: ['push-h', 'pull-h', 'push-v', 'pull-v', 'core', 'pull-h'],
	lower: ['squat', 'hinge', 'lunge', 'calf', 'core', 'squat'],
	push: ['push-h', 'push-v', 'push-h', 'core'],
	pull: ['pull-h', 'pull-v', 'pull-h', 'core'],
	legs: ['squat', 'hinge', 'lunge', 'calf', 'core']
} as const;

// Fallback movement patterns used to fill a slot whose own pattern has NO reachable exercise (e.g. a
// bodyweight/chair user has zero pull moves, so a PPL "Pull" day would otherwise come back empty). The
// substitute keeps the session full with the closest training stimulus (pull -> posterior-chain hinge, then
// core); it only fires when the primary pattern yields nothing, so any equipped profile - and every frozen
// reference fixture - is byte-for-byte unchanged. `pullGap` still flags so the "add a band/table" tip shows.
const FALLBACK_PATTERNS: Record<string, string[]> = {
	'pull-h': ['hinge', 'core', 'squat'],
	'pull-v': ['pull-h', 'core', 'hinge'],
	'push-v': ['push-h', 'core'],
	'push-h': ['push-v', 'core'],
	squat: ['lunge', 'hinge', 'core'],
	hinge: ['squat', 'lunge', 'core'],
	lunge: ['squat', 'hinge', 'core'],
	calf: ['squat', 'lunge', 'core'],
	core: ['hinge', 'squat']
};

export function resolveSplit(p: Profile): Exclude<SplitId, 'auto'> {
	if (p.split !== 'auto') return p.split;
	if (p.days <= 3) return 'full-body';
	if (p.days === 4) return 'upper-lower';
	return 'ppl';
}

function dayBlueprint(split: Exclude<SplitId, 'auto'>, days: number): { key: SessionKey; patterns: string[] }[] {
	const out: { key: SessionKey; patterns: string[] }[] = [];
	for (let d = 0; d < days; d++) {
		if (split === 'full-body') out.push({ key: 'session', patterns: [...PAT.full] });
		else if (split === 'upper-lower') out.push(d % 2 === 0 ? { key: 'upper', patterns: [...PAT.upper] } : { key: 'lower', patterns: [...PAT.lower] });
		else {
			const m = d % 3;
			out.push(m === 0 ? { key: 'push', patterns: [...PAT.push] } : m === 1 ? { key: 'pull', patterns: [...PAT.pull] } : { key: 'legs', patterns: [...PAT.legs] });
		}
	}
	return out;
}

type FitKey = 'strength' | 'hypertrophy' | 'fatLoss' | 'general';
function fitKey(g: GoalId): FitKey {
	return g === 'fat-loss' ? 'fatLoss' : g === 'strength' ? 'strength' : g === 'hypertrophy' ? 'hypertrophy' : 'general';
}

function baseSets(goal: Goal, exp: Experience): number {
	if (exp === 'beginner') return goal.sets[0];
	if (exp === 'advanced') return goal.sets[1];
	return Math.round((goal.sets[0] + goal.sets[1]) / 2);
}

// Seeded per-id rank for the regenerate tie-break. Only consulted when seed > 0, so the default
// (seed 0) leaves every existing/ frozen output byte-identical. Deterministic: same id + seed -> same.
function seededRank(id: string, seed: number): number {
	let h = (2166136261 ^ seed) >>> 0;
	for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
	return h >>> 0;
}

function buildProgram(p: Profile, seed = 0): { sessions: Session[]; pullGap: boolean; weeklyVolume: VolumeRow[]; guidance: Guidance } {
	const goal = goals.find((g) => g.id === p.trainingGoal) ?? goals[3];
	const emph = emphases.find((e) => e.id === p.emphasis) ?? emphases[1];
	const key = fitKey(p.trainingGoal);
	const prenatal = p.pregnant || p.postpartum;
	const easy = prefersEasier(p);
	const ease = easeScore(p);
	const easeActive = ease >= 1; // includes today's prefersEasier cohort (beginner/female/pregnant)
	const easeStrong = ease >= 4; // strong ease: also bias lower impact then lower balance demand

	// Knob 1 - starting volume: shed a set (then two) as ease rises, floored at 2. Pregnancy stays 2.
	const setsEase = ease >= 6 ? 2 : ease >= 3 ? 1 : 0;
	const setsPerExercise = prenatal ? 2 : clamp(baseSets(goal, p.experience) + emph.setsDelta - setsEase, 2, 5);
	const reps = prenatal ? '10-15' : `${goal.reps[0]}-${goal.reps[1]}`;
	// Knob 3 - more recovery as ease rises (+10 s/pt, max +60). Pregnancy stays 75.
	const restSec = prenatal ? 75 : goal.restSec + clamp(ease, 0, 6) * 10;
	const tempo = goal.tempo;

	// How many exercises fit the time? Rest length (intensity) and set count both matter.
	const perSlotSec = setsPerExercise * (40 + restSec);
	const availSec = p.minutes * 60 * 0.82; // ~18% for the warm-up and transitions
	// Knob 2 - session length. Honour a genuinely short request (ENG-3), and cap the slot count as ease
	// rises so eased users get a short, realistic session (this also fixes the old inversion where
	// pregnant / fat-loss users were handed 6-8 exercises).
	const minSlots = p.minutes <= 15 ? 2 : 3;
	let slots = clamp(Math.floor(availSec / perSlotSec) + emph.slotsDelta, minSlots, 8);
	if (ease > 0) {
		const slotCap = clamp(7 - Math.floor(ease / 2), 3, 8); // ease 2->6, 5->4, 7->3
		slots = clamp(Math.min(slots, slotCap), minSlots, 8);
	}

	const blueprint = dayBlueprint(resolveSplit(p), p.days);
	const weeklyUse: Record<string, number> = {};
	let pullGap = false;

	// Prenatal selection bias: within each slot prefer prenatal-illustrated (and prenatal-safe) moves
	// so pregnant users reliably see pregnant figures (0 = preferred). For non-prenatal users pre()
	// returns 1 for every id, so the ordering below is byte-for-byte unchanged.
	const pre = (id: string) => (prenatal && prenatalImages.has(id) ? 0 : 1);

	const sessions: Session[] = blueprint.map((day, idx) => {
		const usedHere = new Set<string>();
		const items: PlanItem[] = [];
		// extend the pattern list if we need more slots than the template lists
		const patterns: string[] = [];
		for (let i = 0; i < slots; i++) patterns.push(day.patterns[i % day.patterns.length]);

		// Best reachable exercise for a movement pattern (least-used-this-week first, then goal-fit, the ease
		// tie-breaks, effectiveness, and the seeded regenerate tie-break). Returns undefined when the pattern
		// has nothing reachable. Extracted so an empty slot can fall back to an alternative pattern below.
		const bestFor = (pat: string): Exercise | undefined => exercises
			.filter((e) =>
				e.pattern === pat &&
				hasEquipment(p, e.id) &&
				suitable(p, e.id) &&
				expRank(e.experienceMin) <= expRank(p.experience) &&
				!usedHere.has(e.id) &&
				!prenatalUnsafe(p, e)
			)
			// Rotate across the week first (least-used this week wins) so repeated split days
			// (e.g. two Push days) get DIFFERENT exercises; then by goal-fit, then effectiveness.
			.sort((a, b) =>
				(pre(a.id) - pre(b.id)) ||
				(weeklyUse[a.id] ?? 0) - (weeklyUse[b.id] ?? 0) ||
				b.fit[key] - a.fit[key] ||
				// Soft easier-bias: among equally-fitting moves, prefer lower-difficulty variations for
				// beginners / female / pregnant / postpartum / opt-in (prefersEasier). 0 otherwise -> unchanged.
				(easy ? expRank(a.experienceMin) - expRank(b.experienceMin) : 0) ||
				// Strong ease (older / high-BMI / pregnant / opt-in): also surface lower-impact then
				// lower-balance moves first. Gated above the plain beginner/female cohort so pinned
				// fixtures are unaffected; 0 for everyone else -> unchanged.
				(easeStrong ? impactRank(a) - impactRank(b) : 0) ||
				(easeStrong ? balanceRank(a) - balanceRank(b) : 0) ||
				eff(b.id) - eff(a.id) ||
				// Regenerate: a seeded tie-break only varies genuine ties (after fit/effectiveness),
				// so the program stays sensible but differs run-to-run. seed 0 -> 0 -> unchanged.
				(seed ? seededRank(a.id, seed) - seededRank(b.id, seed) : 0) ||
				a.id.localeCompare(b.id)
			)[0];

		for (const pat of patterns) {
			let ex = bestFor(pat);
			if (!ex) {
				if (pat === 'pull-h' || pat === 'pull-v') pullGap = true;
				// Slot empty (the user cannot reach this pattern, e.g. no pull move for a bodyweight user):
				// fill it with the closest available alternative so the session is not left blank. Only runs
				// when the primary pattern yields nothing, so equipped + frozen profiles are unchanged.
				for (const alt of FALLBACK_PATTERNS[pat] ?? []) {
					ex = bestFor(alt);
					if (ex) break;
				}
				if (!ex) continue;
			}
			usedHere.add(ex.id);
			weeklyUse[ex.id] = (weeklyUse[ex.id] ?? 0) + 1;
			items.push({ exercise: ex, sets: setsPerExercise, reps, restSec, tempo });
		}

		const labelN = day.key === 'session' ? idx + 1 : undefined;
		const title = day.key === 'session' ? `Session ${idx + 1}` : day.key[0].toUpperCase() + day.key.slice(1);
		return { title, titleKey: day.key, n: labelN, day: idx + 1, items };
	});

	// Weekly volume per muscle (sets x how often each exercise appears).
	const vol: Record<string, number> = {};
	let weeklySets = 0;
	for (const s of sessions) {
		for (const it of s.items) {
			weeklySets += it.sets;
			for (const m of it.exercise.primary) vol[m] = (vol[m] ?? 0) + it.sets;
		}
	}
	const weeklyVolume: VolumeRow[] = Object.entries(vol)
		.map(([muscle, sets]) => ({ muscle, sets }))
		.sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle))
		.slice(0, 8);

	const guidance: Guidance = {
		// Knob 4 - gentler effort + progression as ease rises (additive text, gated; unchanged at ease 0).
		rir: ease >= 3 ? EASE_RIR : goal.rir,
		tempo,
		progression: ease >= 1 ? EASE_PROGRESSION : goal.progression,
		cardio: goal.cardio, note: goal.note,
		setsPerExercise, reps, restSec, weeklySets
	};

	return { sessions, pullGap, weeklyVolume, guidance };
}

const WARMUP_POOL = ['cat-cow', 'thoracic-rotation', 'world-greatest-stretch', 'ninety-ninety-hip-switch'];
const COOLDOWN_POOL = ['childs-pose', 'downward-dog', 'hip-flexor-stretch', 'deep-squat-hold', 'thread-the-needle'];
// Dynamic / pulse-raising drills (PR-C). Used when the user opts into an active or mixed warm-up.
const ACTIVE_WARMUP_POOL = [
	'marching-in-place', 'arm-circles', 'hip-circles', 'leg-swings', 'torso-rotations', 'shoulder-rolls',
	'side-bends', 'ankle-circles', 'step-touch', 'standing-forward-bend', 'low-impact-jacks', 'inchworm-walkout',
	// cardio warm-ups: outdoor-walk needs nothing; the machine walks/spin/row appear only if owned (hasEquipment).
	'outdoor-walk', 'treadmill-walk', 'walking-pad-walk', 'stationary-bike-warmup', 'rowing-warmup'
];

// Warm-up source pool by preference. undefined === 'stretch' -> the original WARMUP_POOL (unchanged).
function warmupPool(p: Profile): string[] {
	switch (p.warmupStyle) {
		case 'active': return ACTIVE_WARMUP_POOL;
		case 'both':
		case 'mobility-only': return [...ACTIVE_WARMUP_POOL, ...WARMUP_POOL];
		default: return WARMUP_POOL; // undefined | 'stretch'
	}
}

// Deterministic per-profile seed so mobility picks vary between people (and every
// pool entry gets surfaced over time) while staying stable for the same profile.
function mobilitySeed(p: Profile): number {
	return p.days * 5 + Math.round(p.minutes / 15) + p.age + (p.sex === 'female' ? 2 : 0);
}

function pickMobility(p: Profile, pool: string[], count: number, offset: number): Exercise[] {
	const avail = pool
		.map((id) => exercises.find((e) => e.id === id))
		.filter((e): e is Exercise => !!e && hasEquipment(p, e.id) && suitable(p, e.id));
	if (avail.length === 0) return [];
	const start = ((offset % avail.length) + avail.length) % avail.length;
	const rotated = [...avail.slice(start), ...avail.slice(0, start)];
	return rotated.slice(0, count);
}

function buildWarmup(p: Profile): Session {
	// 'mobility-only' makes the warm-up the whole routine, so it gets more moves; otherwise unchanged.
	const count = p.warmupStyle === 'mobility-only'
		? clamp(Math.round(p.minutes / 8), 4, 8)
		: clamp(Math.round(p.minutes / 20), 2, 3);
	const items: PlanItem[] = pickMobility(p, warmupPool(p), count, mobilitySeed(p)).map((ex) =>
		ex.warmupType === 'cardio'
			? { exercise: ex, sets: 1, reps: '10-15 min', restSec: 0, tempo: 'easy' }
			: { exercise: ex, sets: 1, reps: '6-8', restSec: 0, tempo: 'slow' }
	);
	return { title: 'Warm-up', titleKey: 'warmup', day: 0, items };
}

function buildCooldown(p: Profile): Session {
	const count = clamp(Math.round(p.minutes / 25), 2, 3);
	// Different offset from warm-up so the two blocks do not march in lockstep.
	const items: PlanItem[] = pickMobility(p, COOLDOWN_POOL, count, mobilitySeed(p) + 2).map((ex) => ({ exercise: ex, sets: 1, reps: '20-40 s', restSec: 0, tempo: 'hold' }));
	return { title: 'Cool-down', titleKey: 'cooldown', day: 0, items };
}

// Trimester-weighted birth-preparation block for pregnant users. Picks the most relevant tagged moves
// (prenatalWeight) for the trimester; T1=1 move, T2=2, T3=3. Equipment/suitability/avoid filters run
// first (ball moves only if a ball is owned). Deterministic; absent for non-pregnant users.
function buildBirthPrep(p: Profile): Session | undefined {
	if (!p.pregnant) return undefined;
	const t = clamp(p.trimester, 1, 3);
	const avail = exercises.filter(
		(e) => e.prenatalWeight && hasEquipment(p, e.id) && suitable(p, e.id) && !prenatalUnsafe(p, e)
	);
	if (!avail.length) return undefined;
	const ranked = [...avail].sort(
		(a, b) => b.prenatalWeight![t - 1] - a.prenatalWeight![t - 1] || a.id.localeCompare(b.id)
	);
	const items: PlanItem[] = ranked.slice(0, clamp(t, 1, 4)).map((ex) => ({ exercise: ex, sets: 1, reps: '5-8', restSec: 0, tempo: 'gentle' }));
	return { title: 'Birth preparation', titleKey: 'birthprep', day: 0, items };
}

// Similar-exercise options for the swap control: same movement pattern, reachable equipment,
// allowed experience, not already used in that session. Ranked by goal fit.
// When easierFirst is set, lower-difficulty variations are ranked ahead of goal-fit (for beginners,
// pregnant/postpartum, and users who asked for easier options - see prefersEasier).
export function swapOptions(p: Profile, current: Exercise, excludeIds: string[], easierFirst = false): Exercise[] {
	const key = fitKey(p.trainingGoal);
	return exercises
		.filter((e) =>
			e.id !== current.id &&
			e.pattern === current.pattern &&
			hasEquipment(p, e.id) &&
			suitable(p, e.id) &&
			expRank(e.experienceMin) <= expRank(p.experience) &&
			!prenatalUnsafe(p, e) &&
			!excludeIds.includes(e.id)
		)
		.sort((a, b) =>
			(easierFirst ? expRank(a.experienceMin) - expRank(b.experienceMin) : 0) ||
			b.fit[key] - a.fit[key] || eff(b.id) - eff(a.id) || a.id.localeCompare(b.id)
		);
}

/** Reachable exercises for refilling an EMPTY session (2026-07 parity audit H3): the session's own
 *  movement patterns first (blueprint order), then their fallback patterns. Before this, a user who
 *  removed every exercise from a day had NO way to refill it short of regenerating (losing every other
 *  manual edit) - the add control needed a reference item that no longer existed. Additive helper only;
 *  buildProgram never calls it, so every frozen fixture is untouched. */
export function sessionFillOptions(p: Profile, titleKey: SessionKey, excludeIds: string[] = []): Exercise[] {
	const patMap: Record<string, readonly string[]> = {
		session: PAT.full, upper: PAT.upper, lower: PAT.lower, push: PAT.push, pull: PAT.pull, legs: PAT.legs
	};
	const base = patMap[titleKey] ?? PAT.full;
	const pats: string[] = [];
	for (const pat of base) if (!pats.includes(pat)) pats.push(pat);
	for (const pat of base) for (const fb of FALLBACK_PATTERNS[pat] ?? []) if (!pats.includes(fb)) pats.push(fb);
	const key = fitKey(p.trainingGoal);
	const out: Exercise[] = [];
	for (const pat of pats) {
		const cands = exercises
			.filter((e) =>
				e.pattern === pat && hasEquipment(p, e.id) && suitable(p, e.id) &&
				expRank(e.experienceMin) <= expRank(p.experience) && !prenatalUnsafe(p, e) &&
				!excludeIds.includes(e.id) && !out.some((x) => x.id === e.id)
			)
			.sort((a, b) => b.fit[key] - a.fit[key] || eff(b.id) - eff(a.id) || a.id.localeCompare(b.id));
		out.push(...cands);
	}
	return out;
}

// Heuristic for biasing toward easier variations: explicit opt-in, beginners, female users (on average
// lower upper-body strength), or pregnancy/postpartum. Only reorders + surfaces tips; never removes options.
export function prefersEasier(p: Profile): boolean {
	return !!p.easierOptions || p.experience === 'beginner' || p.sex === 'female' || p.pregnant || p.postpartum;
}

// ---- Aggressive, finely-graded "ease-in" ----
// Higher score = a lighter, easier START (lower volume + intensity, shorter session, more rest, gentler
// progression, easier / lower-impact moves first). The score is a pure function of the profile so the
// generator stays deterministic. It is 0 for a fit younger adult, so the pinned reference profile is
// unchanged byte-for-byte. NOTE: energy/nutrition is NOT eased here (a deficit must stay a real deficit);
// the underweight/minor guard lives in estimateEnergy.
export function easeScore(p: Profile): number {
	const h = p.heightCm / 100;
	const bmi = h > 0 ? p.weightKg / (h * h) : 0;
	// Age: per-decade gradient so 60 vs 70 vs 80 differ markedly.
	const agePts = p.age >= 80 ? 5 : p.age >= 70 ? 4 : p.age >= 60 ? 3 : p.age >= 50 ? 2 : p.age >= 40 ? 1 : 0;
	// BMI: heavier classes ease harder. (Underweight does NOT ease training - it is an energy concern.)
	const bmiPts = bmi >= 40 ? 3 : bmi >= 35 ? 2 : bmi >= 30 ? 1 : 0;
	const expPts = p.experience === 'beginner' ? 2 : 0; // deconditioned proxy
	const optPts = p.easierOptions ? 2 : 0; // explicit "show me easier options"
	const pregPts = p.pregnant || p.postpartum ? 2 : 0; // on top of the existing prenatal overrides
	return agePts + bmiPts + expPts + optPts + pregPts; // 0 .. 14
}

const RANK3: Record<string, number> = { low: 0, medium: 1, high: 2 };
const impactRank = (e: Exercise) => RANK3[profiles[e.id]?.impact ?? 'low'] ?? 0;
const balanceRank = (e: Exercise) => RANK3[profiles[e.id]?.balanceDemand ?? 'low'] ?? 0;

const EASE_RIR: Loc = {
	en: 'Easing in: leave 3-4 reps in reserve and do not train to failure for now.',
	fi: 'Kevyt aloitus: jätä 3-4 toistoa varaan, äläkä treenaa uupumukseen vielä.',
	hu: 'Könnyű ráhangolódás: hagyj 3-4 ismétlést tartalékban, és egyelőre ne eddz a kifáradásig.',
	sv: 'Mjuk start: lämna 3-4 repetitioner i reserv och träna inte till utmattning än.'
};
const EASE_PROGRESSION: Loc = {
	en: 'Progress slowly: add reps before load, and only add load once every set feels easy. Take a lighter week when you need it.',
	fi: 'Etene rauhassa: lisää ensin toistoja, painoa vasta kun kaikki sarjat tuntuvat helpoilta. Pidä kevyempi viikko tarvittaessa.',
	hu: 'Haladj lassan: előbb ismétléseket adj hozzá, terhelést csak akkor, ha minden sorozat könnyű. Tarts könnyebb hetet, amikor szükséged van rá.',
	sv: 'Öka långsamt: lägg till repetitioner före vikt, och öka vikten först när varje set känns lätt. Ta en lättare vecka vid behov.'
};

// Mobility options for swapping/adding warm-up or cool-down moves (pattern 'mobility'), least-used first.
export function mobilityOptions(p: Profile, excludeIds: string[]): Exercise[] {
	return exercises
		.filter((e) => e.pattern === 'mobility' && hasEquipment(p, e.id) && suitable(p, e.id) && !excludeIds.includes(e.id))
		.sort((a, b) => eff(b.id) - eff(a.id) || a.id.localeCompare(b.id));
}

export function generate(p: Profile, seed = 0): Plan {
	const energy = estimateEnergy(p);
	const mobilityOnly = p.warmupStyle === 'mobility-only';
	const prog = buildProgram(p, seed);
	// mobility-only: drop the strength sessions + weekly volume; keep the (expanded) warm-up + cooldown.
	const sessions = mobilityOnly ? [] : prog.sessions;
	const weeklyVolume = mobilityOnly ? [] : prog.weeklyVolume;
	const pullGap = mobilityOnly ? false : prog.pullGap;
	const guidance = mobilityOnly ? { ...prog.guidance, weeklySets: 0 } : prog.guidance;
	const nutrition = nutritionGoals.find((n) => n.id === p.nutritionGoal) ?? nutritionGoals[1];
	const supps = supplements.filter((s) => s.goals.includes(p.trainingGoal));
	return {
		mobilityOnly,
		trainingGoal: p.trainingGoal,
		nutritionGoal: p.nutritionGoal,
		emphasis: p.emphasis,
		split: p.split,
		resolvedSplit: resolveSplit(p),
		experience: p.experience,
		prenatal: p.pregnant || p.postpartum,
		maxTier: maxTier(p),
		energy,
		body: bodyMetrics(p, energy),
		warmup: buildWarmup(p),
		cooldown: buildCooldown(p),
		birthPrep: buildBirthPrep(p),
		sessions,
		weeklyVolume,
		guidance,
		diet: { principles: dietPrinciples, groups: foodGroups, energy, nutrition },
		supplements: p.pregnant || p.postpartum || mobilityOnly ? undefined : supps,
		pullGap,
		easeLevel: easeScore(p)
	};
}
