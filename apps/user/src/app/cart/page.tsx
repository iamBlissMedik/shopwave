import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

/**
 * Rendered client-side on purpose: a guest's first cart request mints their
 * session cookie, which must reach the browser — a server-side fetch would set
 * it on a response the browser never sees.
 */
export default function CartPage() {
  return <CartView />;
}
