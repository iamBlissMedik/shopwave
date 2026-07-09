import pino from 'pino';
import { env, isProd, isTest } from '../config/env';

/**
 * Structured logging with Pino.
 * - In development we pretty-print for readability.
 * - In production we emit JSON (one line per event) so log shippers
 *   (Datadog, Loki, CloudWatch, …) can parse it.
 */
export const logger = pino({
  // Silent under test to keep the suite output clean.
  level: isTest ? 'silent' : isProd ? 'info' : 'debug',
  // Pretty transport only in dev — JSON in prod.
  transport: isProd || isTest
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
  // Never log secrets that may sneak into request bodies/headers.
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  base: { env: env.NODE_ENV },
});
