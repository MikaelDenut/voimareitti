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
