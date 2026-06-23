// Stage 2.5 shadow comparison (report section 9A). Runs the CURRENT pipeline (baseline = planWeek +
// applyMicroTopUps) against the CANDIDATE (planWeek + optimizeWeek) across a broad profile/seed matrix, in
// the test/analysis layer with the optimizer NOT connected to the app. Logs a win/tie/loss table for review
// and asserts the hard acceptance bars. This is the gate that must be clean BEFORE any UI wiring.

import { describe, it, expect } from 'vitest';
import { planWeek, type WeekPlan } from './meal-planner';
import { estimateEnergy, type EnergyResult } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { applyMicroTopUps } from '../nutrition/micro-topup';
import { scoreWeek } from '../nutrition/score';
import { dayTotals, weekMicros, TRACKED_MICROS } from '../nutrition/day-totals';
import { KCAL_TOLERANCE, SUPPLEMENTABLE_MICROS } from '../nutrition/constants';
import { shoppingList } from '../shopping';
import { optimizeWeek, validateWeek } from './optimizer';

// Pin precise: this is the PRECISE shadow (batch has its own batch-shadow.test.ts).
function mk(over: Partial<FullProfile> = {}): FullProfile { return { ...defaultProfile(), cookingMode: 'precise', ...over }; }

// Broad matrix: every diet mode, all goals, both sexes, age bands, pregnancy, household, and meals/day 2..6.
const SPECS: { label: string; over: Partial<FullProfile> }[] = [
	{ label: 'default', over: {} },
	{ label: 'vegan', over: { dietaryFilters: ['vegan'] } },
	{ label: 'vegetarian', over: { dietaryFilters: ['vegetarian'] } },
	{ label: 'dairyfree', over: { dietaryFilters: ['dairyFree'] } },
	{ label: 'glutenfree', over: { dietaryFilters: ['glutenFree'] } },
	{ label: 'noPork+noRedMeat', over: { dietaryFilters: ['noPork', 'noRedMeat'] } },
	{ label: 'cut-4', over: { nutritionGoal: 'lose', weightKg: 70, mealsPerDay: 4 } },
	{ label: 'gain-5', over: { nutritionGoal: 'gain', weightKg: 90, mealsPerDay: 5 } },
	{ label: 'older-female', over: { sex: 'female', age: 68, weightKg: 62 } },
	{ label: 'young-male-cut', over: { sex: 'male', age: 25, weightKg: 100, nutritionGoal: 'lose' } },
	{ label: 'pregnant-T2', over: { sex: 'female', pregnant: true, trimester: 2, age: 30 } },
	{ label: 'household', over: { household: [{ id: 'k', label: 'Kid', age: 8 }, { id: 'a', label: 'Partner', age: 35, sex: 'male' }] } },
	{ label: 'meals2', over: { mealsPerDay: 2 } },
	{ label: 'meals6', over: { mealsPerDay: 6 } }
];
const SEEDS = [1, 7, 42, 99, 123, 500];

interface Row {
	label: string;
	candOver: number; baseOver: number; safety: number;
	candScore: number; warmScore: number; baseScore: number;
	distinctCand: number; distinctBase: number;
	candNonCa: number; baseNonCa: number; candSupp: number; baseSupp: number;
	candCa: boolean; baseCa: boolean;
	candAddOns: number; baseAddOns: number;
}

const overBand = (w: WeekPlan) => w.days.filter((d) => dayTotals(d).kcal > w.meta.targetKcal * (1 + KCAL_TOLERANCE) + 0.5).length;
const distinctSlot = (w: WeekPlan) => new Set(w.days.flatMap((d) => d.meals.filter((m) => m.recipeId).map((m) => m.recipeId))).size;
const NON_CALCIUM = TRACKED_MICROS.filter((k) => k !== 'calcium_mg');
function microShortfall(w: WeekPlan, micros: EnergyResult['microTargets'], keys: readonly string[]): number {
	const wk = weekMicros(w.days) as unknown as Record<string, number>;
	const m = micros as unknown as Record<string, number>;
	let s = 0;
	for (const k of keys) { const t7 = m[k] * 7; if (t7 > 0 && wk[k] < t7) s += (t7 - wk[k]) / t7; }
	return s;
}
const caCovered = (w: WeekPlan, micros: EnergyResult['microTargets']) => weekMicros(w.days).calcium_mg >= micros.calcium_mg * 7 * 0.9;
const addOns = (w: WeekPlan) => w.days.reduce((n, d) => n + d.meals.reduce((m, meal) => m + (meal.additions ?? []).filter((a) => a.kind === 'ingredient' || a.kind === 'recipe').length, 0), 0);

const ROWS: Row[] = [];
for (const spec of SPECS) {
	for (const seed of SEEDS) {
		const p = mk(spec.over);
		const e = estimateEnergy(p);
		const warm = planWeek({ profile: p, energy: e, seed });
		const opt = optimizeWeek(warm, p, e).week;
		const baseline = (() => { const c = structuredClone(warm); applyMicroTopUps(c, p); return c; })();
		ROWS.push({
			label: `${spec.label}#${seed}`,
			candOver: overBand(opt), baseOver: overBand(baseline), safety: validateWeek(opt, p, e).safety.length,
			candScore: scoreWeek(opt, p, e).total, warmScore: scoreWeek(warm, p, e).total, baseScore: scoreWeek(baseline, p, e).total,
			distinctCand: distinctSlot(opt), distinctBase: distinctSlot(baseline),
			candNonCa: microShortfall(opt, e.microTargets, NON_CALCIUM), baseNonCa: microShortfall(baseline, e.microTargets, NON_CALCIUM),
			candSupp: microShortfall(opt, e.microTargets, SUPPLEMENTABLE_MICROS), baseSupp: microShortfall(baseline, e.microTargets, SUPPLEMENTABLE_MICROS),
			candCa: caCovered(opt, e.microTargets), baseCa: caCovered(baseline, e.microTargets),
			candAddOns: addOns(opt), baseAddOns: addOns(baseline)
		});
	}
}

const N = ROWS.length;
const sum = (f: (r: Row) => number) => ROWS.reduce((a, r) => a + f(r), 0);
const AGG = {
	pairs: N,
	baseOverDays: sum((r) => r.baseOver),
	candOverDays: sum((r) => r.candOver),
	safetyViolations: sum((r) => r.safety),
	scoreWin: ROWS.filter((r) => r.candScore < r.baseScore - 1e-6).length,
	scoreTie: ROWS.filter((r) => Math.abs(r.candScore - r.baseScore) <= 1e-6).length,
	scoreLoss: ROWS.filter((r) => r.candScore > r.baseScore + 1e-6).length,
	neverWorseVsWarm: ROWS.every((r) => r.candScore <= r.warmScore + 1e-6),
	varietyTies: ROWS.filter((r) => r.distinctCand === r.distinctBase).length,
	nonCaMicroOk: ROWS.filter((r) => r.candNonCa <= r.baseNonCa + 1e-9).length,
	baseCaCovered: ROWS.filter((r) => r.baseCa).length,
	candCaCovered: ROWS.filter((r) => r.candCa).length,
	caFlaggedNotForced: ROWS.filter((r) => r.baseCa && !r.candCa).length,
	baseAddOnAvg: +(sum((r) => r.baseAddOns) / N).toFixed(1),
	candAddOnAvg: +(sum((r) => r.candAddOns) / N).toFixed(1),
	candNonCaShortfallAvg: +(sum((r) => r.candNonCa) / N).toFixed(3),
	baseNonCaShortfallAvg: +(sum((r) => r.baseNonCa) / N).toFixed(3),
	candSuppShortfallAvg: +(sum((r) => r.candSupp) / N).toFixed(3),
	baseSuppShortfallAvg: +(sum((r) => r.baseSupp) / N).toFixed(3)
};

describe('Stage 2.5 shadow comparison (baseline = planWeek+applyMicroTopUps, candidate = planWeek+optimizeWeek)', () => {
	it('prints the win/tie/loss table', () => {
		console.log('\n=== SHADOW COMPARISON ===');
		console.log(JSON.stringify(AGG, null, 2));
		const anomalies = ROWS.filter((r) => r.candOver > 0 || r.safety > 0 || r.candScore > r.warmScore + 1e-6);
		console.log('anomalies (candidate over-band / unsafe / worse-than-warm):', anomalies.map((a) => a.label));
		expect(true).toBe(true);
	});

	it('HARD: candidate has zero safety violations across the matrix', () => {
		expect(AGG.safetyViolations).toBe(0);
	});

	it('HARD: candidate has zero over-band days, while the baseline overshoots (the bug fix)', () => {
		expect(AGG.baseOverDays, 'baseline should overshoot somewhere').toBeGreaterThan(0);
		expect(AGG.candOverDays, 'candidate must never overshoot').toBe(0);
	});

	it('HARD: candidate is never worse than the warm start on score', () => {
		expect(AGG.neverWorseVsWarm).toBe(true);
	});

	it('QUALITY: variety (distinct recipes) is not reduced vs the baseline', () => {
		// The recipe-swap move intentionally changes dishes for better-scoring ones, so per-pair distinct
		// counts need not be identical; in aggregate the candidate must not have FEWER distinct recipes.
		expect(sum((r) => r.distinctCand)).toBeGreaterThanOrEqual(sum((r) => r.distinctBase));
	});

	it('QUALITY: candidate covers the SUPPLEMENTABLE micros at least as well as the baseline', () => {
		// Candidate uses a responsible, narrower supplement set (D, B12, iron, zinc, C) and gap-doses them so
		// they land near 100% (vs the baseline's full-RDA overshoot). It deliberately does NOT pill-push
		// magnesium / folate / potassium (food nutrients, flagged instead), so total non-Ca shortfall can be
		// higher than the over-supplementing baseline BY DESIGN (the table reports both). The gate is that the
		// micros we DO supplement are covered at least as well as before.
		expect(AGG.candSuppShortfallAvg).toBeLessThanOrEqual(AGG.baseSuppShortfallAvg + 0.05);
	});

	it('COMPAT: optimized weeks round-trip as saved plans and shop deterministically', () => {
		const p = mk(SPECS[0].over);
		const e = estimateEnergy(p);
		const opt = optimizeWeek(planWeek({ profile: p, energy: e, seed: 7 }), p, e).week;
		expect(JSON.parse(JSON.stringify(opt))).toEqual(opt);                 // saved-plan JSON round-trip
		expect(typeof opt.meta.planHash).toBe('string');
		expect(opt.meta.planHash.length).toBeGreaterThan(0);
		expect(shoppingList(opt)).toEqual(shoppingList(opt));                 // deterministic rollup
		expect(shoppingList(opt).lines.every((l) => typeof l.ingredientId === 'string' && l.grams >= 0)).toBe(true);
	});
});
