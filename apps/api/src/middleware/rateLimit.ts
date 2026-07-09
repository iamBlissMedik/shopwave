import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env';

// Rate limiting is disabled under test so the suite can register many users
// from one IP without tripping the brute-force guard.
const skip = () => isTest;

/** Global limiter — blunt protection against abusive clients. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { error: { message: 'Too many requests, please try again later.' } },
});

/** Tighter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { error: { message: 'Too many auth attempts, please try again later.' } },
});

/**
 * Extra-tight limiter for the admin surface — the highest-privilege area, so it
 * gets the strictest budget as one more layer of defense.
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { error: { message: 'Too many admin requests, please try again later.' } },
});
