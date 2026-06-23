import { describe, it, expect } from 'vitest';
import { recipes } from './content/recipes';
import {
	goalBucketsOf, matchesDiet, matchesFodmap, nutrientFlags, matchesNutrient,
	isAlcoholFree, isContradiction, glutenFreeable, glutenSwappable, dietAnnotations,
	COURSE_LABELS, courseLabel
} from './recipe-filters';
import { recipeImage } from './recipe-images';
import { ingredients, getIngredient } from './content/ingredients';

// Data-integrity guard: glutenFreeable/lactoseFreeable judge a recipe NOT swappable (and the planner
// then drops it) if any ingredient id fails to resolve. With every id resolving, a typo can never
// silently remove an otherwise-valid dish. Keep this green by fixing the data, never the predicate.
describe('every recipe ingredient id resolves to a known ingredient', () => {
	it('has zero unresolved ingredient references', () => {
		const bad: string[] = [];
		for (const r of recipes) {
			for (const ri of r.ingredients) {
				if (!getIngredient(ri.ingredientId)) bad.push(`${r.id} -> ${ri.ingredientId}`);
			}
		}
		expect(bad).toEqual([]);
	});
});

describe('recipe goal buckets', () => {
	it('maps raw goal tags into lose/maintain/gain', () => {
		const fake = { goal: ['cut', 'bulk', 'gain-muscle', 'maintain', 'gain'] } as never;
		expect(goalBucketsOf(fake).sort()).toEqual(['gain', 'lose', 'maintain']);
	});
	it('every recipe yields at least one known bucket or none, never an unknown', () => {
		for (const r of recipes) {
			for (const b of goalBucketsOf(r)) expect(['lose', 'maintain', 'gain']).toContain(b);
		}
	});
});

describe('diet filters do not leak violators', () => {
	it('vegan results are internally consistent (vegetarian, no meat/fish)', () => {
		for (const r of recipes.filter((r) => matchesDiet(r, 'vegan'))) {
			expect(r.dietary.vegetarian, r.id).toBe(true);
			expect(r.dietary.containsRedMeat, r.id).toBe(false);
			expect(r.dietary.containsPork, r.id).toBe(false);
			expect(r.dietary.containsFish, r.id).toBe(false);
		}
	});
	it('gluten-free / nut-free / soy-free results truly carry the flag', () => {
		for (const r of recipes.filter((r) => matchesDiet(r, 'glutenFree'))) expect(r.dietary.glutenFree).toBe(true);
		for (const r of recipes.filter((r) => matchesDiet(r, 'nutFree'))) expect(r.dietary.nutFree).toBe(true);
		for (const r of recipes.filter((r) => matchesDiet(r, 'soyFree'))) expect(r.dietary.soyFree).toBe(true);
	});
	it('no-pork results contain no pork', () => {
		for (const r of recipes.filter((r) => matchesDiet(r, 'noPork'))) expect(r.dietary.containsPork).toBe(false);
	});
});

describe('FODMAP filter', () => {
	it('strict yields only low-FODMAP recipes', () => {
		for (const r of recipes.filter((r) => matchesFodmap(r, 'strict'))) expect(r.dietary.fodmap).toBe('low');
	});
	it('gentle excludes high-FODMAP recipes', () => {
		for (const r of recipes.filter((r) => matchesFodmap(r, 'gentle'))) expect(r.dietary.fodmap).not.toBe('high');
	});
	it('off keeps everything', () => {
		expect(recipes.filter((r) => matchesFodmap(r, 'off')).length).toBe(recipes.length);
	});
});

describe('nutrient flags', () => {
	it('high-protein flag respects the 25 g / 25% rule', () => {
		for (const r of recipes.filter((r) => matchesNutrient(r, 'high-protein'))) {
			const n = r.nutritionPerServing;
			const pct = n.energy_kcal > 0 ? (n.protein_g * 4) / n.energy_kcal : 0;
			expect(n.protein_g >= 25 || pct >= 0.25, r.id).toBe(true);
		}
	});
	it('low-cal flag is <= 400 kcal per serving', () => {
		for (const r of recipes.filter((r) => matchesNutrient(r, 'low-cal'))) {
			expect(r.nutritionPerServing.energy_kcal, r.id).toBeLessThanOrEqual(400);
		}
	});
	it('low-carb flag is <= 20 g carbs per serving', () => {
		for (const r of recipes.filter((r) => matchesNutrient(r, 'low-carb'))) {
			expect(r.nutritionPerServing.carbohydrates_g, r.id).toBeLessThanOrEqual(20);
		}
	});
	it('nutrientFlags returns all four keys for every recipe', () => {
		for (const r of recipes) {
			const f = nutrientFlags(r);
			expect(Object.keys(f).sort()).toEqual(['high-fibre', 'high-protein', 'low-cal', 'low-carb']);
		}
	});
});

describe('per-serving and per-100g values', () => {
	it('every recipe has finite per-serving and per-100g macros', () => {
		for (const r of recipes) {
			for (const m of [r.nutritionPerServing, r.nutritionPer100g]) {
				expect(Number.isFinite(m.energy_kcal), r.id).toBe(true);
				expect(Number.isFinite(m.protein_g), r.id).toBe(true);
				expect(Number.isFinite(m.carbohydrates_g), r.id).toBe(true);
			}
		}
	});
});

describe('recipe images resolve', () => {
	it('every recipe resolves to a real /img path (final art or placeholder)', () => {
		for (const r of recipes) {
			const src = recipeImage(r);
			expect(src.startsWith('/img/'), `${r.id} -> ${src}`).toBe(true);
		}
	});
});

describe('alcohol detection + contradiction', () => {
	it('flags a wine/beer recipe as not alcohol-free, and a plain one as alcohol-free', () => {
		const withAlc = recipes.find((r) => r.ingredients.some((i) => /wine|beer/.test(i.ingredientId)));
		if (withAlc) expect(isAlcoholFree(withAlc)).toBe(false);
		const noAlc = recipes.find((r) => r.ingredients.every((i) => !/wine|beer|rum|vodka/.test(i.ingredientId)));
		if (noAlc) expect(isAlcoholFree(noAlc)).toBe(true);
	});
	it('gain goal + low-cal is a contradiction; lose goal is not', () => {
		expect(isContradiction('gain', ['low-cal'])).toBe(true);
		expect(isContradiction('lose', [])).toBe(false);
	});
});

describe('JSON-LD required fields are present on every recipe', () => {
	it('name, instructions, and nutrition exist', () => {
		for (const r of recipes) {
			expect(r.name.en.length, r.id).toBeGreaterThan(0);
			expect(r.instructions.length, r.id).toBeGreaterThan(0);
			expect(Number.isFinite(r.nutritionPerServing.energy_kcal), r.id).toBe(true);
		}
	});
});

describe('smart gluten-free / lactose-free (Theme 9)', () => {
	it('a non-GF pasta dish is gluten-free-able (annotated, not dropped)', () => {
		const r = recipes.find((x) => x.id === 'spaghetti-bolognese');
		expect(r).toBeTruthy();
		expect(r!.dietary.glutenFree).toBe(false);
		expect(glutenFreeable(r!)).toBe(true);
	});

	it('glutenFreeable is consistent: a natively GF recipe stays GF-able', () => {
		const gf = recipes.find((x) => x.dietary.glutenFree);
		if (gf) expect(glutenFreeable(gf)).toBe(true);
	});

	it('dietAnnotations marks a swappable pasta ingredient under the GF filter only', () => {
		const pasta = ingredients.find((i) => i.family === 'pasta' && !i.dietary.glutenFree);
		expect(pasta).toBeTruthy();
		expect(glutenSwappable(pasta!)).toBe(true);
		const on = dietAnnotations(pasta!, ['glutenFree']);
		expect(on.map((x) => x.en)).toEqual(['gluten free']);
		expect(dietAnnotations(pasta!, []).length).toBe(0);
	});

	it('lactoseFreeable keeps a milk dish; milk gets a lactose-free annotation', () => {
		const milk = getIngredient('milk');
		expect(milk).toBeTruthy();
		const notes = dietAnnotations(milk!, ['lactoseFree']).map((x) => x.en);
		// milk is not natively lactose-free in the DB -> it should be annotated, not dropped
		if (!milk!.dietary.lactoseFree) expect(notes).toContain('lactose-free');
	});
});

describe('course localization parity (Theme 10)', () => {
	const LANGS = ['en', 'fi', 'hu', 'sv'] as const;
	it('every recipe course value has a complete 4-language label', () => {
		for (const r of recipes) {
			for (const c of r.course) {
				const lbl = COURSE_LABELS[c];
				expect(lbl, 'course missing from COURSE_LABELS: ' + c).toBeTruthy();
				for (const l of LANGS) expect(lbl[l].length, c + '.' + l).toBeGreaterThan(0);
			}
		}
	});
	it('known courses are actually translated (not the raw English fallback)', () => {
		expect(courseLabel('breakfast', 'fi')).toBe('Aamiainen');
		expect(courseLabel('main course', 'hu')).toBe('Főétel');
		expect(courseLabel('casserole', 'sv')).toBe('Gratäng');
	});
	it('renamed recipes dropped their marketing suffixes', () => {
		const ids = ['high-protein-muffins', 'chicken-tikka-masala-meal-prep', 'salmon-potato-veg-traybake-family'];
		for (const id of ids) {
			const r = recipes.find((x) => x.id === id);
			expect(r, id).toBeTruthy();
			expect(/meal prep|bulk|family |high-protein/i.test(r!.name.en), id + ' name still has a suffix').toBe(false);
		}
	});
});
