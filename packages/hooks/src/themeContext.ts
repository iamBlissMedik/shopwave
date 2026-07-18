'use client';

import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme; // the user's preference
  resolvedTheme: 'light' | 'dark'; // what is actually applied
  setTheme: (theme: Theme) => void;
  toggle: () => void; // cycles light → dark → system
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
