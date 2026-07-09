import './env';
import { execSync } from 'node:child_process';

/**
 * Runs once before the whole test run: applies all Prisma migrations to the
 * isolated test database so the schema is current.
 */
export default function globalSetup() {
  execSync('prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });
}
