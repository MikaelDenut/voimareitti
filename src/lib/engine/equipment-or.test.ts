// PR-A: OR-alternatives equipment gate (equipmentAny) + the incline-push-up swap fix.
// Locks the new semantics AND the no-leak guarantee (no exercise uses gear the user lacks).
import { describe, it, expect } from 'vitest';
import { hasEquipment, swapOptions, type Profile } from './engine';
import { exercises } from '$lib/content/data';

const base: Profile = {
	age: 30, sex: 'female', weightKg: 70, heightCm: 170,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'intermediate',
	emphasis: 'balanced', split: 'auto', location: 'home',
	equipment: ['none'], days: 3, minutes: 45,
	pregnant: false, postpartum: false, trimester: 2
};
const withEquip = (...ids: string[]): Profile => ({ ...base, equipment: ids });
const ex = (id: string) => exercises.find((e) => e.id === id)!;

describe('equipmentAny OR-alternatives gate', () => {
	it('accepts ANY one raised surface (chair OR bench OR table) for support exercises', () => {
		for (const id of ['incline-pushup', 'bulgarian-split-squat', 'bench-dip', 'step-up']) {
			expect(hasEquipment(withEquip('chair'), id)).toBe(true);
			expect(hasEquipment(withEquip('bench'), id)).toBe(true);
		}
		// incline-pushup also reachable with just a table
		expect(hasEquipment(withEquip('table'), 'incline-pushup')).toBe(true);
	});

	it('still excludes support exercises when the user has NO support', () => {
		for (const id of ['incline-pushup', 'bulgarian-split-squat', 'bench-dip', 'step-up']) {
			expect(hasEquipment(withEquip('none'), id)).toBe(false);
		}
	});

	it('cable-OR-band exercises are reachable with just a resistance band', () => {
		expect(hasEquipment(withEquip('resistance-band'), 'face-pull')).toBe(true);
		expect(hasEquipment(withEquip('resistance-band'), 'pallof-press')).toBe(true);
	});

	it('does NOT leak: owning a bench never unlocks band/cable exercises', () => {
		// band-press has no equipmentAny -> still strictly needs a band
		expect(hasEquipment(withEquip('bench'), 'band-press')).toBe(false);
		// face-pull needs cable OR band, a bench is neither
		expect(hasEquipment(withEquip('bench'), 'face-pull')).toBe(false);
	});

	it('AND across groups: dumbbell-row needs a weight AND a support', () => {
		expect(hasEquipment(withEquip('dumbbell', 'chair'), 'dumbbell-row')).toBe(true);
		expect(hasEquipment(withEquip('dumbbell'), 'dumbbell-row')).toBe(false); // weight, no support
		expect(hasEquipment(withEquip('chair'), 'dumbbell-row')).toBe(false); // support, no weight
	});

	it('farmer-carry accepts any single weight', () => {
		expect(hasEquipment(withEquip('kettlebell'), 'farmer-carry')).toBe(true);
		expect(hasEquipment(withEquip('none'), 'farmer-carry')).toBe(false);
	});

	it('gym unlocks everything (unchanged)', () => {
		const gym: Profile = { ...base, location: 'gym', equipment: [] };
		expect(hasEquipment(gym, 'incline-pushup')).toBe(true);
		expect(hasEquipment(gym, 'face-pull')).toBe(true);
	});

	it('untouched exercises keep their original AND gate (backward-compatible)', () => {
		expect(hasEquipment(withEquip('dumbbell'), 'goblet-squat')).toBe(true);
		expect(hasEquipment(withEquip('none'), 'goblet-squat')).toBe(false);
	});
});

describe('incline push-up is now a reachable swap (the reported bug)', () => {
	it('appears as a push-up swap option for a user with a chair', () => {
		const p = withEquip('chair');
		const ids = swapOptions(p, ex('pushup'), []).map((e) => e.id);
		expect(ids).toContain('incline-pushup');
	});

	it('is correctly absent for a pure-bodyweight user (no support owned)', () => {
		const p = withEquip('none');
		const ids = swapOptions(p, ex('pushup'), []).map((e) => e.id);
		expect(ids).not.toContain('incline-pushup');
	});
});
