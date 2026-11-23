import express from 'express';
import { handleError, HttpError } from './src/errors.js';
import { recipes } from './src/recipes.js';

const app = express();

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.once('finish', () => {
    console.info(JSON.stringify({
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
});

app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => {
  res.json({ name: 'Recipe API', recipes: '/api/recipes' });
});
app.use('/api/recipes', recipes);

app.use((_req, _res, next) => next(new HttpError(404, 'Route not found.')));
app.use(handleError);

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => console.info(`Recipe API listening on port ${port}`));
}

export default app;
