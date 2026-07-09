import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import '@shopwave/config/globals.css';
import { themeNoFlashScript } from '@shopwave/hooks';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

// Geist = display/headings (self-hosted via the `geist` package, exposes
// --font-geist-sans), Nunito Sans = body. Both surface as CSS variables the
// shared Tailwind preset reads (--font-display / --font-sans).
const sans = Nunito_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Shopwave — Marketplace',
  description: 'Shop products from every store — a production-grade MVP storefront.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${GeistSans.variable}`}>
      <head>
        {/* Set the theme class before paint to avoid a flash of the wrong theme. */}
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
