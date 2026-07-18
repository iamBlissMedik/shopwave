import { Spinner } from './Spinner';

/**
 * Centered loading panel — the loading twin of `ErrorState`, shown while a route
 * or section fetches its data. Presentational. The spinner carries the
 * accessible announcement; the visible label is decorative (`aria-hidden`) so
 * screen readers hear the message once.
 */
export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mb-4 flex justify-center text-brand">
        <Spinner size="lg" label={message} />
      </div>
      <p className="text-muted" aria-hidden>
        {message}
      </p>
    </div>
  );
}
