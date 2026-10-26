import type { Metadata } from 'next';
import { LoginForm } from '@shopwave/hooks';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <LoginForm
      title="Merchant login"
      description="Sign in to manage your store."
      role="MERCHANT"
      demo={
        <p>
          <b className="text-foreground">Merchant demo:</b> sound@example.com / Merchant1!
        </p>
      }
    />
  );
}
