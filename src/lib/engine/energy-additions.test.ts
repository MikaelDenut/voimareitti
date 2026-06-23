import { describe, it, expect } from 'vitest';
import { estimateEnergy, type Profile } from './engine';

const base: Profile = {
	age: 30, sex: 'unspecified', weightKg: 75, heightCm: 175,
	trainingGoal: 'general', nutritionGoal: 'maintain', experience: 'beginner',
	emphasis: 'balanced', split: 'auto', location: 'home', equipment: ['chair'],
	days: 3, minutes: 45, pregnant: false, postpartum: false, trimester: 2
};

describe('estimateEnergy - Phase 3 additive fields', () => {
	it('proteinBand equals [proteinLow, proteinHigh] for a younger adult', () => {
		const r = estimateEnergy(base);
		expect(r.proteinBand).toEqual([r.proteinLow, r.proteinHigh]);
	});

	it('proteinBand floor is raised for an older adult, never lowered', () => {
		const r = estimateEnergy({ ...base, age: 70 });
		expect(r.proteinBand[0]).toBeGreaterThanOrEqual(r.proteinLow);
		expect(r.proteinBand[1]).toBe(r.proteinHigh);
		// 1.2 g/kg floor on 75 kg = 90, above the maintain low
		expect(r.proteinBand[0]).toBeGreaterThanOrEqual(90);
	});

	it('carb ceiling: cut goal caps at 1.5 g/kg', () => {
		const r = estimateEnergy({ ...base, sex: 'female', weightKg: 62, nutritionGoal: 'lose' });
		expect(r.carbCeilingG).toBe(Math.round(62 * 1.5));
	});

	it('carb ceiling: maintain caps at 2.5 g/kg', () => {
		const r = estimateEnergy({ ...base, weightKg: 75, nutritionGoal: 'maintain' });
		expect(r.carbCeilingG).toBe(Math.round(75 * 2.5));
	});

	it('carb ceiling: bulk (gain) is unrestricted', () => {
		const r = estimateEnergy({ ...base, nutritionGoal: 'gain' });
		expect(r.carbCeilingG).toBeNull();
	});

	it('carb ceiling: never caps pregnancy, postpartum, or a safety-adjusted minor', () => {
		expect(estimateEnergy({ ...base, sex: 'female', pregnant: true }).carbCeilingG).toBeNull();
		expect(estimateEnergy({ ...base, sex: 'female', postpartum: true }).carbCeilingG).toBeNull();
		// 14yo, normal BMI, lose -> nutritionAdjusted 'minor' -> no carb cap
		const minor = estimateEnergy({ ...base, age: 14, weightKg: 55, heightCm: 165, nutritionGoal: 'lose' });
		expect(minor.nutritionAdjusted).toBe('minor');
		expect(minor.carbCeilingG).toBeNull();
	});

	it('micro targets emphasise folate/iron in pregnancy and D for older adults', () => {
		const preg = estimateEnergy({ ...base, sex: 'female', pregnant: true }).microTargets;
		expect(preg.folate_ug).toBe(600);
		expect(preg.iron_mg).toBe(27);
		const older = estimateEnergy({ ...base, age: 70 }).microTargets;
		expect(older.vitamin_d_ug).toBe(20);
		const female = estimateEnergy({ ...base, sex: 'female' }).microTargets;
		expect(female.iron_mg).toBe(18);
	});

	it('is deterministic', () => {
		expect(estimateEnergy(base)).toEqual(estimateEnergy({ ...base }));
	});
});

describe('estimateEnergy - Theme 1/2 breastfeeding, water target, overrides', () => {
	const female: Profile = { ...base, sex: 'female', weightKg: 65, heightCm: 168 };

	it('breastfeeding adds an energy increment over the non-breastfeeding baseline', () => {
		const off = estimateEnergy(female);
		const on = estimateEnergy({ ...female, breastfeeding: true });
		expect(on.target).toBeGreaterThan(off.target);
		expect(on.target).toBeGreaterThanOrEqual(off.tdee + 450); // never a deficit, plus the bump
	});

	it('breastfeeding never stacks with pregnancy (pregnancy wins, breastfeeding ignored)', () => {
		const preg = estimateEnergy({ ...female, pregnant: true, trimester: 2 });
		const both = estimateEnergy({ ...female, pregnant: true, trimester: 2, breastfeeding: true });
		expect(both.target).toBe(preg.target);
	});

	it('breastfeeding lifts protein band and removes the carb ceiling', () => {
		const on = estimateEnergy({ ...female, breastfeeding: true });
		const off = estimateEnergy(female);
		expect(on.proteinHigh).toBeGreaterThanOrEqual(off.proteinHigh);
		expect(on.carbCeilingG).toBeNull();
	});

	it('waterTargetMl is a NEW field; frozen waterMl is unchanged', () => {
		const r = estimateEnergy(base);
		expect(r.waterMl).toBe(2475); // frozen
		expect(r.waterTargetMl).toBeGreaterThan(0);
	});

	it('water target rises with pregnancy, breastfeeding, and older age; override wins', () => {
		const baseW = estimateEnergy(female).waterTargetMl;
		expect(estimateEnergy({ ...female, pregnant: true }).waterTargetMl).toBeGreaterThan(baseW);
		expect(estimateEnergy({ ...female, breastfeeding: true }).waterTargetMl).toBeGreaterThan(baseW);
		expect(estimateEnergy({ ...female, age: 70 }).waterTargetMl).toBeGreaterThan(baseW);
		expect(estimateEnergy({ ...female, waterOverride: 4200 }).waterTargetMl).toBe(4200);
	});

	it('overrides replace the automatic target and set the flag; absent => all false', () => {
		const auto = estimateEnergy(base);
		expect(auto.overridden).toEqual({ kcal: false, protein: false, carb: false, fat: false, water: false });
		const ov = estimateEnergy({ ...base, kcalOverride: 2000, proteinOverride: 150, carbOverride: 200, fatOverride: 70 });
		expect(ov.target).toBe(2000);
		expect(ov.proteinLow).toBe(150);
		expect(ov.proteinHigh).toBe(150);
		expect(ov.carbG).toBe(200);
		expect(ov.fatG).toBe(70);
		expect(ov.overridden).toEqual({ kcal: true, protein: true, carb: true, fat: true, water: false });
	});

	it('a kcal override is clamped up to the sex calorie floor (never dangerously low)', () => {
		const ov = estimateEnergy({ ...base, sex: 'male', kcalOverride: 800 });
		expect(ov.target).toBe(1500); // male floor
		expect(ov.overridden.kcal).toBe(true);
	});
});
