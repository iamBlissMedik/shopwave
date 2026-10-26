import 'server-only';

import { getServerHttp } from '@shopwave/hooks/server';
import { createApi } from './create';

/** The admin API for Server Components, called as the signed-in admin. */
export async function getServerApi() {
  return createApi(await getServerHttp());
}
