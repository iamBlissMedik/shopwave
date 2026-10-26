import Link from 'next/link';
import { ErrorState, buttonClasses } from '@shopwave/ui';

/** Unknown, removed or hidden product (the API returns 404 for inactive ones). */
export default function ProductNotFound() {
  return (
    <ErrorState
      title="Product not found"
      message="It may have been removed or is no longer for sale."
    >
      <Link href="/" className={buttonClasses()}>
        Back to products
      </Link>
    </ErrorState>
  );
}
