'use client';

import toast, { type ToastOptions } from 'react-hot-toast';
import { getErrorMessage } from '@shopwave/api-client';

/**
 * The shared toast API for every app. One place controls how notifications look
 * and — crucially — how errors are turned into user-facing messages: `notify.error`
 * accepts ANY thrown value (HttpError, Error, string) and runs it through
 * `getErrorMessage` — an `HttpError` already carries the API's own message.
 *
 * Always prefer this over importing `react-hot-toast` directly, so styling and
 * error normalization stay consistent across user / merchant / admin.
 */
export const notify = {
  success: (message: string, opts?: ToastOptions) => toast.success(message, opts),
  /**
   * Accepts any error shape — a caught `HttpError`/`Error` (normalized via
   * `getErrorMessage`) or a ready-made string message — and shows it.
   */
  error: (error: unknown, opts?: ToastOptions) =>
    toast.error(typeof error === 'string' ? error : getErrorMessage(error), opts),
  message: (message: string, opts?: ToastOptions) => toast(message, opts),
};
