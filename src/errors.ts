import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(readonly status: 400 | 404, message: string) {
    super(message);
  }
}

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (typeof error === 'object' && error !== null && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Request body must be valid JSON.' });
      return;
    }
    if (error.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body must be 32 KB or less.' });
      return;
    }
  }

  if (error instanceof URIError) {
    res.status(400).json({ error: 'The URL contains invalid encoding.' });
    return;
  }

  console.error('Request failed', error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
};
