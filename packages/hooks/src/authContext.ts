'use client';

import { createContext } from 'react';
import type { User, LoginValues, RegisterValues } from '@shopwave/types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
