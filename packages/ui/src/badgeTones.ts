import type { Tone } from './Badge';

/**
 * Domain → Badge tone mappings (roles, order statuses). The Badge component
 * itself stays generic; these encode the platform's business vocabulary and are
 * shared so merchant and admin consoles colour statuses identically.
 */
export const roleTone: Record<string, Tone> = {
  USER: 'neutral',
  MERCHANT: 'brand',
  ADMIN: 'warning',
};

export const statusTone: Record<string, Tone> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELLED: 'danger',
  active: 'success',
  inactive: 'neutral',
};
