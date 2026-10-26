import Link from 'next/link';
import { ErrorState, buttonClasses } from '@shopwave/ui';

/** 404 page for unmatched routes. */
export default function NotFound() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you’re looking for doesn’t exist or has moved."
    >
      <Link href="/" className={buttonClasses()}>
        Go home
      </Link>
    </ErrorState>
  );
}
