import { describe, expect, it } from 'vitest';
import { roleTone, statusTone } from '../badgeTones';

describe('badgeTones', () => {
  it('maps roles to their tones', () => {
    expect(roleTone.MERCHANT).toBe('brand');
    expect(roleTone.ADMIN).toBe('warning');
    expect(roleTone.USER).toBe('neutral');
  });

  it('maps order/visibility statuses to their tones', () => {
    expect(statusTone.PAID).toBe('success');
    expect(statusTone.CANCELLED).toBe('danger');
    expect(statusTone.active).toBe('success');
    expect(statusTone.inactive).toBe('neutral');
  });
});
