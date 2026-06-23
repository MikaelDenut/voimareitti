import { describe, it, expect } from 'vitest';
import { planWeek, type WeekPlan } from './meal-planner';
import { estimateEnergy, type EnergyResult } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { applyMicroTopUps } from '../nutrition/micro-topup';
import { scoreWeek } from '../nutrition/score';
import { dayTotals, weekMicros } from '../nutrition/day-totals';
import { KCAL_TOLERANCE } from '../nutrition/constants';
import { MICRO_UL } from '../nutrition/micro-limits';
import { optimizeWeek, validateWeek } from './optimizer';
import { generateMoves } from '../nutrition/moves';

// Pin precise: these tests validate the PRECISE optimizer; batch has its own tests (batch-planner / batch-shadow).
function mk(over: Partial<FullProfile> = {}): FullProfile { return { ...defaultProfile(), cookingMode: 'precise', ...over }; }

interface Case { label: string; group: 'omni' | 'misc'; p: FullProfile; e: EnergyResult; warm: WeekPlan; opt: WeekPlan; baseline: WeekPlan; }

// Build the comparison matrix ONCE. warm = bare planWeek; opt = planWeek + optimizeWeek (the candidate);
// baseline = planWeek + applyMicroTopUps (today's pipeline). optimizeWeek + applyMicroTopUps do not mutate
// `warm` (optimizeWeek clones; baseline uses a clone), so warm stays the untouched reference.
const SPECS: { label: string; group: 'omni' | 'misc'; over: Partial<FullProfile>; seeds: number[] }[] = [
	{ label: 'cut-4meals', group: 'omni', over: { mealsPerDay: 4, nutritionGoal: 'lose', weightKg: 70 }, seeds: [1, 7, 42] },
	{ label: '5meals', group: 'omni', over: { mealsPerDay: 5, weightKg: 80 }, seeds: [2, 11] },
	{ label: 'vegan', group: 'misc', over: { dietaryFilters: ['vegan'] }, seeds: [5, 99] },
	{ label: 'dairyfree', group: 'misc', over: { dietaryFilters: ['dairyFree'] }, seeds: [3] },
	{ label: 'default', group: 'misc', over: {}, seeds: [42] }
];

const CASES: Case[] = [];
for (const spec of SPECS) {
	for (const seed of spec.seeds) {
		const p = mk(spec.over);
		const e = estimateEnergy(p);
		const warm = planWeek({ profile: p, energy: e, seed });
		const opt = optimizeWeek(warm, p, e).week;
		const baseline = (() => { const c = structuredClone(warm); applyMicroTopUps(c, p); return c; })();
		CASES.push({ label: `${spec.label}#${seed}`, group: spec.group, p, e, warm, opt, baseline });
	}
}
const OMNI = CASES.filter((c) => c.group === 'omni');
const VEGAN = CASES.filter((c) => c.label.startsWith('vegan'));

const overBandDays = (w: WeekPlan, target: number) =>
	w.days.filter((d) => dayTotals(d).kcal > target * (1 + KCAL_TOLERANCE) + 0.5).length;

describe('optimizeWeek - determinism + purity', () => {
	it('is deterministic and never mutates the warm start', () => {
		const c = CASES[0];
		const snap = JSON.stringify(c.warm);
		expect(optimizeWeek(c.warm, c.p, c.e).week).toEqual(optimizeWeek(c.warm, c.p, c.e).week);
		expect(JSON.stringify(c.warm)).toBe(snap);
	});
});

describe('optimizeWeek - never worse than the warm start', () => {
	it('score(optimized) <= score(warm) for every case', () => {
		for (const c of CASES) {
			const w = scoreWeek(c.warm, c.p, c.e).total;
			const o = scoreWeek(c.opt, c.p, c.e).total;
			expect(o, c.label).toBeLessThanOrEqual(w + 1e-6);
		}
	});
});

describe('optimizeWeek - hard constraints', () => {
	it('produces ZERO safety violations for every case', () => {
		for (const c of CASES) expect(validateWeek(c.opt, c.p, c.e).safety, c.label).toEqual([]);
	});

	it('never increases the number of out-of-band days vs the warm start', () => {
		for (const c of CASES) {
			const wB = validateWeek(c.warm, c.p, c.e).band.length;
			const oB = validateWeek(c.opt, c.p, c.e).band.length;
			expect(oB, c.label).toBeLessThanOrEqual(wB);
		}
	});
});

describe('optimizeWeek vs the current pipeline (the bug fix)', () => {
	it('candidate has ZERO over-band days where the baseline overshoots', () => {
		let baselineOver = 0, candidateOver = 0;
		for (const c of OMNI) {
			baselineOver += overBandDays(c.baseline, c.e.target);
			candidateOver += overBandDays(c.opt, c.e.target);
		}
		expect(baselineOver, 'baseline (planWeek + applyMicroTopUps) should overshoot - the bug').toBeGreaterThan(0);
		expect(candidateOver, 'candidate (planWeek + optimizeWeek) must not overshoot').toBe(0);
	});
});

describe('optimizeWeek - micro coverage still happens (vitamins still get added)', () => {
	it('covers a supplement-fixable shortfall: vegan B12 reaches target via a 0-kcal supplement', () => {
		expect(VEGAN.length).toBeGreaterThan(0);
		for (const c of VEGAN) {
			const got = weekMicros(c.opt.days).vitamin_b12_ug;
			const need = c.e.microTargets.vitamin_b12_ug * 7 * 0.9;
			expect(got, c.label).toBeGreaterThanOrEqual(need);
		}
	});
});

describe('validateWeek - catches planted hard violations', () => {
	it('flags a calcium supplement (forbidden) on an otherwise valid week', () => {
		const c = CASES[0];
		const bad = structuredClone(c.opt);
		bad.days[0].meals.push({
			slotKey: 'supplement', recipeId: null, servings: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
			additions: [{ kind: 'supplement', micro: 'calcium_mg', amount: 1000 }]
		});
		expect(validateWeek(bad, c.p, c.e).safety.some((s) => s.includes('calcium'))).toBe(true);
	});
});

describe('generateMoves', () => {
	it('returns feasible-shaped candidates and does not mutate the source', () => {
		const c = CASES[0];
		const snap = JSON.stringify(c.warm);
		const moves = generateMoves(c.warm, c.p, c.e);
		expect(moves.length).toBeGreaterThan(0);
		for (const m of moves) { expect(m.week.days.length).toBe(7); expect(typeof m.kind).toBe('string'); }
		expect(JSON.stringify(c.warm)).toBe(snap);
	});
});

describe('optimizeWeek - performance budget', () => {
	it('optimizes a week well within budget', () => {
		const p = mk({ mealsPerDay: 5, weightKg: 80 });
		const e = estimateEnergy(p);
		const warm = planWeek({ profile: p, energy: e, seed: 123 });
		const t0 = Date.now();
		optimizeWeek(warm, p, e);
		// Regression guard against a gross slowdown (a single Generate is ~1.5s warm). The ceiling is
		// generous because the full vitest suite runs files in parallel and saturates the CPU, which
		// can push this well past a tight bound on dev machines without any real perf change. Shared
		// CI runners are slower and noisier still (this once clocked ~4.3s on GitHub Actions), so the
		// ceiling is far higher under CI - there it only needs to catch a pathological regression.
		const budgetMs = process.env.CI ? 20000 : 4000;
		expect(Date.now() - t0).toBeLessThan(budgetMs);
	});
});

describe('optimizeWeek - micro safety rules (migrated from micro-topup, now on the optimizer path)', () => {
	function gen(over: Partial<FullProfile>) {
		const p = mk(over);
		const e = estimateEnergy(p);
		return optimizeWeek(planWeek({ profile: p, energy: e, seed: 5 }), p, e).week;
	}
	const supps = (w: WeekPlan) => {
		const s = new Set<string>();
		for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) if (a.kind === 'supplement') s.add(a.micro);
		return s;
	};
	const usesMilk = (w: WeekPlan) =>
		w.days.some((d) => d.meals.some((m) => (m.additions ?? []).some((a) => a.kind === 'ingredient' && a.ingredientId === 'milk')));

	it('never adds a calcium supplement; a vegan plan still gets a B12 or D supplement', () => {
		const s = supps(gen({ dietaryFilters: ['vegan'] }));
		expect(s.has('calcium_mg')).toBe(false);
		expect(s.has('vitamin_b12_ug') || s.has('vitamin_d_ug')).toBe(true);
	});

	it('never tops up calcium with milk on vegan / dairy-free / lactose-free / milk-avoided plans', () => {
		expect(usesMilk(gen({ dietaryFilters: ['vegan'] })), 'vegan').toBe(false);
		expect(usesMilk(gen({ dietaryFilters: ['dairyFree'] })), 'dairy-free').toBe(false);
		expect(usesMilk(gen({ dietaryFilters: ['lactoseFree'] })), 'lactose-free').toBe(false);
		expect(usesMilk(gen({ dislikedIngredientIds: ['milk'] })), 'milk avoided').toBe(false);
	});

	it('never adds an iron pill when preferIronFromFood is set', () => {
		expect(supps(gen({ sex: 'female', age: 30, preferIronFromFood: true })).has('iron_mg')).toBe(false);
	});

	it('supplement lines carry 0 kcal', () => {
		const w = gen({ dietaryFilters: ['vegan'] });
		for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) if (a.kind === 'supplement') expect(m.kcal).toBe(0);
	});

	it('never auto-supplements magnesium, folate, or potassium (food nutrients are flagged, not pilled)', () => {
		for (const seed of [1, 7, 42, 99]) {
			const p = mk({}); const e = estimateEnergy(p);
			const w = optimizeWeek(planWeek({ profile: p, energy: e, seed }), p, e).week;
			const s = supps(w);
			expect(s.has('magnesium_mg'), `seed ${seed}`).toBe(false);
			expect(s.has('folate_ug'), `seed ${seed}`).toBe(false);
			expect(s.has('potassium_mg'), `seed ${seed}`).toBe(false);
		}
	});

	it('keeps supplemented micros within their weekly UL (no unsafe overshoot)', () => {
		for (const seed of [1, 5, 7, 42, 99]) {
			const p = mk({ dietaryFilters: ['vegan'] }); const e = estimateEnergy(p);
			const w = optimizeWeek(planWeek({ profile: p, energy: e, seed }), p, e).week;
			const wk = weekMicros(w.days) as unknown as Record<string, number>;
			for (const k of supps(w)) {
				// Only micros WITH a food-relevant UL can overshoot unsafely; they must stay under the weekly UL.
				// No-UL micros (B12, folate, potassium, magnesium) can be food-rich, which is fine.
				const ul = (MICRO_UL as Record<string, number | null>)[k];
				if (ul != null) expect(wk[k], `${k} seed ${seed}`).toBeLessThanOrEqual(ul * 7);
			}
		}
	});
});

describe('optimizeWeek - tolerates a non-plain / proxy input (the "Generate does nothing" bug)', () => {
	// In the browser, generate() assigns the plan to a $bindable $state, so `week` is a deep Svelte 5 Proxy.
	// optimizeWeek used structuredClone(initial), which throws DataCloneError on state proxies -> generate()
	// threw -> the view never switched. These guard that optimizeWeek clones proxy-safely.
	it('works when the input is wrapped in a Proxy', () => {
		const p = mk(); const e = estimateEnergy(p);
		const proxied = new Proxy(planWeek({ profile: p, energy: e, seed: 3 }), {}) as WeekPlan;
		expect(() => optimizeWeek(proxied, p, e)).not.toThrow();
		expect(optimizeWeek(proxied, p, e).week.days.length).toBe(7);
	});

	it('works when the input is NOT structuredClone-able (carries a function prop, like a reactive object)', () => {
		const p = mk(); const e = estimateEnergy(p);
		const w = planWeek({ profile: p, energy: e, seed: 3 });
		(w as unknown as Record<string, unknown>).__reactive = () => {}; // structuredClone would throw on this
		expect(() => structuredClone(w)).toThrow();                      // confirms the old failure mode
		expect(() => optimizeWeek(w, p, e)).not.toThrow();               // the fix: JSON clone tolerates it
		expect(optimizeWeek(w, p, e).week.days.length).toBe(7);
	});
});

describe('batch mode awareness (B2-S3)', () => {
	const e = estimateEnergy(mk());
	// A week with the SAME recipe twice in one day (a leftover): a hard error in precise, the point in batch.
	function weekWithSameDayRepeat(): WeekPlan {
		const w = optimizeWeek(planWeek({ profile: mk(), energy: e, seed: 7 }), mk(), e).week;
		const m = w.days[0].meals.find((x) => x.recipeId);
		if (m) w.days[0].meals.push({ ...m });
		return w;
	}
	it('validateWeek: a within-day repeat is a safety violation in precise mode but allowed in batch', () => {
		const w = weekWithSameDayRepeat();
		expect(validateWeek(w, mk({ cookingMode: 'precise' }), e).safety.some((s) => s.includes('repeats within the day'))).toBe(true);
		expect(validateWeek(w, mk({ cookingMode: 'batch' }), e).safety.some((s) => s.includes('repeats within the day'))).toBe(false);
	});
	it('scoreWeek: batch mode does not penalize the intended repeat (variety term is lower)', () => {
		const w = weekWithSameDayRepeat();
		const vPrecise = scoreWeek(w, mk({ cookingMode: 'precise' }), e).terms.variety;
		const vBatch = scoreWeek(w, mk({ cookingMode: 'batch' }), e).terms.variety;
		expect(vBatch).toBeLessThan(vPrecise);
	});
});
