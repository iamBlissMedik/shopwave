import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutDashboard, Package } from 'lucide-react';
import { DashboardShell } from '../DashboardShell';

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
];

describe('DashboardShell', () => {
  it('renders the title, nav items and children', () => {
    render(
      <DashboardShell title="Merchant" nav={nav} pathname="/products">
        <p>Body content</p>
      </DashboardShell>,
    );
    expect(screen.getByText('Merchant')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('marks the active route with the brand style', () => {
    render(
      <DashboardShell title="Merchant" nav={nav} pathname="/products">
        <p>x</p>
      </DashboardShell>,
    );
    const active = screen.getByText('Products').closest('a');
    expect(active?.className).toContain('text-brand');
  });

  it('falls back to a plain <a> when no LinkComponent is given', () => {
    render(
      <DashboardShell title="Merchant" nav={nav} pathname="/">
        <p>x</p>
      </DashboardShell>,
    );
    expect(screen.getByText('Overview').closest('a')).toHaveAttribute('href', '/');
  });
});
