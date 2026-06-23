import { describe, it, expect } from 'vitest';
import {
	defaultProfile,
	migrate,
	parseStored,
	SCHEMA_VERSION,
	DIETARY_VALUES,
	type FullProfile
} from './profile-core';

describe('profile defaults', () => {
	it('produces a complete, valid default profile', () => {
		const p = defaultProfile();
		expect(p.schemaVersion).toBe(SCHEMA_VERSION);
		expect(p.mealsPerDay).toBe(3);
		expect(p.fodmap).toBe('off');
		expect(p.mealLabels).toBe('named');
		expect(p.dietaryFilters).toEqual([]);
		expect(p.household).toEqual([]);
		expect(p.profileSeed).toBe(1);
		expect(p.planSeedOffset).toBe(0);
		// Workout fields present (engine contract)
		expect(p.age).toBe(30);
		expect(p.equipment).toContain('chair');
		// v3 additions
		expect(p.breastfeeding).toBe(false);
		expect(p.kcalOverride).toBeUndefined();
		expect(p.proteinOverride).toBeUndefined();
	});

	it('defaults are independent objects (no shared array refs)', () => {
		const a = defaultProfile();
		const b = defaultProfile();
		a.dietaryFilters.push('vegan');
		expect(b.dietaryFilters).toEqual([]);
	});
});

describe('profile migration', () => {
	it('migrates a legacy workout-only blob (no food fields, no version)', () => {
		const legacy = {
			age: 41, sex: 'female', weightKg: 62, heightCm: 168, trainingGoal: 'hypertrophy',
			nutritionGoal: 'lose', experience: 'intermediate', emphasis: 'balanced', split: 'auto',
			location: 'gym', equipment: ['dumbbell'], days: 4, minutes: 50,
			pregnant: false, postpartum: false, trimester: 2
		};
		const p = migrate(legacy);
		// workout fields preserved
		expect(p.age).toBe(41);
		expect(p.sex).toBe('female');
		expect(p.location).toBe('gym');
		expect(p.equipment).toEqual(['dumbbell']);
		// food fields filled from defaults
		expect(p.mealsPerDay).toBe(3);
		expect(p.fodmap).toBe('off');
		expect(p.dietaryFilters).toEqual([]);
		// version stamped
		expect(p.schemaVersion).toBe(SCHEMA_VERSION);
	});

	it('keeps valid food fields and drops unknown keys', () => {
		const p = migrate({
			mealsPerDay: 5, fodmap: 'gentle', alcoholFree: true, mealLabels: 'numbered',
			dietaryFilters: ['vegan', 'glutenFree', 'bogusFilter'],
			somethingRandom: { a: 1 }
		});
		expect(p.mealsPerDay).toBe(5);
		expect(p.fodmap).toBe('gentle');
		expect(p.alcoholFree).toBe(true);
		expect(p.mealLabels).toBe('numbered');
		expect(p.dietaryFilters).toEqual(['vegan', 'glutenFree']); // bogus filtered out
		expect((p as unknown as Record<string, unknown>).somethingRandom).toBeUndefined();
	});

	it('repairs out-of-range / wrong-typed numerics', () => {
		const p = migrate({ age: 999, days: 99, minutes: -5, mealsPerDay: 20, weightKg: 'heavy' });
		expect(p.age).toBe(100);
		expect(p.days).toBe(7);
		expect(p.minutes).toBe(10);
		expect(p.mealsPerDay).toBe(8);
		expect(p.weightKg).toBe(defaultProfile().weightKg); // wrong type -> default
	});

	it('normalizes household members and clamps minor ages', () => {
		const p = migrate({
			household: [
				{ id: 'a', label: 'Dad', age: 40, sex: 'male', goal: 'maintain' },
				{ label: 'Kid', age: 8 },
				'garbage',
				{ age: 200 }
			]
		});
		expect(p.household.length).toBe(3);
		expect(p.household[0].id).toBe('a');
		expect(p.household[1].id).toBe('m1'); // generated id
		expect(p.household[2].age).toBe(100); // clamped
	});

	it('every DIETARY_VALUES entry survives migration', () => {
		const p = migrate({ dietaryFilters: [...DIETARY_VALUES] });
		expect(p.dietaryFilters).toEqual(DIETARY_VALUES);
	});

	it('derives a household member type from age when absent, keeps an explicit type', () => {
		const p = migrate({
			household: [
				{ id: 'a', label: 'Dad', age: 40 },        // -> adult
				{ id: 'b', label: 'Teen', age: 15 },       // -> teen
				{ id: 'c', label: 'Kid', age: 8 },         // -> child
				{ id: 'd', label: 'Custom', age: 30, type: 'child' } // explicit kept
			]
		});
		expect(p.household[0].type).toBe('adult');
		expect(p.household[1].type).toBe('teen');
		expect(p.household[2].type).toBe('child');
		expect(p.household[3].type).toBe('child');
	});

	it('copies valid override targets and drops garbage', () => {
		const p = migrate({
			breastfeeding: true,
			kcalOverride: 2200, proteinOverride: 160,
			carbOverride: 0, fatOverride: 'lots', waterOverride: -5
		});
		expect(p.breastfeeding).toBe(true);
		expect(p.kcalOverride).toBe(2200);
		expect(p.proteinOverride).toBe(160);
		expect(p.carbOverride).toBeUndefined(); // 0 is not > 0
		expect(p.fatOverride).toBeUndefined();  // wrong type
		expect(p.waterOverride).toBeUndefined(); // negative
	});

	it('breastfeeding defaults to false for a legacy blob without the flag', () => {
		expect(migrate({ age: 30 }).breastfeeding).toBe(false);
	});

	it('preserves a stored waist measurement (not in defaultProfile, so easily dropped)', () => {
		expect(migrate({ waistCm: 84 }).waistCm).toBe(84);
		expect(migrate({ waistCm: 'big' }).waistCm).toBeUndefined();
		expect(migrate({ waistCm: 0 }).waistCm).toBeUndefined();
		expect(migrate({ waistCm: 9 }).waistCm).toBe(40);   // clamped up
		expect(migrate({ waistCm: 999 }).waistCm).toBe(200); // clamped down
	});

	it('clamps a corrupt/zero weight or height to a sane positive range', () => {
		expect(migrate({ weightKg: 0 }).weightKg).toBe(30);
		expect(migrate({ heightCm: 0 }).heightCm).toBe(100);
		expect(migrate({ weightKg: 5000 }).weightKg).toBe(300);
		expect(migrate({ heightCm: 5 }).heightCm).toBe(100);
	});
});

describe('parseStored - bad localStorage data', () => {
	it('null -> defaults', () => {
		expect(parseStored(null)).toEqual(defaultProfile());
	});
	it('invalid JSON -> defaults', () => {
		expect(parseStored('{not json')).toEqual(defaultProfile());
	});
	it('JSON that is not an object -> defaults', () => {
		expect(parseStored('42')).toEqual(defaultProfile());
		expect(parseStored('"hello"')).toEqual(defaultProfile());
		expect(parseStored('null')).toEqual(defaultProfile());
	});
	it('round-trips a valid profile (persistence integrity)', () => {
		const p: FullProfile = { ...defaultProfile(), mealsPerDay: 6, alcoholFree: true, dietaryFilters: ['vegan'] };
		const restored = parseStored(JSON.stringify(p));
		expect(restored).toEqual(p);
	});
});
