import type { TablesInsert } from './database.types.js';
import { HttpError } from './errors.js';

const categories = ['breakfast', 'lunch', 'dinner', 'dessert'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateId(value: string) {
  if (!uuid.test(value)) {
    throw new HttpError(400, 'Recipe ID must be a valid UUID.');
  }
  return value;
}

export function validateCategory(value: unknown) {
  if (typeof value !== 'string' || !categories.includes(value)) {
    throw new HttpError(400, `Category must be one of: ${categories.join(', ')}.`);
  }
  return value;
}

function validateText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new HttpError(400, `${field} must be a string with 1 to ${maxLength} characters.`);
  }

  if (value.includes('\u0000')) {
    throw new HttpError(400, `${field} cannot contain null characters.`);
  }

  return value.trim();
}

export function validateRecipe(body: unknown): TablesInsert<'recipes'> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Send a JSON object with title, category, ingredients, and instructions.');
  }

  const fields = ['title', 'category', 'ingredients', 'instructions'];
  if (Object.keys(body).some((key) => !fields.includes(key))) {
    throw new HttpError(400, 'Only title, category, ingredients, and instructions can be written.');
  }

  const { title, category, ingredients, instructions } = body as Record<string, unknown>;
  if (!Array.isArray(ingredients) || ingredients.length < 1 || ingredients.length > 30) {
    throw new HttpError(400, 'Ingredients must be an array containing 1 to 30 strings.');
  }

  return {
    title: validateText(title, 'Title', 120),
    category: validateCategory(category),
    ingredients: ingredients.map((ingredient, index) => (
      validateText(ingredient, `Ingredient ${index + 1}`, 200)
    )),
    instructions: validateText(instructions, 'Instructions', 3000),
  };
}
