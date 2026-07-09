import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import '@shopwave/config/globals.css';
import { themeNoFlashScript } from '@shopwave/hooks';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

// Geist = display/headings (self-hosted), Nunito Sans = body (shared across apps).
const sans = Nunito_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Shopwave Merchant',
  description: 'Manage your store, products and sales.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${GeistSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
