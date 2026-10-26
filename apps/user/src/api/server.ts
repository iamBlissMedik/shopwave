import 'server-only';

import { getServerHttp } from '@shopwave/hooks/server';
import { createApi } from './create';

/** The storefront API for Server Components, called as the current visitor. */
export async function getServerApi() {
  return createApi(await getServerHttp());
}
