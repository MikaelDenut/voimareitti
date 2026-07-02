import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// Bundle budget guard (planning section 26): SvelteKit code-splits per route, so a route that does not
// import the heavy food modules (recipes.ts ~ ingredients.ts) keeps them out of its chunk. We assert the
// "light" public pages never import the food system, so landing/exercises/muscles stay lean.
// NOTE: /about is now the Help page and is a deliberate content-heavy reference page (food groups + recipe
// lists), so it legitimately imports the food modules and is no longer a "light" page.

const FOOD_MODULES = [
	'$lib/content/recipes',
	'$lib/content/ingredients',
	'$lib/engine/meal-planner',
	'$lib/shopping',
	'$lib/recipe-filters'
];

const LIGHT_PAGES = [
	'src/routes/[lang]/+page.svelte',
	'src/routes/[lang]/exercises/+page.svelte',
	'src/routes/[lang]/exercises/[id]/+page.svelte',
	'src/routes/[lang]/muscles/+page.svelte'
];

describe('bundle budget: light pages do not import the food system', () => {
	for (const page of LIGHT_PAGES) {
		it(`${page} imports no heavy food module`, () => {
			if (!existsSync(page)) return; // route may not exist
			const src = readFileSync(page, 'utf-8');
			for (const m of FOOD_MODULES) {
				expect(src.includes(m), `${page} imports ${m}`).toBe(false);
			}
		});
	}

	// 2026-07 audit H2: the grep above only sees the page file's OWN source, so a shared component can
	// smuggle a heavy module into a light page transitively. ProfilePanel (on every light page) did exactly
	// that with a static ingredient-DB import (~428 KB source). Guard the components the light pages embed:
	// only a type-only or dynamic import() of the ingredient DB is allowed there.
	const SHARED_ON_LIGHT_PAGES = ['src/lib/ProfilePanel.svelte'];
	for (const comp of SHARED_ON_LIGHT_PAGES) {
		it(`${comp} has no STATIC value import of the ingredient DB (lazy/type-only allowed)`, () => {
			if (!existsSync(comp)) return;
			const src = readFileSync(comp, 'utf-8');
			// Every `import ... from '$lib/content/ingredients'` line must be `import type`.
			const staticImports = src.match(/^\s*import\s[^;]*from\s+['"]\$lib\/content\/ingredients['"]/gm) ?? [];
			const valueImports = staticImports.filter((l) => !/^\s*import\s+type\b/.test(l));
			expect(valueImports, `${comp} statically imports the ingredient DB: ${valueImports.join(' | ')}`).toEqual([]);
		});
	}
});
