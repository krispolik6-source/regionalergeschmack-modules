// Lokalne przepisy powiązane z produktami / producentami curated
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
export const LOCAL_RECIPES = Object.freeze([
    {
        id: 'bauernfruehstueck',
        name: 'Bauernfrühstück',
        imageSlug: 'daily-dish',
        timeMin: 35,
        difficulty: 'easy',
        ingredientKeys: ['potatoesHof', 'freeEggs', 'onion', 'regionalButter', 'chives'],
        linkedProductSlugs: ['potatoes', 'eggs', 'butter'],
        linkedProducerIds: ['content-hof-mueller', 'content-molkerei-rhein'],
        steps: [
            'Kartoffeln kochen und würfeln.',
            'In Butter mit Zwiebeln anbraten.',
            'Eier zugeben und goldbraun braten.',
            'Würzen und mit Schnittlauch bestreuen.'
        ]
    },
    {
        id: 'kartoffelsalat',
        name: 'Kartoffelsalat',
        imageSlug: 'potatoes',
        timeMin: 40,
        difficulty: 'easy',
        ingredientKeys: ['bioPotatoes', 'vegStock', 'appleVinegar', 'rapeseedOil', 'mustard'],
        linkedProductSlugs: ['potatoes', 'apples'],
        linkedProducerIds: ['content-hof-mueller'],
        steps: [
            'Kartoffeln in der Schale kochen.',
            'Schneiden und mit warmer Brühe übergießen.',
            'Mit Senfdressing vermengen.',
            '20 Minuten ziehen lassen.'
        ]
    },
    {
        id: 'flammkuchen',
        name: 'Flammkuchen',
        imageSlug: 'pastries',
        timeMin: 45,
        difficulty: 'medium',
        ingredientKeys: ['dough', 'sourCream', 'onions', 'baconBerg', 'chives'],
        linkedProductSlugs: ['pastries', 'sausage'],
        linkedProducerIds: ['content-baeckerei-schmidt', 'content-metzgerei-berg'],
        steps: [
            'Teig dünn ausrollen.',
            'Mit Schmand bestreichen.',
            'Zwiebeln und Speck darauf verteilen.',
            'Heiß und kurz backen.'
        ]
    },
    {
        id: 'kaesekuchen',
        name: 'Käsekuchen',
        imageSlug: 'cake',
        timeMin: 70,
        difficulty: 'medium',
        ingredientKeys: ['quark', 'eggs', 'butter', 'sugar', 'vanilla'],
        linkedProductSlugs: ['cheese', 'eggs', 'butter'],
        linkedProducerIds: ['content-molkerei-rhein', 'content-hof-mueller'],
        steps: [
            'Quarkmasse glatt rühren.',
            'In die Form füllen.',
            'Backen bis die Oberfläche goldgelb ist.',
            'Abkühlen lassen.'
        ]
    },
    {
        id: 'apfelstrudel',
        name: 'Apfelstrudel',
        imageSlug: 'apples',
        timeMin: 60,
        difficulty: 'medium',
        ingredientKeys: ['applesHof', 'pastry', 'butter', 'cinnamon', 'raisins'],
        linkedProductSlugs: ['apples', 'butter'],
        linkedProducerIds: ['content-hof-mueller', 'content-molkerei-rhein'],
        steps: [
            'Äpfel schälen und würfeln.',
            'Mit Zimt und Butter vermengen.',
            'Einrollen und backen.',
            'Warm servieren.'
        ]
    },
    {
        id: 'spargelsuppe',
        name: 'Spargelsuppe',
        imageSlug: 'soup',
        timeMin: 35,
        difficulty: 'easy',
        ingredientKeys: ['asparagus', 'stock', 'creamMilk', 'butter', 'chives'],
        linkedProductSlugs: ['soup', 'vegetables', 'milk'],
        linkedProducerIds: ['content-gasthof-eifel', 'content-molkerei-rhein'],
        steps: [
            'Gemüse weich kochen.',
            'Pürieren und mit Milch / Sahne verfeinern.',
            'Abschmecken.',
            'Mit Schnittlauch servieren.'
        ]
    },
    {
        id: 'bratkartoffeln',
        name: 'Bratkartoffeln',
        imageSlug: 'potatoes',
        timeMin: 30,
        difficulty: 'easy',
        ingredientKeys: ['boiledPotatoes', 'onion', 'butterOil', 'saltPepper', 'baconOptional'],
        linkedProductSlugs: ['potatoes', 'butter'],
        linkedProducerIds: ['content-hof-mueller'],
        steps: [
            'Kartoffeln in Scheiben schneiden.',
            'In heißer Butter knusprig braten.',
            'Zwiebeln mitrösten.',
            'Kräftig würzen.'
        ]
    },
    {
        id: 'brotzeit',
        name: 'Brotzeit',
        imageSlug: 'bread',
        timeMin: 15,
        difficulty: 'easy',
        ingredientKeys: ['farmBread', 'butter', 'cheeseSausage', 'cucumberRadish', 'mustard'],
        linkedProductSlugs: ['bread', 'butter', 'cheese', 'sausage'],
        linkedProducerIds: ['content-baeckerei-schmidt', 'content-metzgerei-berg', 'content-molkerei-rhein'],
        steps: [
            'Brot in Scheiben schneiden.',
            'Mit Butter bestreichen.',
            'Belag und Gemüse anrichten.',
            'Sofort servieren.'
        ]
    }
]);

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
    return getProductImageUrl(recipe?.imageSlug) || getProductImageUrl('daily-dish');
}

export default { LOCAL_RECIPES, getRecipes, getRecipeImageUrl };
