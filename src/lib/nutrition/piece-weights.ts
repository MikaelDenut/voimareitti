// Average edible grams per ONE piece, for the "add a food by the piece" feature (an apple, a banana, one
// carrot, three oranges). Sourced from real data - see planning/piece-weights-research.md for the per-row
// citation. Primary sources: the FDA "Raw Fruits" + "Raw Vegetables" nutrition charts (edible-weight
// portions), USDA FoodData Central standard household portions, and USDA / American Egg Board egg weights.
// Values are approximate by nature (produce varies); they are display defaults and the grams field always
// lets the user override. Ingredients NOT in this map are entered by grams only (berries, melons, leaves).

export const PIECE_GRAMS: Record<string, number> = {
	// fruit
	apple: 182, avocado: 150, banana: 126, clementine: 74, satsuma: 90, mandarin: 88,
	grapefruit: 154, kiwi: 74, lemon: 58, lime: 67, mango: 200, nectarine: 140, orange: 154,
	peach: 147, pear: 166, persimmon: 168, plum: 76, pomegranate: 282, strawberry: 18,
	dates: 24, prunes: 8,
	// protein
	egg: 50, 'egg-white': 33,
	// vegetables
	'bell-pepper': 148, 'red-bell-pepper': 148, 'green-bell-pepper': 148, 'yellow-bell-pepper': 148,
	carrot: 61, cucumber: 300, tomato: 123, 'cherry-tomato': 17, 'yellow-onion': 148, 'red-onion': 148,
	shallot: 40, 'pearl-onion': 10, 'spring-onion': 15, 'spring-onion-green': 15, potato: 148,
	'sweet-potato': 130, beetroot: 82, radish: 12, 'button-mushroom': 17, courgette: 196, leek: 89,
	parsnip: 130, 'celery-sticks': 40, sweetcorn: 90,
	// carbs (slices / units)
	bread: 28, 'rye-bread': 32, 'wholegrain-rye-crispbread': 10, 'tortilla-wrap': 49, flatbread: 60
};

/** Grams for a piece count of an ingredient, or null if the ingredient has no known per-piece weight. */
export function piecesToGrams(ingredientId: string, pieces: number): number | null {
	const g = PIECE_GRAMS[ingredientId];
	if (g == null) return null;
	return Math.round(g * pieces);
}

/** Whether an ingredient can be counted in pieces (has a sourced per-piece weight). */
export function isCountable(ingredientId: string): boolean {
	return ingredientId in PIECE_GRAMS;
}
