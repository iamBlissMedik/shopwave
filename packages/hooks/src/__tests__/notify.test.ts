import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-hot-toast so we can assert what the shared notify helper forwards.
// `vi.hoisted` makes the mock available at hoist time (vi.mock is hoisted above
// regular top-level declarations).
const toast = vi.hoisted(() =>
  Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
);
vi.mock('react-hot-toast', () => ({ default: toast }));

import { notify } from '../notify';

describe('notify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normalizes a thrown Error to its message', () => {
    notify.error(new Error('Cart is empty'));
    expect(toast.error).toHaveBeenCalledWith('Cart is empty', undefined);
  });

  it('passes a ready-made string message straight through', () => {
    notify.error('This portal is for merchant accounts.');
    expect(toast.error).toHaveBeenCalledWith('This portal is for merchant accounts.', undefined);
  });

  it('forwards success messages', () => {
    notify.success('Order placed successfully!');
    expect(toast.success).toHaveBeenCalledWith('Order placed successfully!', undefined);
  });
});
