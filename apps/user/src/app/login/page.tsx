import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@shopwave/hooks';

export const metadata: Metadata = { title: 'Log in', robots: { index: false } };

export default function LoginPage() {
  return (
    <LoginForm
      title="Log in"
      description="Try a demo account — see the README for customer / merchant / admin logins."
      demo={
        <p>
          <b className="text-foreground">Customer:</b> user@example.com / User1234!
        </p>
      }
      footer={
        <>
          No account?{' '}
          <Link href="/register" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </>
      }
    />
  );
}
