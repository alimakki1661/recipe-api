# Recipe API

Recipe API is a CSC 436 Express and TypeScript backend. It stores recipes in Supabase and supports listing, filtering by meal category, creating, replacing, and deleting recipes.

## Run locally

1. Use Node.js 24 and run `npm ci`.
2. In a dedicated Supabase project, run the SQL in [the migration](supabase/migrations/20261123000100_create_recipes.sql) in the SQL Editor. Then run [the seed SQL](supabase/seed.sql) for sample recipes.
3. Copy `.env.example` to `.env`. Set `SUPABASE_URL` to the project's API URL and `SUPABASE_SERVICE_ROLE_KEY` to the server-only service role or secret key. Keep the key in local or Vercel environment variables.
4. Run `npm run dev` and open `http://localhost:3000/api/recipes?category=lunch`. Run `npm run typecheck` to check the TypeScript.

The demo API lets anyone with its URL write to the recipes table through Express. Use sample recipes in the dedicated project.

Regenerate the database types after changing the schema. Sign in with `npx supabase login`, replace `YOUR_PROJECT_REF` with your Supabase project reference, and run:

```sh
npx supabase gen types typescript --remote=YOUR_PROJECT_REF --schema public > database.types.ts.tmp
```

After confirming that the command succeeded and the file contains `export type Database`, move it to `src/database.types.ts` and rerun the type check.

## Endpoints

| Method | Path | Request body | Success response |
| --- | --- | --- | --- |
| GET | `/` | None | `200` — `{"name":"Recipe API","recipes":"/api/recipes"}` |
| GET | `/api/recipes` | None. Optional `?category=lunch` | `200` — `[recipe]` using the recipe object below, newest first. Returns `[]` when no records match. |
| GET | `/api/recipes/:id` | None. Use a recipe UUID in the path. | `200` — the recipe object below |
| POST | `/api/recipes` | Recipe input below | `201` — the created recipe object and a `Location` header |
| PUT | `/api/recipes/:id` | All four recipe fields | `200` — the updated recipe object |
| DELETE | `/api/recipes/:id` | None | `200` — `{"deleted":true,"id":"13d4e54d-aed7-47d6-8121-82b7f08de356"}` |

Send `Content-Type: application/json` with this body for POST or PUT:

```json
{
  "title": "Lemon Chickpea Salad",
  "category": "lunch",
  "ingredients": ["1 can chickpeas", "1 cucumber", "1 lemon", "1 tbsp olive oil"],
  "instructions": "Dice the cucumber. Toss with rinsed chickpeas, lemon juice, and olive oil."
}
```

A recipe object returned by the API looks like this:

```json
{
  "id": "13d4e54d-aed7-47d6-8121-82b7f08de356",
  "title": "Lemon Chickpea Salad",
  "category": "lunch",
  "ingredients": ["1 can chickpeas", "1 cucumber", "1 lemon", "1 tbsp olive oil"],
  "instructions": "Dice the cucumber. Toss with rinsed chickpeas, lemon juice, and olive oil.",
  "created_at": "2026-11-23T16:00:00+00:00"
}
```

Categories are `breakfast`, `lunch`, `dinner`, and `dessert`. Titles allow 1–120 characters, instructions allow 1–3,000, and each recipe needs 1–30 ingredients of 1–200 characters each. The database assigns `id` and `created_at`.

Errors use the shape `{"error":"Recipe not found."}`. Invalid JSON, bodies, UUIDs, and category filters return `400`. Unknown routes and missing recipes return `404`. Bodies larger than 32 KB return `413`. Unexpected server or database failures return `500` with a generic message and details in the server logs.

See [requests.http](requests.http) for the full request sequence.

## Vercel

**Live base URL** — https://recipe-api-three-mu.vercel.app

1. Push this project to a GitHub repository that your grader can open.
2. [Import the repository into Vercel](https://vercel.com/new). Express is detected from the root `index.ts` and its default app export.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` under the Vercel project's environment variables for Production, then deploy or redeploy.
4. Replace the pending URL above with the production domain and commit the README update. Verify the GitHub link, app root, and filtered list in an incognito window.
5. The Brightspace comment should use the actual production domain in a request such as `GET https://YOUR-PRODUCTION-DOMAIN/api/recipes?category=lunch`.

[Vercel Express guide](https://vercel.com/kb/guide/ship-a-express-app-on-vercel) · [Supabase type generation](https://supabase.com/docs/guides/api/rest/generating-types)

## Walkthrough

Start at `index.ts` and trace a PUT request. The logger records the response status, `express.json()` parses the body, and the recipe router validates the UUID and four fields before calling Supabase. The update filters by UUID and returns the changed row. With no matching row, `maybeSingle()` returns null, and the route throws a 404. Express 5 forwards thrown errors from async routes to the centralized handler.
