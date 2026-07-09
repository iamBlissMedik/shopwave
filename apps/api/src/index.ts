import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/**
 * Graceful shutdown: stop accepting new connections, then close the DB pool.
 * Important in containerized/production environments so in-flight requests
 * finish and connections are released cleanly.
 */
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Closed HTTP server and database connections');
    process.exit(0);
  });
  // Failsafe: force-exit if cleanup hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
