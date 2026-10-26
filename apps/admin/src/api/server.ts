import 'server-only';

import { createServerApi } from '@shopwave/hooks/server';
import { createApi } from './create';

/**
 * The admin API for Server Components, called as the signed-in admin. Every call
 * first waits for a confirmed ADMIN session (see `createServerApi`).
 */
export const getServerApi = createServerApi(createApi, { role: 'ADMIN' });
