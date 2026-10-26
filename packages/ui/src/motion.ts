/**
 * Shared motion vocabulary. Entrances (page, list, badge, icon) are CSS
 * keyframes defined in the Tailwind preset — `animate-page-in`,
 * `animate-fade-in-up`, `animate-pop-in`, `animate-spin-in` — so they run in
 * server-rendered HTML without JavaScript.
 *
 * `easeOut` is the same expo-out curve as the preset's `ease-out-expo`, for the
 * few JS-driven animations (exit / layout animations in the cart) so both
 * systems move with identical timing.
 */
export const easeOut = [0.16, 1, 0.3, 1] as const;
