'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '@shopwave/types';
import { useAuth, notify } from '@shopwave/hooks';
import { Input, Button } from '@shopwave/ui';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values);
      if (user.role !== 'ADMIN') {
        // Right credentials, wrong portal: drop the session we just created so the
        // user isn't left silently logged-in on an app they can't use.
        await logout();
        notify.error('This console is for admin accounts.');
        return;
      }
      notify.success('Welcome back!');
      router.push(redirect && redirect !== '/login' ? redirect : '/');
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Admin login</h1>
      <p className="mb-6 text-sm text-muted">Restricted — platform operators only.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="email" type="email" label="Email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input id="password" type="password" label="Password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <div className="mt-4 space-y-1 rounded-md border border-border bg-surface-muted p-3 text-xs text-muted">
        <p><b className="text-foreground">Admin demo:</b> admin@example.com / Admin123!</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
