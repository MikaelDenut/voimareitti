// C1 (audit + planning/50): batch leftover runs are capped at 3 consecutive days, lunch/dinner stay separate
// dishes, and the leftover badge = same dish, same slot, previous day (batch only). Regression net.
import { describe, it, expect } from 'vitest';
import { batchPlanWeek, planWeek, type WeekPlan } from './meal-planner';
import { estimateEnergy } from './engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { optimizeWeek } from './optimizer';
import { isLeftoverMeal, dayTotals } from '../nutrition/day-totals';
import { getRecipe } from '../content/recipes';

const MAIN_KEYS = new Set(['meal_lunch', 'meal_dinner']);
const mk = (o: Partial<FullProfile> = {}): FullProfile => ({ ...defaultProfile(), cookingMode: 'batch', ...o });
const isCook = (id: string | null | undefined) => !!id && getRecipe(id)?.cookEffort === 'cook';

/** Longest run of the same recipe on consecutive days within any MAIN slot (cooked leftovers). */
function maxMainRun(w: WeekPlan): number {
	let best = 0;
	for (const sk of MAIN_KEYS) {
		const seq = w.days.map((d) => d.meals.find((m) => m.slotKey === sk && m.recipeId)?.recipeId ?? null);
		let cur = 0;
		for (let i = 0; i < seq.length; i++) {
			if (seq[i] && seq[i] === seq[i - 1]) cur++; else cur = seq[i] ? 1 : 0;
			if (cur > best) best = cur;
		}
	}
	return best;
}
/** Fewest distinct cooked dishes across the main slots that actually carry cook-tagged dishes. */
function minDistinctCooksPerMainSlot(w: WeekPlan): number {
	const bySlot = new Map<string, Set<string>>();
	for (const d of w.days) for (const m of d.meals)
		if (MAIN_KEYS.has(m.slotKey) && isCook(m.recipeId)) {
			if (!bySlot.has(m.slotKey)) bySlot.set(m.slotKey, new Set());
			bySlot.get(m.slotKey)!.add(m.recipeId!);
		}
	const sizes = [...bySlot.values()].map((s) => s.size);
	return sizes.length ? Math.min(...sizes) : 0;
}
function distinctCooks(w: WeekPlan): number {
	return new Set(w.days.flatMap((d) => d.meals.filter((m) => isCook(m.recipeId)).map((m) => m.recipeId))).size;
}

const SPECS: { label: string; over: Partial<FullProfile> }[] = [
	{ label: 'omnivore', over: {} },
	{ label: 'vegetarian', over: { dietaryFilters: ['vegetarian'] } },
	{ label: 'vegan', over: { dietaryFilters: ['vegan'] } },
	{ label: 'dairyFree', over: { dietaryFilters: ['dairyFree'] } },
	{ label: 'glutenFree', over: { dietaryFilters: ['glutenFree'] } },
	{ label: 'noPork+noRedMeat', over: { dietaryFilters: ['noPork', 'noRedMeat'] } },
	{ label: 'lose', over: { nutritionGoal: 'lose', weightKg: 80 } },
	{ label: 'gain', over: { nutritionGoal: 'gain', weightKg: 95 } },
	{ label: 'mpd1', over: { mealsPerDay: 1 } },
	{ label: 'mpd2', over: { mealsPerDay: 2 } },
	{ label: 'mpd5', over: { mealsPerDay: 5 } },
	{ label: 'mpd8', over: { mealsPerDay: 8 } },
	{ label: 'pregnant', over: { sex: 'female', pregnant: true, trimester: 2 } },
	{ label: 'household', over: { household: [{ id: 'k', label: 'K', age: 8 }, { id: 'p', label: 'P', age: 35, sex: 'male' }] } },
];
const SEEDS = [1, 7, 42, 123, 500];

describe('C1 - batch leftover 3-day cap', () => {
	it('no cooked dish is eaten more than 3 consecutive days in a main slot (when >=2 distinct cooks exist)', () => {
		for (const spec of SPECS) for (const seed of SEEDS) {
			const p = mk(spec.over); const e = estimateEnergy(p);
			const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed }), p, e).week;
			// Guard: an extreme diet may offer <2 cookable mains, where the cap is physically impossible.
			if (minDistinctCooksPerMainSlot(w) >= 2) expect(maxMainRun(w), `${spec.label}#${seed}`).toBeLessThanOrEqual(3);
		}
	});

	it('the old 4+ day run is gone for the default profile (was: same dish Mon-Thu)', () => {
		for (const seed of SEEDS) {
			const p = mk(); const e = estimateEnergy(p);
			const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed }), p, e).week;
			expect(maxMainRun(w), `default#${seed}`).toBeLessThanOrEqual(3);
		}
	});

	it('presets form a variety ladder (Minimal <= Balanced <= I-enjoy distinct cooked dishes)', () => {
		const distinctFor = (cs: number) => {
			const p = mk({ cookSessionsPerWeek: cs }); const e = estimateEnergy(p);
			return distinctCooks(optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week);
		};
		const mini = distinctFor(2), bal = distinctFor(4), enjoy = distinctFor(6);
		expect(mini).toBeLessThanOrEqual(bal);
		expect(bal).toBeLessThanOrEqual(enjoy);
		expect(enjoy).toBeGreaterThan(mini); // the ladder must actually differentiate
	});

	it('still produces real leftovers (each main cooked dish eaten >=2 days) for the default', () => {
		const p = mk(); const e = estimateEnergy(p);
		const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		const counts: Record<string, number> = {};
		for (const d of w.days) for (const m of d.meals) if (isCook(m.recipeId)) counts[m.recipeId!] = (counts[m.recipeId!] ?? 0) + 1;
		expect(Object.values(counts).some((n) => n >= 2)).toBe(true);
	});
});

describe('isLeftoverMeal (badge helper)', () => {
	it('flags a same-slot same-dish previous-day meal, never day 0', () => {
		const p = mk(); const e = estimateEnergy(p);
		const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		for (const m of w.days[0].meals) expect(isLeftoverMeal(w.days, 0, m)).toBe(false);
		let found = false;
		for (let i = 1; i < w.days.length; i++) for (const m of w.days[i].meals) {
			const prevHas = w.days[i - 1].meals.some((x) => x.slotKey === m.slotKey && x.recipeId === m.recipeId && m.recipeId);
			expect(isLeftoverMeal(w.days, i, m)).toBe(!!prevHas);
			if (prevHas) found = true;
		}
		expect(found).toBe(true); // batch must actually create at least one leftover
	});

	it('precise plans never have a same-slot consecutive repeat (badge stays batch-only in practice)', () => {
		const p = { ...defaultProfile(), cookingMode: 'precise' as const }; const e = estimateEnergy(p);
		const w = optimizeWeek(planWeek({ profile: p, energy: e, seed: 42 }), p, e).week;
		for (let i = 1; i < w.days.length; i++) for (const m of w.days[i].meals)
			if (m.recipeId) expect(isLeftoverMeal(w.days, i, m), `day${i} ${m.recipeId}`).toBe(false);
	});
});

describe('H3 - batch protein lever', () => {
	it('batch meets the daily protein floor on the large majority of days across the matrix', () => {
		// batchPlanWeek now adds high-protein snacks (lever 1.5) where the band allows, lifting protein coverage.
		// It cannot fix calorie-full short days (no band room; batch disables the protein-repair swap by design),
		// so the bar is "large majority", not "all". Guards against regressing batch protein coverage.
		let days = 0, met = 0;
		for (const spec of SPECS) for (const seed of SEEDS) {
			const p = mk(spec.over); const e = estimateEnergy(p);
			const w = optimizeWeek(batchPlanWeek({ profile: p, energy: e, seed }), p, e).week;
			const floor = e.proteinBand[0] * (w.meta.householdScale || 1);
			for (const d of w.days) { days++; if (dayTotals(d).protein >= floor - 0.5) met++; }
		}
		expect(met / days).toBeGreaterThanOrEqual(0.8);
	});
});
