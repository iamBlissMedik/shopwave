import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validate `req.body`, `req.query` and `req.params` against a Zod schema.
 * On success the parsed (and coerced/defaulted) values replace the originals,
 * so downstream handlers work with fully-typed, trusted data.
 *
 * Usage: router.post('/', validate(z.object({ body: createSchema })), handler)
 */
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      if (parsed.body !== undefined) req.body = parsed.body;
      // req.query / req.params are read-only getters in Express 5-style typings;
      // assigning via Object.assign keeps the same reference.
      if (parsed.query !== undefined) Object.assign(req.query, parsed.query);
      if (parsed.params !== undefined) Object.assign(req.params, parsed.params);

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
        return;
      }
      next(err);
    }
  };
