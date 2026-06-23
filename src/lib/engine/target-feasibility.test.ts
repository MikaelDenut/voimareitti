import { describe, it, expect } from 'vitest';
import { estimateEnergy } from './engine';
import { defaultProfile } from '../profile-core';

// D3 (planning/53 T1 + planning/54): impossible custom-target combos must be FLAGGED (so the UI hard-blocks
// generation) but legitimate single overrides - especially lowering calories - must NOT be flagged.
function e(over: Record<string, number> = {}) {
	return estimateEnergy({ ...defaultProfile(), ...over } as any);
}

describe('custom-target feasibility flag (targetConflict)', () => {
	it('a fully automatic profile is always feasible', () => {
		expect(e().targetConflict).toBeUndefined();
	});

	it('flags kcal 1000 + protein 500 g (protein alone needs ~2000 kcal)', () => {
		const tc = e({ kcalOverride: 1000, proteinOverride: 500 }).targetConflict;
		expect(tc).toBeTruthy();
		expect(tc!.requiredKcal).toBeGreaterThan(tc!.targetKcal);
		expect(tc!.requiredKcal).toBe(2000); // 500 g * 4
	});

	it('does NOT flag simply lowering calories (kcal override alone, macros automatic)', () => {
		expect(e({ kcalOverride: 1000 }).targetConflict).toBeUndefined();
		expect(e({ kcalOverride: 1500 }).targetConflict).toBeUndefined();
	});

	it('flags an absurd single macro override (protein/fat/carb)', () => {
		expect(e({ proteinOverride: 1000 }).targetConflict).toBeTruthy();
		expect(e({ fatOverride: 1000 }).targetConflict).toBeTruthy();
		expect(e({ carbOverride: 2000 }).targetConflict).toBeTruthy();
	});

	it('does NOT flag a sensible custom set', () => {
		expect(e({ kcalOverride: 2000, proteinOverride: 150, carbOverride: 200, fatOverride: 60 }).targetConflict).toBeUndefined();
		expect(e({ proteinOverride: 200 }).targetConflict).toBeUndefined(); // 800 kcal < ~2391 auto target
	});

	it('does NOT flag an ambitious-but-possible high kcal target', () => {
		expect(e({ kcalOverride: 5000 }).targetConflict).toBeUndefined();
	});

	it('never produces NaN in the conflict numbers', () => {
		const tc = e({ kcalOverride: 1000, proteinOverride: 500, fatOverride: 100, carbOverride: 100 }).targetConflict!;
		for (const v of Object.values(tc)) expect(Number.isFinite(v)).toBe(true);
	});
});
