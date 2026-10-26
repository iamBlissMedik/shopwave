import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Shield } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpError } from '@shopwave/api-client';
import { AuthProvider } from '../AuthProvider';
import { DashboardNavbar } from '../DashboardNavbar';
import { useAuth } from '../useAuth';
import { api } from '../client';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('../ThemeToggle', () => ({ ThemeToggle: () => null }));

const user = { id: 'u1', email: 'ada@example.com', name: 'Ada Admin', role: 'ADMIN' as const };

function Status() {
  return <p data-testid="status">{useAuth().status}</p>;
}

function renderWithAuth() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Status />
        <DashboardNavbar icon={Shield} label="Admin" />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe('AuthProvider status', () => {
  it('is signed-in with a user, and the navbar offers logout', async () => {
    vi.spyOn(api.auth, 'me').mockResolvedValue({ user } as never);
    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('signed-in'));
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
  });

  it.each([401, 404])('is signed-out on %i, and the navbar offers login', async (status) => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(new HttpError(status, 'Unauthorized'));
    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('signed-out'));
    expect(screen.getByRole('link', { name: 'Login' })).toBeTruthy();
  });

  it.each([
    ['a 5xx', new HttpError(503, 'down')],
    ['a network failure', new HttpError(0, 'Could not reach the server')],
  ])('is unknown on %s, and the navbar shows neither login nor logout', async (_label, error) => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(error);
    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unknown'));
    expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Log out' })).toBeNull();
  });
});
