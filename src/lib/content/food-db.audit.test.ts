// Data-quality audit (planning/43 B + C): localization fixes and ingredient category sanity.
import { describe, it, expect } from 'vitest';
import { ingredients, getIngredient } from './ingredients';
import { getRecipe } from './recipes';

describe('localization corrections (planning/43 B)', () => {
	it('Hungarian kiwi is written with w', () => {
		expect(getIngredient('kiwi')!.name.hu).toBe('Kiwi');
	});
	it('honeydew Hungarian is no longer the "mezdinnye" calque', () => {
		const hu = getIngredient('honeydew')!.name.hu;
		expect(hu).not.toBe('Mézdinnye');
		expect(hu.trim().length).toBeGreaterThan(0);
	});
	it('green beans Swedish is the natural term', () => {
		expect(getIngredient('green-beans')!.name.sv).toBe('Gröna bönor');
	});
	it('nutritional yeast Hungarian is the food term, not brewer-yeast', () => {
		expect(getIngredient('nutritional-yeast')!.name.hu).toBe('Táplálékélesztő');
	});
});

describe('no machine-translation regressions (hu/sv/fi not silently equal to en)', () => {
	// Loan words that legitimately read the same in Hungarian/Swedish/Finnish as in English.
	const LOANS = new Set([
		'bulgur', 'chorizo', 'defrutum-saba', 'gnocchi', 'ketchup', 'lime', 'mandarin', 'mascarpone', 'mozzarella', 'nori', 'skyr',
		'pecorino', 'penne', 'ricotta', 'togarashi', 'garam-masala', 'ras-el-hanout', 'gochujang', 'guanciale',
		'edamame', 'tempeh', 'tofu', 'seitan', 'wasabi', 'hummus', 'pesto', 'curry', 'miso', 'tahini', 'quinoa',
		'couscous', 'feta', 'halloumi', 'paneer', 'kiwi', 'mango', 'papaya', 'avocado', 'parmesan', 'cheddar',
		'gruyere', 'chia-seeds', 'hoisin-sauce'
	]);
	it('Hungarian names differ from English unless a known loan word', () => {
		const bad = ingredients.filter((i) => i.name.hu.toLowerCase() === i.name.en.toLowerCase() && !LOANS.has(i.id)).map((i) => i.id);
		expect(bad).toEqual([]);
	});
});

describe('ingredient categories (planning/43 C)', () => {
	it('chia seeds swap within the seed/nut family (not interchangeable with oils)', () => {
		// role stays consistent with all nuts/seeds; the family is what drives sensible swaps.
		expect(getIngredient('chia-seeds')!.family).toBe('nut-seed');
	});
	it('stocks are tagged as the stock family (not a beverage)', () => {
		for (const id of ['chicken-stock', 'beef-stock', 'vegetable-stock']) {
			expect(getIngredient(id)!.family).toBe('stock');
		}
	});
	it('every ingredient has a valid role', () => {
		const ROLES = new Set(['protein', 'carb', 'vegetable', 'fruit', 'fat', 'dairy', 'legume', 'seasoning', 'liquid', 'other']);
		for (const i of ingredients) expect(ROLES.has(i.role), `${i.id} role ${i.role}`).toBe(true);
	});
});

describe('dairy-free derivation (new diet selector)', () => {
	it('dairy foods are not dairy-free', () => {
		for (const id of ['milk', 'butter', 'whey-protein', 'cheese-tortellini', 'cottage-cheese', 'skyr', 'quark', 'greek-yogurt', 'bechamel']) {
			expect(getIngredient(id)!.dietary.dairyFree, id).toBe(false);
		}
	});
	it('plant and non-dairy foods are dairy-free', () => {
		for (const id of ['coconut-milk', 'almond-butter', 'peanut-butter', 'olive-oil', 'chicken-breast', 'oat-drink', 'tofu']) {
			const ing = getIngredient(id);
			if (ing) expect(ing.dietary.dairyFree, id).toBe(true);
		}
	});
	it('Finnish high-protein staples were added', () => {
		for (const id of ['skyr', 'quark']) {
			const ing = getIngredient(id);
			expect(ing, id).toBeTruthy();
			expect(ing!.per100g.protein_g).toBeGreaterThanOrEqual(10);
		}
		expect(getIngredient('quark')!.name.fi).toBe('Rahka');
	});
});

describe('prepared foods live as recipes, not as raw ingredients', () => {
	// An ingredient is a shop-bought basic food. A prepared dish (a fried egg, boiled potatoes) is a RECIPE
	// built from ingredients + instructions. Misclassified prepared foods are CONVERTED, never deleted.
	it('fried egg and boiled potatoes exist as recipes, not as plain ingredients', () => {
		// not sitting in the ingredient table as cooked single-food duplicates...
		expect(getIngredient('fried-egg'), 'fried-egg ingredient').toBeUndefined();
		expect(getIngredient('boiled-potato'), 'boiled-potato ingredient').toBeUndefined();
		// ...but preserved as real recipes built on the raw items, which still exist as ingredients.
		expect(getRecipe('fried-egg'), 'fried-egg recipe').toBeTruthy();
		expect(getRecipe('boiled-potatoes'), 'boiled-potatoes recipe').toBeTruthy();
		for (const id of ['egg', 'potato']) expect(getIngredient(id), id).toBeTruthy();
	});

	it('no eat-alone snack ingredient is itself a cooked/prepared dish', () => {
		// eatAlone foods surface directly as a snack ("1 apple"); none may be a dish needing its own cooking.
		const COOKED = /\b(fried|boiled|cooked|grilled|steamed|poached|mashed|stewed|braised|baked)\b/i;
		const bad = ingredients
			.filter((i) => i.eatAlone && (COOKED.test(i.id) || COOKED.test(i.name.en)))
			.map((i) => i.id);
		expect(bad).toEqual([]);
	});
});

describe('bechamel is a reusable component (ingredient anchor + sub-recipe)', () => {
	it('the bechamel ingredient still exists so the 4 dishes that use it keep their ingredient list', () => {
		const b = getIngredient('bechamel');
		expect(b).toBeTruthy();
		// it contains milk + butter, so it must not read as dairy-free
		expect(b!.dietary.dairyFree).toBe(false);
	});
	it('bechamel also exists as a component sub-recipe with its own ingredients + steps', () => {
		const r = getRecipe('bechamel');
		expect(r, 'bechamel recipe').toBeTruthy();
		expect(r!.component, 'component flag').toBe(true);
		expect(r!.ingredients.length).toBeGreaterThanOrEqual(3); // butter + flour + milk at least
		expect(r!.instructions.length).toBeGreaterThan(0);
	});
});
