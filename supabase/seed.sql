insert into public.recipes (id, title, category, ingredients, instructions)
values
  (
    '13d4e54d-aed7-47d6-8121-82b7f08de356',
    'Lemon Chickpea Salad',
    'lunch',
    array['1 can chickpeas', '1 cucumber', '1 lemon', '1 tbsp olive oil'],
    'Dice the cucumber. Toss with rinsed chickpeas, lemon juice, and olive oil.'
  ),
  (
    'a82e6811-6fbb-460a-9474-bec3a9ec763e',
    'Tomato Pasta',
    'dinner',
    array['8 oz pasta', '1 cup crushed tomatoes', '2 cloves garlic'],
    'Cook the pasta. Simmer the tomatoes with minced garlic and toss with the pasta.'
  )
on conflict (id) do nothing;
