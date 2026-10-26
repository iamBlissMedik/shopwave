import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { dehydrate } from '@tanstack/react-query';
import '@shopwave/config/globals.css';
import { AppProviders, qk, themeNoFlashScript } from '@shopwave/hooks';
import { getServerUser, makeServerQueryClient } from '@shopwave/hooks/server';
import { Navbar } from '@/components/Navbar';
import { siteUrl } from '@/lib/site';

// Geist = display/headings (self-hosted via the `geist` package, exposes
// --font-geist-sans), Nunito Sans = body. Both surface as CSS variables the
// shared Tailwind preset reads (--font-display / --font-sans).
// `adjustFontFallback: false` — Next has no fallback metrics for Nunito Sans,
// so there is nothing to adjust (and it would log a build error otherwise).
const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Shopwave — Marketplace', template: '%s · Shopwave' },
  description: 'Shop products from every store on the Shopwave marketplace.',
  openGraph: { siteName: 'Shopwave', type: 'website' },
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
