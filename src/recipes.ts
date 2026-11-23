import { Router } from 'express';
import { HttpError } from './errors.js';
import { getSupabase } from './supabase.js';
import { validateCategory, validateId, validateRecipe } from './validation.js';

export const recipes = Router();

recipes.get('/', async (req, res) => {
  const category = req.query.category === undefined
    ? undefined
    : validateCategory(req.query.category);

  let query = getSupabase().from('recipes').select('*')
    .order('created_at', { ascending: false })
    .order('id');

  if (category !== undefined) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
});

recipes.get('/:id', async (req, res) => {
  const id = validateId(req.params.id);
  const { data, error } = await getSupabase().from('recipes')
    .select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, 'Recipe not found.');
  res.json(data);
});

recipes.post('/', async (req, res) => {
  const recipe = validateRecipe(req.body);
  const { data, error } = await getSupabase().from('recipes')
    .insert(recipe).select().single();

  if (error) throw error;
  res.location(`/api/recipes/${data.id}`).status(201).json(data);
});

recipes.put('/:id', async (req, res) => {
  const id = validateId(req.params.id);
  const recipe = validateRecipe(req.body);
  const { data, error } = await getSupabase().from('recipes')
    .update(recipe).eq('id', id).select().maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, 'Recipe not found.');
  res.json(data);
});

recipes.delete('/:id', async (req, res) => {
  const id = validateId(req.params.id);
  const { data, error } = await getSupabase().from('recipes')
    .delete().eq('id', id).select('id').maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, 'Recipe not found.');
  res.json({ deleted: true, id: data.id });
});
