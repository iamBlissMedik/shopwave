import type { Metadata } from 'next';
import '@shopwave/config/globals.css';
import { AppShell } from '@shopwave/hooks/shell';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: { default: 'Shopwave Admin', template: '%s · Shopwave Admin' },
  description: 'Moderate users and the marketplace catalogue.',
  // A private back-office: keep it out of search engines.
  robots: { index: false, follow: false },
};

/** Fonts, theme, providers and the server-resolved session come from the shared shell. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <AppShell navbar={<Navbar />}>{children}</AppShell>;
}
