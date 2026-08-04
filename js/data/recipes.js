// Lokalne przepisy powiązane z produktami / producentami
// Nazwy i składniki tłumaczone przez recipes.items.* w translations-content.js

import { getProductImageUrl } from './productImages.js';

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   imageSlug: string,
 *   timeMin: number,
 *   difficulty: 'easy'|'medium'|'hard',
 *   ingredientKeys: string[],
 *   linkedProductSlugs: string[],
 *   linkedProducerIds: string[],
 *   steps: string[]
 * }} Recipe
 */

/** @type {readonly Recipe[]} */
export const LOCAL_RECIPES = Object.freeze([]);

/**
 * @returns {readonly Recipe[]}
 */
export function getRecipes() {
    return LOCAL_RECIPES;
}

/**
 * @param {Recipe} recipe
 * @returns {string | null}
 */
export function getRecipeImageUrl(recipe) {
    return getProductImageUrl(recipe?.imageSlug) || null;
}

export default { LOCAL_RECIPES, getRecipes, getRecipeImageUrl };
