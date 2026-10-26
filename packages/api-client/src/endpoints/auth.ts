import type { User, LoginValues, RegisterValues } from '@shopwave/types';
import type { Http } from '../http';

/** Auth endpoints. Tokens live in an httpOnly cookie set by the API. */
export function authEndpoints(http: Http) {
  return {
    me: () => http.get<{ user: User }>('/auth/me'),
    login: (values: LoginValues) => http.post<{ user: User }>('/auth/login', values),
    register: (values: RegisterValues) => http.post<{ user: User }>('/auth/register', values),
    logout: () => http.post<{ message: string }>('/auth/logout'),
  };
}
