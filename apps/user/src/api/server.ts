import 'server-only';

import { createServerApi } from '@shopwave/hooks/server';
import { createApi } from './create';

/** The storefront API for Server Components, called as the current visitor. */
export const getServerApi = createServerApi(createApi);
