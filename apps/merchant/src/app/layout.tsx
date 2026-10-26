import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { dehydrate } from '@tanstack/react-query';
import '@shopwave/config/globals.css';
import { AppProviders, qk, themeNoFlashScript } from '@shopwave/hooks';
import { getServerUser, makeServerQueryClient } from '@shopwave/hooks/server';
import { Navbar } from '@/components/Navbar';

// Geist = display/headings (self-hosted), Nunito Sans = body (shared across apps).
// `adjustFontFallback: false` — Next has no fallback metrics for Nunito Sans,
// so there is nothing to adjust (and it would log a build error otherwise).
const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: { default: 'Shopwave Merchant', template: '%s · Shopwave Merchant' },
  description: 'Manage your store, products and sales.',
  // A private back-office: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Resolve the session on the server and seed it into the client cache, so the
  // first HTML already renders the right navbar (no logged-out flicker).
  const queryClient = makeServerQueryClient();
  queryClient.setQueryData(qk.me(), await getServerUser());

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${GeistSans.variable}`}
    >
      <head>
        {/* Set the theme class before paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <AppProviders state={dehydrate(queryClient)}>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
