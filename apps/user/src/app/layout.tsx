import type { Metadata } from 'next';
import '@shopwave/config/globals.css';
import { AppShell } from '@shopwave/hooks/shell';
import { Navbar } from '@/components/Navbar';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Shopwave — Marketplace', template: '%s · Shopwave' },
  description: 'Shop products from every store on the Shopwave marketplace.',
  openGraph: { siteName: 'Shopwave', type: 'website' },
};

/** Fonts, theme, providers and the server-resolved session come from the shared shell. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <AppShell navbar={<Navbar />}>{children}</AppShell>;
}
