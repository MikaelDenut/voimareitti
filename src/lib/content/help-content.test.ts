import { describe, it, expect } from 'vitest';
import { HELP_SECTIONS, helpEntries, searchHelp, normalizeText } from './help-content';

const LANGS = ['en', 'fi', 'hu', 'sv'] as const;
const sectionIds = new Set(HELP_SECTIONS.map((s) => s.id));

function strings(): string[] {
	const out: string[] = [];
	for (const s of HELP_SECTIONS) for (const l of LANGS) { out.push(s.title[l]!); out.push(s.intro[l]!); }
	for (const e of helpEntries) {
		for (const l of LANGS) {
			out.push(e.title[l]!);
			for (const p of e.body) out.push(p[l]!);
			if (e.keywords) out.push(e.keywords[l]!);
		}
	}
	return out;
}

describe('help-content integrity', () => {
	it('every section has all four languages, non-empty', () => {
		for (const s of HELP_SECTIONS) for (const l of LANGS) {
			expect(s.title[l], `${s.id}.title.${l}`).toBeTruthy();
			expect(s.intro[l], `${s.id}.intro.${l}`).toBeTruthy();
		}
	});

	it('every entry has all four languages on title + each body paragraph', () => {
		for (const e of helpEntries) {
			expect(e.body.length, `${e.id} has body`).toBeGreaterThan(0);
			for (const l of LANGS) {
				expect(e.title[l], `${e.id}.title.${l}`).toBeTruthy();
				for (const p of e.body) expect(p[l], `${e.id}.body.${l}`).toBeTruthy();
			}
		}
	});

	it('every entry references a known section', () => {
		for (const e of helpEntries) expect(sectionIds.has(e.section), `${e.id} -> ${e.section}`).toBe(true);
	});

	it('entry ids are unique', () => {
		const ids = helpEntries.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('no em or en dashes anywhere (Hard Rule 1)', () => {
		for (const s of strings()) {
			expect(s.includes('—'), `em dash in: ${s}`).toBe(false);
			expect(s.includes('–'), `en dash in: ${s}`).toBe(false);
		}
	});

	it('no forbidden duct/health-claim style phrasing in the English copy (Hard Rule 15 guard)', () => {
		const banned = ['cure', 'cures', 'prevent disease', 'prevents illness', 'boosts immun', 'detox', 'reduce symptoms', 'improves your health'];
		for (const e of helpEntries) {
			const en = [e.title.en, ...e.body.map((b) => b.en)].join(' ').toLowerCase();
			for (const b of banned) expect(en.includes(b), `${e.id} contains "${b}"`).toBe(false);
		}
	});
});

describe('searchHelp', () => {
	it('empty query returns every entry in declared order', () => {
		const r = searchHelp('', 'en');
		expect(r.length).toBe(helpEntries.length);
		expect(r.map((e) => e.id)).toEqual(helpEntries.map((e) => e.id));
	});

	it('matches on the English title', () => {
		const ids = searchHelp('shopping', 'en').map((e) => e.id);
		expect(ids).toContain('shopping');
	});

	it('requires every term (AND)', () => {
		const ids = searchHelp('meal plan', 'en').map((e) => e.id);
		expect(ids).toContain('meal-plan');
	});

	it('is accent-insensitive (a query without diacritics finds a diacritic word)', () => {
		// "lammittely" should find the Finnish warm-up entry titled "Lämmittely ja loppuverryttely".
		const ids = searchHelp('lammittely', 'fi').map((e) => e.id);
		expect(ids).toContain('warmup-cooldown');
	});

	it('returns nothing for a non-matching query', () => {
		expect(searchHelp('zzzqqxnope', 'en')).toEqual([]);
	});

	it('preserves declared order in filtered results', () => {
		const r = searchHelp('a', 'en'); // common letter, several matches
		const order = helpEntries.map((e) => e.id);
		const idx = r.map((e) => order.indexOf(e.id));
		const sorted = [...idx].sort((x, y) => x - y);
		expect(idx).toEqual(sorted);
	});

	it('normalizeText lowercases and strips diacritics', () => {
		expect(normalizeText('Vähemmän ANNOKSIA')).toBe('vahemman annoksia');
		expect(normalizeText('Középhaladó')).toBe('kozephalado');
	});
});
