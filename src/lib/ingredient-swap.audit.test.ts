// Swap audit (planning/43 E): avoided foods are never offered, and the ranked list cycles cleanly.
import { describe, it, expect } from 'vitest';
import { ingredientSwapOptions } from './ingredient-swap';
import { ingredients } from './content/ingredients';

describe('ingredientSwapOptions - avoid + stable cycle', () => {
	it('never offers an avoided ingredient', () => {
		// salmon has many same-role alternatives; avoid two of them and confirm they are gone.
		const base = ingredientSwapOptions('salmon').map((i) => i.id);
		expect(base.length).toBeGreaterThan(2);
		const avoid = base.slice(0, 2);
		const got = ingredientSwapOptions('salmon', [], avoid).map((i) => i.id);
		for (const a of avoid) expect(got).not.toContain(a);
	});

	it('returns a stable ranked list so a caller can cycle without immediate repeats', () => {
		const opts = ingredientSwapOptions('chicken-breast');
		expect(opts.length).toBeGreaterThan(1);
		// Cycling by index hits distinct ingredients before wrapping.
		const seen = new Set<string>();
		for (let i = 0; i < Math.min(opts.length, 5); i++) seen.add(opts[i % opts.length].id);
		expect(seen.size).toBe(Math.min(opts.length, 5));
		// Deterministic: same inputs -> same order.
		expect(ingredientSwapOptions('chicken-breast').map((i) => i.id)).toEqual(opts.map((i) => i.id));
	});

	it('never includes the source ingredient itself', () => {
		for (const id of ['salmon', 'tofu', 'green-beans', 'chia-seeds']) {
			expect(ingredientSwapOptions(id).map((i) => i.id)).not.toContain(id);
		}
	});

	it('every ingredient still has at least one swap option (no dead ends)', () => {
		const dead = ingredients.filter((i) => ingredientSwapOptions(i.id).length === 0).map((i) => i.id);
		expect(dead).toEqual([]);
	});
});

// 2026-07 audit C1: the swap family used to ignore every diet/allergen/FODMAP filter - one tap could put
// meat on a vegan plan or a nut on a nut-allergy plan. With the profile passed, EVERY offered option must
// pass ingredientAllowed. These run the real ranking over the real DB for the highest-risk combos.
describe('ingredientSwapOptions - diet/allergen/FODMAP safety (audit C1)', () => {
	const prof = (over: Partial<{ dietaryFilters: string[]; fodmap: 'off' | 'gentle' | 'strict'; dislikedIngredientIds: string[] }>) => ({
		dietaryFilters: [], fodmap: 'off' as const, dislikedIngredientIds: [], ...over
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}) as any;

	it('vegan profile is never offered an animal product', () => {
		const p = prof({ dietaryFilters: ['vegan'] });
		for (const src of ['tofu', 'chicken-breast', 'salmon', 'egg']) {
			for (const opt of ingredientSwapOptions(src, [], [], p)) {
				expect(opt.dietary.vegan, `${src} -> ${opt.id}`).toBe(true);
			}
		}
	});

	it('nut-free profile is never offered a nut', () => {
		const p = prof({ dietaryFilters: ['nutFree'] });
		for (const src of ['sunflower-seeds', 'chia-seeds', 'peanut-butter']) {
			for (const opt of ingredientSwapOptions(src, [], [], p)) {
				expect(opt.dietary.nutFree, `${src} -> ${opt.id}`).toBe(true);
			}
		}
	});

	it('strict FODMAP profile is only offered low-FODMAP foods', () => {
		const p = prof({ fodmap: 'strict' });
		for (const src of ['carrot', 'courgette', 'potato']) {
			for (const opt of ingredientSwapOptions(src, [], [], p)) {
				expect(opt.dietary.fodmap, `${src} -> ${opt.id}`).toBe('low');
			}
		}
	});

	it('gluten-free profile is never offered a gluten source', () => {
		const p = prof({ dietaryFilters: ['glutenFree'] });
		for (const src of ['potato', 'white-rice', 'oats']) {
			for (const opt of ingredientSwapOptions(src, [], [], p)) {
				expect(opt.dietary.glutenFree, `${src} -> ${opt.id}`).toBe(true);
			}
		}
	});

	it('omitting the profile keeps the original unfiltered behavior (back-compat)', () => {
		expect(ingredientSwapOptions('salmon').length).toBeGreaterThan(0);
	});
});
