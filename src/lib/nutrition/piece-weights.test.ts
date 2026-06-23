import { describe, it, expect } from 'vitest';
import { PIECE_GRAMS, piecesToGrams, isCountable } from './piece-weights';
import { getIngredient } from '../content/ingredients';

describe('piece weights', () => {
	it('every key resolves to a real ingredient id (a rename never leaves a dangling key)', () => {
		for (const id of Object.keys(PIECE_GRAMS)) expect(getIngredient(id), id).toBeTruthy();
	});
	it('every value is a sane positive weight (1-1000 g)', () => {
		for (const [id, g] of Object.entries(PIECE_GRAMS)) {
			expect(g, id).toBeGreaterThan(0);
			expect(g, id).toBeLessThanOrEqual(1000);
		}
	});
	it('piecesToGrams multiplies, rounds, and returns null for unknown foods', () => {
		expect(piecesToGrams('orange', 3)).toBe(154 * 3);
		expect(piecesToGrams('egg', 2)).toBe(100);
		expect(piecesToGrams('definitely-not-a-food', 1)).toBeNull();
	});
	it('isCountable reflects the map', () => {
		expect(isCountable('apple')).toBe(true);
		expect(isCountable('blueberry')).toBe(false);
	});
});
