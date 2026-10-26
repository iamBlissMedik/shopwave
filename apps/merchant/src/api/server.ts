import 'server-only';

import { getServerHttp } from '@shopwave/hooks/server';
import { createApi } from './create';

/** The merchant API for Server Components, called as the signed-in merchant. */
export async function getServerApi() {
  return createApi(await getServerHttp());
}
