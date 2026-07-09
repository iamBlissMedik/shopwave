'use client';

import toast, { type ToastOptions } from 'react-hot-toast';
import { getErrorMessage } from '@shopwave/api-client';

/**
 * The shared toast API for every app. One place controls how notifications look
 * and — crucially — how errors are turned into user-facing messages: `notify.error`
 * accepts ANY thrown value (AxiosError, Error, string) and runs it through
 * `getErrorMessage`, which unwraps the API's `{ error: { message } }` envelope.
 *
 * Always prefer this over importing `react-hot-toast` directly, so styling and
 * error normalization stay consistent across user / merchant / admin.
 */
export const notify = {
  success: (message: string, opts?: ToastOptions) => toast.success(message, opts),
  /**
   * Accepts any error shape — a caught `AxiosError`/`Error` (normalized via
   * `getErrorMessage`) or a ready-made string message — and shows it.
   */
  error: (error: unknown, opts?: ToastOptions) =>
    toast.error(typeof error === 'string' ? error : getErrorMessage(error), opts),
  message: (message: string, opts?: ToastOptions) => toast(message, opts),
  loading: (message: string, opts?: ToastOptions) => toast.loading(message, opts),
  dismiss: (id?: string) => toast.dismiss(id),
  /** Tie a toast lifecycle to a promise (loading → success/error). */
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error?: string },
  ) =>
    toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: (err) => msgs.error ?? getErrorMessage(err),
    }),
};

export { getErrorMessage };
