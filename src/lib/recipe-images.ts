// Food image resolver (planning section 22). Single source of truth for turning an ingredient or recipe
// into an <img> src that ALWAYS resolves to a real file: final art when present, a deterministic
// placeholder otherwise. Missing final art is allowed; broken images are not (CLAUDE.md Hard Rule:
// images must never block implementation). Plain hyphens only; no health claims here.

import { ingredientImageFiles, type IngredientRole } from './content/ingredients';
import { recipeImageFiles } from './content/recipes';

// All placeholders are Mikael's purpose-made art under static/img/placeholders/.
const PH = (slug: string) => `/img/placeholders/placeholder-${slug}.png`;
const ROLE = (role: string) => `/img/placeholders/role-${role}.png`;        // role-protein.png ...
const GROUP = (key: string) => `/img/placeholders/group-${key}.png`;        // group-protein.png ...
const GENERIC_RECIPE = PH('recipe-generic');

// Recipe course -> the matching course placeholder.
const COURSE_PLACEHOLDER: Record<string, string> = {
	breakfast: PH('breakfast'),
	lunch: PH('lunch'),
	dinner: PH('dinner'),
	snack: PH('snack'),
	dessert: PH('dessert'),
	soup: PH('soup'),
	salad: PH('salad')
};

// Ingredient role -> Mikael's role placeholder (files match the IngredientRole names exactly).
const ROLE_PLACEHOLDER: Record<IngredientRole, string> = {
	protein: ROLE('protein'), carb: ROLE('carb'), vegetable: ROLE('vegetable'),
	fruit: ROLE('fruit'), fat: ROLE('fat'), dairy: ROLE('dairy'),
	legume: ROLE('legume'), seasoning: ROLE('seasoning'), liquid: ROLE('liquid'), other: ROLE('other')
};

// Food-group key (workout funnel + nutrition cards) -> Mikael's group placeholder.
const FOOD_GROUP_PLACEHOLDER: Record<string, string> = {
	protein: GROUP('protein'),
	carbs: GROUP('carbs'),
	vegetables: GROUP('vegetables'),
	fruit: GROUP('fruit'),
	fats: GROUP('fats'),
	'dairy-and-alternatives': GROUP('dairy-and-alternatives'),
	fibre: GROUP('vegetables')
};

/** Placeholder for an ingredient role - Mikael's role art under /img/placeholders/. */
export function placeholderForRole(role?: IngredientRole): string {
	return (role && ROLE_PLACEHOLDER[role]) || ROLE('other');
}

/** Placeholder for a food-group key - Mikael's group art under /img/placeholders/. */
export function placeholderForFoodGroup(key?: string): string {
	return (key && FOOD_GROUP_PLACEHOLDER[key]) || GENERIC_RECIPE;
}

/** Placeholder for a recipe course - uses Mikael's purpose-made course placeholders. */
export function placeholderForCourse(course?: string): string {
	return (course && COURSE_PLACEHOLDER[course]) || GENERIC_RECIPE;
}

/**
 * Resolve an ingredient image src. Returns final art (/img/ingredients/<file>) when it exists on disk,
 * otherwise a role placeholder. Never returns a path to a non-existent file.
 */
export function ingredientImage(id: string, role?: IngredientRole): string {
	const file = ingredientImageFiles.get(id);
	if (file) return `/img/ingredients/${file}`;
	return placeholderForRole(role);
}

/** True when an ingredient has final art (not a placeholder). */
export function hasIngredientImage(id: string): boolean {
	return ingredientImageFiles.has(id);
}

/**
 * Resolve a recipe image src. Returns final scene art (/img/recipes/<image>) when the recipe declares
 * one (the build guarantees the file exists), otherwise a course placeholder.
 */
export function recipeImage(r: { id?: string; image?: string; course?: string[] }): string {
	if (r.image && r.image.trim() !== '') return `/img/recipes/${r.image}`;
	const file = r.id ? recipeImageFiles.get(r.id) : undefined;
	if (file) return `/img/recipes/${file}`;
	return placeholderForCourse(r.course?.[0]);
}

/** True when a recipe has final scene art (not a placeholder). */
export function hasRecipeImage(r: { id?: string; image?: string }): boolean {
	if (r.image && r.image.trim() !== '') return true;
	return !!(r.id && recipeImageFiles.has(r.id));
}
