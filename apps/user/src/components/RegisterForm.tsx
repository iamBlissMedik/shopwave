'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { ShoppingBag, Store, type LucideIcon } from 'lucide-react';
import { registerSchema, type RegisterValues } from '@shopwave/types';
import { useAuth, notify } from '@shopwave/hooks';
import { Input, Button } from '@shopwave/ui';

type SignupRole = RegisterValues['role'];

/** One of the two "I want to…" choices. */
function RoleCard({
  icon: Icon,
  title,
  desc,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        'flex flex-1 flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
        selected ? 'border-brand bg-brand/10' : 'border-border hover:bg-surface-muted',
      )}
    >
      <Icon size={20} aria-hidden className={selected ? 'text-brand' : 'text-muted'} />
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted">{desc}</span>
    </button>
  );
}

/** Sign-up form: shopper or seller, with a store name for sellers. */
export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'USER' },
  });

  const role = useWatch({ control, name: 'role' });
  const selectRole = (value: SignupRole) => setValue('role', value, { shouldValidate: true });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const user = await registerUser(values);
      notify.success('Account created!');
      if (user.role === 'MERCHANT') {
        notify.message('Open the Merchant portal to manage your store.', { icon: '🏪' });
      }
      router.push('/');
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <span className="mb-1 block text-sm font-medium text-foreground">I want to…</span>
          <div className="flex gap-3">
            <RoleCard
              icon={ShoppingBag}
              title="Shop"
              desc="Browse and buy products"
              selected={role === 'USER'}
              onSelect={() => selectRole('USER')}
            />
            <RoleCard
              icon={Store}
              title="Sell"
              desc="List and manage products"
              selected={role === 'MERCHANT'}
              onSelect={() => selectRole('MERCHANT')}
            />
          </div>
        </div>

        <Input
          id="name"
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        {role === 'MERCHANT' && (
          <Input
            id="storeName"
            label="Store name"
            placeholder="e.g. SoundHub Audio"
            error={errors.storeName?.message}
            {...register('storeName')}
          />
        )}

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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
