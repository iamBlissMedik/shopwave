import '@testing-library/jest-dom/vitest';

// Recharts' ResponsiveContainer relies on ResizeObserver, which jsdom doesn't
// implement. A no-op stub lets chart components mount (at 0×0) so we can assert
// their surrounding markup — titles, empty states — in unit tests.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
