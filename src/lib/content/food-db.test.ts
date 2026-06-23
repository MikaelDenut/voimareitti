import { describe, it, expect } from 'vitest';
import { ingredients, getIngredient, ingredientImageFiles, type Ingredient } from './ingredients';
import { recipes, getRecipe } from './recipes';
import {
	ingredientImage,
	recipeImage,
	placeholderForRole,
	placeholderForFoodGroup,
	placeholderForCourse
} from '../recipe-images';

const LANGS = ['en', 'fi', 'hu', 'sv'] as const;
const DASH = /[‒–—―−]/; // figure/en/em dash + minus (Hard Rule 1)

function locComplete(loc: Record<string, unknown> | undefined): boolean {
	return !!loc && LANGS.every((l) => typeof loc[l] === 'string' && (loc[l] as string).trim() !== '');
}
function locDashFree(loc: Record<string, string>): boolean {
	return LANGS.every((l) => !DASH.test(loc[l]));
}

describe('food DB integrity', () => {
	it('has the expected data counts', () => {
		expect(ingredients.length).toBe(317);
		expect(recipes.length).toBe(377);
	});

	it('ingredient ids are unique', () => {
		const ids = ingredients.map((i) => i.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('recipe ids are unique', () => {
		const ids = recipes.map((r) => r.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every recipe ingredient references a known ingredient (id or alias)', () => {
		for (const r of recipes) {
			for (const ing of r.ingredients) {
				expect(getIngredient(ing.ingredientId), `${r.id} -> ${ing.ingredientId}`).toBeDefined();
			}
		}
	});

	it('every ingredient name is 4-language and dash-free', () => {
		for (const i of ingredients) {
			expect(locComplete(i.name), `ingredient ${i.id} name`).toBe(true);
			expect(locDashFree(i.name), `ingredient ${i.id} name dash`).toBe(true);
		}
	});

	it('every recipe name + instruction step is 4-language and dash-free', () => {
		for (const r of recipes) {
			expect(locComplete(r.name), `recipe ${r.id} name`).toBe(true);
			expect(locDashFree(r.name), `recipe ${r.id} name dash`).toBe(true);
			expect(r.instructions.length, `recipe ${r.id} instructions`).toBeGreaterThan(0);
			r.instructions.forEach((s, idx) => {
				expect(locComplete(s), `recipe ${r.id} step ${idx + 1}`).toBe(true);
				expect(locDashFree(s), `recipe ${r.id} step ${idx + 1} dash`).toBe(true);
			});
		}
	});

	it('every recipe has valid browse metadata', () => {
		for (const r of recipes) {
			expect(Number.isInteger(r.prepMinutes), `${r.id} prep`).toBe(true);
			expect(Number.isInteger(r.cookMinutes), `${r.id} cook`).toBe(true);
			expect(['easy', 'medium', 'hard']).toContain(r.difficulty);
			expect(Array.isArray(r.equipment), `${r.id} equipment`).toBe(true);
			expect(Array.isArray(r.course) && r.course.length > 0, `${r.id} course`).toBe(true);
		}
	});

	it('dietary flags (incl soyFree) are present and boolean on every ingredient', () => {
		for (const i of ingredients) {
			const d = i.dietary;
			for (const k of ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree', 'nutFree', 'soyFree'] as const) {
				expect(typeof d[k], `ingredient ${i.id}.${k}`).toBe('boolean');
			}
			expect(['low', 'moderate', 'high']).toContain(d.fodmap);
		}
	});

	it('dietary flags (incl soyFree) are present and boolean on every recipe', () => {
		for (const r of recipes) {
			const d = r.dietary;
			for (const k of ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree', 'nutFree', 'soyFree'] as const) {
				expect(typeof d[k], `recipe ${r.id}.${k}`).toBe('boolean');
			}
			expect(['low', 'moderate', 'high']).toContain(d.fodmap);
		}
	});

	it('every recipe has computed per-serving nutrition', () => {
		for (const r of recipes) {
			expect(Number.isFinite(r.nutritionPerServing.energy_kcal), `${r.id} kcal`).toBe(true);
			expect(Number.isFinite(r.nutritionPerServing.protein_g), `${r.id} protein`).toBe(true);
			expect(r.computed.baseServings, `${r.id} servings`).toBeGreaterThan(0);
		}
	});

	it('getRecipe + getIngredient resolve a known id', () => {
		expect(getRecipe(recipes[0].id)?.id).toBe(recipes[0].id);
		expect(getIngredient(ingredients[0].id)?.id).toBe(ingredients[0].id);
		expect(getRecipe('definitely-not-a-recipe')).toBeUndefined();
	});
});

describe('food image resolver', () => {
	it('ingredientImage returns final art when present, placeholder otherwise', () => {
		const withArt = ingredients.find((i: Ingredient) => ingredientImageFiles.has(i.id));
		if (withArt) {
			expect(ingredientImage(withArt.id, withArt.role)).toBe(
				`/img/ingredients/${ingredientImageFiles.get(withArt.id)}`
			);
		}
		const noArt = ingredients.find((i: Ingredient) => !ingredientImageFiles.has(i.id));
		if (noArt) {
			expect(ingredientImage(noArt.id, noArt.role)).toMatch(/^\/img\/placeholders\/role-/);
		}
	});

	it('every ingredient resolves to a non-empty /img path', () => {
		for (const i of ingredients) {
			const src = ingredientImage(i.id, i.role);
			expect(src.startsWith('/img/'), `${i.id} -> ${src}`).toBe(true);
		}
	});

	it('every recipe resolves to a non-empty /img path (placeholder until art lands)', () => {
		for (const r of recipes) {
			const src = recipeImage(r);
			expect(src.startsWith('/img/'), `${r.id} -> ${src}`).toBe(true);
		}
	});

	it('placeholders use Mikael purpose-made art under /img/placeholders/', () => {
		expect(placeholderForRole('protein')).toBe('/img/placeholders/role-protein.png');
		expect(placeholderForFoodGroup('vegetables')).toBe('/img/placeholders/group-vegetables.png');
		expect(placeholderForCourse('dinner')).toBe('/img/placeholders/placeholder-dinner.png');
		expect(placeholderForCourse('unknown-course')).toBe('/img/placeholders/placeholder-recipe-generic.png');
	});
});
