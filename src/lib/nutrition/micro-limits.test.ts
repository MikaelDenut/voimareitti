import { describe, it, expect } from 'vitest';
import { MICRO_UL, weeklyMicroBand, microLimits } from './micro-limits';
import { TRACKED_MICROS } from './day-totals';

describe('micro limits', () => {
	it('has a UL entry (number or null) for every tracked micro', () => {
		for (const k of TRACKED_MICROS) expect(k in MICRO_UL).toBe(true);
	});
	it('food-only / no-UL nutrients have null (never flagged too high)', () => {
		expect(MICRO_UL.magnesium_mg).toBeNull(); // supplemental UL only
		expect(MICRO_UL.folate_ug).toBeNull();    // folic-acid UL only
		expect(MICRO_UL.potassium_mg).toBeNull(); // no UL
		expect(MICRO_UL.vitamin_b12_ug).toBeNull();
		expect(MICRO_UL.calcium_mg).toBe(2500);
		expect(MICRO_UL.iron_mg).toBe(45);
	});

	it('bands a weekly total against the weekly range', () => {
		const dailyTarget = 100; // -> weekly 700
		const ul = 200;          // -> weekly 1400
		expect(weeklyMicroBand(700, dailyTarget, ul)).toBe('good');     // exactly target
		expect(weeklyMicroBand(900, dailyTarget, ul)).toBe('good');     // comfortably in range
		expect(weeklyMicroBand(650, dailyTarget, ul)).toBe('low');      // a bit under
		expect(weeklyMicroBand(400, dailyTarget, ul)).toBe('low-bad');  // well under (<70%)
		expect(weeklyMicroBand(1450, dailyTarget, ul)).toBe('high-bad'); // over the UL
		expect(weeklyMicroBand(1300, dailyTarget, ul)).toBe('high');    // approaching the UL
	});

	it('never returns a high band when there is no UL', () => {
		expect(weeklyMicroBand(999999, 100, null)).toBe('good'); // huge intake, but no UL -> not "too high"
		expect(weeklyMicroBand(700, 100, null)).toBe('good');    // exactly the weekly target
		expect(weeklyMicroBand(350, 100, null)).toBe('low-bad'); // low is still flagged (<70% of 700)
	});

	it('microLimits returns targets + the UL map', () => {
		const lim = microLimits(30, 'female', false);
		expect(lim.target.iron_mg).toBeGreaterThan(0);
		expect(lim.ul.calcium_mg).toBe(2500);
	});
});
