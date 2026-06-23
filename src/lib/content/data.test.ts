import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { exercises, supplements, DENY_SUBSTANCES, muscle } from '$lib/content/data';
import { profiles } from '$lib/content/profiles';
import { exerciseImages } from '$lib/content/exercise-images';

const imgDir = fileURLToPath(new URL('../../../static/img/exercises', import.meta.url));
const files = readdirSync(imgDir);

describe('content integrity', () => {
	it('every exercise has an illustration in the image set', () => {
		for (const e of exercises) expect(exerciseImages.has(e.id), `no image for ${e.id}`).toBe(true);
	});

	it('every image-set id resolves to a webp file on disk', () => {
		for (const id of exerciseImages) expect(files, `missing file for ${id}`).toContain(`${id}.webp`);
	});

	it('exercise ids are unique', () => {
		const ids = exercises.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every exercise primary muscle has a localized label', () => {
		for (const e of exercises) {
			for (const m of e.primary) {
				// muscle() returns the key unchanged only if unknown; require a real translation.
				expect(muscle(m, 'fi'), `no FI label for muscle "${m}"`).not.toBe('');
				expect(muscle(m, 'sv')).toBeTruthy();
				expect(muscle(m, 'hu')).toBeTruthy();
			}
		}
	});

	it('every exercise has a structured profile', () => {
		for (const e of exercises) expect(profiles[e.id], `no profile for ${e.id}`).toBeTruthy();
	});

	it('profiles are well-formed', () => {
		for (const id of Object.keys(profiles)) {
			const p = profiles[id];
			expect(p.effectiveness, id).toBeGreaterThanOrEqual(1);
			expect(p.effectiveness, id).toBeLessThanOrEqual(5);
			expect(p.purposes.length, id).toBeGreaterThan(0);
			expect(p.equipment.length, id).toBeGreaterThan(0);
			expect(p.recommended.en, id).toBeTruthy();
		}
	});

	it('deny-list substances never appear as a recommended supplement', () => {
		const names = supplements.map((s) => s.name.en.toLowerCase());
		for (const d of DENY_SUBSTANCES) {
			expect(names.some((n) => n.includes(d.toLowerCase()))).toBe(false);
		}
	});
});
