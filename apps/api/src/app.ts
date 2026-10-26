import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './lib/logger';
import { globalLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error';
import { buildOpenApiDocument } from './docs/openapi';
import apiRoutes from './routes';

/**
 * Builds and configures the Express application.
 * Middleware order matters — it runs top-to-bottom for every request.
 */
export function createApp() {
  const app = express();

  // Trust the first proxy hop for client IPs (rate limiting, logs): the load balancer
  // for browser traffic, or the Next.js server when it renders pages — it calls the
  // API directly via API_URL and sends just the visitor's IP in X-Forwarded-For,
  // resolved from its own trusted hops (TRUSTED_PROXY_HOPS in the frontends).
  app.set('trust proxy', 1);

  // --- Security & platform middleware ---
  app.use(helmet()); // sensible secure HTTP headers
  app.use(
    cors({
      // Allowlist: only our three frontends (user/merchant/admin) may call the
      // API. A function lets us reflect the matching origin (required when
      // `credentials: true`) and still allow same-origin / curl (no Origin).
      origin(origin, callback) {
        // Allow same-origin / non-browser callers (no Origin header) and the
        // allowlisted frontends. Deny others by simply not emitting the
        // Access-Control-Allow-Origin header (the browser then blocks the
        // response) — without throwing, so preflights don't 500.
        callback(null, !origin || env.CORS_ORIGINS.includes(origin));
      },
      credentials: true, // allow the httpOnly auth cookie to be sent
    }),
  );
  app.use(compression()); // gzip responses
  app.use(express.json({ limit: '10kb' })); // parse JSON bodies, cap size
  app.use(cookieParser()); // populate req.cookies
  app.use(pinoHttp({ logger })); // structured request logging
  app.use(globalLimiter); // basic rate limiting

  // --- Health check (handy for uptime probes / load balancers) ---
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // --- API docs (OpenAPI spec generated from the Zod schemas) ---
  const openApiDocument = buildOpenApiDocument();
  app.get('/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // --- Feature routes ---
  app.use('/api', apiRoutes);

  // --- Fallbacks (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
