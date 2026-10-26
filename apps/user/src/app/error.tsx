'use client';

import { useEffect } from 'react';
import { ErrorState, Button } from '@shopwave/ui';

/**
 * Route-level error boundary. Catches render/data errors in this segment and
 * shows a friendly, recoverable panel instead of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward to your monitoring service (Sentry, etc.).
    console.error(error);
  }, [error]);

  return (
    <ErrorState message="An unexpected error occurred. You can try again.">
      <Button onClick={reset}>Try again</Button>
    </ErrorState>
  );
}
