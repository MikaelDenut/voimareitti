import { describe, it, expect } from 'vitest';
import { planWeek } from '../engine/meal-planner';
import { estimateEnergy } from '../engine/engine';
import { defaultProfile, type FullProfile } from '../profile-core';
import { applyMicroTopUps } from './micro-topup';

function suppMicros(week: ReturnType<typeof planWeek>): Set<string> {
	const s = new Set<string>();
	for (const d of week.days) for (const m of d.meals) for (const a of m.additions ?? []) if (a.kind === 'supplement') s.add(a.micro);
	return s;
}
function gen(over: Partial<FullProfile>) {
	const p = { ...defaultProfile(), ...over } as FullProfile;
	const w = planWeek({ profile: p, energy: estimateEnergy(p), seed: 5 });
	applyMicroTopUps(w, p);
	return { p, w };
}

describe('weekly micro top-up', () => {
	it('a vegan plan auto-adds a B12 or D supplement, and NEVER a calcium supplement', () => {
		const { w } = gen({ dietaryFilters: ['vegan'] });
		const micros = suppMicros(w);
		expect(micros.has('vitamin_b12_ug') || micros.has('vitamin_d_ug')).toBe(true);
		expect(micros.has('calcium_mg')).toBe(false); // calcium is food-only, never a pill
	});

	it('supplement lines carry 0 kcal and a positive dose', () => {
		const { w } = gen({ dietaryFilters: ['vegan'] });
		for (const d of w.days) for (const m of d.meals) for (const a of m.additions ?? []) {
			if (a.kind === 'supplement') { expect(m.kcal).toBe(0); expect(a.amount).toBeGreaterThan(0); }
		}
	});

	const usesMilk = (w: ReturnType<typeof planWeek>) =>
		w.days.some((d) => d.meals.some((m) => (m.additions ?? []).some((a) => a.kind === 'ingredient' && a.ingredientId === 'milk')));

	it('a vegan calcium shortfall is NOT topped up with milk (dairy excluded)', () => {
		expect(usesMilk(gen({ dietaryFilters: ['vegan'] }).w)).toBe(false);
	});

	it('a dairy-free or lactose-free calcium shortfall is NOT topped up with milk', () => {
		expect(usesMilk(gen({ dietaryFilters: ['dairyFree'] }).w), 'dairy-free').toBe(false);
		expect(usesMilk(gen({ dietaryFilters: ['lactoseFree'] }).w), 'lactose-free').toBe(false);
	});

	it('milk on the avoid list is never used for the calcium top-up', () => {
		expect(usesMilk(gen({ dislikedIngredientIds: ['milk'] }).w)).toBe(false);
	});

	it('preferIronFromFood: an iron supplement is NEVER added', () => {
		const { w } = gen({ sex: 'female', age: 30, preferIronFromFood: true });
		expect(suppMicros(w).has('iron_mg')).toBe(false);
	});
});
