'use client';

import { createContext } from 'react';
import type { User, LoginValues, RegisterValues } from '@shopwave/types';

/**
 * - `loading`: the first check is in flight.
 * - `signed-in` / `signed-out`: the API gave a definite answer.
 * - `unknown`: the API couldn't be reached. Show neither "Login" nor the user,
 *   and don't act on it; the check retries in the background.
 */
export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'unknown';

export interface AuthContextValue {
  /** The signed-in user; `null` unless `status` is `signed-in`. */
  user: User | null;
  status: AuthStatus;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  /** Ends the session and (by default) reloads at `/`. Pass `{ redirect: false }` to stay put. */
  logout: (options?: { redirect?: boolean }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
