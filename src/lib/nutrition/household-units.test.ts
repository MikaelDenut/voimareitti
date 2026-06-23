import { describe, it, expect } from 'vitest';
import { householdAmount, householdBuyAmount, UNIT_LABELS } from './household-units';

describe('householdAmount', () => {
	it('converts eggs to pieces (so "25 g egg" reads as half an egg)', () => {
		const big = householdAmount('egg', 100);
		expect(big?.unit).toBe('piece');
		expect(big!.count).toBeGreaterThanOrEqual(1.5);
		const half = householdAmount('egg', 30);
		expect(half?.unit).toBe('piece');
		expect(half!.count).toBeGreaterThan(0);
		expect(half!.count).toBeLessThanOrEqual(1);
	});

	it('returns null for a sub-half amount (caller falls back to grams)', () => {
		expect(householdAmount('egg', 8)).toBeNull();
	});

	it('returns null for an unknown / non-countable ingredient', () => {
		expect(householdAmount('zzz-not-a-real-ingredient', 100)).toBeNull();
	});

	it('uses pieces (not dozens of tbsp) for countable produce that also declares a spoon unit (audit M1)', () => {
		// Regression: yellow onion declares a tbsp unit, so 650 g used to render as "63 tbsp". PIECE_GRAMS is
		// now consulted before spoons, and spoon counts are capped, so this reads in pieces (or grams), not tbsp.
		const a = householdAmount('yellow-onion', 650);
		expect(a?.unit).not.toBe('tbsp');
		if (a) { expect(a.unit).toBe('piece'); expect(a.count).toBeLessThanOrEqual(6); }
	});
});

describe('householdBuyAmount', () => {
	it('rounds whole items UP to an integer (you buy whole eggs)', () => {
		const b = householdBuyAmount('egg', 130);
		expect(b?.unit).toBe('piece');
		expect(Number.isInteger(b!.count)).toBe(true);
		expect(b!.count).toBeGreaterThanOrEqual(2);
	});
});

describe('UNIT_LABELS', () => {
	it('localizes the common units with correct diacritics', () => {
		expect(UNIT_LABELS.piece.fi).toBe('kpl');
		expect(UNIT_LABELS.tbsp.sv).toBe('msk');
		expect(UNIT_LABELS.can.fi).toBe('tölkki');
		expect(UNIT_LABELS.cup.hu).toBe('csésze');
	});
});
