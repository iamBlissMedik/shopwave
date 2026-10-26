'use client';

import { createContext } from 'react';
import type { User, LoginValues, RegisterValues } from '@shopwave/types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  /** Ends the session and (by default) reloads at `/`. Pass `{ redirect: false }` to stay put. */
  logout: (options?: { redirect?: boolean }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
