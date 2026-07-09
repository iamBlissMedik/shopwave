import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Augment Express' Request type so `req.user` is strongly typed everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

/**
 * Reads the JWT from the httpOnly cookie (preferred) or the
 * `Authorization: Bearer <token>` header, verifies it, and attaches the user.
 * Storing the token in an httpOnly cookie keeps it out of reach of JS/XSS.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookieToken ?? bearer;

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

/**
 * Like `authenticate`, but never rejects: if a valid token is present it attaches
 * `req.user`; otherwise it just continues anonymously. Used by the cart routes so
 * guests (no token) and logged-in customers share the same endpoints — the
 * controller resolves the cart owner from `req.user` or a guest session cookie.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookieToken ?? bearer;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Ignore an invalid/expired token — fall through as a guest.
    }
  }
  next();
}

/** Restrict a route to specific roles (e.g. admin-only product mutations). */
export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden('Insufficient permissions');
    next();
  };
