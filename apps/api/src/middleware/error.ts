import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../lib/logger';
import { isProd } from '../config/env';

/** 404 handler for unmatched routes. Registered after all real routes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

/**
 * Central error handler. Every thrown error funnels here and is converted into
 * a consistent JSON envelope: { error: { message, details? } }.
 * We deliberately never leak stack traces or internal messages in production.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique-constraint violation → 409 Conflict
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with these details already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
  } else if (err instanceof Error && !isProd) {
    message = err.message;
  }

  if (statusCode >= 500) {
    logger.error({ err }, 'Unhandled error');
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
}
