import { describe, it, expect } from 'vitest';
import { messages, locales, t } from '$lib/i18n';
import { exercises, goals, equipment, dietPrinciples, foodGroups, supplements } from '$lib/content/data';
import { recipes } from '$lib/content/recipes';
import { ingredients } from '$lib/content/ingredients';
import { MEAL_SLOT_KEYS } from '$lib/nutrition/constants';

describe('i18n key parity', () => {
	const enKeys = Object.keys(messages.en);
	for (const l of locales) {
		it(`${l} defines every English key`, () => {
			for (const k of enKeys) {
				expect(messages[l][k], `${l} is missing "${k}"`).toBeTruthy();
			}
		});
	}
});

describe('Hard Rule 1: no em or en dashes anywhere', () => {
	const blob =
		JSON.stringify(messages) +
		JSON.stringify({ exercises, goals, equipment, dietPrinciples, foodGroups, supplements }) +
		JSON.stringify(recipes) + JSON.stringify(ingredients);

	it('UI strings, exercise content, recipes and ingredients carry no em/en dashes', () => {
		expect(blob.includes('—'), 'em dash found').toBe(false);
		expect(blob.includes('–'), 'en dash found').toBe(false);
	});
});

describe('meal-slot keys (planning section 29)', () => {
	it('every MEAL_SLOT_KEY resolves in all four locales', () => {
		for (const key of MEAL_SLOT_KEYS) {
			for (const l of locales) {
				const v = t(l, key);
				expect(v, `${l}.${key}`).toBeTruthy();
				expect(v, `${l}.${key} fell back to the key`).not.toBe(key);
			}
		}
	});

	it('localized meal names keep their diacritics (no ASCII transliteration)', () => {
		// sample non-English forms that MUST carry diacritics
		expect(t('fi', 'meal_dinner')).toContain('ä'); // Paivallinen WRONG -> Päivällinen
		expect(t('hu', 'meal_elevenses')).toContain('í'); // Tizorai WRONG -> Tízórai
		expect(t('sv', 'meal_afternoon_snack')).toContain('å'); // Mellanmal WRONG -> Mellanmål
		expect(t('hu', 'meal_late_snack')).toContain('ő'); // Keso WRONG -> Késő
	});
});

describe('content language coverage', () => {
	it('every exercise has fi, hu and sv names (not just en)', () => {
		for (const e of exercises) {
			expect(e.name.fi, `${e.id} missing fi name`).toBeTruthy();
			expect(e.name.hu, `${e.id} missing hu name`).toBeTruthy();
			expect(e.name.sv, `${e.id} missing sv name`).toBeTruthy();
		}
	});

	// PR-4: detail fields on the exercise pages must be fully localized too (the earlier gap was that
	// ~34 newer exercises had en+fi only here, so hu/sv users silently saw English).
	it('every exercise detail field is localized in hu and sv (not just en/fi)', () => {
		const core = ['cue', 'purpose', 'setup', 'mistakes', 'easier', 'harder'] as const;
		const optional = ['safety', 'modTips'] as const;
		for (const e of exercises) {
			const rec = e as unknown as Record<string, { hu?: string; sv?: string } | undefined>;
			for (const f of core) {
				expect(rec[f]?.hu, `${e.id}.${f} missing hu`).toBeTruthy();
				expect(rec[f]?.sv, `${e.id}.${f} missing sv`).toBeTruthy();
			}
			for (const f of optional) {
				if (rec[f]) {
					expect(rec[f]?.hu, `${e.id}.${f} missing hu`).toBeTruthy();
					expect(rec[f]?.sv, `${e.id}.${f} missing sv`).toBeTruthy();
				}
			}
		}
	});
});
