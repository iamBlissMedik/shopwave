'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

const STORAGE_KEY = 'theme';

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Apply/remove the `dark` class on <html>. */
function applyClass(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // On mount, read the stored preference (set synchronously by the no-flash
  // script in <head>, so this only syncs React state).
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
    setThemeState(stored);
  }, []);

  // Whenever the preference changes, resolve it and apply the class.
  useEffect(() => {
    const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
    setResolvedTheme(resolved);
    applyClass(resolved);
  }, [theme]);

  // When following the system, react live to OS theme changes.
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = mql.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyClass(resolved);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
