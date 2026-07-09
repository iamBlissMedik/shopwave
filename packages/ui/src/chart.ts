/**
 * Fixed chart palette, drawn from the FunRadar foundation. Mid-tone hues chosen
 * to read well in BOTH light and dark themes, so charts stay uniform without
 * recomputing colors on theme change. Mirrors the `accent-*` Tailwind tokens.
 */
export const CHART = {
  brand: '#7855fd', // brand-450 (vivid on either background)
  brandSoft: '#bbb2ff', // brand-300
  axis: '#a3a3a3', // grey-400 (legible on either background)
  grid: 'rgba(163, 163, 163, 0.2)',
  // purple · teal · hibiscus · yellow · atlantis
  series: ['#7855fd', '#1cc9a5', '#ea4a9a', '#f6b51e', '#96c91c'],
};
