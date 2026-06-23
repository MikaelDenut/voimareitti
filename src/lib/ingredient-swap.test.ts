import { describe, it, expect } from 'vitest';
import { ingredientSwapOptions } from './ingredient-swap';
import { ingredients, getIngredient } from './content/ingredients';

const ids = (arr: { id: string }[]) => arr.map((x) => x.id);
const famOf = (id: string) => getIngredient(id)?.family;

describe('ingredientSwapOptions - family-first ranking (an onion stays an onion)', () => {
	it('every ingredient has a family tag', () => {
		expect(ingredients.every((i) => typeof i.family === 'string' && i.family.length > 0)).toBe(true);
	});

	it('onion swaps return other alliums before any other family', () => {
		const alliums = ingredients.filter((i) => i.family === 'allium').map((i) => i.id);
		const expected = alliums.filter((id) => id !== 'yellow-onion');
		expect(expected.length).toBeGreaterThan(2);

		const res = ingredientSwapOptions('yellow-onion');
		// All same-family members are offered...
		for (const id of expected) {
			expect(res.find((r) => r.id === id), `expected ${id} among onion swaps`).toBeTruthy();
		}
		// ...and they rank first, ahead of any role-fallback family.
		const head = res.slice(0, expected.length);
		expect(head.every((r) => r.family === 'allium')).toBe(true);
		// onion never swaps to peas (the old role-only bug).
		const peas = res.findIndex((r) => r.id === 'peas' || r.family === 'pod-veg');
		const lastAllium = res.map((r) => r.family).lastIndexOf('allium');
		if (peas !== -1) expect(peas).toBeGreaterThan(lastAllium);
	});

	it('mince swaps return other minces first', () => {
		const minces = ingredients.filter((i) => i.family === 'mince').map((i) => i.id).filter((id) => id !== 'beef-mince');
		const res = ingredientSwapOptions('beef-mince');
		for (const id of minces) expect(res.find((r) => r.id === id)).toBeTruthy();
		expect(res.slice(0, minces.length).every((r) => r.family === 'mince')).toBe(true);
	});

	it('is deterministic and stable', () => {
		expect(ids(ingredientSwapOptions('yellow-onion'))).toEqual(ids(ingredientSwapOptions('yellow-onion')));
	});

	it('respects excludeIds and never returns the ingredient itself', () => {
		const res = ingredientSwapOptions('yellow-onion', ['red-onion']);
		expect(res.find((r) => r.id === 'yellow-onion')).toBeUndefined();
		expect(res.find((r) => r.id === 'red-onion')).toBeUndefined();
	});

	it('milk swaps include the milk family (milk <-> oat drink)', () => {
		expect(famOf('milk')).toBe('milk');
		const milkFam = ingredients.filter((i) => i.family === 'milk' && i.id !== 'milk').map((i) => i.id);
		const res = ingredientSwapOptions('milk');
		for (const id of milkFam) expect(res.find((r) => r.id === id), `expected ${id}`).toBeTruthy();
		expect(res.find((r) => r.id === 'oat-drink')).toBeTruthy();
	});
});
