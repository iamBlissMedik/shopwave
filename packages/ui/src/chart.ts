import type { CSSProperties } from 'react';

/**
 * Fixed chart palette, drawn from the FunRadar foundation. Mid-tone hues chosen
 * to read well in BOTH light and dark themes, so charts stay uniform without
 * recomputing colors on theme change. Mirrors the `accent-*` Tailwind tokens.
 */
export const CHART = {
  brand: '#7855fd', // brand-450 (vivid on either background)
  axis: '#a3a3a3', // grey-400 (legible on either background)
  grid: 'rgba(163, 163, 163, 0.2)',
  // purple · teal · hibiscus · yellow · atlantis
  series: ['#7855fd', '#1cc9a5', '#ea4a9a', '#f6b51e', '#96c91c'],
};

/** Recharts tooltip box, themed through the design-token CSS variables. */
export const chartTooltipStyle: CSSProperties = {
  backgroundColor: 'rgb(var(--color-surface))',
  border: '1px solid rgb(var(--color-border))',
  borderRadius: 8,
  color: 'rgb(var(--color-foreground))',
  fontSize: 12,
};
