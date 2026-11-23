create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  category text not null check (category in ('breakfast', 'lunch', 'dinner', 'dessert')),
  ingredients text[] not null check (cardinality(ingredients) between 1 and 30),
  instructions text not null check (char_length(btrim(instructions)) between 1 and 3000),
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;
revoke all on table public.recipes from public, anon, authenticated;
grant select, insert, update, delete on table public.recipes to service_role;
