/**
 * Runs before React hydrates to set the correct theme class immediately,
 * preventing a flash of the wrong theme (FOUC). Injected as an inline script.
 *
 * Plain string constant (no React) so a Server Component layout can inline it
 * in <head> without pulling in the client bundle.
 */
export const themeNoFlashScript = `
(function() {
  try {
    var t = localStorage.getItem('theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;
