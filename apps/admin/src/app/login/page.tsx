import type { Metadata } from 'next';
import { LoginForm } from '@shopwave/hooks';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <LoginForm
      title="Admin login"
      description="Restricted — platform operators only."
      role="ADMIN"
      demo={
        <p>
          <b className="text-foreground">Admin demo:</b> admin@example.com / Admin123!
        </p>
      }
    />
  );
}
