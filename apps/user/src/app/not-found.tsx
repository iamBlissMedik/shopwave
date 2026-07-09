import Link from 'next/link';
import { ErrorState } from '@shopwave/ui';

/** 404 page for unmatched routes. */
export default function NotFound() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you’re looking for doesn’t exist or has moved."
    >
      <Link
        href="/"
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90"
      >
        Go home
      </Link>
    </ErrorState>
  );
}
