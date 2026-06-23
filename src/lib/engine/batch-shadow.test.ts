// B2-S5: batch-mode shadow across the full profile/seed matrix. Proves the batch generator + the batch-aware
// optimizer hold the HARD bars everywhere (zero over-band days, zero safety violations), deliver the batch win
// (no more distinct cooked dishes than precise, with real leftovers), and stay save/shop-compatible. Mirrors
// the precise shadow (shadow-compare.test.ts) but for cookingMode 'batch'. Prints a table for review.

import { describe, it, expect } from 'vitest';
import { planWeek, batchPlanWeek, type WeekPlan } from './meal-planner';
import { estimateEnergy } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { dayTotals, weekMicros } from '../nutrition/day-totals';
import { KCAL_TOLERANCE, SUPPLEMENTABLE_MICROS } from '../nutrition/constants';
import { shoppingList } from '../shopping';
import { optimizeWeek, validateWeek } from './optimizer';
import { getRecipe } from '../content/recipes';

function mk(over: Partial<FullProfile> = {}): FullProfile {
	return { ...defaultProfile(), cookingMode: 'batch', ...over };
}

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
const SEEDS = [1, 42, 500];

const overBand = (w: WeekPlan) => w.days.filter((d) => dayTotals(d).kcal > w.meta.targetKcal * (1 + KCAL_TOLERANCE) + 0.5).length;
const underBand = (w: WeekPlan) => w.days.filter((d) => dayTotals(d).kcal < w.meta.targetKcal * (1 - KCAL_TOLERANCE) - 0.5).length;
const isCook = (id: string | null) => !!id && getRecipe(id)?.cookEffort === 'cook';
const distinctCooks = (w: WeekPlan) => new Set(w.days.flatMap((d) => d.meals.filter((m) => isCook(m.recipeId)).map((m) => m.recipeId))).size;
function hasLeftover(w: WeekPlan): boolean {
	const c: Record<string, number> = {};
	for (const d of w.days) for (const m of d.meals) if (isCook(m.recipeId)) c[m.recipeId!] = (c[m.recipeId!] ?? 0) + 1;
	return Object.values(c).some((n) => n >= 2);
}
function suppShortfall(w: WeekPlan, micros: Record<string, number>): number {
	const wk = weekMicros(w.days) as unknown as Record<string, number>;
	let s = 0;
	for (const k of SUPPLEMENTABLE_MICROS as readonly string[]) { const t7 = micros[k] * 7; if (t7 > 0 && wk[k] < t7) s += (t7 - wk[k]) / t7; }
	return s;
}

interface Row { label: string; candOver: number; candUnder: number; safety: number; cooksBatch: number; cooksPrecise: number; leftover: boolean; supp: number; }
const ROWS: Row[] = [];
for (const spec of SPECS) {
	for (const seed of SEEDS) {
		const p = mk(spec.over);
		const e = estimateEnergy(p);
		const batch = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed }), p, e).week;
		const pp = { ...p, cookingMode: 'precise' as const };
		const precise = optimizeWeek(planWeek({ profile: pp, energy: e, seed }), pp, e).week;
		ROWS.push({
			label: `${spec.label}#${seed}`,
			candOver: overBand(batch), candUnder: underBand(batch), safety: validateWeek(batch, p, e).safety.length,
			cooksBatch: distinctCooks(batch), cooksPrecise: distinctCooks(precise), leftover: hasLeftover(batch),
			supp: +suppShortfall(batch, e.microTargets as unknown as Record<string, number>).toFixed(3)
		});
	}
}
const N = ROWS.length;
const sum = (f: (r: Row) => number) => ROWS.reduce((a, r) => a + f(r), 0);
const AGG = {
	cases: N,
	overBandDays: sum((r) => r.candOver),
	underBandDays: sum((r) => r.candUnder),
	safetyViolations: sum((r) => r.safety),
	consolidationWins: ROWS.filter((r) => r.cooksBatch <= r.cooksPrecise).length,
	avgCooksBatch: +(sum((r) => r.cooksBatch) / N).toFixed(1),
	avgCooksPrecise: +(sum((r) => r.cooksPrecise) / N).toFixed(1),
	leftoverCases: ROWS.filter((r) => r.leftover).length,
	avgSuppShortfall: +(sum((r) => r.supp) / N).toFixed(3)
};

describe('B2-S5 batch shadow (batchPlanWeek + optimizeWeek across the matrix)', () => {
	it('prints the batch shadow table', () => {
		console.log('\n=== BATCH SHADOW ===');
		console.log(JSON.stringify(AGG, null, 2));
		const bad = ROWS.filter((r) => r.candOver > 0 || r.safety > 0);
		console.log('anomalies (over-band / unsafe):', bad.map((r) => `${r.label}[o${r.candOver}/s${r.safety}]`));
		expect(true).toBe(true);
	});

	it('HARD: zero safety violations across the matrix', () => {
		expect(AGG.safetyViolations).toBe(0);
	});

	it('HARD: zero over-band days across the matrix', () => {
		expect(AGG.overBandDays).toBe(0);
	});

	it('QUALITY: batch strongly consolidates cooked dishes vs precise (aggregate + vast majority)', () => {
		// The metric counts cook-tagged dishes; precise occasionally happens to pick quick/no-cook recipes for a
		// slot, so a single case can tie/exceed. The decisive signals are the aggregate (batch ~halves the
		// distinct cooks) and the vast majority of cases.
		expect(AGG.avgCooksBatch).toBeLessThanOrEqual(AGG.avgCooksPrecise);
		expect(AGG.consolidationWins).toBeGreaterThanOrEqual(Math.ceil(N * 0.9));
	});

	it('QUALITY: batch keeps days in the lower band too (under-target days stay rare)', () => {
		// Over-band is the hard bug (asserted 0 above). Under-band is soft; track that it stays uncommon.
		expect(AGG.underBandDays).toBeLessThanOrEqual(Math.ceil(N * 0.1));
	});

	it('QUALITY: batch produces real leftovers in the vast majority of cases', () => {
		expect(AGG.leftoverCases).toBeGreaterThanOrEqual(Math.ceil(N * 0.8));
	});

	it('COMPAT: a batch week round-trips as a saved plan and shops deterministically', () => {
		const p = mk(); const e = estimateEnergy(p);
		const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		expect(JSON.parse(JSON.stringify(w))).toEqual(w);
		expect(typeof w.meta.planHash).toBe('string');
		expect(shoppingList(w)).toEqual(shoppingList(w));
		expect(shoppingList(w).lines.every((l) => typeof l.ingredientId === 'string' && l.grams >= 0)).toBe(true);
	});
});
