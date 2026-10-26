import type { Metadata } from 'next';
import { NewProductView } from '@/components/NewProductView';

export const metadata: Metadata = { title: 'Add product' };

export default function NewProductPage() {
  return <NewProductView />;
}
