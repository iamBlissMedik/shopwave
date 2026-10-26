'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues, type Role } from '@shopwave/types';
import { Button, Input } from '@shopwave/ui';
import { useAuth } from './useAuth';
import { notify } from './notify';
import { safeRedirect } from './safeRedirect';

export interface LoginFormProps {
  title: string;
  description: ReactNode;
  /**
   * Restrict this login to one role (the merchant / admin portals). A correct
   * login with another role is signed straight back out. Omit to allow anyone.
   */
  role?: Role;
  /** Demo-credentials hint shown under the form. */
  demo?: ReactNode;
  /** Extra content below the form (e.g. a "Sign up" link). */
  footer?: ReactNode;
}

/**
 * The login page body shared by all three apps: validated email/password form,
 * optional role gate, and a sanitized `?redirect=` back to where the visitor
 * was headed.
 */
export function LoginForm({ title, description, role, demo, footer }: LoginFormProps) {
  const router = useRouter();
  const { login, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values);
      if (role && user.role !== role) {
        // Right credentials, wrong portal: drop the session we just created so the
        // user isn't left silently logged in on an app they can't use.
        await logout({ redirect: false });
        notify.error(`This portal is for ${role.toLowerCase()} accounts.`);
        return;
      }
      notify.success('Welcome back!');
      // Read at submit time rather than via `useSearchParams()`, which would
      // force the statically rendered page to bail out to client-only rendering.
      router.push(safeRedirect(new URLSearchParams(window.location.search).get('redirect')));
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-sm text-muted">{description}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      {demo && (
        <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3 text-xs text-muted">
          {demo}
        </div>
      )}
      {footer && <div className="mt-4 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
