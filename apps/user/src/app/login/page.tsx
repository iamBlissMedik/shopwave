'use client';

import { Suspense } from 'react';
import Link from 'next/link';
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
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      notify.success('Welcome back!');
      // Storefront always lands at home; merchant/admin have their own apps.
      router.push(redirect || '/');
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Log in</h1>
      <p className="mb-6 text-sm text-muted">
        Try a demo account — see the README for customer / merchant / admin logins.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="email" type="email" label="Email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input id="password" type="password" label="Password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <div className="mt-4 space-y-1 rounded-md border border-border bg-surface-muted p-3 text-xs text-muted">
        <p><b className="text-foreground">Customer:</b> user@example.com / User1234!</p>
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        No account?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
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
