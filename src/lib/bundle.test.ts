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
});
