import 'server-only';

import { createServerApi } from '@shopwave/hooks/server';
import { createApi } from './create';

/**
 * The merchant API for Server Components, called as the signed-in merchant. Every call
 * first waits for a confirmed MERCHANT session (see `createServerApi`).
 */
export const getServerApi = createServerApi(createApi, { role: 'MERCHANT' });
